/**
 * TOPICS MODULE - PHÂN LOẠI ĐỀ THI & BÀI TOÁN THEO CHUYÊN ĐỀ
 * Tổng hợp toàn diện: Đề thi hệ thống (TST, VMO, Mock, Olympic, Đà Nẵng)
 * và Các bài toán lưu trong Database (Math Support OCR).
 */

(function (root) {
  'use strict';

  const CANONICAL_TOPICS = [
    { id: 'Dãy số', name: 'Dãy số & Giới hạn', icon: '🔢', color: '#0284c7' },
    { id: 'Hàm số', name: 'Hàm số & Phương trình hàm', icon: '📈', color: '#6366f1' },
    { id: 'Số học', name: 'Số học', icon: '🧮', color: '#8b5cf6' },
    { id: 'Hình học', name: 'Hình học phẳng', icon: '📐', color: '#059669' },
    { id: 'Đa thức', name: 'Đa thức', icon: '📊', color: '#d97706' },
    { id: 'Tổ hợp', name: 'Tổ hợp', icon: '🎲', color: '#e11d48' },
    { id: 'Bất đẳng thức', name: 'Bất đẳng thức & Cực trị', icon: '⚖️', color: '#0d9488' }
  ];

  const state = {
    selectedTopic: '',
    selectedSource: 'ALL',
    searchQuery: '',
    savedProblems: [],
    loadingSaved: false,
    initialized: false
  };

  function normalizeText(str) {
    return String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function getSystemProblems() {
    return Array.isArray(root.SYSTEM_TOPIC_PROBLEMS) ? root.SYSTEM_TOPIC_PROBLEMS : [];
  }

  async function loadSavedDatabaseProblems() {
    if (!root.VMODataService?.getMathSupportProblems) return [];
    try {
      state.loadingSaved = true;
      const res = await root.VMODataService.getMathSupportProblems(1, '', '');
      state.loadingSaved = false;
      const items = res?.items || [];
      return items.map((p, idx) => ({
        id: 'db-' + (p.id || p._id || idx),
        anchor: '',
        examTitle: p.source || 'Bài lưu Database (Math Support)',
        category: 'database',
        categoryLabel: '📝 Bài lưu Database',
        label: p.title || ('Bài lưu #' + (idx + 1)),
        rawTopic: p.topic || 'Dãy số',
        topic: p.topic || 'Dãy số',
        content: p.content || '',
        isSavedDb: true
      }));
    } catch (e) {
      console.warn('[Topics] Không tải được bài lưu database:', e?.message || e);
      state.loadingSaved = false;
      return [];
    }
  }

  function renderLatex(container) {
    if (!container) return;
    try {
      if (typeof root.renderMathInElement === 'function') {
        root.renderMathInElement(container, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '\\[', right: '\\]', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false }
          ],
          throwOnError: false
        });
      } else if (root.MathJax?.typesetPromise) {
        root.MathJax.typesetPromise([container]).catch(() => {});
      }
    } catch (err) {
      console.warn('[Topics] Lỗi render Math:', err);
    }
  }

  function updateSidebarStats(allProblems) {
    const counts = {};
    CANONICAL_TOPICS.forEach(t => { counts[t.id] = 0; });
    allProblems.forEach(p => {
      if (counts[p.topic] !== undefined) counts[p.topic]++;
    });

    // Cập nhật số lượng trên các badge sidebar
    CANONICAL_TOPICS.forEach(t => {
      const badge = document.getElementById('sidebar-topic-count-' + t.id);
      if (badge) badge.textContent = counts[t.id] || 0;
    });
    const totalBadge = document.getElementById('sidebar-topic-count-ALL');
    if (totalBadge) totalBadge.textContent = allProblems.length;

    const statsEl = document.getElementById('sidebarTopicStats');
    if (statsEl) {
      statsEl.textContent = `Tổng cộng: ${allProblems.length} bài toán`;
    }
  }

  function renderProblemsList() {
    const listEl = document.getElementById('topicsProblemsList');
    if (!listEl) return;

    const sysProblems = getSystemProblems();
    const allProblems = [...sysProblems, ...state.savedProblems];

    updateSidebarStats(allProblems);

    // Filter
    let filtered = allProblems.filter(p => {
      if (state.selectedTopic && p.topic !== state.selectedTopic) return false;
      if (state.selectedSource !== 'ALL') {
        if (state.selectedSource === 'SAVED') {
          if (!p.isSavedDb) return false;
        } else if (state.selectedSource === 'SYSTEM') {
          if (p.isSavedDb) return false;
        } else if (p.category !== state.selectedSource) {
          return false;
        }
      }
      if (state.searchQuery) {
        const q = normalizeText(state.searchQuery);
        const text = normalizeText((p.examTitle || '') + ' ' + (p.label || '') + ' ' + (p.topic || '') + ' ' + (p.content || ''));
        if (!text.includes(q)) return false;
      }
      return true;
    });

    const summaryEl = document.getElementById('topicsResultsSummary');
    if (summaryEl) {
      const currentTopicObj = CANONICAL_TOPICS.find(t => t.id === state.selectedTopic);
      const topicName = currentTopicObj ? `${currentTopicObj.icon} ${currentTopicObj.name}` : 'Tất cả chuyên đề';
      summaryEl.innerHTML = `Đang hiển thị <strong>${filtered.length}</strong> bài toán thuộc <strong>${topicName}</strong>`;
    }

    if (!filtered.length) {
      listEl.innerHTML = `
        <div class="empty-state" style="text-align:center;padding:48px 16px;background:#f8fafc;border-radius:12px;border:1px dashed #cbd5e1;grid-column:1/-1;">
          <div style="font-size:2.5rem;margin-bottom:8px;">🔍</div>
          <h3 style="margin:0 0 8px;font-size:1.1rem;color:#1e293b;">Không tìm thấy bài toán phù hợp</h3>
          <p style="margin:0;color:#64748b;font-size:0.9rem;">Hãy thử chọn chuyên đề khác hoặc xóa từ khóa tìm kiếm.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map((p, idx) => {
      const topicObj = CANONICAL_TOPICS.find(t => t.id === p.topic) || { name: p.topic, icon: '🏷️', color: '#64748b' };
      const sourceColor = p.isSavedDb ? '#8b5cf6' : p.category === 'tst' ? '#1e40af' : p.category === 'mock' ? '#b45309' : p.category === 'danang' ? '#047857' : '#475569';
      const sourceBadge = p.isSavedDb ? '📝 Database OCR' : p.categoryLabel || '🏛️ Hệ thống';

      return `
        <article class="problem-item topic-problem-card" id="topic-item-${idx}" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.04);margin-bottom:16px;">
          <div class="problem-header" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;border-bottom:1px solid #f1f5f9;padding-bottom:10px;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span class="badge" style="background:${topicObj.color}15;color:${topicObj.color};font-weight:700;font-size:0.78rem;padding:3px 8px;border-radius:4px;border:1px solid ${topicObj.color}30;">
                ${topicObj.icon} ${topicObj.name}
              </span>
              <span class="badge" style="background:${sourceColor}15;color:${sourceColor};font-weight:600;font-size:0.75rem;padding:3px 8px;border-radius:4px;">
                ${sourceBadge}
              </span>
              <span style="font-size:0.85rem;color:#64748b;font-weight:600;">${escapeHtml(p.examTitle)}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-weight:700;color:#0f172a;font-size:0.95rem;">${escapeHtml(p.label)}</span>
            </div>
          </div>
          <div class="problem-content tex2jax_process math-display-block" style="font-size:0.95rem;line-height:1.65;color:#1e293b;margin-bottom:14px;overflow-x:auto;">
            ${p.content}
          </div>
          <div class="topic-problem-actions" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding-top:10px;border-top:1px dashed #f1f5f9;">
            <button type="button" class="btn-decomposer" onclick="window.decomposeFromTopicCard('${p.id}')" style="display:inline-flex;align-items:center;gap:6px;background:#0284c7;color:#fff;border:none;padding:6px 12px;border-radius:6px;font-size:0.82rem;font-weight:600;cursor:pointer;">
              💡 Xé nhỏ bài toán
            </button>
            <button type="button" class="btn-ai-coach" onclick="window.askCoachFromTopicCard('${p.id}')" style="display:inline-flex;align-items:center;gap:6px;background:#f8fafc;color:#475569;border:1px solid #cbd5e1;padding:6px 12px;border-radius:6px;font-size:0.82rem;font-weight:600;cursor:pointer;">
              🧠 AI Coach
            </button>
            <button type="button" class="btn-copy" onclick="window.copyTopicProblemText(this, '${p.id}')" style="display:inline-flex;align-items:center;gap:6px;background:#f8fafc;color:#475569;border:1px solid #cbd5e1;padding:6px 12px;border-radius:6px;font-size:0.82rem;font-weight:600;cursor:pointer;">
              📋 Sao chép
            </button>
            ${p.anchor ? `
            <button type="button" class="btn-view-origin" onclick="window.navigateToOriginExam('${p.category}', '${p.anchor}')" style="display:inline-flex;align-items:center;gap:6px;background:#f8fafc;color:#0284c7;border:1px solid #bae6fd;padding:6px 12px;border-radius:6px;font-size:0.82rem;font-weight:600;cursor:pointer;margin-left:auto;">
              🔗 Đề gốc ↗
            </button>` : ''}
          </div>
        </article>
      `;
    }).join('');

    renderLatex(listEl);
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>'"]/g, tag => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
  }

  // API tương tác toàn cục
  root.filterTopicsByTopic = function (topic) {
    state.selectedTopic = topic || '';
    
    // Đồng bộ nút pills
    document.querySelectorAll('#topicsFilterPills .pill').forEach(pill => {
      const active = (pill.getAttribute('data-topic') || '') === state.selectedTopic;
      pill.classList.toggle('active', active);
    });

    // Đồng bộ sidebar link
    document.querySelectorAll('#sidebar-topics .toc-topic-link').forEach(link => {
      const active = (link.getAttribute('data-topic') || '') === state.selectedTopic;
      link.classList.toggle('active', active);
      if (active) {
        link.style.background = '#e0f2fe';
        link.style.color = '#0369a1';
        link.style.fontWeight = '700';
      } else {
        link.style.background = '';
        link.style.color = '';
        link.style.fontWeight = '';
      }
    });

    renderProblemsList();
  };

  root.filterTopicsBySource = function (source) {
    state.selectedSource = source || 'ALL';
    document.querySelectorAll('#topicsSourceFilterBar .source-filter-btn').forEach(btn => {
      const active = (btn.getAttribute('data-source') || 'ALL') === state.selectedSource;
      btn.classList.toggle('active', active);
      if (active) {
        btn.style.background = '#0284c7';
        btn.style.color = '#fff';
      } else {
        btn.style.background = '#f8fafc';
        btn.style.color = '#475569';
      }
    });
    renderProblemsList();
  };

  root.switchTopicsTab = async function (topic) {
    const btn = document.getElementById('tab-btn-topics');
    if (typeof root.switchTab === 'function') {
      await root.switchTab('tab-topics', btn);
    }
    root.filterTopicsByTopic(topic);
    const topEl = document.getElementById('tab-topics');
    if (topEl) topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  root.decomposeFromTopicCard = function (problemId) {
    const all = [...getSystemProblems(), ...state.savedProblems];
    const prob = all.find(p => p.id === problemId);
    if (!prob) return;
    if (typeof root.decomposeProblem === 'function') {
      root.decomposeProblem(prob.content, `${prob.examTitle} — ${prob.label}`, prob.topic);
    } else {
      alert('Chức năng Problem Decomposer đang khởi động, vui lòng thử lại.');
    }
  };

  root.askCoachFromTopicCard = async function (problemId) {
    const all = [...getSystemProblems(), ...state.savedProblems];
    const prob = all.find(p => p.id === problemId);
    if (!prob) return;
    const btn = document.getElementById('tab-btn-coach');
    if (typeof root.switchTab === 'function') {
      await root.switchTab('tab-coach', btn);
    }
    if (typeof root.openAiCoachWithProblem === 'function') {
      root.openAiCoachWithProblem(prob.content, prob.topic, prob.label);
    }
  };

  root.copyTopicProblemText = function (btn, problemId) {
    const all = [...getSystemProblems(), ...state.savedProblems];
    const prob = all.find(p => p.id === problemId);
    if (!prob) return;
    const textToCopy = `${prob.examTitle} - ${prob.label}\nChuyên đề: ${prob.topic}\n\n${prob.content.replace(/<[^>]+>/g, '')}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Đã chép!';
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      });
    }
  };

  root.navigateToOriginExam = async function (category, anchor) {
    const tabMap = {
      tst: 'tab-tst',
      mock: 'tab-mock',
      history: 'tab-history',
      danang: 'tab-danang'
    };
    const tabId = tabMap[category] || 'tab-tst';
    const btn = document.getElementById('tab-btn-' + category);
    if (typeof root.switchTab === 'function') {
      await root.switchTab(tabId, btn);
    }
    setTimeout(() => {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  root.initTopicsView = async function () {
    if (state.initialized) {
      renderProblemsList();
      return;
    }
    state.initialized = true;

    // Tải bài lưu từ database nếu có
    const saved = await loadSavedDatabaseProblems();
    state.savedProblems = saved;

    // Gắn sự kiện tìm kiếm
    const searchInput = document.getElementById('topicsSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        state.searchQuery = e.target.value.trim();
        renderProblemsList();
      });
    }

    renderProblemsList();
  };

  // Tự động khởi tạo khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      root.initTopicsView();
    });
  } else {
    root.initTopicsView();
  }

})(typeof window !== 'undefined' ? window : globalThis);
