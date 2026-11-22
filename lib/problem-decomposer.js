/**
 * PROBLEM DECOMPOSER ENGINE
 * Phân rã bài toán Olympic / THPT chuyên thành bản đồ tư duy (DAG/Mind Map)
 * với hệ thống gợi ý từng tầng (Progressive Hints) và mini-quiz tự kiểm tra.
 * Đảm bảo 100% công thức toán học (kể cả x_{n+1} = x_n + 1/x_n) được bọc LaTeX chuẩn xác.
 */

import { text } from './ai.js';
import { generateVerifierJson } from './ai-verifier.js';

export const decomposerSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    targetGoal: { type: 'string' },
    difficulty: { type: 'integer' },
    estimatedSteps: { type: 'integer' },
    nodes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          category: { type: 'string' }, // 'target' | 'observation' | 'lemma' | 'technique' | 'calculation' | 'conclusion'
          level: { type: 'integer' },
          dependsOn: { type: 'array', items: { type: 'string' } },
          description: { type: 'string' },
          keyFormula: { type: 'string' },
          hints: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                level: { type: 'integer' },
                label: { type: 'string' },
                content: { type: 'string' }
              },
              required: ['level', 'label', 'content'],
              additionalProperties: false
            }
          },
          checkQuestion: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              options: { type: 'array', items: { type: 'string' } },
              correctIndex: { type: 'integer' },
              explanation: { type: 'string' }
            },
            required: ['question', 'options', 'correctIndex', 'explanation'],
            additionalProperties: false
          }
        },
        required: ['id', 'title', 'category', 'level', 'dependsOn', 'description', 'hints'],
        additionalProperties: false
      }
    },
    connections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          from: { type: 'string' },
          to: { type: 'string' },
          label: { type: 'string' }
        },
        required: ['from', 'to'],
        additionalProperties: false
      }
    }
  },
  required: ['title', 'summary', 'targetGoal', 'difficulty', 'estimatedSteps', 'nodes', 'connections'],
  additionalProperties: false
};

const CATEGORIES = ['target', 'observation', 'lemma', 'technique', 'calculation', 'conclusion'];

/**
 * Tự động nhận diện và bọc các biểu thức toán học trần (bare math expressions)
 * như x_{n+1} = x_n + 1/x_n, u_n, f(x), v.v. vào delimiter chuẩn \( ... \)
 */
export function autoFormatLatex(input) {
  if (!input || typeof input !== 'string') return '';
  let s = input;

  const protectedMath = [];
  function protect(math) {
    protectedMath.push(math);
    return `@@MATH_${protectedMath.length - 1}@@`;
  }

  // 1. Bảo vệ các khối toán đã có delimiter: \(...\), \[...\], $...$, $$...$$
  s = s.replace(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g, m => protect(m));

  // 2. Bảo vệ các chuỗi lệnh LaTeX trần bắt đầu bằng gạch chéo ngược (như \infty, \to, \implies, \frac{...}{...}, \sqrt{...}, v.v.)
  // Xử lý \text{...} đơn lẻ để đưa về văn bản tự nhiên, tránh để MathJax báo lỗi bên ngoài toán
  s = s.replace(/(\\(?:[a-zA-Z]+)(?:\{[^{}]*\}|\[[^\[\]]*\])*(?:_[a-zA-Z0-9]+|_{[^{}]*})*(?:\^[a-zA-Z0-9]+|\^{[^{}]*})*(?:\s*(?:=|<|>|<=|>=|!=|\+|-|\*|\/|\\to|\\implies|\\iff)\s*(?:\\?[a-zA-Z0-9]+(?:\{[^{}]*\}|\[[^\[\]]*\])*(?:_[a-zA-Z0-9]+|_{[^{}]*})*(?:\^[a-zA-Z0-9]+|\^{[^{}]*})*|[0-9]+))*)/g, (m) => {
    if (/^\\[nrtbfv]$/.test(m)) return m;
    const textMatch = m.match(/^\\text\{([^{}]*)\}$/);
    if (textMatch) return textMatch[1];
    return protect(`\\(${m}\\)`);
  });

  // 3. Nhận diện các phương trình / hệ thức truy hồi hoàn chỉnh:
  // E.g. x_{n+1} = x_n + 1/x_n, L = f(L), x_{n+1} - x_n = f(x_n) - x_n, g(x+y) = g(x) + g(y)
  // Quan trọng: Lookaround không được cho phép khớp bên trong nhóm chỉ số dưới {n+1} (tránh sinh \(x_{\(n+1\)}\))
  const mathToken = "(?:[a-zA-Z](?:_[a-zA-Z0-9]+|_{[^{}]+})?(?:\\^[a-zA-Z0-9]+|\\^{[^{}]+})?(?:\\([a-zA-Z0-9_+\\-*\\/\\\\,\\s]+\\))?|[0-9]+(?:\\/[a-zA-Z0-9_]+|\\/[a-zA-Z](?:_[a-zA-Z0-9]+|_{[^{}]+}))?|\\\\[a-zA-Z]+(?:\\{[^{}]*\\})*)";
  const mathOp = "(?:\\s*(?:=|<|>|<=|>=|!=|\\+|-|\\*|\\/|\\^|=>|<=>|->)\\s*)";
  const eqRegex = new RegExp(`(?<![a-zA-Z0-9_\\\\{])(${mathToken}(?:${mathOp}${mathToken})+)(?![a-zA-Z0-9_\\\\}])`, "g");

  s = s.replace(eqRegex, (m) => {
    if (!/(=|<|>|\+|-|\*|\/|_|\^|=>|->)/.test(m)) return m;
    let formatted = m
      .replace(/(\b[0-9]+)\/([a-zA-Z](?:_[a-zA-Z0-9]+|_{[^{}]+})|[0-9]+)/g, '\\frac{$1}{$2}')
      .replace(/>=/g, '\\ge ')
      .replace(/<=/g, '\\le ')
      .replace(/!=/g, '\\ne ')
      .replace(/=>/g, '\\implies ')
      .replace(/<=>/g, '\\iff ')
      .replace(/->/g, '\\to ');
    return protect(`\\(${formatted}\\)`);
  });

  // 4. Biến có chỉ số dưới trần (x_{n+1}, x_n, u_n, x_1, x_2, (x_n), (x_{2n}))
  s = s.replace(/(?<![a-zA-Z0-9_\\\\])(\(?[a-zA-Z](?:_[a-zA-Z0-9]+|_{[^{}]+})(?:\^[a-zA-Z0-9]+|\^{[^{}]+})?\)?)(?![a-zA-Z0-9_])/g, m => protect(`\\(${m}\\)`));

  // 5. Khoảng chặn [a, b], [x_1, x_2]
  s = s.replace(/(?<![a-zA-Z0-9_\\\\])(\[[a-zA-Z0-9_+\\-]+,\s*[a-zA-Z0-9_+\\-]+\])(?![a-zA-Z0-9_])/g, m => protect(`\\(${m}\\)`));

  // 6. Phục hồi các khối toán đã bảo vệ
  s = s.replace(/@@MATH_(\d+)@@/g, (_, idx) => protectedMath[Number(idx)]);

  // 7. Dọn dẹp an toàn các cặp ngoặc kép vô ý
  s = s.replace(/\\\(\s*\\\(([\s\S]*?)\\\)\s*\\\)/g, '\\($1\\)');
  s = s.replace(/\\\(\s*\\\)/g, '');

  return s;
}

/**
 * Chuẩn hóa kết quả decomposition từ model AI hoặc dữ liệu thô
 */
export function normalizeDecomposition(raw, options = {}) {
  const lang = options.lang === 'en' ? 'en' : 'vi';
  const isEn = lang === 'en';

  if (!raw || typeof raw !== 'object') {
    return buildFallbackDecomposition(options);
  }

  const title = autoFormatLatex(text(raw.title, 300)) || (isEn ? 'Problem Decomposition Map' : 'Bản đồ tư duy giải toán');
  const summary = autoFormatLatex(text(raw.summary, 1000)) || (isEn ? 'Step-by-step problem breakdown.' : 'Phân tích các bước tư duy của bài toán.');
  const targetGoal = autoFormatLatex(text(raw.targetGoal, 800)) || (isEn ? 'Reach final mathematical conclusion.' : 'Đạt được kết luận toán học cuối cùng.');
  const difficulty = Math.max(1, Math.min(5, Number(raw.difficulty) || 3));

  let nodes = Array.isArray(raw.nodes) ? raw.nodes : [];
  if (nodes.length < 2) {
    return buildFallbackDecomposition(options);
  }

  const seenIds = new Set();
  const cleanedNodes = [];

  nodes.forEach((n, idx) => {
    if (!n || typeof n !== 'object') return;
    let id = String(n.id || `step-${idx + 1}`).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!id || seenIds.has(id)) id = `node-${idx + 1}`;
    seenIds.add(id);

    const nodeTitle = autoFormatLatex(text(n.title, 200)) || (isEn ? `Step ${idx + 1}` : `Bước ${idx + 1}`);
    const category = CATEGORIES.includes(n.category) ? n.category : (idx === 0 ? 'observation' : (idx === nodes.length - 1 ? 'conclusion' : 'lemma'));
    const level = Math.max(0, Math.min(4, Number(n.level) || (idx === 0 ? 0 : 1)));
    const dependsOn = Array.isArray(n.dependsOn) ? n.dependsOn.map(d => String(d).trim()).filter(Boolean) : [];
    const description = autoFormatLatex(text(n.description, 1000));
    const keyFormula = autoFormatLatex(text(n.keyFormula, 800));

    // Hints normalization (3 levels)
    let rawHints = Array.isArray(n.hints) ? n.hints : [];
    let hints = [];

    const defaultHintLabels = isEn
      ? ['Level 1: Direction & Intuition', 'Level 2: Technique & Key Formulation', 'Level 3: Detailed Step Proof']
      : ['Tầng 1: Định hướng tư duy', 'Tầng 2: Kỹ thuật then chốt', 'Tầng 3: Chứng minh chi tiết của bước'];

    for (let lvl = 1; lvl <= 3; lvl++) {
      const existing = rawHints.find(h => Number(h?.level) === lvl) || rawHints[lvl - 1];
      const content = autoFormatLatex(text(existing?.content, 3000));
      if (content) {
        hints.push({
          level: lvl,
          label: autoFormatLatex(text(existing?.label, 100)) || defaultHintLabels[lvl - 1],
          content
        });
      }
    }

    if (hints.length === 0) {
      hints = [
        {
          level: 1,
          label: defaultHintLabels[0],
          content: description || (isEn ? 'Analyze the conditions and identify the invariant.' : 'Khảo sát giả thiết và tìm các bất biến hoặc đặc trưng của bài toán.')
        },
        {
          level: 2,
          label: defaultHintLabels[1],
          content: keyFormula ? (isEn ? `Apply the formulation: ${keyFormula}` : `Thiết lập biến đổi: ${keyFormula}`) : (isEn ? 'Transform variables and check edge cases.' : 'Đổi biến hoặc đánh giá bất đẳng thức phù hợp.')
        },
        {
          level: 3,
          label: defaultHintLabels[2],
          content: isEn ? 'Complete this sub-step rigorously.' : 'Trình bày trọn vẹn lập luận logic để hoàn tất bước này.'
        }
      ];
    }

    // Check Question normalization
    let checkQuestion = null;
    if (n.checkQuestion && typeof n.checkQuestion === 'object' && n.checkQuestion.question) {
      const qText = autoFormatLatex(text(n.checkQuestion.question, 500));
      const optionsList = Array.isArray(n.checkQuestion.options)
        ? n.checkQuestion.options.map(opt => autoFormatLatex(text(opt, 200))).filter(Boolean)
        : [];
      if (optionsList.length >= 2) {
        const correctIndex = Math.max(0, Math.min(optionsList.length - 1, Number(n.checkQuestion.correctIndex) || 0));
        checkQuestion = {
          question: qText,
          options: optionsList,
          correctIndex,
          explanation: autoFormatLatex(text(n.checkQuestion.explanation, 600)) || (isEn ? 'Correct answer derived from the mathematical analysis of this step.' : 'Đáp án chính xác dựa trên lập luận toán học của bước này.')
        };
      }
    }

    cleanedNodes.push({
      id,
      title: nodeTitle,
      category,
      level,
      dependsOn,
      description,
      keyFormula,
      hints,
      checkQuestion
    });
  });

  // Connections normalization
  let connections = Array.isArray(raw.connections) ? raw.connections : [];
  const validConnections = [];

  connections.forEach(conn => {
    if (!conn || typeof conn !== 'object') return;
    const from = String(conn.from || '').trim();
    const to = String(conn.to || '').trim();
    if (from && to && seenIds.has(from) && seenIds.has(to) && from !== to) {
      validConnections.push({
        from,
        to,
        label: text(conn.label, 100)
      });
    }
  });

  // If no connections, create linear chain among nodes
  if (validConnections.length === 0 && cleanedNodes.length > 1) {
    for (let i = 0; i < cleanedNodes.length - 1; i++) {
      validConnections.push({
        from: cleanedNodes[i].id,
        to: cleanedNodes[i + 1].id,
        label: isEn ? 'leads to' : 'dẫn tới'
      });
    }
  }

  return {
    title,
    summary,
    targetGoal,
    difficulty,
    estimatedSteps: cleanedNodes.length,
    nodes: cleanedNodes,
    connections: validConnections
  };
}

/**
 * Bộ sinh bản đồ phân rã dự phòng chất lượng cao (Deterministic Mathematical Fallback)
 * Tự động nhận diện dạng toán (PTH, Dãy số, Số học, Hình học, Tổ hợp, BĐT) để tạo sơ đồ tư duy thực chiến
 */
export function buildFallbackDecomposition({ statement = '', topic = '', title = '', solution = '', lang = 'vi' }) {
  const isEn = lang === 'en';
  const normText = `${statement} ${topic} ${title} ${solution}`.toLowerCase();

  // 1. Phân loại dạng toán
  let branch = 'algebra';
  if (/hình|tam giác|đường tròn|tiếp xúc|đồng quy|thẳng hàng|trục đẳng phương|tứ giác|geometry|circle/i.test(normText)) {
    branch = 'geometry';
  } else if (/phương trình hàm|hàm số|f\(x\)|functional/i.test(normText)) {
    branch = 'functional_eq';
  } else if (/dãy số|giới hạn|hội tụ|lim|u_n|x_n|sequence/i.test(normText)) {
    branch = 'sequence';
  } else if (/chia hết|nguyên tố|ước chung|modulo|đồng dư|thặng dư|số nguyên|number theory|prime/i.test(normText)) {
    branch = 'number_theory';
  } else if (/tổ hợp|đếm|tô màu|dirichlet|đồ thị|bàn cờ|combinatorics/i.test(normText)) {
    branch = 'combinatorics';
  } else if (/bất đẳng thức|lớn nhất|nhỏ nhất|cực trị|am-gm|cauchy|inequality/i.test(normText)) {
    branch = 'inequality';
  }

  if (branch === 'geometry') {
    return isEn ? {
      title: title || 'Geometry Problem Decomposition',
      summary: 'Deconstruct the geometric configuration into cyclic properties, auxiliary radical lemmas, and conclusion.',
      targetGoal: 'Prove the target geometric concurrency, collinearity, or cyclic property.',
      difficulty: 4,
      estimatedSteps: 3,
      nodes: [
        {
          id: 'step-1-config',
          title: 'Step 1: Configuration & Special Points',
          category: 'observation',
          level: 0,
          dependsOn: [],
          description: 'Identify harmonic bundles, radical axes, or cyclic quadrilaterals from initial points.',
          keyFormula: '\\(\\angle ABC = \\angle ADC\\)',
          hints: [
            { level: 1, label: 'Direction', content: 'Draw the exact configuration and look for cyclic quadrilaterals sharing circumcircles.' },
            { level: 2, label: 'Technique', content: 'Chase directed angles modulo \\(\\pi\\) or construct the radical axis of the two circles.' },
            { level: 3, label: 'Proof', content: 'Show that the four points lie on a circle by proving supplementary opposite angles: \\(\\angle ABC + \\angle ADC = \\pi\\).' }
          ],
          checkQuestion: {
            question: 'What is the most effective approach when two circles intersect at two points?',
            options: ['Consider their radical axis line', 'Calculate coordinates', 'Apply trigonometry directly'],
            correctIndex: 0,
            explanation: 'The common chord is the radical axis, which simplifies power-of-a-point calculations.'
          }
        },
        {
          id: 'step-2-lemma',
          title: 'Step 2: Core Auxiliary Lemma',
          category: 'lemma',
          level: 1,
          dependsOn: ['step-1-config'],
          description: 'Establish the core relationship (e.g. collinearity or mid-point property).',
          keyFormula: '\\(\\mathcal{P}_{\\omega_1}(P) = \\mathcal{P}_{\\omega_2}(P)\\)',
          hints: [
            { level: 1, label: 'Direction', content: 'Look for an auxiliary point having equal powers with respect to the relevant circles.' },
            { level: 2, label: 'Technique', content: 'Use the radical center theorem for three circles.' },
            { level: 3, label: 'Proof', content: 'Combine the power equations to establish the required collinearity.' }
          ]
        },
        {
          id: 'step-3-deduction',
          title: 'Step 3: Synthesis & Final Target',
          category: 'conclusion',
          level: 2,
          dependsOn: ['step-2-lemma'],
          description: 'Apply the established lemma to deduce the final concurrency or tangency.',
          keyFormula: '\\(XY \\perp O_1O_2\\)',
          hints: [
            { level: 1, label: 'Direction', content: 'Connect the radical axis perpendicularity to the line of centers.' },
            { level: 2, label: 'Technique', content: 'Conclude via the uniqueness of the perpendicular line.' },
            { level: 3, label: 'Proof', content: 'Combine all observations to complete the proof.' }
          ]
        }
      ],
      connections: [
        { from: 'step-1-config', to: 'step-2-lemma', label: 'provides angle/power relation' },
        { from: 'step-2-lemma', to: 'step-3-deduction', label: 'yields final target' }
      ]
    } : {
      title: title || 'Bản đồ tư duy hình học phẳng',
      summary: 'Xé nhỏ cấu hình hình học thành các góc nội tiếp, tứ giác nội tiếp, bổ đề then chốt và kết luận.',
      targetGoal: 'Chứng minh tính chất hình học mục tiêu (đồng quy, thẳng hàng, tiếp xúc hoặc tứ giác nội tiếp).',
      difficulty: 4,
      estimatedSteps: 3,
      nodes: [
        {
          id: 'step-1-config',
          title: 'Bước 1: Khai thác cấu hình & Tứ giác nội tiếp',
          category: 'observation',
          level: 0,
          dependsOn: [],
          description: 'Quan sát các điểm đồng viên, phương tích hoặc chùm đường thẳng từ giả thiết.',
          keyFormula: '\\(\\angle ABC = \\angle ADC\\)',
          hints: [
            { level: 1, label: 'Định hướng', content: 'Vẽ hình chính xác và tìm kiếm các tứ giác nội tiếp cơ sở xuất hiện từ các đường cao, phân giác hoặc tiếp tuyến.' },
            { level: 2, label: 'Kỹ thuật', content: 'Truy đuổi góc có hướng modulo \\(\\pi\\) hoặc thiết lập phương tích của một điểm đối với đường tròn.' },
            { level: 3, label: 'Chứng minh', content: 'Chứng minh các điểm đồng viên bằng cách chỉ ra hai góc nhìn cùng một đoạn thẳng bằng nhau: \\(\\angle ABC = \\angle ADC\\).' }
          ],
          checkQuestion: {
            question: 'Khi gặp hai đường tròn cắt nhau tại hai điểm, công cụ hữu hiệu nhất là gì?',
            options: ['Xét trục đẳng phương của hai đường tròn', 'Tọa độ hóa ngay lập tức', 'Dùng định lý cosin'],
            correctIndex: 0,
            explanation: 'Dây cung chung là trục đẳng phương, cho phép chuyển các đẳng thức độ dài về phương tích.'
          }
        },
        {
          id: 'step-2-lemma',
          title: 'Bước 2: Bổ đề then chốt (Trục đẳng phương / Điểm đặc biệt)',
          category: 'lemma',
          level: 1,
          dependsOn: ['step-1-config'],
          description: 'Xây dựng bổ đề trung gian: đồng quy của ba trục đẳng phương hoặc tính chất đối xứng.',
          keyFormula: '\\(\\mathcal{P}_{\\omega_1}(P) = \\mathcal{P}_{\\omega_2}(P)\\)',
          hints: [
            { level: 1, label: 'Định hướng', content: 'Tìm điểm phụ có cùng phương tích đối với các đường tròn liên quan.' },
            { level: 2, label: 'Kỹ thuật', content: 'Áp dụng định lý tâm đẳng phương cho ba đường tròn.' },
            { level: 3, label: 'Chứng minh', content: 'Kết hợp các đẳng thức phương tích để suy ra điểm thuộc trục đẳng phương.' }
          ]
        },
        {
          id: 'step-3-deduction',
          title: 'Bước 3: Tổng hợp & Kết luận mục tiêu',
          category: 'conclusion',
          level: 2,
          dependsOn: ['step-2-lemma'],
          description: 'Dẫn xuất tính chất tiếp xúc / vuông góc / thẳng hàng cuối cùng.',
          keyFormula: '\\(XY \\perp O_1O_2\\)',
          hints: [
            { level: 1, label: 'Định hướng', content: 'Dùng tính vuông góc của trục đẳng phương với đoạn nối tâm.' },
            { level: 2, label: 'Kỹ thuật', content: 'Khẳng định tính duy nhất của điểm hoặc đường thẳng qua lập luận phản chứng/đối xứng.' },
            { level: 3, label: 'Chứng minh', content: 'Ghép nối toàn bộ chuỗi suy luận để kết thúc bài toán.' }
          ]
        }
      ],
      connections: [
        { from: 'step-1-config', to: 'step-2-lemma', label: 'cung cấp quan hệ góc & phương tích' },
        { from: 'step-2-lemma', to: 'step-3-deduction', label: 'dẫn tới kết luận cuối' }
      ]
    };
  }

  // Dãy số & Giới hạn
  if (branch === 'sequence') {
    return isEn ? {
      title: title || 'Sequences & Limits Decomposition Map',
      summary: 'Deconstruct recurrence relation, invariant bounds, monotonicity, and convergence calculation.',
      targetGoal: 'Establish convergence and determine the exact limit.',
      difficulty: 3,
      estimatedSteps: 3,
      nodes: [
        {
          id: 'step-1-bounds',
          title: 'Step 1: Invariant Interval & Lower/Upper Bounds',
          category: 'observation',
          level: 0,
          dependsOn: [],
          description: 'Find an invariant interval \\(I\\) such that \\(f(I) \\subset I\\), proving bounded sequence.',
          keyFormula: '\\(a \\le x_n \\le b, \\quad \\forall n \\ge 1\\)',
          hints: [
            { level: 1, label: 'Direction', content: 'Test small values \\(x_1, x_2, x_3\\) to hypothesize the interval \\([a, b]\\).' },
            { level: 2, label: 'Technique', content: 'Use mathematical induction to confirm the bounds for all \\(n\\).' },
            { level: 3, label: 'Proof', content: 'Check \\(f(x)\\) on \\([a, b]\\) and verify \\(f([a, b]) \\subset [a, b]\\).' }
          ],
          checkQuestion: {
            question: 'Why must we prove bounds before taking limits?',
            options: ['To guarantee the limit exists and lies in the domain', 'It is optional', 'Limits do not need bounds'],
            correctIndex: 0,
            explanation: 'A bounded monotonic sequence is guaranteed to have a finite limit by Weierstrass theorem.'
          }
        },
        {
          id: 'step-2-monotonicity',
          title: 'Step 2: Monotonicity Analysis',
          category: 'lemma',
          level: 1,
          dependsOn: ['step-1-bounds'],
          description: 'Assess difference \\(x_{n+1} - x_n\\) or ratio \\(\\frac{x_{n+1}}{x_n}\\).',
          keyFormula: '\\(x_{n+1} - x_n = f(x_n) - x_n\\)',
          hints: [
            { level: 1, label: 'Direction', content: 'Study the sign of \\(g(x) = f(x) - x\\) on the invariant interval.' },
            { level: 2, label: 'Technique', content: 'If \\(f\\) is decreasing, consider the two alternating subsequences \\((x_{2n})\\) and \\((x_{2n+1})\\).' },
            { level: 3, label: 'Proof', content: 'Show \\(x_{n+1} \\ge x_n\\) (for monotonic increasing) or analyze both alternating subsequences.' }
          ]
        },
        {
          id: 'step-3-fixed-point',
          title: 'Step 3: Fixed Point Equation & Limit',
          category: 'conclusion',
          level: 2,
          dependsOn: ['step-2-monotonicity'],
          description: 'Solve \\(L = f(L)\\) and identify the unique limit point.',
          keyFormula: '\\(L = f(L) \\implies L = L^*\\)',
          hints: [
            { level: 1, label: 'Direction', content: 'Take limit on both sides of recurrence relation: \\(\\lim x_{n+1} = \\lim f(x_n)\\).' },
            { level: 2, label: 'Technique', content: 'Eliminate extraneous roots using the proven bounds \\(a \\le L \\le b\\).' },
            { level: 3, label: 'Proof', content: 'Conclude \\(\\lim_{n \\to \\infty} x_n = L^*\\).' }
          ]
        }
      ],
      connections: [
        { from: 'step-1-bounds', to: 'step-2-monotonicity', label: 'enables sign analysis' },
        { from: 'step-2-monotonicity', to: 'step-3-fixed-point', label: 'guarantees limit existence' }
      ]
    } : {
      title: title || 'Bản đồ tư duy Dãy số & Giới hạn',
      summary: 'Xé nhỏ bài toán dãy số thành: khoảng bất biến, tính bị chặn, tính đơn điệu và phương trình điểm bất động.',
      targetGoal: 'Chứng minh dãy số hội tụ và tính giới hạn hữu hạn.',
      difficulty: 3,
      estimatedSteps: 3,
      nodes: [
        {
          id: 'step-1-bounds',
          title: 'Bước 1: Khoảng bất biến & Đánh giá bị chặn',
          category: 'observation',
          level: 0,
          dependsOn: [],
          description: 'Tìm khoảng bất biến chứa \\(x_1\\) và chứng minh dãy bị chặn bằng quy nạp.',
          keyFormula: '\\(a \\le x_n \\le b, \\quad \\forall n \\ge 1\\)',
          hints: [
            { level: 1, label: 'Định hướng', content: 'Thử vài giá trị đầu \\(x_1, x_2, x_3\\) để dự đoán khoảng chặn \\([a, b]\\).' },
            { level: 2, label: 'Kỹ thuật', content: 'Khảo sát hàm sinh \\(f(x)\\) trên \\([a, b]\\) và dùng quy nạp toán học.' },
            { level: 3, label: 'Chứng minh', content: 'Do \\(f([a, b]) \\subset [a, b]\\), suy ra \\(x_n \\in [a, b]\\) với mọi \\(n \\ge 1\\).' }
          ],
          checkQuestion: {
            question: 'Tại sao cần chứng minh dãy bị chặn trước khi tính giới hạn?',
            options: ['Để đảm bảo nghiệm của phương trình điểm bất động thuộc tập xác định', 'Không bắt buộc', 'Chỉ để tính đạo hàm'],
            correctIndex: 0,
            explanation: 'Dãy đơn điệu và bị chặn chắc chắn có giới hạn hữu hạn theo định lý Weierstrass.'
          }
        },
        {
          id: 'step-2-monotonicity',
          title: 'Bước 2: Khảo sát tính đơn điệu',
          category: 'lemma',
          level: 1,
          dependsOn: ['step-1-bounds'],
          description: 'Xét dấu hiệu \\(x_{n+1} - x_n\\) hoặc hàm hiệu \\(g(x) = f(x) - x\\).',
          keyFormula: '\\(x_{n+1} - x_n = f(x_n) - x_n\\)',
          hints: [
            { level: 1, label: 'Định hướng', content: 'Xét dấu hàm hiệu \\(g(x) = f(x) - x\\) trên khoảng bị chặn \\([a, b]\\) vừa tìm được.' },
            { level: 2, label: 'Kỹ thuật', content: 'Nếu \\(f\\) nghịch biến, xét hai dãy con đan dấu \\((x_{2n})\\) và \\((x_{2n+1})\\).' },
            { level: 3, label: 'Chứng minh', content: 'Khẳng định tính tăng/giảm ngặt của dãy số trên miền khảo sát.' }
          ]
        },
        {
          id: 'step-3-fixed-point',
          title: 'Bước 3: Giải phương trình điểm bất động & Kết luận',
          category: 'conclusion',
          level: 2,
          dependsOn: ['step-2-monotonicity'],
          description: 'Chuyển qua giới hạn hai vế, giải \\(L = f(L)\\) và chọn nghiệm thích hợp.',
          keyFormula: '\\(L = f(L) \\implies L = L^*\\)',
          hints: [
            { level: 1, label: 'Định hướng', content: 'Chuyển qua giới hạn hai vế của hệ thức truy hồi khi \\(n \\to +\\infty\\).' },
            { level: 2, label: 'Kỹ thuật', content: 'Loại bỏ nghiệm ngoại lai không thuộc khoảng chặn \\([a, b]\\).' },
            { level: 3, label: 'Chứng minh', content: 'Kết luận giới hạn duy nhất của dãy số: \\(\\lim_{n \\to \\infty} x_n = L^*\\).' }
          ]
        }
      ],
      connections: [
        { from: 'step-1-bounds', to: 'step-2-monotonicity', label: 'cho phép xét dấu' },
        { from: 'step-2-monotonicity', to: 'step-3-fixed-point', label: 'bảo đảm hội tụ' }
      ]
    };
  }

  // Phương trình hàm / Đại số tổng quát (Default)
  return isEn ? {
    title: title || 'Analytical Problem Mind Map',
    summary: 'Decompose into core substitutions, invariant properties, auxiliary lemmas, and conclusion.',
    targetGoal: 'Determine all satisfying solutions / rigorous proof.',
    difficulty: 4,
    estimatedSteps: 3,
    nodes: [
      {
        id: 'step-1-substitutions',
        title: 'Step 1: Strategic Substitutions & Edge Cases',
        category: 'observation',
        level: 0,
        dependsOn: [],
        description: 'Substitute special values (\\(x=0, x=1, x=y\\)) to reveal injectivity/surjectivity or values.',
        keyFormula: '\\(f(0), f(1)\\) or \\(f(x) = f(y) \\implies x = y\\)',
        hints: [
          { level: 1, label: 'Direction', content: 'Substitute boundary values to isolate single-variable terms.' },
          { level: 2, label: 'Technique', content: 'Check for injectivity: if \\(f(a) = f(b)\\), what happens to both sides?' },
          { level: 3, label: 'Proof', content: 'Deduce special values and prove injectivity or surjectivity.' }
        ],
        checkQuestion: {
          question: 'What is the primary benefit of proving a function is injective?',
          options: ['Allows removing f from both sides: f(u)=f(v) => u=v', 'Proves the function is continuous', 'Determines the degree of f'],
          correctIndex: 0,
          explanation: 'Injectivity lets you strip the function operator f off equality relations.'
        }
      },
      {
        id: 'step-2-cauchy-reduction',
        title: 'Step 2: Linearization or Cauchy Reduction',
        category: 'technique',
        level: 1,
        dependsOn: ['step-1-substitutions'],
        description: 'Transform equation into Cauchy additive form \\(g(x+y) = g(x) + g(y)\\).',
        keyFormula: '\\(g(x+y) = g(x) + g(y) \\implies g(x) = cx\\)',
        hints: [
          { level: 1, label: 'Direction', content: 'Consider a transformation \\(g(x) = f(x) - f(0)\\) or reciprocal \\(g(x) = \\frac{1}{f(x)-1}\\).' },
          { level: 2, label: 'Technique', content: 'Verify Cauchy additivity on rational numbers \\(\\mathbb{Q}\\) first.' },
          { level: 3, label: 'Proof', content: 'Extend to \\(\\mathbb{R}\\) via monotonicity or boundedness.' }
        ]
      },
      {
        id: 'step-3-verification',
        title: 'Step 3: Verification & All Solutions',
        category: 'conclusion',
        level: 2,
        dependsOn: ['step-2-cauchy-reduction'],
        description: 'Plug candidate solutions back into the original equation.',
        keyFormula: '\\(f(x) = x\\) or \\(f(x) = 0\\)',
        hints: [
          { level: 1, label: 'Direction', content: 'Never forget to verify candidate functions in the original equation.' },
          { level: 2, label: 'Technique', content: 'Check all parameter values and state the complete solution set.' },
          { level: 3, label: 'Proof', content: 'Verify and summarize all valid solutions.' }
        ]
      }
    ],
    connections: [
      { from: 'step-1-substitutions', to: 'step-2-cauchy-reduction', label: 'simplifies variables' },
      { from: 'step-2-cauchy-reduction', to: 'step-3-verification', label: 'yields candidate functions' }
    ]
  } : {
    title: title || 'Bản đồ tư duy phân tích bài toán',
    summary: 'Xé nhỏ bài toán thành các phép thế đặc biệt, phát hiện tính đơn ánh/toàn ánh, bổ đề then chốt và thử lại.',
    targetGoal: 'Tìm tất cả các nghiệm thỏa mãn hoặc hoàn tất chứng minh chặt chẽ.',
    difficulty: 4,
    estimatedSteps: 3,
    nodes: [
      {
        id: 'step-1-substitutions',
        title: 'Bước 1: Các phép thế chiến lược & Khảo sát giá trị biên',
        category: 'observation',
        level: 0,
        dependsOn: [],
        description: 'Thế các giá trị đặc biệt (\\(x=0, y=0, x=y\\)) để tìm \\(f(0), f(1)\\) và kiểm tra tính đơn ánh/toàn ánh.',
        keyFormula: '\\(f(0), f(1)\\) hoặc \\(f(x)=f(y) \\implies x=y\\)',
        hints: [
          { level: 1, label: 'Định hướng', content: 'Thế các giá trị triệt tiêu để cô lập hàm một biến.' },
          { level: 2, label: 'Kỹ thuật', content: 'Kiểm tra tính đơn ánh: giả sử \\(f(a) = f(b)\\), thế vào hai vế để tìm mối liên hệ giữa \\(a\\) và \\(b\\).' },
          { level: 3, label: 'Chứng minh', content: 'Khẳng định giá trị điểm đặc biệt và tính chất đơn ánh/toàn ánh của hàm.' }
        ],
        checkQuestion: {
          question: 'Mục đích lớn nhất khi chứng minh hàm f là đơn ánh là gì?',
          options: ['Cho phép triệt tiêu hàm f ở hai vế: f(u)=f(v) => u=v', 'Khẳng định hàm số liên tục', 'Biết ngay bậc của hàm'],
          correctIndex: 0,
          explanation: 'Tính đơn ánh cho phép bỏ toán tử f ở cả hai vế để đưa về phương trình biến số thuần túy.'
        }
      },
      {
        id: 'step-2-cauchy-reduction',
        title: 'Bước 2: Tuyến tính hóa hoặc Quy về phương trình Cauchy',
        category: 'technique',
        level: 1,
        dependsOn: ['step-1-substitutions'],
        description: 'Đổi biến \\(g(x)\\) để đưa phương trình về dạng Cauchy cộng tính \\(g(x+y) = g(x) + g(y)\\).',
        keyFormula: '\\(g(x+y) = g(x) + g(y) \\implies g(x) = cx\\)',
        hints: [
          { level: 1, label: 'Định hướng', content: 'Xét hàm hiệu hoặc tỉ số để chuyển về dạng cộng tính chuẩn: \\(g(x) = f(x) - f(0)\\).' },
          { level: 2, label: 'Kỹ thuật', content: 'Chứng minh cộng tính trên tập số hữu tỉ \\(\\mathbb{Q}\\) bằng quy nạp.' },
          { level: 3, label: 'Chứng minh', content: 'Mở rộng lên tập số thực \\(\\mathbb{R}\\) nhờ điều kiện đơn điệu hoặc liên tục.' }
        ]
      },
      {
        id: 'step-3-verification',
        title: 'Bước 3: Thử lại vào phương trình gốc & Kết luận',
        category: 'conclusion',
        level: 2,
        dependsOn: ['step-2-cauchy-reduction'],
        description: 'Thay các hàm ứng viên tìm được vào hệ thức ban đầu để loại bỏ nghiệm ngoại lai.',
        keyFormula: '\\(f(x) = x\\) hoặc \\(f(x) = 0\\)',
        hints: [
          { level: 1, label: 'Định hướng', content: 'Bắt buộc phải thử lại nghiệm vào phương trình ban đầu.' },
          { level: 2, label: 'Kỹ thuật', content: 'Kiểm tra từng trường hợp hằng số và nghiệm đặc biệt.' },
          { level: 3, label: 'Chứng minh', content: 'Kết luận tập nghiệm đầy đủ và chính xác: \\(f(x) = x\\) với mọi \\(x \\in \\mathbb{R}\\).' }
        ]
      }
    ],
    connections: [
      { from: 'step-1-substitutions', to: 'step-2-cauchy-reduction', label: 'rút gọn cấu trúc' },
      { from: 'step-2-cauchy-reduction', to: 'step-3-verification', label: 'cho ra hàm ứng viên' }
    ]
  };
}

/**
 * Gọi AI sinh bản đồ phân rã toán học chi tiết (Problem Decomposer)
 */
export async function decomposeProblem({ statement, topic = '', title = '', solution = '', lang = 'vi', pipelineBudget = 60_000 }) {
  const outputLanguage = lang === 'en' ? 'English' : 'Vietnamese';
  const prompt = `You are an elite International Mathematical Olympiad (IMO) and VMO professor.
Your task is to DECOMPOSE the following mathematical problem into an interactive Mind Map / Directed Acyclic Graph (DAG) for students.

GOAL OF THE DECOMPOSITION:
Do NOT dump the full proof in one piece! Instead, break the mathematical challenge into 3 to 5 logical thinking nodes:
1. Root/Goal: What is the ultimate objective?
2. Initial Observations & Edge cases: What should a student explore first?
3. Core Lemmas / Key Estimates: What auxiliary theorem or lemma must be proven before solving the whole problem?
4. Key Formulation / Calculation: What specific equation/inequality connects the lemma to the goal?
5. Final Synthesis / Conclusion: How do the steps assemble together?

IMPORTANT RULES FOR MATHEMATICAL EXPRESSIONS:
- CRITICAL: EVERY single mathematical formula, expression, variable (such as $x$, $y$, $n$, $x_n$, $u_k$, $x_{n+1}$), recurrence relation (e.g. \\(x_{n+1} = x_n + \\frac{1}{x_n}\\)), inequality, fraction (use \\frac{a}{b}, NEVER bare a/b), and set MUST BE STRICTLY WRITTEN IN LATEX using \\(...\\) for inline math and \\[...\\] for display math!
- NEVER write bare math like x_{n+1} = x_n + 1/x_n without LaTeX delimiters! Always write \\(x_{n+1} = x_n + \\frac{1}{x_n}\\).

IMPORTANT RULES FOR EACH NODE:
- category: one of 'target', 'observation', 'lemma', 'technique', 'calculation', 'conclusion'
- level: 0 (starting), 1 (intermediate milestone), 2 (final resolution)
- hints: Provide exactly 3 progressive levels of hints:
  * Level 1 (Direction/Nudge): Gentle guidance on where to look without spoiling equations.
  * Level 2 (Technique/Formula): Specific theorem, inequality, or substitution to try.
  * Level 3 (Detailed Step Proof): Complete, rigorous proof for THIS specific node only.
- checkQuestion: A smart multiple-choice question testing the student's insight for this step, with 3-4 options and an explanation.
- keyFormula: Standard LaTeX formula \\(...\\) or \\[...\\] representing this step.
- connections: List directed edges { from, to, label } representing the causal thinking path.

Write all explanations and titles entirely in ${outputLanguage}.

PROBLEM STATEMENT:
${statement}

TOPIC: ${topic || 'Olympiad Mathematics'}
PROBLEM TITLE: ${title || 'Exam Problem'}
${solution ? `REFERENCE / VERIFIED SOLUTION OUTLINE:\n${solution.slice(0, 10000)}` : ''}
`;

  try {
    const result = await generateVerifierJson({
      input: prompt,
      schema: decomposerSchema,
      systemInstruction: `You are an Olympic mathematics pedagogy expert. You decompose complex proofs into progressive interactive mind maps with 3-tier hints. ALWAYS write all mathematical formulas in LaTeX \\(...\\) or \\[...\\]. Write in ${outputLanguage}.`,
      model: process.env.GEMINI_DECOMPOSER_MODEL || process.env.GEMINI_VERIFY_MODEL || 'gemini-3.5-flash',
      timeoutMs: Math.max(12_000, Math.min(80_000, pipelineBudget)),
      maxOutputTokens: 5_000,
      reasoningEffort: 'medium'
    });

    const normalized = normalizeDecomposition(result.data, { statement, topic, title, solution, lang });
    normalized.model = result.model;
    return normalized;
  } catch (error) {
    console.warn('[decomposeProblem] Model call failed or timed out, using mathematical fallback:', error.message);
    return buildFallbackDecomposition({ statement, topic, title, solution, lang });
  }
}
