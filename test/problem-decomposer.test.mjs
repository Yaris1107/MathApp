import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import {
  decomposerSchema,
  normalizeDecomposition,
  buildFallbackDecomposition,
  decomposeProblem
} from '../lib/problem-decomposer.js';

// ── 1. Schema & Validation ──────────────────────────────────────────────────
assert.ok(decomposerSchema.properties.nodes);
assert.ok(decomposerSchema.properties.connections);
assert.equal(decomposerSchema.required.includes('targetGoal'), true);

// ── 2. Normalization of raw model output ─────────────────────────────────────
const rawSample = {
  title: 'Bài toán phương trình hàm Cauchy',
  summary: 'Phân tích qua 3 bước then chốt',
  targetGoal: 'Xác định tất cả hàm f thỏa mãn',
  difficulty: 4,
  estimatedSteps: 3,
  nodes: [
    {
      id: 'step-1-sub',
      title: 'Các phép thế biến',
      category: 'observation',
      level: 0,
      dependsOn: [],
      description: 'Thế x=0, y=0',
      keyFormula: '\\(f(0) = 0\\)',
      hints: [
        { level: 1, label: 'Định hướng', content: 'Thế các giá trị đặc biệt' },
        { level: 2, label: 'Kỹ thuật', content: 'Dùng tính đơn ánh' },
        { level: 3, label: 'Lời giải', content: 'Chứng minh f(x)=x' }
      ],
      checkQuestion: {
        question: 'Tại sao cần thế x=y=0?',
        options: ['Để tìm f(0)', 'Để triệt tiêu vế phải', 'Không có lý do'],
        correctIndex: 0,
        explanation: 'Cho biết giá trị tại gốc tọa độ.'
      }
    },
    {
      id: 'step-2-cauchy',
      title: 'Quy về Cauchy',
      category: 'technique',
      level: 1,
      dependsOn: ['step-1-sub'],
      description: 'Cộng tính',
      keyFormula: '\\(f(x+y)=f(x)+f(y)\\)',
      hints: [
        { level: 1, label: 'Định hướng', content: 'Cộng tính trên Q' },
        { level: 2, label: 'Kỹ thuật', content: 'Mở rộng lên R' },
        { level: 3, label: 'Lời giải', content: 'Kết luận f(x)=cx' }
      ]
    }
  ],
  connections: [
    { from: 'step-1-sub', to: 'step-2-cauchy', label: 'dẫn tới' }
  ]
};

const normalized = normalizeDecomposition(rawSample, { lang: 'vi' });
assert.equal(normalized.title, 'Bài toán phương trình hàm Cauchy');
assert.equal(normalized.nodes.length, 2);
assert.equal(normalized.nodes[0].hints.length, 3);
assert.equal(normalized.nodes[0].checkQuestion.correctIndex, 0);
assert.equal(normalized.connections.length, 1);
assert.equal(normalized.connections[0].from, 'step-1-sub');

// ── 3. Deterministic Mathematical Fallbacks ──────────────────────────────────
const geoFallback = buildFallbackDecomposition({
  statement: 'Cho tam giác ABC nội tiếp (O), trực tâm H. Chứng minh AH cắt BC tại trung điểm.',
  topic: 'Hình học phẳng',
  title: 'Bài hình học',
  lang: 'vi'
});
assert.ok(geoFallback.nodes.length >= 3, 'Geometry fallback should produce at least 3 nodes');
assert.ok(geoFallback.nodes.some(n => n.category === 'observation' || n.category === 'lemma'));
assert.ok(geoFallback.connections.length >= 2);

const seqFallbackEn = buildFallbackDecomposition({
  statement: 'Consider sequence x_n with x_1 = 2 and x_{n+1} = (x_n + 2)/x_n. Prove convergence and find limit.',
  topic: 'Sequences',
  title: 'Sequence Limit',
  lang: 'en'
});
assert.ok(seqFallbackEn.nodes.length >= 3);
assert.equal(seqFallbackEn.title, 'Sequence Limit');
assert.ok(seqFallbackEn.nodes[0].hints[0].label.includes('Direction'));

// ── 4. DecomposeProblem with Simulated Model ─────────────────────────────────
const result = await decomposeProblem({
  statement: 'Cho f(x+y) = f(x) + f(y) với mọi x, y thực. Giả sử f liên tục tại 0. Tìm f(x).',
  topic: 'Phương trình hàm',
  title: 'PTH Cauchy',
  lang: 'vi',
  pipelineBudget: 5000
});
assert.ok(result.nodes.length >= 3);
assert.ok(result.nodes[0].id);
assert.ok(result.connections.length >= 1);

// ── 5. Client DOM Rendering & Interactive Simulation ─────────────────────────
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const scriptDecomp = fs.readFileSync(new URL('../ai_decomposer.js', import.meta.url), 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://example.test/' });
const { window } = dom;

window.MathJax = { typesetPromise: async () => {}, typesetClear: () => {} };
window.showVMOToast = () => {};
window.eval(scriptDecomp);

// Mock fetch to return decomposer JSON
window.fetch = async (url, options) => {
  const body = JSON.parse(options?.body || '{}');
  if (body.mode === 'decompose') {
    return {
      ok: true,
      json: async () => ({
        success: true,
        source: 'gemini_problem_decomposer',
        data: {
          decomposer: rawSample
        }
      })
    };
  }
  return { ok: false, json: async () => ({}) };
};

// Create a problem card in DOM and open decomposer
const container = window.document.createElement('div');
container.className = 'problem-item';
container.id = 'prob-test-1';
container.innerHTML = `
  <div class="problem-header">
    <span class="problem-id">Câu 1</span>
    <button class="btn-problem-decomposer">🧩 Xé nhỏ bài toán</button>
  </div>
  <div class="problem-content">Cho f(x+y)=f(x)+f(y). Tìm f.</div>
`;
window.document.body.appendChild(container);

const btn = container.querySelector('.btn-problem-decomposer');
await window.openProblemDecomposer(btn);

const wrap = container.querySelector('.ai-decomposer-wrap');
assert.ok(wrap, 'Decomposer wrapper should be rendered');
assert.ok(wrap.querySelector('.decomp-header'), 'Header should be rendered');
assert.equal(wrap.querySelectorAll('.decomp-node-card').length, 2, 'Two node cards in graph');

// Simulate selecting node 1 and answering quiz correctly
window.decompSelectNode('prob-test-1', 'step-1-sub');
window.decompAnswerQuiz('prob-test-1', 'step-1-sub', 0);
assert.ok(container.querySelector('.decomp-quiz-feedback.success'));

// Simulate selecting node 2
window.decompSelectNode('prob-test-1', 'step-2-cauchy');
assert.ok(container.querySelector('.decomp-node-card.active'));

// Simulate marking node completed
window.decompMarkCompleted('prob-test-1', 'step-1-sub');
assert.ok(container.textContent.includes('50%'), 'Progress should advance to 50%');

// Unlock all
window.decompUnlockAll('prob-test-1');
assert.ok(container.textContent.includes('100%'), 'Progress should reach 100%');

// Reset
window.decompReset('prob-test-1');
assert.ok(container.textContent.includes('0%'), 'Progress should reset to 0%');

console.log('Problem Decomposer: Schema, normalization, fallbacks, client rendering & interactions: OK');
