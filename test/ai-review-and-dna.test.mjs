import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  RED_TEAM_ROLES,
  redTeamReviewerSchema,
  redTeamJudgeSchema,
  screenObjections,
  redTeamVerdict,
  runRedTeam
} from '../lib/ai-review.js';
import {
  TECHNIQUE_CATALOG,
  canonicalTechnique,
  normalizeMathDna,
  extractMathDna
} from '../lib/math-dna.js';

// ── Red Team evidence screening ────────────────────────────────────────────
assert.equal(RED_TEAM_ROLES.length, 3, 'Red Team uses three independent reviewers');

const solution = [
  'Ta chứng minh bằng phản chứng.',
  'Giả sử tồn tại x nguyên dương không chia hết cho 4.',
  'Khi đó x = 4k + r với r thuộc {1, 2, 3}.',
  'Do đó x chia hết cho 4, mâu thuẫn.',
  'Vậy mọi nghiệm nguyên dương đều chia hết cho 4.'
].join('\n');

const quoted = {
  severity: 'major',
  type: 'logic',
  step: 3,
  claim: 'x = 4k + r chưa xét r = 0',
  evidenceQuote: 'Khi đó x = 4k + r với r thuộc {1, 2, 3}.',
  reason: 'Bước này bỏ sót trường hợp r = 0 nên lập luận chưa đầy đủ.',
  proposedFix: 'Xét cả r = 0 trước khi kết luận.',
  counterexample: ''
};
const fabricated = {
  severity: 'fatal',
  type: 'counterexample',
  step: 2,
  claim: 'Phản ví dụ x = 7 phá vỡ bước 2',
  evidenceQuote: 'Đoạn này hoàn toàn không có trong lời giải.',
  reason: 'x = 7 không chia hết cho 4.',
  proposedFix: 'Sửa lại toàn bộ.',
  counterexample: 'x = 7'
};
const incompleteCounterexample = {
  severity: 'minor',
  type: 'counterexample',
  step: 3,
  claim: 'Có phản ví dụ khác',
  evidenceQuote: 'Do đó x chia hết cho 4, mâu thuẫn.',
  reason: 'Cần kiểm tra thêm.',
  proposedFix: '',
  counterexample: ''
};

const screened = screenObjections([
  { role: 'logic', objections: [quoted, fabricated] },
  { role: 'counterexample', objections: [incompleteCounterexample] }
], solution);
assert.equal(screened.valid.length, 1, 'Only the objection quoting real solution text survives');
assert.equal(screened.valid[0].evidenceQuote, quoted.evidenceQuote);
assert.equal(screened.valid[0].reviewer, 'logic');
assert.ok(screened.rejected.some(item => item.rejectedBecause === 'quote_not_in_solution'));
assert.ok(screened.rejected.some(item => item.rejectedBecause === 'counterexample_incomplete'));
assert.equal(redTeamVerdict([], [], []), 'passed');
assert.equal(redTeamVerdict([], [{ ...quoted, severity: 'fatal' }], []), 'rejected');
assert.equal(redTeamVerdict([], [quoted], []), 'concerns');

const acjson = await runRedTeam({
  common: 'Đề: chứng minh x chia hết cho 4.',
  solution,
  outputLanguage: 'Vietnamese',
  generate: async options => {
    if (options.schema === redTeamReviewerSchema) {
      return {
        data: {
          role: 'logic',
          verdict: 'concerns',
          summary: 'Có một lỗ hổng.',
          objections: [quoted, fabricated]
        },
        model: 'fake-reviewer'
      };
    }
    assert.equal(options.schema, redTeamJudgeSchema);
    return {
      data: {
        verdict: 'concerns',
        confidence: 0.8,
        summary: 'Giữ lại lỗi có bằng chứng.',
        confirmedObjections: [quoted, fabricated],
        dismissedObjections: [],
        recommendedFixes: ['Xét r = 0'],
        revisedScore: 3.9
      },
      model: 'fake-judge'
    };
  },
  log: () => {}
});
assert.equal(acjson.verdict, 'concerns');
assert.equal(acjson.revisedScore, '3.9/5.0');
assert.equal(acjson.confirmedObjections.length, 1, 'The judge may only confirm objections that survived screening');
assert.equal(acjson.rejectedObjectionCount >= 1, true);
assert.equal(acjson.checkedObjectionCount >= 3, true);
assert.ok(acjson.dismissedObjections.some(item => item.rejectedBecause === 'not_in_screened_set'));
assert.equal(acjson.reviewers.length >= 1, true);
assert.equal(acjson.model, 'fake-judge');

await assert.rejects(
  runRedTeam({ common: 'x', solution: 'quá ngắn', generate: async () => ({ data: {} }) }),
  /RED_TEAM_SOLUTION_TOO_SHORT/
);

// ── Math DNA normalization ────────────────────────────────────────────────
assert.ok(TECHNIQUE_CATALOG.length >= 30);
assert.deepEqual(canonicalTechnique('Bất đẳng thức Cauchy - Schwarz'), { id: 'cauchy-schwarz', label: 'Cauchy–Schwarz' });
assert.deepEqual(canonicalTechnique('#pigeonhole'), { id: 'pigeonhole', label: 'Nguyên lý Dirichlet' });
assert.deepEqual(canonicalTechnique('đổi biến'), { id: 'substitution', label: 'Đổi biến' });
assert.equal(canonicalTechnique('kỹ thuật chưa có tên').id.startsWith('custom:'), true);

const dna = normalizeMathDna({
  primaryTechnique: 'Quy nạp mạnh',
  techniqueTags: ['Quy nạp mạnh', 'bất biến', 'Bất biến', 'Cauchy-Schwarz', ''],
  hypothesisDependencies: [
    { hypothesis: 'n là số nguyên dương', used: true, consequenceIfRemoved: 'Không xác định được bước cơ sở.' },
    { hypothesis: 'thiếu kết luận', used: true, consequenceIfRemoved: '' }
  ],
  prerequisites: [
    { concept: 'Phép chia có dư', whyNeeded: 'Dùng trong bước quy nạp.' },
    { concept: '', whyNeeded: 'Bỏ' }
  ],
  insight: 'Ý tưởng chính.',
  difficulty: 9,
  suggestedPracticeFocus: ['Tìm bất biến', 'Bài tập quy nạp', '']
});
assert.equal(dna.primaryTechnique.id, 'strong-induction');
assert.deepEqual(dna.techniqueTags.map(tag => tag.id), ['strong-induction', 'invariant', 'cauchy-schwarz'], 'Tags are canonical and deduplicated');
assert.equal(dna.hypothesisDependencies.length, 1);
assert.equal(dna.prerequisites.length, 1);
assert.equal(dna.difficulty, 5, 'Difficulty is clamped to 1..5');
assert.deepEqual(dna.suggestedPracticeFocus, ['Tìm bất biến', 'Bài tập quy nạp']);

const { dna: extracted, model } = await extractMathDna({
  common: 'Đề bài quy nạp.',
  solution: 'Lời giải dùng quy nạp mạnh và bất biến.',
  generate: async options => ({
    data: {
      primaryTechnique: 'strong induction',
      techniqueTags: ['invariant'],
      hypothesisDependencies: [],
      prerequisites: [],
      insight: 'Giữ bất biến qua từng bước.',
      difficulty: 4,
      suggestedPracticeFocus: []
    },
    model: options.models[0]
  }),
  log: () => {}
});
assert.equal(extracted.primaryTechnique.id, 'strong-induction');
assert.equal(extracted.difficulty, 4);
assert.equal(model, 'gemini-3.5-flash');

// ── Guide route wiring for the new modes ──────────────────────────────────
const routeSource = fs.readFileSync(new URL('../api/ai-guide.js', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '')
  .replaceAll('export function', 'function')
  .replace('export default async function', 'async function');
const fakeRedTeam = async () => ({
  verdict: 'passed', confidence: 0.9, summary: 'Ổn.', revisedScore: '5.0/5.0',
  reviewers: [], confirmedObjections: [], dismissedObjections: [],
  checkedObjectionCount: 0, rejectedObjectionCount: 0, generatedAt: 'now'
});
let persistedDna = null;
const fakeDna = async () => ({
  dna: normalizeMathDna({ primaryTechnique: 'invariant', techniqueTags: ['invariant'], insight: 'Bất biến.', difficulty: 3 }),
  model: 'fake-dna'
});
const fakeDb = {
  collection: () => ({
    updateOne: async (query, update) => { persistedDna = { query, update }; return { acknowledged: true }; }
  })
};
const route = new Function(
  'readBookProblemImages', 'generateGuideDiagram', 'inspectGeometryDiagram', 'geometrySchema', 'geometryInstruction',
  'selectGuideGeometry', 'cleanGeometryDiagram', 'mathematicalAuditInstruction', 'auditEvidence', 'retrieveVerifiedContext',
  'getSession', 'checkRateLimit', 'generateJson', 'generateWithFallback', 'parseBody', 'prepare', 'text', 'generateVerifierJson',
  'runRedTeam', 'extractMathDna', 'getDb',
  routeSource + ';return handler;'
)(
  async () => [], async () => ({}), () => ({ geometry: null, issues: [] }), {}, '', () => ({}), () => null,
  '', () => true, async () => ({ statement: 'Đề gốc', topic: 'Số học', block: '' }),
  () => ({ username: 'student' }), () => true, async () => ({ data: {}, model: 'solver' }),
  async primary => ({ ...await primary(), provider: 'google' }), req => req.body, () => {}, (v, max = 50000) => String(v ?? '').slice(0, max),
  async () => ({ data: {}, model: 'verifier' }), fakeRedTeam, fakeDna, async () => fakeDb
);
const request = async body => {
  const res = { status(code) { this.code = code; return this; }, json(value) { this.value = value; return this; } };
  await route({ method: 'POST', body }, res);
  return res;
};
const longSolution = 'Một lời giải đủ dài để phản biện. '.repeat(8);

const blockedMode = await request({ mode: 'redteam', problemContent: 'Đề', solution: 'quá ngắn' });
assert.equal(blockedMode.code, 400);

const redTeamResponse = await request({ mode: 'redteam', problemContent: 'Đề', contentKey: 'tst:test:1', solution: longSolution });
assert.equal(redTeamResponse.code, 200);
assert.equal(redTeamResponse.value.source, 'gemini_red_team');
assert.equal(redTeamResponse.value.data.redTeam.verdict, 'passed');

const dnaResponse = await request({ mode: 'dna', problemContent: 'Đề', contentKey: 'tst:test:1', problemTitle: 'Bài 1', solution: longSolution });
assert.equal(dnaResponse.code, 200);
assert.equal(dnaResponse.value.source, 'gemini_math_dna');
assert.equal(dnaResponse.value.data.dna.primaryTechnique.id, 'invariant');
assert.equal(dnaResponse.value.data.persisted, true);
assert.deepEqual(persistedDna.query, { problemKey: 'tst:test:1' });
assert.equal(persistedDna.update.$set.primaryTechnique.id, 'invariant');

console.log('AI Red Team evidence screening, Math DNA normalization and guide modes: OK');
