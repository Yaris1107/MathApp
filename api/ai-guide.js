import { readBookProblemImages } from '../lib/books.js';
import { generateGuideDiagram } from '../lib/guide-diagram.js';
import { geometrySchema, geometryInstruction, selectGuideGeometry, inspectGeometryDiagram } from '../lib/geometry-diagram.js';
import { mathematicalAuditInstruction, auditEvidence } from '../lib/math-audit.js';
import { retrieveVerifiedContext } from '../lib/rag-retrieval.js';
import { getSession } from '../lib/session.js';
import { checkRateLimit, generateJson, generateWithFallback, parseBody, prepare, text } from '../lib/ai.js';
import { generateVerifierJson } from '../lib/ai-verifier.js';
import { runRedTeam } from '../lib/ai-review.js';
import { extractMathDna } from '../lib/math-dna.js';
import { getDb } from '../lib/db.js';

// A single Vercel invocation is hard-capped at 300s. The client may resume the
// same problem in a new invocation (mode=solve / mode=verify) without any total
// time limit, so each phase is allowed to use almost the whole platform budget.
const FUNCTION_BUDGET_MS = Number(process.env.AI_GUIDE_BUDGET_MS) || 292_000;
const BUDGET_SAFETY_MS = 4_000;

const stringArray = { type: 'array', items: { type: 'string' } };
const guideSchema = { type: 'object', properties: {
  requirements: stringArray, knowledge: { type: 'string' }, intuition: { type: 'string' },
  solution: { type: 'string' }, pitfalls: { type: 'string' }, finalAnswers: stringArray,
  equalityCases: stringArray, assumptionsUsed: stringArray, verificationChecks: stringArray
}, required: ['requirements', 'knowledge', 'intuition', 'solution', 'pitfalls', 'finalAnswers', 'equalityCases', 'assumptionsUsed', 'verificationChecks'] };

const verifierSchema = { type: 'object', properties: {
  approved: { type: 'boolean' }, score: { type: 'number' }, allPartsCorrect: { type: 'boolean' },
  rigorous: { type: 'boolean' }, noExtraAssumptions: { type: 'boolean' }, equalityCasesChecked: { type: 'boolean' },
  matchesVerifiedReference: { type: 'boolean' }, summary: { type: 'string' }, criticalIssues: stringArray,
  correctedApproved: { type: 'boolean' }, correctedScore: { type: 'number' }, correctedKnowledge: { type: 'string' },
  correctedAllPartsCorrect: { type: 'boolean' }, correctedRigorous: { type: 'boolean' },
  correctedNoExtraAssumptions: { type: 'boolean' }, correctedEqualityCasesChecked: { type: 'boolean' },
  correctedMatchesVerifiedReference: { type: 'boolean' },
  correctedIntuition: { type: 'string' }, correctedSolution: { type: 'string' }, correctedPitfalls: { type: 'string' },
  correctedFinalAnswers: stringArray, correctedEqualityCases: stringArray, correctedVerificationChecks: stringArray
}, required: ['approved', 'score', 'allPartsCorrect', 'rigorous', 'noExtraAssumptions', 'equalityCasesChecked', 'matchesVerifiedReference', 'summary', 'criticalIssues', 'correctedApproved', 'correctedScore', 'correctedKnowledge', 'correctedAllPartsCorrect', 'correctedRigorous', 'correctedNoExtraAssumptions', 'correctedEqualityCasesChecked', 'correctedMatchesVerifiedReference', 'correctedIntuition', 'correctedSolution', 'correctedPitfalls', 'correctedFinalAnswers', 'correctedEqualityCases', 'correctedVerificationChecks'], additionalProperties: false };

Object.assign(guideSchema.properties, { degeneracyChecks: stringArray });
guideSchema.required.push('degeneracyChecks');
Object.assign(verifierSchema.properties, { degeneraciesChecked: { type: 'boolean' }, degeneracyChecks: stringArray,
  correctedDegeneraciesChecked: { type: 'boolean' }, correctedDegeneracyChecks: stringArray });
verifierSchema.required.push('degeneraciesChecked', 'degeneracyChecks', 'correctedDegeneraciesChecked', 'correctedDegeneracyChecks');

guideSchema.properties.geometry = geometrySchema;
guideSchema.required.push('geometry');
Object.assign(verifierSchema.properties, { geometryApproved: { type: 'boolean' }, correctedGeometryApproved: { type: 'boolean' }, correctedGeometry: geometrySchema });
verifierSchema.required.push('geometryApproved', 'correctedGeometryApproved', 'correctedGeometry');

const genericPatterns = [/thực hiện các phép thế thích hợp/i, /xây dựng một ví dụ cụ thể/i, /thiết lập (?:một )?đánh giá phù hợp/i, /apply appropriate substitutions/i, /construct a suitable example/i, /derive an appropriate estimate/i];
const scoreOf = value => Number.isFinite(Number(value)) ? Math.max(0, Math.min(5, Number(value))) : 0;

function partCount(statement) {
  const matches = String(statement || '').match(/(?:^|\n)\s*(?:[a-d]|[1-4])[.)]\s+/gim) || [];
  return Math.max(1, new Set(matches.map(item => item.trim().toLowerCase())).size);
}

// A resumed verify phase receives the candidate back from the client. Keep only
// the fields the pipeline needs and bound every string so an oversized or
// unexpected payload cannot bloat the verifier prompt.
function cleanCandidate(value) {
  const source = value && typeof value === 'object' ? value : {};
  const list = (items, max = 20, length = 2_500) => (Array.isArray(items) ? items : [])
    .slice(0, max).map(item => text(item, length)).filter(Boolean);
  return {
    requirements: list(source.requirements),
    knowledge: text(source.knowledge, 50_000),
    intuition: text(source.intuition, 50_000),
    solution: text(source.solution, 100_000),
    pitfalls: text(source.pitfalls, 50_000),
    finalAnswers: list(source.finalAnswers),
    equalityCases: list(source.equalityCases),
    assumptionsUsed: list(source.assumptionsUsed),
    verificationChecks: list(source.verificationChecks),
    degeneracyChecks: list(source.degeneracyChecks),
    geometry: source.geometry && typeof source.geometry === 'object' ? source.geometry : null
  };
}

export function substantive(solution, finalAnswers, requiredParts) {
  const body = text(solution, 100000);
  return body.length >= 260 && Array.isArray(finalAnswers) && finalAnswers.length >= requiredParts && !genericPatterns.some(pattern => pattern.test(body));
}

export function accepted(data, corrected = false) {
  if (corrected) return data.correctedDegeneraciesChecked === true && auditEvidence(data.correctedDegeneracyChecks) && data.correctedApproved === true && scoreOf(data.correctedScore) >= 4.5 && data.correctedAllPartsCorrect === true && data.correctedRigorous === true && data.correctedNoExtraAssumptions === true && data.correctedEqualityCasesChecked === true && data.correctedMatchesVerifiedReference === true;
  return data.degeneraciesChecked === true && auditEvidence(data.degeneracyChecks) && data.approved === true && scoreOf(data.score) >= 4.5 && data.allPartsCorrect === true && data.rigorous === true && data.noExtraAssumptions === true && data.equalityCasesChecked === true && data.matchesVerifiedReference === true;
}

export function describeGuideError(error, mode = '') {
  const code = text(error?.code, 80);
  const stage = error?.aiStage || 'solver';
  if (code === 'AI_NOT_CONFIGURED') return { status: 503, error: 'Chưa cấu hình GEMINI_API_KEY cho Gia sư AI trên Vercel.' };
  if (code === 'AI_TIMEOUT') return { status: 504, error: error?.aiStage === 'solver'
    ? 'Gemini quá thời gian khi tạo lời giải. Vui lòng thử lại.'
    : 'Gemini quá thời gian khi kiểm định lời giải. Vui lòng thử lại.', stage };
  if (code === 'AI_RECITATION') return { status: 502, error: 'Gemini không thể tạo nội dung cho bài này. Vui lòng thử lại hoặc diễn đạt đề ngắn gọn hơn.', stage };
  if (code === 'AI_RED_TEAM_UNAVAILABLE') return { status: 503, error: 'Hội đồng phản biện AI tạm thời không phản hồi. Vui lòng thử lại.', stage: 'verifier' };
  if (code === 'AI_HTTP_429') return { status: 503, error: 'Bạn thao tác hơi nhanh hoặc Gemini đang giới hạn tần suất. Vui lòng thử lại sau ít giây.', stage };
  if (/^AI_HTTP_(?:5\d\d)$/.test(code)) return { status: 503, error: 'Gemini đang quá tải hoặc tạm thời không khả dụng. Vui lòng thử lại sau ít phút.', stage };
  if (mode === 'diagram' && code === 'GEOMETRY_TIMEOUT') return { status: 504, error: 'Gia sư AI chưa hoàn tất kiểm tra hình trong thời gian cho phép. Vui lòng thử lại.', stage: 'verifier' };
  return { status: 502, error: `Gia sư AI gặp lỗi khi ${stage === 'verifier' ? 'kiểm định lời giải' : 'tạo lời giải'}${code ? ` (${code})` : ''}. Vui lòng thử lại; nếu tiếp tục, gửi mã lỗi cho quản trị viên.`,
    stage };
}

function withBookImages(prompt,images){return images.length?{parts:[{text:prompt},...images.map(url=>({inlineData:{mimeType:'image/png',data:url.split(',')[1]}}))]}:prompt;}

async function persistMathDna({ problemKey, title, topic, dna, username }) {
  if (!problemKey) return false;
  try {
    const db = await getDb();
    const now = new Date();
    await db.collection('math_dna').updateOne(
      { problemKey },
      { $set: {
        problemKey, title: text(title, 500), topic: text(topic, 200),
        primaryTechnique: dna.primaryTechnique, techniqueTags: dna.techniqueTags,
        hypothesisDependencies: dna.hypothesisDependencies, prerequisites: dna.prerequisites,
        insight: dna.insight, difficulty: dna.difficulty,
        suggestedPracticeFocus: dna.suggestedPracticeFocus,
        updatedBy: text(username, 80), updatedAt: now
      }, $setOnInsert: { createdAt: now, createdBy: text(username, 80) } },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.warn('[MATH DNA persist]', { code: error?.code || 'UNKNOWN', message: text(error?.message, 300) });
    return false;
  }
}

export default async function handler(req, res) {
  prepare(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });
  const session = await getSession(req);
  if (!session) return res.status(401).json({ success: false, error: 'Vui lòng đăng nhập lại' });
  if (!checkRateLimit(`${session.username}:guide`, 20)) return res.status(429).json({ success: false, error: 'Bạn đang gửi yêu cầu quá nhanh' });
  const body = parseBody(req);
  if (!body) return res.status(400).json({ success: false, error: 'JSON không hợp lệ' });
  let problemContent = text(body.problemContent);
  if (!problemContent) return res.status(400).json({ success: false, error: 'Thiếu nội dung bài toán' });
  const startedAt = Date.now();
  const outputLanguage = body.lang === 'en' ? 'English' : 'Vietnamese';

  try {
    const reference = await retrieveVerifiedContext({ problemRef: text(body.contentKey || body.problemKey || body.problemId, 180),
      statement: problemContent, topic: text(body.topic, 200), session, purpose: 'guide' });
    if (reference?.blocked) return res.status(403).json({ success: false, error: 'Câu hỏi này chưa được phép sử dụng AI Hướng dẫn giải' });
    problemContent = text(reference.statement, 100000);
    const referenceBlock = reference.block;
    const bookImages=reference.bookAssetKeys?.length?await readBookProblemImages(reference,session):[];
    const academicContext = reference.educationLevel === 'university' ? `university mathematics${reference.courseName ? ': ' + reference.courseName : ''}; use rigorous definitions, domains and proofs appropriate to this course` : 'high-school Mathematical Olympiad';
    const common = `Exam: ${text(body.examTitle, 300)}\nProblem: ${text(body.problemId, 120)} - ${text(body.problemTitle, 500)}\nAcademic context: ${academicContext}\nTopic: ${text(reference.topic || body.topic, 200)}\nSTATEMENT:\n${problemContent}\n\n${referenceBlock}`;
    const mathFormat = 'In every guide field (including corrected fields), enclose each mathematical expression in $...$ or $$...$$. Preserve TeX delimiters and escape backslashes correctly in JSON. Keep multiline equations inside one display block. Use Markdown for prose only, without HTML.';
    const problemSpecificGuidance = /bóng đèn|light bulbs?/i.test(problemContent)
      ? 'For this bulbs problem, interpret n as a positive integer: prove parity of the number of lit bulbs is invariant, conclude n must be even, and when n is even pair the bulbs and toggle each pair once. State the final answer exactly as n even.'
      : '';
    const remainingBudget = () => Math.max(0, FUNCTION_BUDGET_MS - (Date.now() - startedAt) - BUDGET_SAFETY_MS);
    // Existing saved guides can receive a diagram without replacing their proof.
    if (body.mode === 'diagram') {
      const solution = text(body.solution, 100000);
      if (!solution) return res.status(400).json({ success: false, error: 'Thiếu lời giải để dựng hình' });
      const result = await generateGuideDiagram({ common, solution, language: outputLanguage,
        generate: options => generateWithFallback(
          () => generateJson(options),
          geminiError => {
            console.warn('[AI GUIDE diagram fallback]', { code: geminiError?.code || 'UNKNOWN', status: geminiError?.status || 0 });
            const timeoutMs = Math.min(options.timeoutMs, remainingBudget());
            if (timeoutMs < 5_000) throw geminiError;
            return generateVerifierJson({
              input: options.contents,
              schema: options.schema,
              model: process.env.GEMINI_SOLVER_FALLBACK_MODEL || process.env.GEMINI_VERIFY_MODEL || 'gemini-3.5-flash',
              timeoutMs,
              totalTimeoutMs: timeoutMs,
              maxOutputTokens: 10_000,
              reasoningEffort: 'medium',
              systemInstruction: options.systemInstruction
            });
          },
          { stage: 'solver' }
        ),
        review: generateVerifierJson, deadline: Date.now() + remainingBudget(),
        log: (event, diagnostics) => console.warn(event, { problemKey: text(body.contentKey || body.problemId, 180), ...diagnostics }) });
      if (!result.geometry) return res.status(422).json({ success: false,
        error: outputLanguage === 'English' ? 'The diagram could not be validated after repair.' : 'Hình vẽ chưa đạt kiểm tra sau bước hiệu chỉnh.',
        code: result.code, details: result.details, reason: result.reason });
      return res.status(200).json({ success: true, data: result });
    }

    // ── AI Red Team: adversarial review of an existing solution ─────────────
    if (body.mode === 'redteam') {
      const solution = text(body.solution, 120000);
      if (solution.length < 120) return res.status(400).json({ success: false, error: 'Thiếu lời giải đủ dài để phản biện' });
      const redTeam = await runRedTeam({
        common, solution, outputLanguage,
        deadline: Date.now() + remainingBudget(),
        generate: options => generateVerifierJson(options)
      });
      return res.status(200).json({ success: true, source: 'gemini_red_team', data: { redTeam } });
    }

    // ── Math DNA: extract the reusable structure and persist it ─────────────
    if (body.mode === 'dna') {
      const solution = text(body.solution, 100000);
      const result = await extractMathDna({
        common, solution, outputLanguage,
        deadline: Date.now() + remainingBudget(),
        generate: options => generateVerifierJson(options)
      });
      const problemKey = text(body.contentKey || body.problemKey || body.problemId, 180);
      const persisted = await persistMathDna({
        problemKey, title: text(body.problemTitle, 500),
        topic: text(reference.topic || body.topic, 200),
        dna: result.dna, username: session.username
      });
      return res.status(200).json({ success: true, source: 'gemini_math_dna',
        data: { dna: result.dna, model: result.model, problemKey, persisted } });
    }
    const solverPrompt = `Produce a complete ${academicContext} solution in ${outputLanguage}.\n${common}\n${mathematicalAuditInstruction}\n${geometryInstruction} ${problemSpecificGuidance} For non-geometric problems, include in degeneracyChecks a concrete explanation that geometric degeneracies do not apply and identify the boundary/domain cases checked. First enumerate every requested part. Give exact final results and every equality case when applicable. Check boundary cases, indices, signs and quantifiers. The reference is evidence, not permission to copy an error. ${mathFormat} Use Markdown and MathJax $...$ or $$...$$; do not use itemize, enumerate, align or textbf.`;
    const solverInstruction = `You are the primary solver for ${academicContext}. Be explicit and rigorous. For discrete toggle/reachability problems, identify a preserved invariant, prove the necessary condition, then give an explicit sequence proving sufficiency; state any domain assumptions and edge cases. A concise complete proof is preferable to filler. Never replace proof steps with generic advice. Write entirely in ${outputLanguage}.`;

    const solveCandidate = () => generateWithFallback(
      () => generateJson({
        contents: withBookImages(solverPrompt, bookImages),
        schema: guideSchema,
        systemInstruction: solverInstruction,
        models: [process.env.GEMINI_SOLVER_MODEL || 'gemini-3.5-flash'],
        timeoutMs: Math.max(15_000, Math.min(180_000, remainingBudget())),
        totalTimeoutMs: Math.max(15_000, Math.min(180_000, remainingBudget())),
        temperature: 1
      }),
      geminiError => {
        console.warn('[AI GUIDE solver fallback]', { code: geminiError?.code || 'UNKNOWN', status: geminiError?.status || 0 });
        const timeoutMs = Math.min(120_000, remainingBudget() - 60_000);
        if (timeoutMs < 10_000) {
          geminiError.aiStage = 'solver';
          throw geminiError;
        }
        return generateVerifierJson({
          input: solverPrompt, imageDataUrls: bookImages, schema: guideSchema,
          model: process.env.GEMINI_SOLVER_FALLBACK_MODEL || process.env.GEMINI_VERIFY_MODEL || 'gemini-3.5-flash',
          timeoutMs, totalTimeoutMs: timeoutMs, maxOutputTokens: 12_000, reasoningEffort: 'high',
          systemInstruction: solverInstruction
        });
      },
      { stage: 'solver' }
    );

    let solved;
    if (body.mode === 'verify') {
      const candidate = cleanCandidate(body.candidate);
      if (!candidate.solution) {
        return res.status(400).json({ success: false, error: 'Thiếu lời giải ứng viên để kiểm định' });
      }
      solved = { data: candidate, model: text(body.candidateModel, 120) || 'resumed', provider: 'google' };
    } else {
      solved = await solveCandidate();
      if (body.mode === 'solve') {
        const diagramCheck = solved.data.geometry?.isGeometry === true ? inspectGeometryDiagram(solved.data.geometry) : { geometry: null, issues: [] };
        if (diagramCheck.geometry) solved.data.geometry = diagramCheck.geometry;
        return res.status(200).json({ success: true, source: 'gemini_solver', phase: 'solved',
          model: solved.model, providers: { solver: 'google' }, candidate: solved.data });
      }
    }

    const diagramCheck = solved.data.geometry?.isGeometry === true ? inspectGeometryDiagram(solved.data.geometry) : { geometry: null, issues: [] };
    if (diagramCheck.geometry) solved.data.geometry = diagramCheck.geometry;
    let verified;
    try {
      verified = await generateVerifierJson({
      imageDataUrls:bookImages,
      input: `${mathematicalAuditInstruction}\nIndependently solve and audit the candidate below. ${geometryInstruction} Independently check the candidate geometry against EVERY statement hypothesis and every depicted auxiliary construction in the selected proof, labels, coordinates and constraints. Set geometryApproved=true only if faithful and complete. Supply a correctedGeometry and correctedGeometryApproved for the corrected proof; never reuse a diagram incompatible with that proof. Diagram failure alone must not reject a valid proof. For non-geometric problems, set degeneraciesChecked=true with a concrete note that geometric degeneracies do not apply, and document checks relevant to the problem domain instead. For discrete-operation problems, independently verify the invariant and the constructive sufficiency proof. Do not reject a complete proof merely for being concise; reject unsupported claims, not brevity. Score 0.0-5.0. Approval requires every requested part correct, a rigorous derivation, no unstated assumptions, and all extremal/equality cases proved when applicable. When no EXACT reference exists (including SIMILAR-only sources), matchesVerifiedReference means independent cross-check passed. Never require the new answer to equal the answer of a similar problem. If anything is weak, provide a fully corrected guide in the corrected* fields. Leave no generic placeholders. ${mathFormat}\n\n${common}\n\nDIAGRAM NUMERICAL VALIDATION:\n${JSON.stringify(diagramCheck.issues)}\n${solved.provider.toUpperCase()} CANDIDATE JSON:\n${JSON.stringify(solved.data)}`,
      schema: verifierSchema,
      systemInstruction: `You are an independent adversarial reviewer for ${academicContext}. Recompute the problem instead of trusting the candidate. Correct the guide in ${outputLanguage} when needed. A score of 5.0 means publication-ready and fully rigorous. Return only the required structured result.`,
      model: process.env.GEMINI_VERIFY_MODEL || 'gemini-3.5-flash',
      timeoutMs: Math.max(15_000, Math.min(180_000, remainingBudget())),
      totalTimeoutMs: Math.max(15_000, remainingBudget()),
      maxOutputTokens: 12_000,
      reasoningEffort: 'medium'
      });
    } catch (error) {
      error.aiStage = 'verifier';
      throw error;
    }
    const requiredParts = partCount(problemContent);
    let data; let score; let repaired = false;
    if (accepted(verified.data) && substantive(solved.data.solution, solved.data.finalAnswers, requiredParts)) {
      data = solved.data; score = scoreOf(verified.data.score);
    } else if (accepted(verified.data, true) && substantive(verified.data.correctedSolution, verified.data.correctedFinalAnswers, requiredParts)) {
      repaired = true; score = scoreOf(verified.data.correctedScore);
      data = { knowledge: verified.data.correctedKnowledge, intuition: verified.data.correctedIntuition, solution: verified.data.correctedSolution, pitfalls: verified.data.correctedPitfalls, finalAnswers: verified.data.correctedFinalAnswers, equalityCases: verified.data.correctedEqualityCases, verificationChecks: verified.data.correctedVerificationChecks, degeneracyChecks: verified.data.correctedDegeneracyChecks };
    } else {
      const rejectedScore = Math.max(scoreOf(verified.data.score), scoreOf(verified.data.correctedScore));
      const summary = text(verified.data.summary, 1000);
      return res.status(422).json({ success: false,
        error: `AI chưa tạo được lời giải đạt chuẩn kiểm định (điểm ${rejectedScore.toFixed(1)}/5.0).${summary ? ` Lý do: ${summary}` : ' Vui lòng thử lại.'}`,
        code: 'QUALITY_REJECTED', quality: { score: rejectedScore, summary } });
    }
    Object.assign(data, selectGuideGeometry(solved.data, verified.data, repaired, reference.topic || body.topic));
    data.quality = { degeneracyChecks: repaired ? verified.data.correctedDegeneracyChecks : verified.data.degeneracyChecks, verified: true, score: `${score.toFixed(1)}/5.0`, repaired, solverProvider: solved.provider, verifierProvider: 'google', usedTrustedReference: Boolean(reference?.content), referenceOrigin: reference?.origin || '', retrieval: reference.retrieval, summary: text(verified.data.summary, 1000) };
    return res.status(200).json({
      success: true,
      source: 'gemini_verified',
      phase: 'verified',
      model: `${solved.model}+${verified.model}`,
      providers: { solver: 'google', verifier: 'google' },
      data
    });
  } catch (error) {
    console.error('[AI GUIDE]', error);
    const failure = describeGuideError(error, body.mode);
    return res.status(failure.status).json({ success: false, error: failure.error,
      code: text(error?.code, 80) || 'AI_PIPELINE_ERROR', ...(failure.stage ? { stage: failure.stage } : {}) });
  }
}
