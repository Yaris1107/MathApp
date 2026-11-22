/**
 * AI PROBLEM DECOMPOSER (Frontend Client)
 * Bản đồ tư duy xé nhỏ bài toán & Gợi ý từng tầng (Progressive Hints)
 * Tự động chuẩn hóa công thức toán học (kể cả x_{n+1} = x_n + 1/x_n) và render MathJax hoàn hảo.
 */

(() => {
  const decomposerStore = new Map();

  function isEn() {
    return window.currentLang === 'en';
  }

  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Tự động phát hiện và chuyển đổi các biểu thức toán học dạng trần (bare math)
   * như x_{n+1} = x_n + 1/x_n, u_n, x_{2n}, a/b thành LaTeX chuẩn \( ... \)
   */
  function autoFormatLatex(input) {
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
   * Escape HTML bên ngoài công thức toán, giữ nguyên cú pháp TeX bên trong
   */
  function formatMathHtml(input) {
    if (!input || typeof input !== 'string') return '';
    const formatted = autoFormatLatex(input);

    const math = [];
    const marker = '\uE120';
    const textWithoutMath = formatted.replace(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g, m => {
      math.push(m);
      return `${marker}${math.length - 1}${marker}`;
    });

    const escaped = esc(textWithoutMath);
    return escaped.replace(new RegExp(`${marker}(\\d+)${marker}`, 'g'), (_, idx) => math[Number(idx)]);
  }

  function typesetMath(container) {
    if (!container) return;
    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([container]).catch(() => {});
    }
  }

  function getProblemMeta(trigger) {
    const card = trigger.closest('.problem-item, .examplebox, .book-subsection, .exam-problem-card, article') || trigger.closest('.ai-guide-panel')?.parentElement;
    if (!card) return null;

    const panel = card.querySelector('.ai-guide-panel');
    const problemId = card.id || card.dataset.contentKey || card.dataset.problemKey || `prob-${Math.random().toString(36).slice(2, 9)}`;
    const problemTitle = card.querySelector('.problem-id, .box-heading, h3, h4')?.textContent?.trim() || 'Bài toán';
    
    // Extract statement
    const contentEl = card.querySelector('.problem-content, .box-content, .exercise-content, p');
    let problemContent = '';
    if (contentEl) {
      const clone = contentEl.cloneNode(true);
      clone.querySelectorAll('button, .ai-guide-panel, .btn-submit-solution, .btn-ai-guide, .btn-socratic-tutor, .btn-problem-decomposer, .ai-decomposer-wrap').forEach(el => el.remove());
      problemContent = clone.textContent.trim();
    }

    const topic = card.dataset.topic || card.closest('[data-topic]')?.dataset.topic || 'Toán THPT Chuyên';
    const examTitle = document.querySelector('.exam-title, .header-title, h1, h2')?.textContent?.trim() || 'Tuyển tập Olympic';

    // Solution if already available in DOM or AI guide
    const solEl = card.querySelector('.ai-section-solution, .example-solution');
    const solution = solEl ? solEl.textContent.trim() : '';

    return { card, panel, problemId, problemTitle, problemContent, topic, examTitle, solution };
  }

  // ── Open Problem Decomposer ──────────────────────────────────────────────
  window.openProblemDecomposer = async function(triggerOrId) {
    let meta = null;
    let hostContainer = null;
    let problemId = null;

    if (typeof triggerOrId === 'string') {
      problemId = triggerOrId;
      const panel = document.getElementById(`ai-panel-${problemId}`);
      if (panel) {
        meta = {
          problemId,
          panel,
          card: panel.closest('.problem-item, .examplebox, .book-subsection, article'),
          problemTitle: panel.querySelector('.ai-guide-title span:first-child')?.textContent || 'Bài toán',
          problemContent: panel.closest('.problem-item, .examplebox')?.querySelector('.problem-content')?.textContent || '',
          topic: panel.querySelector('.ai-guide-title span:last-child')?.textContent?.replace('•', '').trim() || '',
          solution: panel.querySelector('.ai-section-solution')?.textContent || ''
        };
        hostContainer = panel.querySelector('[data-decomposer-panel]');
      }
    } else if (triggerOrId instanceof HTMLElement) {
      meta = getProblemMeta(triggerOrId);
      problemId = meta?.problemId;
      if (triggerOrId.closest('.ai-guide-panel')) {
        hostContainer = triggerOrId.closest('.ai-guide-panel').querySelector('[data-decomposer-panel]');
      } else {
        // Outside guide panel: find or create container right below problem header/content
        let decompWrap = meta.card.querySelector('.ai-standalone-decomposer-host');
        if (!decompWrap) {
          decompWrap = document.createElement('div');
          decompWrap.className = 'ai-standalone-decomposer-host';
          meta.card.appendChild(decompWrap);
        }
        hostContainer = decompWrap;
      }
    }

    if (!meta || !hostContainer) return;

    // Toggle if already visible
    if (!hostContainer.hidden && hostContainer.querySelector('.ai-decomposer-wrap')) {
      const wrap = hostContainer.querySelector('.ai-decomposer-wrap');
      if (wrap.style.display !== 'none') {
        wrap.style.display = 'none';
        return;
      } else {
        wrap.style.display = 'block';
        return;
      }
    }

    hostContainer.hidden = false;
    hostContainer.replaceChildren();

    // Show loading spinner
    const loadingCard = document.createElement('div');
    loadingCard.className = 'ai-decomposer-wrap';
    loadingCard.innerHTML = `
      <div style="padding: 30px; text-align: center; color: #4f46e5;">
        <div style="display:inline-block;width:34px;height:34px;border:3px solid rgba(99,102,241,0.2);border-top-color:#4f46e5;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
        <p style="margin: 12px 0 4px 0; font-weight: 700; font-size: 0.95rem;">
          ${isEn() ? 'Decomposing problem into an interactive mind map…' : 'Đang xé nhỏ bài toán thành sơ đồ tư duy tương tác…'}
        </p>
        <p style="margin: 0; font-size: 0.8rem; opacity: 0.8;">
          ${isEn() ? 'Extracting milestones, progressive hints, and check questions' : 'Trích xuất các mốc tư duy, gợi ý 3 tầng và câu hỏi thử thách'}
        </p>
      </div>
    `;
    hostContainer.appendChild(loadingCard);

    try {
      const response = await fetch('/api/ai-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'decompose',
          problemId,
          contentKey: problemId,
          problemTitle: meta.problemTitle,
          problemContent: meta.problemContent,
          topic: meta.topic,
          examTitle: meta.examTitle,
          solution: meta.solution,
          lang: isEn() ? 'en' : 'vi'
        })
      });

      const result = await response.json().catch(() => ({}));
      const decomposer = result?.data?.decomposer;

      if (!response.ok || !result.success || !decomposer) {
        throw new Error(result?.error || (isEn() ? 'Failed to decompose problem.' : 'Không thể tạo bản đồ phân rã bài toán.'));
      }

      // Initialize state for this problem
      const nodes = decomposer.nodes || [];
      const firstNodeId = nodes[0]?.id || 'step-1';

      decomposerStore.set(problemId, {
        decomposer,
        activeNodeId: firstNodeId,
        revealedHints: new Set([`${firstNodeId}:1`]), // Level 1 hint revealed for first node by default
        completedNodes: new Set(),
        quizAnswers: new Map()
      });

      renderDecomposerUI(hostContainer, problemId);
      window.showVMOToast?.(isEn() ? 'Problem decomposed successfully.' : 'Đã tạo sơ đồ tư duy xé nhỏ bài toán.', true);
    } catch (err) {
      console.error('[Problem Decomposer]', err);
      hostContainer.innerHTML = `
        <div class="ai-decomposer-wrap" style="padding: 20px; text-align: center; color: #dc2626;">
          <p style="margin: 0 0 10px 0; font-weight: 700;">⚠️ ${esc(err.message)}</p>
          <button type="button" class="decomp-btn-unlock" onclick="window.openProblemDecomposer('${esc(problemId)}')">
            🔄 ${isEn() ? 'Retry' : 'Thử lại'}
          </button>
        </div>
      `;
    }
  };

  // ── Render Decomposer UI ─────────────────────────────────────────────────
  function renderDecomposerUI(container, problemId) {
    const state = decomposerStore.get(problemId);
    if (!state || !state.decomposer) return;

    const { decomposer, activeNodeId, revealedHints, completedNodes, quizAnswers } = state;
    const nodes = decomposer.nodes || [];
    const activeNode = nodes.find(n => n.id === activeNodeId) || nodes[0];
    const totalNodes = nodes.length;
    const completedCount = completedNodes.size;
    const progressPercent = Math.round((completedCount / Math.max(1, totalNodes)) * 100);

    const wrap = document.createElement('div');
    wrap.className = 'ai-decomposer-wrap';
    wrap.id = `decomp-wrap-${problemId}`;

    // Header
    const catLabels = {
      target: isEn() ? 'Target Goal' : 'Mục tiêu chính',
      observation: isEn() ? 'Observation' : 'Nhận xét',
      lemma: isEn() ? 'Key Lemma' : 'Bổ đề then chốt',
      technique: isEn() ? 'Technique' : 'Kỹ thuật',
      calculation: isEn() ? 'Formulation' : 'Biến đổi',
      conclusion: isEn() ? 'Conclusion' : 'Kết luận'
    };

    wrap.innerHTML = `
      <div class="decomp-header">
        <div class="decomp-title-group">
          <h4>🧩 ${formatMathHtml(decomposer.title)}</h4>
          <p>${formatMathHtml(decomposer.summary)}</p>
        </div>
        <div class="decomp-header-badges">
          <span class="decomp-badge">★ ${isEn() ? 'Difficulty' : 'Độ khó'}: ${decomposer.difficulty}/5</span>
          <span class="decomp-badge">🧭 ${totalNodes} ${isEn() ? 'Thinking Nodes' : 'Nút tư duy'}</span>
        </div>
        <div class="decomp-header-actions">
          <button type="button" onclick="window.decompUnlockAll('${esc(problemId)}')">
            🔓 ${isEn() ? 'Unlock All' : 'Mở toàn bộ'}
          </button>
          <button type="button" onclick="window.decompReset('${esc(problemId)}')">
            🔄 ${isEn() ? 'Reset' : 'Làm lại'}
          </button>
          <button type="button" onclick="window.decompClose('${esc(problemId)}')">
            ✕
          </button>
        </div>
      </div>

      <div class="decomp-progress-bar-wrap">
        <span class="decomp-progress-text">
          ${isEn() ? 'Exploration Progress' : 'Tiến độ khám phá'}: ${completedCount}/${totalNodes} (${progressPercent}%)
        </span>
        <div class="decomp-progress-track">
          <div class="decomp-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>

      <div class="decomp-body">
        <!-- Cột trái: Sơ đồ tư duy dạng dòng chảy (Graph Pane) -->
        <div class="decomp-graph-pane">
          <div class="decomp-flow-chain">
            ${nodes.map((node, idx) => {
              const isActive = node.id === activeNodeId;
              const isCompleted = completedNodes.has(node.id);
              const isLocked = !isCompleted && !isActive && idx > 0 && !completedNodes.has(nodes[idx - 1].id);
              const catClass = `cat-${node.category || 'observation'}`;
              const catName = catLabels[node.category] || (isEn() ? 'Step' : 'Bước');

              let statusIcon = '🔒';
              if (isCompleted) statusIcon = '✅';
              else if (isActive) statusIcon = '🔓';

              return `
                <div class="decomp-node-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}"
                     onclick="window.decompSelectNode('${esc(problemId)}', '${esc(node.id)}')">
                  <div class="decomp-node-card-head">
                    <span class="decomp-node-cat ${catClass}">${catName}</span>
                    <span class="decomp-node-status">${statusIcon}</span>
                  </div>
                  <div class="decomp-node-title">${formatMathHtml(node.title)}</div>
                  <p class="decomp-node-desc">${formatMathHtml(node.description || '')}</p>
                  ${node.keyFormula ? `<div class="decomp-node-formula">${formatMathHtml(node.keyFormula)}</div>` : ''}
                </div>
                ${idx < nodes.length - 1 ? `
                  <div class="decomp-connector">
                    <span>${isEn() ? 'leads to' : 'dẫn tới'}</span>
                  </div>
                ` : ''}
              `;
            }).join('')}
          </div>
        </div>

        <!-- Cột phải: Chi tiết nút & Gợi ý từng tầng (Detail Inspection Pane) -->
        <div class="decomp-detail-pane" id="decomp-detail-${esc(problemId)}">
          ${renderNodeDetailHtml(problemId, activeNode, state)}
        </div>
      </div>
    `;

    container.replaceChildren(wrap);
    typesetMath(wrap);
  }

  function renderNodeDetailHtml(problemId, node, state) {
    if (!node) return `<p style="opacity:0.7;">${isEn() ? 'Select a thinking node to inspect.' : 'Chọn một nút tư duy trên sơ đồ để xem chi tiết.'}</p>`;

    const { revealedHints, completedNodes, quizAnswers } = state;
    const isCompleted = completedNodes.has(node.id);
    const hints = node.hints || [];

    return `
      <div class="decomp-detail-head">
        <span class="decomp-node-cat cat-${node.category || 'observation'}" style="margin-bottom:6px;display:inline-block;">
          ${esc(node.category?.toUpperCase() || 'STEP')}
        </span>
        <h3>${formatMathHtml(node.title)}</h3>
        <p>${formatMathHtml(node.description || '')}</p>
        ${node.keyFormula ? `
          <div class="decomp-node-formula" style="margin-top:10px;font-size:0.95rem;">
            <strong>${isEn() ? 'Key Formulation' : 'Công thức trọng tâm'}:</strong> ${formatMathHtml(node.keyFormula)}
          </div>
        ` : ''}
      </div>

      <!-- Tầng gợi ý từng bước (Progressive Hints) -->
      <div class="decomp-hints-container">
        ${hints.map(hint => {
          const hintKey = `${node.id}:${hint.level}`;
          const isRevealed = revealedHints.has(hintKey);
          const levelTagClass = `level-tag-${hint.level}`;

          if (!isRevealed) {
            return `
              <div class="decomp-hint-box locked">
                <span class="decomp-hint-level-tag ${levelTagClass}" style="margin-bottom:8px;display:inline-block;">
                  ${formatMathHtml(hint.label)}
                </span>
                <p style="margin:0 0 10px 0;font-size:0.85rem;opacity:0.8;">
                  🔒 ${isEn() ? 'Hint level is locked. Try thinking first!' : 'Gợi ý tầng này đang khóa. Hãy tự suy nghĩ trước khi mở!'}
                </p>
                <button type="button" class="decomp-btn-unlock" onclick="window.decompRevealHint('${esc(problemId)}', '${esc(node.id)}', ${hint.level})">
                  🔓 ${isEn() ? 'Reveal This Hint' : 'Mở khóa gợi ý này'}
                </button>
              </div>
            `;
          }

          return `
            <div class="decomp-hint-box">
              <div class="decomp-hint-header">
                <span class="decomp-hint-level-tag ${levelTagClass}">${formatMathHtml(hint.label)}</span>
                <span style="font-size:0.75rem;font-weight:700;color:#10b981;">✓ ${isEn() ? 'Unlocked' : 'Đã mở'}</span>
              </div>
              <div class="decomp-hint-content">
                ${formatMathHtml(hint.content)}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Mini-Quiz tự kiểm tra (nếu có) -->
      ${node.checkQuestion ? `
        <div class="decomp-quiz-box">
          <div class="decomp-quiz-question">
            🎯 ${isEn() ? 'Checkpoint Mini-Quiz' : 'Thử thách tự kiểm tra'}: ${formatMathHtml(node.checkQuestion.question)}
          </div>
          <div class="decomp-quiz-options">
            ${(node.checkQuestion.options || []).map((opt, optIdx) => {
              const answered = quizAnswers.get(node.id);
              const isSelected = answered?.chosenIndex === optIdx;
              const isCorrect = optIdx === node.checkQuestion.correctIndex;
              let btnClass = '';
              if (answered) {
                if (isSelected && answered.isCorrect) btnClass = 'correct';
                else if (isSelected && !answered.isCorrect) btnClass = 'incorrect';
                else if (isCorrect) btnClass = 'correct';
              }
              return `
                <button type="button" class="decomp-quiz-option-btn ${btnClass}"
                        onclick="window.decompAnswerQuiz('${esc(problemId)}', '${esc(node.id)}', ${optIdx})"
                        ${answered ? 'disabled' : ''}>
                  ${String.fromCharCode(65 + optIdx)}. ${formatMathHtml(opt)}
                </button>
              `;
            }).join('')}
          </div>
          ${quizAnswers.has(node.id) ? `
            <div class="decomp-quiz-feedback ${quizAnswers.get(node.id).isCorrect ? 'success' : 'error'}">
              ${quizAnswers.get(node.id).isCorrect
                ? `🎉 ${isEn() ? 'Spot on!' : 'Chính xác!'} ${formatMathHtml(node.checkQuestion.explanation)}`
                : `❌ ${isEn() ? 'Not quite.' : 'Chưa chính xác.'} ${formatMathHtml(node.checkQuestion.explanation)}`}
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Footer Action -->
      <div class="decomp-detail-actions">
        <button type="button" class="decomp-btn-complete" onclick="window.decompMarkCompleted('${esc(problemId)}', '${esc(node.id)}')">
          ${isCompleted ? `✅ ${isEn() ? 'Completed' : 'Đã nắm vững'}` : `✨ ${isEn() ? 'Mark Step Completed & Next' : 'Đã hiểu & Sang bước tiếp'}`}
        </button>
      </div>
    `;
  }

  // ── Interactive Actions ──────────────────────────────────────────────────
  window.decompSelectNode = function(problemId, nodeId) {
    const state = decomposerStore.get(problemId);
    if (!state) return;
    state.activeNodeId = nodeId;
    // Auto-reveal level 1 for clicked node
    state.revealedHints.add(`${nodeId}:1`);
    const container = document.getElementById(`decomp-wrap-${problemId}`)?.parentElement;
    if (container) {
      renderDecomposerUI(container, problemId);
    }
  };

  window.decompRevealHint = function(problemId, nodeId, level) {
    const state = decomposerStore.get(problemId);
    if (!state) return;
    state.revealedHints.add(`${nodeId}:${level}`);
    const container = document.getElementById(`decomp-wrap-${problemId}`)?.parentElement;
    if (container) {
      renderDecomposerUI(container, problemId);
    }
  };

  window.decompAnswerQuiz = function(problemId, nodeId, optIndex) {
    const state = decomposerStore.get(problemId);
    if (!state) return;
    const node = state.decomposer.nodes.find(n => n.id === nodeId);
    if (!node?.checkQuestion) return;

    const isCorrect = optIndex === node.checkQuestion.correctIndex;
    state.quizAnswers.set(nodeId, { chosenIndex: optIndex, isCorrect });

    // If correct, auto-reveal level 3 detailed hint
    if (isCorrect) {
      state.revealedHints.add(`${nodeId}:2`);
      state.revealedHints.add(`${nodeId}:3`);
    }

    const container = document.getElementById(`decomp-wrap-${problemId}`)?.parentElement;
    if (container) {
      renderDecomposerUI(container, problemId);
    }
  };

  window.decompMarkCompleted = function(problemId, nodeId) {
    const state = decomposerStore.get(problemId);
    if (!state) return;
    state.completedNodes.add(nodeId);
    // Reveal all hints for this completed node
    state.revealedHints.add(`${nodeId}:1`);
    state.revealedHints.add(`${nodeId}:2`);
    state.revealedHints.add(`${nodeId}:3`);

    // Advance to next node if available
    const nodes = state.decomposer.nodes || [];
    const currentIndex = nodes.findIndex(n => n.id === nodeId);
    if (currentIndex >= 0 && currentIndex < nodes.length - 1) {
      const nextNode = nodes[currentIndex + 1];
      state.activeNodeId = nextNode.id;
      state.revealedHints.add(`${nextNode.id}:1`);
    }

    const container = document.getElementById(`decomp-wrap-${problemId}`)?.parentElement;
    if (container) {
      renderDecomposerUI(container, problemId);
    }
  };

  window.decompUnlockAll = function(problemId) {
    const state = decomposerStore.get(problemId);
    if (!state) return;
    (state.decomposer.nodes || []).forEach(node => {
      state.completedNodes.add(node.id);
      state.revealedHints.add(`${node.id}:1`);
      state.revealedHints.add(`${node.id}:2`);
      state.revealedHints.add(`${node.id}:3`);
    });
    const container = document.getElementById(`decomp-wrap-${problemId}`)?.parentElement;
    if (container) {
      renderDecomposerUI(container, problemId);
    }
  };

  window.decompReset = function(problemId) {
    const state = decomposerStore.get(problemId);
    if (!state) return;
    const firstNodeId = state.decomposer.nodes?.[0]?.id || 'step-1';
    state.activeNodeId = firstNodeId;
    state.completedNodes.clear();
    state.revealedHints.clear();
    state.revealedHints.add(`${firstNodeId}:1`);
    state.quizAnswers.clear();
    const container = document.getElementById(`decomp-wrap-${problemId}`)?.parentElement;
    if (container) {
      renderDecomposerUI(container, problemId);
    }
  };

  window.decompClose = function(problemId) {
    const wrap = document.getElementById(`decomp-wrap-${problemId}`);
    if (wrap) wrap.style.display = 'none';
  };

  // ── Quick button on problem card ─────────────────────────────────────────
  window.openDirectDecomposer = function(btn) {
    window.openProblemDecomposer(btn);
  };
})();
