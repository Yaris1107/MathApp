import assert from 'node:assert/strict';
import {
  difficultyBucket, practiceMatrix, practiceSchema
} from '../api/ai-exam-trends.js';
import { planSchema, socraticSchema } from '../api/ai-guide.js';
import {
  schema as evaluationSchema, verifierSchema, verifierChecks
} from '../api/ai-evaluate-solution.js';

// ── Personalised practice matrix ──────────────────────────────────────────
assert.equal(difficultyBucket('1.5'), 'easy');
assert.equal(difficultyBucket(2), 'easy');
assert.equal(difficultyBucket('3'), 'medium');
assert.equal(difficultyBucket('4'), 'hard');
assert.equal(difficultyBucket('Khó / Olympic'), 'hard');
assert.equal(difficultyBucket('Cơ bản'), 'easy');
assert.equal(difficultyBucket(''), 'medium');

const matrix = practiceMatrix([
  { topic: 'Tổ hợp', easy: 2, medium: '1', hard: 0 },
  { topic: 'Đa thức', easy: 0, medium: 0, hard: 0 },
  { topic: '', easy: 1, medium: 1, hard: 1 },
  { topic: 'Hình học phẳng', easy: 99, medium: 0, hard: 0 }
]);
assert.equal(matrix.matrix.length, 2, 'Rows with no counts or no topic are dropped');
assert.deepEqual(matrix.matrix[0], { topic: 'Tổ hợp', easy: 2, medium: 1, hard: 0, total: 3 });
assert.equal(matrix.matrix[1].easy, 5, 'Per-cell counts are capped at five');
assert.equal(matrix.total, 8);

assert.throws(() => practiceMatrix([]), /Ma trận đề luyện còn trống/);
assert.throws(
  () => practiceMatrix([{ topic: 'Tổ hợp', easy: 5, medium: 5, hard: 5 }, { topic: 'Đa thức', easy: 5, medium: 5, hard: 5 }]),
  /tối đa 15 câu/
);

assert.ok(practiceSchema.required.includes('questions'));
for (const key of ['topic', 'difficulty', 'content', 'answer', 'solution']) {
  assert.ok(practiceSchema.properties.questions.items.required.includes(key), `practice question requires ${key}`);
}

// ── Socratic tutor / knowledge-gap plan schemas ──────────────────────────
for (const key of ['message', 'question', 'focus', 'hintLevel', 'stage', 'correctSoFar', 'mistake', 'nextPrompt', 'isComplete']) {
  assert.ok(socraticSchema.required.includes(key), `socratic schema requires ${key}`);
}
for (const key of ['summary', 'knowledgeMap', 'plan', 'recommendations']) {
  assert.ok(planSchema.required.includes(key), `plan schema requires ${key}`);
}
assert.ok(planSchema.properties.knowledgeMap.items.required.includes('mastery'));
assert.ok(planSchema.properties.plan.items.required.includes('checkpoints'));

// ── Rubric-based essay grading ───────────────────────────────────────────
for (const key of ['rubric', 'mistakes', 'rigor']) {
  assert.ok(evaluationSchema.required.includes(key), `evaluation schema requires ${key}`);
  assert.ok(verifierSchema.required.includes(key), `verifier schema re-checks ${key}`);
}
assert.ok(verifierSchema.required.includes('rubricConsistent'), 'Verifier must certify the rubric');
assert.deepEqual(evaluationSchema.properties.rubric.items.required,
  ['step', 'criterion', 'maxScore', 'earnedScore', 'status', 'feedback', 'fix']);
assert.deepEqual(evaluationSchema.properties.rigor.properties.level.enum,
  ['rigorous', 'mostly-rigorous', 'gaps', 'insufficient']);

const checks = verifierChecks({ rubricConsistent: true }, false);
assert.equal(checks.rubricConsistent, true);
assert.equal(verifierChecks({}, false).rubricConsistent, false);

// ── 30-minute Idle Timeout Verification ──────────────────────────────────
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const authSource = fs.readFileSync(new URL('../auth.js', import.meta.url), 'utf8');
assert.ok(authSource.includes('30 * 60 * 1000'), 'auth.js must use 30 minutes for idle timeout');
assert.ok(!authSource.includes('5 * 60 * 1000'), 'auth.js must not retain old 5 minutes timeout');

// ── Bi-directional Vietnamese <-> English Translation Verification ──────
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const i18nSource = fs.readFileSync(new URL('../i18n.js', import.meta.url), 'utf8');
const dom = new JSDOM(html, { url: 'https://math.test/', runScripts: 'outside-only' });
const { window } = dom;
window.eval(i18nSource);

const tabs = [
  'tab-btn-primary', 'tab-btn-admission', 'tab-btn-danang', 'tab-btn-mock',
  'tab-btn-tst', 'tab-btn-vmo', 'tab-btn-topics', 'tab-btn-history', 'tab-btn-olympic',
  'tab-btn-olympic30', 'tab-btn-duyenhai', 'tab-btn-university-materials',
  'tab-btn-books', 'tab-btn-university', 'tab-btn-coach', 'tab-btn-support'
];

// Capture initial Vietnamese tab labels
const initialViLabels = tabs.map(id => {
  const el = window.document.getElementById(id);
  assert.ok(el, `Tab button ${id} must exist in DOM`);
  return el.textContent.trim();
});

// Switch to English
window.setLanguage('en');
assert.equal(window.currentLang, 'en');
for (const id of tabs) {
  const text = window.document.getElementById(id).textContent;
  assert.ok(!/[ăâđêôơưáàảãạắằẳẵặéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵ]/i.test(text),
    `Tab ${id} must not contain Vietnamese when switched to English: ${text}`);
}

// Switch back to Vietnamese - must restore exact initial Vietnamese text
window.setLanguage('vi');
assert.equal(window.currentLang, 'vi');
tabs.forEach((id, index) => {
  assert.equal(window.document.getElementById(id).textContent.trim(), initialViLabels[index],
    `Tab ${id} must revert completely to exact Vietnamese`);
});

window.close();

console.log('AI Coach modes: practice matrix, Socratic/plan schemas, 30m idle logout, and bilingual i18n: OK');
