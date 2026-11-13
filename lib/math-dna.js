// Math DNA: extract the reusable mathematical structure of a problem/solution.
// The model proposes tags and hypothesis dependencies; deterministic code
// normalizes them into a stable vocabulary so retrieval by technique is
// reliable across sessions and languages.
import { text } from './ai.js';

export const TECHNIQUE_CATALOG = [
  { id: 'invariant', label: 'Bất biến', aliases: ['invariant', 'invariants', 'bất biến'] },
  { id: 'monovariant', label: 'Đơn biến', aliases: ['monovariant', 'đơn biến'] },
  { id: 'extremal-principle', label: 'Nguyên lý cực trị', aliases: ['extremal principle', 'extremal', 'cực trị'] },
  { id: 'pigeonhole', label: 'Nguyên lý Dirichlet', aliases: ['pigeonhole', 'dirichlet', 'chuồng bồ câu'] },
  { id: 'double-counting', label: 'Đếm hai cách', aliases: ['double counting', 'đếm hai cách', 'đếm kép'] },
  { id: 'induction', label: 'Quy nạp', aliases: ['induction', 'quy nạp'] },
  { id: 'strong-induction', label: 'Quy nạp mạnh', aliases: ['strong induction', 'quy nạp mạnh'] },
  { id: 'infinite-descent', label: 'Xuống thang vô hạn', aliases: ['infinite descent', 'xuống thang'] },
  { id: 'contradiction', label: 'Phản chứng', aliases: ['contradiction', 'phản chứng'] },
  { id: 'vieta-jumping', label: 'Nhảy Viète', aliases: ['vieta jumping', 'vieta-jumping', 'nhảy viète'] },
  { id: 'p-adic', label: 'Định giá p-adic', aliases: ['p-adic', 'p adic', 'định giá'] },
  { id: 'lte', label: 'Bổ đề LTE', aliases: ['lte', 'lifting the exponent'] },
  { id: 'crt', label: 'Thặng dư Trung Hoa', aliases: ['crt', 'chinese remainder', 'thặng dư trung hoa'] },
  { id: 'modular-arithmetic', label: 'Đồng dư', aliases: ['modular arithmetic', 'modulo', 'đồng dư'] },
  { id: 'cauchy-schwarz', label: 'Cauchy–Schwarz', aliases: ['cauchy', 'cauchy-schwarz', 'bunhiacopxki', 'bunhiacopsky'] },
  { id: 'am-gm', label: 'AM–GM', aliases: ['am-gm', 'am gm', 'cauchy am gm', 'cô si'] },
  { id: 'jensen', label: 'Jensen', aliases: ['jensen'] },
  { id: 'schur', label: 'Schur', aliases: ['schur'] },
  { id: 'sos', label: 'Tổng bình phương SOS', aliases: ['sos', 'sum of squares', 'tổng bình phương'] },
  { id: 'tangent-line', label: 'Phương pháp tiếp tuyến', aliases: ['tangent line', 'tiếp tuyến'] },
  { id: 'smoothing', label: 'Dồn biến', aliases: ['smoothing', 'dồn biến', 'uvw'] },
  { id: 'substitution', label: 'Đổi biến', aliases: ['substitution', 'đổi biến', 'thế biến'] },
  { id: 'functional-cauchy', label: 'Phương trình hàm Cauchy', aliases: ['cauchy functional', 'cauchy equation', 'hàm cauchy'] },
  { id: 'injectivity-surjectivity', label: 'Đơn ánh / toàn ánh', aliases: ['injective', 'surjective', 'bijective', 'đơn ánh', 'toàn ánh'] },
  { id: 'fixed-point', label: 'Điểm bất động', aliases: ['fixed point', 'điểm bất động'] },
  { id: 'telescoping', label: 'Thu gọn telescoping', aliases: ['telescoping', 'thu gọn'] },
  { id: 'generating-functions', label: 'Hàm sinh', aliases: ['generating function', 'hàm sinh'] },
  { id: 'roots-of-unity', label: 'Căn của đơn vị', aliases: ['roots of unity', 'căn của đơn vị', 'căn đơn vị'] },
  { id: 'graph-model', label: 'Mô hình đồ thị', aliases: ['graph model', 'graph theory', 'đồ thị'] },
  { id: 'coloring', label: 'Tô màu', aliases: ['coloring', 'colouring', 'tô màu'] },
  { id: 'angle-chasing', label: 'Truy đuổi góc', aliases: ['angle chasing', 'angle-chasing', 'truy đuổi góc'] },
  { id: 'radical-axis', label: 'Trục đẳng phương', aliases: ['radical axis', 'trục đẳng phương'] },
  { id: 'spiral-similarity', label: 'Đồng dạng xoắn ốc', aliases: ['spiral similarity', 'đồng dạng xoắn ốc'] },
  { id: 'inversion', label: 'Phép nghịch đảo', aliases: ['inversion', 'nghịch đảo'] },
  { id: 'complex-numbers', label: 'Số phức', aliases: ['complex numbers', 'số phức'] },
  { id: 'coordinates', label: 'Tọa độ', aliases: ['coordinates', 'tọa độ'] },
  { id: 'trigonometry', label: 'Lượng giác', aliases: ['trigonometry', 'trig', 'lượng giác'] },
  { id: 'wlog', label: 'Không mất tổng quát', aliases: ['wlog', 'without loss of generality', 'không mất tổng quát'] },
  { id: 'region-partition', label: 'Phân hoạch miền', aliases: ['partition', 'phân hoạch'] }
];

const normalizeKey = value => text(value, 160)
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[đĐ]/g, 'd')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const catalogIndex = (() => {
  const index = new Map();
  for (const item of TECHNIQUE_CATALOG) {
    for (const alias of [item.id, item.label, ...item.aliases]) {
      const key = normalizeKey(alias);
      if (key) index.set(key, item);
    }
  }
  return index;
})();

export function canonicalTechnique(value) {
  const raw = text(value, 120).replace(/^#+/, '').trim();
  if (!raw) return null;
  const key = normalizeKey(raw);
  const direct = catalogIndex.get(key);
  if (direct) return { id: direct.id, label: direct.label };
  // Accept variants such as "Bất đẳng thức Cauchy - Schwarz".
  for (const [catalogKey, item] of catalogIndex) {
    if (catalogKey && (key.includes(catalogKey) || catalogKey.includes(key)) && Math.min(key.length, catalogKey.length) >= 4) {
      return { id: item.id, label: item.label };
    }
  }
  return {
    id: `custom:${normalizeKey(raw).replace(/\s+/g, '-').slice(0, 48) || 'other'}`,
    label: raw.slice(0, 80)
  };
}

export const mathDnaSchema = {
  type: 'object',
  properties: {
    primaryTechnique: { type: 'string', description: 'The single technique that unlocks this problem.' },
    techniqueTags: { type: 'array', items: { type: 'string' }, description: 'Every reusable technique actually used in the solution.' },
    hypothesisDependencies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          hypothesis: { type: 'string' },
          used: { type: 'boolean' },
          consequenceIfRemoved: { type: 'string' }
        },
        required: ['hypothesis', 'used', 'consequenceIfRemoved'],
        additionalProperties: false
      }
    },
    prerequisites: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          concept: { type: 'string' },
          whyNeeded: { type: 'string' }
        },
        required: ['concept', 'whyNeeded'],
        additionalProperties: false
      }
    },
    insight: { type: 'string', description: 'The key idea in at most three sentences.' },
    difficulty: { type: 'integer', description: '1 (routine) to 5 (Olympiad-hard).' },
    suggestedPracticeFocus: { type: 'array', items: { type: 'string' } }
  },
  required: ['primaryTechnique', 'techniqueTags', 'hypothesisDependencies', 'prerequisites', 'insight', 'difficulty', 'suggestedPracticeFocus'],
  additionalProperties: false
};

export function normalizeMathDna(value) {
  const data = value && typeof value === 'object' ? value : {};
  const techniques = [];
  const seen = new Set();
  const push = raw => {
    const technique = canonicalTechnique(raw);
    if (!technique || seen.has(technique.id)) return;
    seen.add(technique.id);
    techniques.push(technique);
  };
  push(data.primaryTechnique);
  (Array.isArray(data.techniqueTags) ? data.techniqueTags : []).slice(0, 14).forEach(push);

  const primary = canonicalTechnique(data.primaryTechnique) || techniques[0] || null;
  const dependencies = (Array.isArray(data.hypothesisDependencies) ? data.hypothesisDependencies : [])
    .slice(0, 12)
    .map(item => ({
      hypothesis: text(item?.hypothesis, 600),
      used: item?.used === true,
      consequenceIfRemoved: text(item?.consequenceIfRemoved, 1_200)
    }))
    .filter(item => item.hypothesis && item.consequenceIfRemoved);
  const prerequisites = (Array.isArray(data.prerequisites) ? data.prerequisites : [])
    .slice(0, 12)
    .map(item => ({ concept: text(item?.concept, 300), whyNeeded: text(item?.whyNeeded, 1_200) }))
    .filter(item => item.concept && item.whyNeeded);
  const difficulty = Math.max(1, Math.min(5, Math.round(Number(data.difficulty) || 3)));

  return {
    primaryTechnique: primary || { id: 'custom:other', label: 'Khác' },
    techniqueTags: techniques.length ? techniques : [{ id: 'custom:other', label: 'Khác' }],
    hypothesisDependencies: dependencies,
    prerequisites,
    insight: text(data.insight, 4_000),
    difficulty,
    suggestedPracticeFocus: (Array.isArray(data.suggestedPracticeFocus) ? data.suggestedPracticeFocus : [])
      .slice(0, 6).map(item => text(item, 500)).filter(Boolean)
  };
}

export const MATH_DNA_INSTRUCTION = `Extract the mathematical DNA of this problem. Use only techniques that the solution actually uses, not techniques merely mentioned. For each hypothesis, state concretely what breaks if it is removed. Name prerequisites a student must already know. Prefer the canonical technique ids supplied below.`;

function catalogPrompt() {
  return TECHNIQUE_CATALOG.map(item => `- ${item.id} | ${item.label}`).join('\n');
}

export async function extractMathDna({
  common,
  solution,
  outputLanguage = 'Vietnamese',
  deadline = Date.now() + 280_000,
  generate,
  log = console.warn
}) {
  const timeoutMs = Math.max(8_000, Math.min(120_000, deadline - Date.now()));
  const prompt = `${MATH_DNA_INSTRUCTION}

CANONICAL TECHNIQUES
${catalogPrompt()}

STATEMENT AND CONTEXT
${common}

SOLUTION (may be empty for a statement-only extraction)
${text(solution, 100_000) || '(no solution supplied)'}

Write free text in ${outputLanguage}. Return only the structured JSON.`;
  try {
    const result = await generate({
      contents: prompt,
      schema: mathDnaSchema,
      systemInstruction: 'You are a mathematics curriculum analyst. Extract reusable structure, not a summary. Return only the structured JSON.',
      models: [process.env.GEMINI_DNA_MODEL || 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.5-flash-lite'],
      timeoutMs,
      totalTimeoutMs: timeoutMs,
      maxOutputTokens: 8_000,
      temperature: 0.15
    });
    return { dna: normalizeMathDna(result?.data), model: result?.model || '' };
  } catch (error) {
    log('[MATH DNA failed]', { code: error?.code || 'UNKNOWN' });
    throw error;
  }
}
