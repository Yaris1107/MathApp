/**
 * AI Coach — personalised practice generator + knowledge-gap roadmap.
 *
 * Both features reuse existing serverless endpoints:
 *   POST /api/ai-exam-trends  { mode: 'practice', matrix }
 *   POST /api/ai-guide        { mode: 'plan', profile, dna, weeks }
 * No new API file is added, keeping the Vercel 12/12 function limit intact.
 */
(() => {
  const TOPICS = [
    { value: 'Dãy số và Giới hạn dãy số', vi: 'Dãy số & giới hạn', en: 'Sequences & limits' },
    { value: 'Phương trình hàm', vi: 'Phương trình hàm', en: 'Functional equations' },
    { value: 'Số học và dãy số', vi: 'Số học & dãy số', en: 'Number theory' },
    { value: 'Hình học phẳng', vi: 'Hình học phẳng', en: 'Plane geometry' },
    { value: 'Đa thức', vi: 'Đa thức', en: 'Polynomials' },
    { value: 'Tổ hợp', vi: 'Tổ hợp', en: 'Combinatorics' }
  ];
  const LEVELS = [
    { value: 'easy', vi: 'Cơ bản', en: 'Easy' },
    { value: 'medium', vi: 'Trung bình', en: 'Medium' },
    { value: 'hard', vi: 'Khó', en: 'Hard' }
  ];
  const state = { practice: null, plan: null, busy: false };

  const isEn = () => window.currentLang === 'en';
  const t = (vi, en) => (isEn() ? en : vi);

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function typeset(container) {
    if (container && window.MathJax?.typesetPromise) window.MathJax.typesetPromise([container]).catch(() => {});
  }

  function status(el, message, kind = 'info') {
    if (!el) return;
    el.textContent = message || '';
    el.hidden = !message;
    el.dataset.kind = kind;
  }

  function ensureMounted() {
    const root = document.getElementById('tab-coach');
    if (!root || root.dataset.coachMounted === 'true') return root;
    root.dataset.coachMounted = 'true';
    root.innerHTML = `
      <section class="coach-hero">
        <div>
          <span class="coach-kicker">${t('AI COACH · CÁ NHÂN HÓA', 'AI COACH · PERSONALISED')}</span>
          <h2>${t('Luyện tập & lộ trình dành riêng cho bạn', 'Practice & roadmap built for you')}</h2>
          <p>${t('Sinh đề theo ma trận chủ đề/độ khó và chẩn đoán lỗ hổng kiến thức từ lịch sử học tập + Math DNA.', 'Generate a topic/difficulty matrix and diagnose knowledge gaps from your learning history + Math DNA.')}</p>
        </div>
        <div class="coach-hero-badges">
          <span>${t('Ưu tiên kho đề', 'Bank-first')}</span>
          <span>${t('Có đáp án & lời giải', 'Answers & solutions')}</span>
          <span>${t('Lộ trình 2–4 tuần', '2–4 week plan')}</span>
        </div>
      </section>

      <div class="coach-grid">
        <section class="coach-card" id="coachPracticeCard">
          <header class="coach-card-head">
            <div>
              <span class="coach-card-kicker">M</span>
              <h3>${t('Sinh đề luyện cá nhân hóa', 'Personalised practice generator')}</h3>
            </div>
            <span class="coach-chip">${t('Ma trận chủ đề / độ khó', 'Topic / difficulty matrix')}</span>
          </header>
          <p class="coach-muted">${t('Chọn số câu cho từng chủ đề và độ khó. Hệ thống ưu tiên câu có lời giải trong kho trước, sau đó mới sinh câu mới.', 'Choose how many questions per topic and difficulty. Verified bank questions are used first; new ones are generated only for the remainder.')}</p>
          <div class="coach-matrix" id="coachMatrix"></div>
          <div class="coach-actions">
            <button type="button" class="coach-primary" id="coachGeneratePractice">✨ ${t('Sinh đề luyện', 'Generate practice set')}</button>
            <span class="coach-hint">${t('Tối đa 15 câu mỗi lần', 'Up to 15 questions per run')}</span>
          </div>
          <div class="coach-status" id="coachPracticeStatus" hidden></div>
          <div class="coach-results" id="coachPracticeResults"></div>
        </section>

        <section class="coach-card" id="coachPlanCard">
          <header class="coach-card-head">
            <div>
              <span class="coach-card-kicker">M</span>
              <h3>${t('Chẩn đoán lỗ hổng & lộ trình', 'Knowledge gaps & roadmap')}</h3>
            </div>
            <span class="coach-chip">${t('2–4 tuần', '2–4 weeks')}</span>
          </header>
          <p class="coach-muted">${t('Tổng hợp bài đã lưu, bài đã chấm và Math DNA để vẽ bản đồ kiến thức, rồi lập kế hoạch ôn tập có mốc kiểm tra.', 'Combine saved work, graded submissions and Math DNA into a knowledge map, then build a plan with checkpoints.')}</p>
          <div class="coach-form-row">
            <label>${t('Mục tiêu', 'Goal')}<input id="coachGoal" type="text" placeholder="${t('Ví dụ: vào đội tuyển VMO 2027', 'e.g. qualify for the national VMO team 2027')}"></label>
            <label>${t('Số tuần', 'Weeks')}<select id="coachWeeks"><option value="2">2</option><option value="3" selected>3</option><option value="4">4</option></select></label>
          </div>
          <div class="coach-actions">
            <button type="button" class="coach-secondary" id="coachLoadPlan">🧭 ${t('Chẩn đoán & lập lộ trình', 'Diagnose & build roadmap')}</button>
          </div>
          <div class="coach-status" id="coachPlanStatus" hidden></div>
          <div class="coach-results" id="coachPlanResults"></div>
        </section>
      </div>
    `;
    buildMatrix();
    document.getElementById('coachGeneratePractice')?.addEventListener('click', generatePractice);
    document.getElementById('coachLoadPlan')?.addEventListener('click', loadPlan);
    return root;
  }

  function buildMatrix() {
    const host = document.getElementById('coachMatrix');
    if (!host) return;
    host.innerHTML = `
      <div class="coach-matrix-head">
        <span>${t('Chuyên đề', 'Topic')}</span>
        ${LEVELS.map(level => `<span>${t(level.vi, level.en)}</span>`).join('')}
      </div>
      ${TOPICS.map(topic => `
        <div class="coach-matrix-row" data-topic="${esc(topic.value)}">
          <span class="coach-topic">${esc(t(topic.vi, topic.en))}</span>
          ${LEVELS.map(level => `<select data-level="${level.value}" aria-label="${esc(t(topic.vi, topic.en))} ${esc(t(level.vi, level.en))}">
            ${[0, 1, 2, 3].map(count => `<option value="${count}">${count}</option>`).join('')}
          </select>`).join('')}
        </div>
      `).join('')}
    `;
  }

  function readMatrix() {
    const rows = [];
    document.querySelectorAll('#coachMatrix .coach-matrix-row').forEach(row => {
      const entry = { topic: row.dataset.topic, easy: 0, medium: 0, hard: 0 };
      row.querySelectorAll('select[data-level]').forEach(select => {
        entry[select.dataset.level] = Number(select.value) || 0;
      });
      if (entry.easy + entry.medium + entry.hard > 0) rows.push(entry);
    });
    return rows;
  }

  function readError(payload, response) {
    const issues = Array.isArray(payload?.quality?.criticalIssues) ? payload.quality.criticalIssues.slice(0, 2) : [];
    return `${payload?.error || `HTTP ${response.status}`}${issues.length ? ` — ${issues.join('; ')}` : ''}`;
  }

  async function generatePractice() {
    if (state.busy) return;
    const statusEl = document.getElementById('coachPracticeStatus');
    const results = document.getElementById('coachPracticeResults');
    const btn = document.getElementById('coachGeneratePractice');
    const matrix = readMatrix();
    if (!matrix.length) {
      status(statusEl, t('Hãy chọn ít nhất một câu trước khi sinh đề.', 'Choose at least one question before generating.'), 'error');
      return;
    }
    const total = matrix.reduce((sum, row) => sum + row.easy + row.medium + row.hard, 0);
    if (total > 15) {
      status(statusEl, t('Mỗi lần tối đa 15 câu. Hãy giảm bớt.', 'Up to 15 questions per run. Please reduce the matrix.'), 'error');
      return;
    }
    state.busy = true;
    if (btn) btn.disabled = true;
    status(statusEl, t('Đang ưu tiên kho đề và sinh các câu còn thiếu…', 'Searching the bank first and generating the remainder…'), 'busy');
    if (results) results.innerHTML = '';
    try {
      const response = await fetch('/api/ai-exam-trends', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ mode: 'practice', matrix, lang: isEn() ? 'en' : 'vi' })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) throw new Error(readError(payload, response));
      state.practice = payload.data;
      renderPractice(payload.data);
      status(statusEl, payload.data?.note || t('Đã tạo đề luyện.', 'Practice set ready.'), 'success');
    } catch (error) {
      status(statusEl, `${t('Chưa sinh được đề', 'Could not generate the set')}: ${error.message}`, 'error');
    } finally {
      state.busy = false;
      if (btn) btn.disabled = false;
    }
  }

  function renderPractice(data) {
    const host = document.getElementById('coachPracticeResults');
    if (!host) return;
    const items = Array.isArray(data?.items) ? data.items : [];
    if (!items.length) {
      host.innerHTML = `<p class="coach-muted">${t('Chưa có câu hỏi nào.', 'No questions returned.')}</p>`;
      return;
    }
    host.innerHTML = `
      <div class="coach-result-head">
        <strong>${esc(data.title || t('Đề luyện cá nhân hóa', 'Personalised practice set'))}</strong>
        <span>${items.length} ${t('câu', 'questions')} · ${Number(data.bankCount) || 0} ${t('từ kho', 'from bank')} · ${Number(data.generatedCount) || 0} ${t('sinh mới', 'generated')}</span>
      </div>
      ${items.map((item, index) => `
        <article class="coach-question">
          <header>
            <span class="coach-q-number">${t('Câu', 'Q')} ${index + 1}</span>
            <span class="coach-tag">${esc(item.topic || '')}</span>
            <span class="coach-tag coach-tag-level">${esc(LEVELS.find(level => level.value === item.difficulty)?.[isEn() ? 'en' : 'vi'] || item.difficulty || '')}</span>
            <span class="coach-tag ${item.source === 'bank' ? 'coach-tag-bank' : 'coach-tag-new'}">${item.source === 'bank' ? t('Kho đề', 'Bank') : t('Sinh mới', 'New')}</span>
          </header>
          <div class="coach-q-content" data-q-content="${index}"></div>
          <details class="coach-answer">
            <summary>${t('Xem đáp án', 'Show answer')}</summary>
            <div data-q-answer="${index}"></div>
          </details>
          <details class="coach-solution">
            <summary>${t('Xem lời giải chi tiết', 'Show full solution')}</summary>
            <div data-q-solution="${index}"></div>
          </details>
        </article>
      `).join('')}
    `;
    items.forEach((item, index) => {
      const content = host.querySelector(`[data-q-content="${index}"]`);
      if (content) {
        if (window.safeRenderMathJaxToElement) window.safeRenderMathJaxToElement(content, item.content || '');
        else content.textContent = item.content || '';
      }
      const answer = host.querySelector(`[data-q-answer="${index}"]`);
      if (answer) {
        const ans = item.answer || t('Đáp án được trình bày trong lời giải.', 'The answer is developed in the solution.');
        if (window.safeRenderMathJaxToElement) window.safeRenderMathJaxToElement(answer, ans);
        else answer.textContent = ans;
      }
      const solution = host.querySelector(`[data-q-solution="${index}"]`);
      if (solution) {
        const sol = item.solution || t('Chưa có lời giải cho câu này.', 'No solution available for this question.');
        if (window.safeRenderMathJaxToElement) window.safeRenderMathJaxToElement(solution, sol);
        else solution.textContent = sol;
      }
    });
    host.querySelectorAll('details.coach-answer, details.coach-solution').forEach(details => {
      details.addEventListener('toggle', () => {
        if (details.open) typeset(details);
      });
    });
    typeset(host);
  }

  async function fetchData(resource) {
    const response = await fetch(`/api/data?${new URLSearchParams({ resource })}`, { credentials: 'same-origin' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.success) throw new Error(payload.error || `HTTP ${response.status}`);
    return payload;
  }

  async function loadPlan() {
    if (state.busy) return;
    const statusEl = document.getElementById('coachPlanStatus');
    const results = document.getElementById('coachPlanResults');
    const btn = document.getElementById('coachLoadPlan');
    state.busy = true;
    if (btn) btn.disabled = true;
    status(statusEl, t('Đang tổng hợp lịch sử học tập và Math DNA…', 'Aggregating learning history and Math DNA…'), 'busy');
    if (results) results.innerHTML = '';
    try {
      const [learning, dna] = await Promise.allSettled([fetchData('learning_overview'), fetchData('math_dna')]);
      const overview = learning.status === 'fulfilled' ? (learning.value.overview || {}) : {};
      const dnaItems = dna.status === 'fulfilled' ? (dna.value.items || []) : [];
      const totals = overview.totals || {};
      if (!(Number(totals.guideCount) || 0) && !(Number(totals.evaluationCount) || 0) && !dnaItems.length) {
        status(statusEl, t('Chưa có dữ liệu học tập. Hãy lưu ít nhất một lời giải AI hoặc nộp một bài giải để chẩn đoán chính xác.', 'No learning data yet. Save at least one AI guide or submit a solution for an accurate diagnosis.'), 'error');
        return;
      }
      const response = await fetch('/api/ai-guide', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({
          mode: 'plan',
          profile: { totals, evaluations: overview.evaluations || [], guides: overview.guides || [] },
          dna: dnaItems,
          weeks: Number(document.getElementById('coachWeeks')?.value) || 3,
          goal: document.getElementById('coachGoal')?.value.trim() || '',
          lang: isEn() ? 'en' : 'vi'
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) throw new Error(readError(payload, response));
      state.plan = payload.data;
      renderPlan(payload.data);
      status(statusEl, t('Đã lập lộ trình cá nhân hóa.', 'Personalised roadmap ready.'), 'success');
    } catch (error) {
      status(statusEl, `${t('Chưa chẩn đoán được', 'Could not build the diagnosis')}: ${error.message}`, 'error');
    } finally {
      state.busy = false;
      if (btn) btn.disabled = false;
    }
  }

  const STATUS_LABEL = {
    strong: ['Vững', 'Strong', '#16a34a'],
    developing: ['Đang tiến bộ', 'Developing', '#0284c7'],
    gap: ['Có lỗ hổng', 'Gap', '#d97706'],
    'insufficient-evidence': ['Chưa đủ dữ liệu', 'Insufficient evidence', '#64748b']
  };

  function renderPlan(data) {
    const host = document.getElementById('coachPlanResults');
    if (!host) return;
    const knowledgeMap = Array.isArray(data?.knowledgeMap) ? data.knowledgeMap : [];
    const plan = Array.isArray(data?.plan) ? data.plan : [];
    const recommendations = Array.isArray(data?.recommendations) ? data.recommendations : [];
    host.innerHTML = `
      <div class="coach-plan-summary">
        <h4>${t('Bản đồ kiến thức', 'Knowledge map')}</h4>
        <div data-plan-summary></div>
      </div>
      <div class="coach-map">
        ${knowledgeMap.map(item => {
          const meta = STATUS_LABEL[item.status] || STATUS_LABEL['insufficient-evidence'];
          const mastery = Math.max(0, Math.min(100, Number(item.mastery) || 0));
          return `<div class="coach-map-row">
            <div class="coach-map-top">
              <strong>${esc(item.topic)}</strong>
              <span class="coach-tag" style="border-color:${meta[2]};color:${meta[2]};">${meta[isEn() ? 1 : 0]}</span>
              <span class="coach-mastery">${mastery}%</span>
            </div>
            <div class="coach-bar"><span style="width:${mastery}%;background:${meta[2]};"></span></div>
            ${item.evidence ? `<div class="coach-evidence">📚 ${esc(item.evidence)}</div>` : ''}
            ${item.gap ? `<div class="coach-gap">⚠️ ${esc(item.gap)}</div>` : ''}
          </div>`;
        }).join('') || `<p class="coach-muted">${t('Chưa đủ dữ liệu để vẽ bản đồ.', 'Not enough data for a map yet.')}</p>`}
      </div>
      <h4 class="coach-plan-title">${t('Lộ trình ôn tập', 'Study roadmap')}</h4>
      <div class="coach-weeks">
        ${plan.map(week => `
          <div class="coach-week">
            <div class="coach-week-head"><span>${t('Tuần', 'Week')} ${esc(week.week)}</span><strong>${esc(week.focus)}</strong></div>
            <div class="coach-week-cols">
              <div><h5>${t('Mục tiêu', 'Goals')}</h5><ul>${(week.goals || []).map(item => `<li>${esc(item)}</li>`).join('') || '<li>—</li>'}</ul></div>
              <div><h5>${t('Hoạt động', 'Activities')}</h5><ul>${(week.activities || []).map(item => `<li>${esc(item)}</li>`).join('') || '<li>—</li>'}</ul></div>
              <div><h5>${t('Mốc kiểm tra', 'Checkpoints')}</h5><ul>${(week.checkpoints || []).map(item => `<li>${esc(item)}</li>`).join('') || '<li>—</li>'}</ul></div>
            </div>
          </div>
        `).join('') || `<p class="coach-muted">${t('Chưa có tuần nào được tạo.', 'No weeks generated.')}</p>`}
      </div>
      ${recommendations.length ? `<div class="coach-recommendations"><h4>${t('Khuyến nghị', 'Recommendations')}</h4><ul>${recommendations.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div>` : ''}
    `;
    const summary = host.querySelector('[data-plan-summary]');
    if (summary) summary.textContent = data?.summary || '';
    typeset(host);
  }

  function init() {
    ensureMounted();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.addEventListener('langchange', () => {
    const root = document.getElementById('tab-coach');
    if (!root) return;
    const wasPractice = state.practice;
    const wasPlan = state.plan;
    root.dataset.coachMounted = 'false';
    ensureMounted();
    if (wasPractice) renderPractice(wasPractice);
    if (wasPlan) renderPlan(wasPlan);
  });

  window.VMOAICoach = { generatePractice, loadPlan, TOPICS };
})();
