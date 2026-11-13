// AI Red Team: three independent reviewers attack a solution, code screens their
// objections for verifiable evidence, then a judge may only use the screened set.
// The design keeps the model honest: a reviewer cannot invent a step that the
// solution does not contain, and an unsupported objection is discarded.
import { text } from './ai.js';

const SEVERITIES = ['minor', 'major', 'fatal'];
const OBJECTION_TYPES = ['logic', 'counterexample', 'edge_case', 'quantifier', 'assumption', 'algebra'];

const objectionSchema = {
  type: 'object',
  properties: {
    severity: { type: 'string', enum: SEVERITIES },
    type: { type: 'string', enum: OBJECTION_TYPES },
    step: { type: 'integer' },
    claim: { type: 'string', description: 'The exact solution claim being challenged.' },
    evidenceQuote: { type: 'string', description: 'A verbatim quote copied from the candidate solution.' },
    reason: { type: 'string' },
    proposedFix: { type: 'string' },
    counterexample: { type: 'string', description: 'Concrete values/configuration disproving the claim, or an empty string.' }
  },
  required: ['severity', 'type', 'step', 'claim', 'evidenceQuote', 'reason', 'proposedFix', 'counterexample'],
  additionalProperties: false
};

export const redTeamReviewerSchema = {
  type: 'object',
  properties: {
    role: { type: 'string' },
    verdict: { type: 'string', enum: ['sound', 'concerns', 'fatal'] },
    summary: { type: 'string' },
    objections: { type: 'array', items: objectionSchema }
  },
  required: ['role', 'verdict', 'summary', 'objections'],
  additionalProperties: false
};

export const redTeamJudgeSchema = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['passed', 'concerns', 'rejected'] },
    confidence: { type: 'number' },
    summary: { type: 'string' },
    confirmedObjections: { type: 'array', items: objectionSchema },
    dismissedObjections: { type: 'array', items: objectionSchema },
    recommendedFixes: { type: 'array', items: { type: 'string' } },
    revisedScore: { type: 'number' }
  },
  required: ['verdict', 'confidence', 'summary', 'confirmedObjections', 'dismissedObjections', 'recommendedFixes', 'revisedScore'],
  additionalProperties: false
};

export const RED_TEAM_ROLES = [
  {
    id: 'logic',
    title: 'Logic police',
    instruction: 'You are the logic police. Check quantified statements, implications, equivalences, circular reasoning, hidden assumptions and whether each conclusion follows from the stated hypotheses. Do not comment on style or length.'
  },
  {
    id: 'counterexample',
    title: 'Counterexample hunter',
    instruction: 'You are the counterexample hunter. For each material step, try to construct concrete numbers, functions, sequences or geometric configurations that satisfy the hypotheses but break the claim. A counterexample must be fully specified and must satisfy every hypothesis. Never fabricate one.'
  },
  {
    id: 'edge',
    title: 'Edge-case examiner',
    instruction: 'You are the edge-case examiner. Check boundary values, equality cases, degenerate configurations, domains, division by zero, parity, monotonicity, and whether exceptional cases were omitted. Do not repeat purely logical objections another reviewer would raise.'
  }
];

const normalizeForMatch = value => text(value, 4_000)
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[đĐ]/g, 'd')
  .toLowerCase()
  .replace(/[^a-z0-9+\-*/=<>^_{}()[\].,:;|!? ]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function solutionLines(solution) {
  const lines = text(solution, 120_000).split('\n').map(line => normalizeForMatch(line)).filter(Boolean);
  return lines.length ? lines : [normalizeForMatch(solution)];
}

/**
 * Keep only objections whose evidence actually appears in the solution.
 * Returns { valid, rejected } so the judge can be told how many claims were
 * discarded and why, without feeding it unsupported accusations.
 */
export function screenObjections(reviewers, solution) {
  const lines = solutionLines(solution);
  const haystack = lines.join(' ');
  const valid = [];
  const rejected = [];
  const seen = new Set();

  for (const reviewer of Array.isArray(reviewers) ? reviewers : []) {
    for (const objection of Array.isArray(reviewer?.objections) ? reviewer.objections : []) {
      const normalized = {
        severity: SEVERITIES.includes(objection?.severity) ? objection.severity : 'minor',
        type: OBJECTION_TYPES.includes(objection?.type) ? objection.type : 'logic',
        step: Number.isFinite(Number(objection?.step)) ? Math.max(0, Math.trunc(Number(objection.step))) : 0,
        claim: text(objection?.claim, 2_000),
        evidenceQuote: text(objection?.evidenceQuote, 2_000),
        reason: text(objection?.reason, 4_000),
        proposedFix: text(objection?.proposedFix, 4_000),
        counterexample: text(objection?.counterexample, 4_000),
        reviewer: text(reviewer?.role, 80)
      };
      const key = normalizeForMatch(normalized.claim || normalized.evidenceQuote);
      const evidence = normalizeForMatch(normalized.evidenceQuote);
      const claim = normalizeForMatch(normalized.claim);
      const supported = (evidence.length >= 8 && haystack.includes(evidence))
        || (claim.length >= 12 && haystack.includes(claim));
      const inRange = normalized.step >= 1 && normalized.step <= lines.length + 5;
      const counterexampleComplete = normalized.type !== 'counterexample'
        || normalized.counterexample.length >= 3;
      if (!normalized.claim || !normalized.reason) {
        rejected.push({ ...normalized, rejectedBecause: 'missing_claim_or_reason' });
        continue;
      }
      if (!supported) {
        rejected.push({ ...normalized, rejectedBecause: 'quote_not_in_solution' });
        continue;
      }
      if (!inRange) {
        rejected.push({ ...normalized, rejectedBecause: 'step_out_of_range' });
        continue;
      }
      if (!counterexampleComplete) {
        rejected.push({ ...normalized, rejectedBecause: 'counterexample_incomplete' });
        continue;
      }
      if (seen.has(key)) continue;
      seen.add(key);
      valid.push(normalized);
    }
  }
  return { valid, rejected };
}

export function redTeamVerdict(reviewers, confirmed, rejected) {
  if (confirmed.some(item => item.severity === 'fatal')) return 'rejected';
  if (confirmed.length) return 'concerns';
  if (rejected.some(item => item.severity === 'fatal')) return 'concerns';
  return 'passed';
}

function reviewerPrompt({ role, common, solution, outputLanguage }) {
  return `${role.instruction}

You are reviewing a ${outputLanguage} mathematical solution. Read the statement and the candidate solution carefully. Recompute the critical steps yourself.

RULES
1. Every objection MUST include evidenceQuote copied verbatim from the candidate solution and a 1-based step number. Do not quote the problem statement.
2. A counterexample must be completely specified and must satisfy every hypothesis. If you cannot build one, use an empty counterexample string and classify the objection as logic, algebra, quantifier or assumption instead.
3. Do not raise style, brevity or presentation objections. Do not invent steps the candidate did not write.
4. If the solution is sound, return verdict "sound" with an empty objections array.
5. Write all free text in ${outputLanguage}.

STATEMENT
${common}

CANDIDATE SOLUTION
${solution}`;
}

function judgePrompt({ common, solution, reviews, screened, outputLanguage }) {
  return `You are the judge of an adversarial mathematics review. Three independent reviewers attacked the candidate solution. A deterministic checker has already removed objections whose quoted evidence does not appear in the solution.

Only the CONFIRMED objections below are admissible. Never accept a dismissed objection. Judge whether each confirmed objection really breaks the proof, repair what can be repaired in words, and return a final verdict.
- "passed": no confirmed material objection remains.
- "concerns": confirmed minor/major gaps or disputed points that need attention.
- "rejected": a confirmed fatal gap or counterexample defeats the proof.
Use revisedScore as a 0.0-5.0 quality estimate after the review.
Write all free text in ${outputLanguage}.

STATEMENT
${common}

CANDIDATE SOLUTION
${solution}

REVIEWER SUMMARIES
${JSON.stringify(reviews.map(item => ({ role: item.role, verdict: item.verdict, summary: item.summary })))}

CONFIRMED OBJECTIONS
${JSON.stringify(screened.valid)}

DISMISSED OBJECTIONS (inadmissible; do not use them as evidence)
${JSON.stringify(screened.rejected.map(item => ({ claim: item.claim, rejectedBecause: item.rejectedBecause })))}`;
}

/**
 * Run the red-team panel. `generate(options)` must return { data, model }.
 */
export async function runRedTeam({
  common,
  solution,
  outputLanguage = 'Vietnamese',
  deadline = Date.now() + 280_000,
  generate,
  log = console.warn
}) {
  const remaining = () => Math.max(0, deadline - Date.now());
  const solutionText = text(solution, 120_000);
  if (solutionText.length < 120) {
    const error = new Error('RED_TEAM_SOLUTION_TOO_SHORT');
    error.code = 'RED_TEAM_SOLUTION_TOO_SHORT';
    throw error;
  }

  const runs = await Promise.allSettled(RED_TEAM_ROLES.map(role => {
    const timeoutMs = Math.min(100_000, remaining() - 70_000);
    if (timeoutMs < 8_000) {
      const error = new Error('AI_TIMEOUT');
      error.code = 'AI_TIMEOUT';
      return Promise.reject(error);
    }
    return generate({
      contents: reviewerPrompt({ role, common, solution: solutionText, outputLanguage }),
      schema: redTeamReviewerSchema,
      systemInstruction: `You are an adversarial mathematics reviewer (${role.title}). Be precise, evidence-bound and concise. Return only the structured JSON.`,
      models: [process.env.GEMINI_REVIEW_MODEL || 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.5-flash-lite'],
      timeoutMs,
      totalTimeoutMs: timeoutMs,
      maxOutputTokens: 8_000,
      temperature: 0.25
    });
  }));

  const reviews = [];
  const failures = [];
  runs.forEach((run, index) => {
    if (run.status === 'fulfilled' && run.value?.data) {
      reviews.push({
        role: RED_TEAM_ROLES[index].id,
        title: RED_TEAM_ROLES[index].title,
        verdict: ['sound', 'concerns', 'fatal'].includes(run.value.data.verdict) ? run.value.data.verdict : 'concerns',
        summary: text(run.value.data.summary, 3_000),
        objections: Array.isArray(run.value.data.objections) ? run.value.data.objections : [],
        model: run.value.model || ''
      });
    } else {
      failures.push({ role: RED_TEAM_ROLES[index].id, code: text(run.reason?.code, 80) || 'REVIEW_FAILED' });
      log('[RED TEAM reviewer failed]', { role: RED_TEAM_ROLES[index].id, code: run.reason?.code || 'UNKNOWN' });
    }
  });

  if (!reviews.length) {
    const error = new Error('AI_RED_TEAM_UNAVAILABLE');
    error.code = 'AI_RED_TEAM_UNAVAILABLE';
    error.failures = failures;
    throw error;
  }

  const screened = screenObjections(reviews, solutionText);
  const judgeTimeout = Math.max(8_000, Math.min(110_000, remaining() - 5_000));
  const judged = await generate({
    contents: judgePrompt({ common, solution: solutionText, reviews, screened, outputLanguage }),
    schema: redTeamJudgeSchema,
    systemInstruction: 'You are the impartial judge of an adversarial mathematics review. Admit only confirmed, evidence-backed objections. Return only the structured JSON.',
    models: [process.env.GEMINI_REVIEW_JUDGE_MODEL || 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.5-flash-lite'],
    timeoutMs: judgeTimeout,
    totalTimeoutMs: judgeTimeout,
    maxOutputTokens: 10_000,
    temperature: 0.15
  });
  const judge = judged?.data || {};
  const validByKey = new Map(screened.valid.map(item => [normalizeForMatch(item.claim || item.evidenceQuote), item]));
  const judgeConfirmed = Array.isArray(judge.confirmedObjections) ? judge.confirmedObjections : screened.valid;
  const notAdmitted = [];
  const confirmed = judgeConfirmed
    .slice(0, 20)
    .map(item => {
      const key = normalizeForMatch(text(item?.claim, 2_000) || text(item?.evidenceQuote, 2_000));
      const source = validByKey.get(key);
      if (!source) {
        notAdmitted.push(item);
        return null;
      }
      return {
        severity: SEVERITIES.includes(item?.severity) ? item.severity : source.severity,
        type: OBJECTION_TYPES.includes(item?.type) ? item.type : source.type,
        step: Number.isFinite(Number(item?.step)) ? Math.max(0, Math.trunc(Number(item.step))) : source.step,
        claim: text(item?.claim, 2_000) || source.claim,
        evidenceQuote: text(item?.evidenceQuote, 2_000) || source.evidenceQuote,
        reason: text(item?.reason, 4_000) || source.reason,
        proposedFix: text(item?.proposedFix, 4_000) || source.proposedFix,
        counterexample: text(item?.counterexample, 4_000) || source.counterexample
      };
    })
    .filter(item => item && item.claim && item.reason);
  const dismissed = [
    ...notAdmitted.slice(0, 20).map(item => ({
      claim: text(item?.claim, 2_000),
      reason: text(item?.reason, 2_000),
      rejectedBecause: 'not_in_screened_set'
    })),
    ...(Array.isArray(judge.dismissedObjections) ? judge.dismissedObjections : [])
      .slice(0, 20)
      .map(item => ({
        claim: text(item?.claim, 2_000),
        reason: text(item?.reason, 2_000),
        rejectedBecause: 'judge_dismissed'
      }))
  ].filter(item => item.claim).slice(0, 25);
  const verdict = ['passed', 'concerns', 'rejected'].includes(judge.verdict)
    ? judge.verdict
    : redTeamVerdict(reviews, confirmed, screened.rejected);
  const confidence = Number.isFinite(Number(judge.confidence))
    ? Math.max(0, Math.min(1, Number(judge.confidence)))
    : (confirmed.length ? 0.7 : 0.85);
  const revisedScore = Number.isFinite(Number(judge.revisedScore))
    ? Math.max(0, Math.min(5, Number(judge.revisedScore)))
    : (verdict === 'passed' ? 5 : verdict === 'concerns' ? 3.5 : 2);

  return {
    verdict,
    confidence,
    summary: text(judge.summary, 5_000) || (verdict === 'passed'
      ? 'Hội đồng phản biện không tìm thấy lỗi có bằng chứng.'
      : 'Hội đồng phản biện ghi nhận một số điểm cần xem lại.'),
    revisedScore: `${revisedScore.toFixed(1)}/5.0`,
    reviewers: reviews.map(({ objections, ...rest }) => ({ ...rest, objectionCount: objections.length })),
    confirmedObjections: confirmed,
    dismissedObjections: [...screened.rejected.slice(0, 20).map(item => ({
      claim: item.claim, reason: item.reason, rejectedBecause: item.rejectedBecause
    })), ...dismissed].slice(0, 25),
    checkedObjectionCount: screened.valid.length + screened.rejected.length,
    rejectedObjectionCount: screened.rejected.length,
    failures,
    model: judged?.model || '',
    generatedAt: new Date().toISOString()
  };
}
