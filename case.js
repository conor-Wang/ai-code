// case.js — Detail page logic
(function () {
  let currentLang = 'zh';

  // ── Language toggle ──────────────────────────────────────────────────────
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === currentLang));
      renderDetail(currentCase);
    });
  });

  // ── Get case ID from URL ─────────────────────────────────────────────────
  const params = new URLSearchParams(location.search);
  const caseId = params.get('id');
  let currentCase = null;

  if (!caseId || !(currentCase = CASES.find(c => c.id === caseId))) {
    document.getElementById('detailPage').innerHTML = `
      <a class="back-btn" href="index.html">← 返回全部案例</a>
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-text">案例未找到 / Case not found</div>
      </div>`;
    return;
  }

  // ── Render detail ────────────────────────────────────────────────────────
  function renderDetail(c) {
    const zh = currentLang === 'zh';
    const cat = CATEGORIES.find(k => k.id === c.category);

    document.title = `${zh ? c.nameZh : c.nameEn} | Tina · 龙虾应用案例`;
    document.getElementById('pageDesc').content = zh ? c.descZh : c.descEn;

    const skillsHtml = (zh ? c.skillsZh : c.skillsEn)
      .map(s => `<span class="detail-skill-tag">${s}</span>`).join('');
    const tagsHtml = c.tags.map(t => `<span class="tag">${t}</span>`).join('');

    document.getElementById('detailPage').innerHTML = `
      <a class="back-btn" href="index.html">← ${zh ? '返回全部案例' : 'Back to all cases'}</a>

      <div class="detail-hero">
        <div class="detail-category">${cat.icon} ${zh ? cat.zh : cat.en}</div>
        <h1 class="detail-title">${zh ? c.nameZh : c.nameEn}</h1>
        <p class="detail-title-en">${zh ? c.nameEn : c.nameZh}</p>
        <p class="detail-desc">${zh ? c.descZh : c.descEn}</p>
        <p class="detail-desc-en">${zh ? c.descEn : c.descZh}</p>
        <div class="tags-list">${tagsHtml}</div>
      </div>

      <div class="detail-card">
        <div class="detail-card-title">${zh ? '所需技能' : 'Skills Required'}</div>
        <div class="detail-skills">${skillsHtml}</div>
      </div>

      <div class="detail-card">
        <div class="detail-card-title">${zh ? '使用方法' : 'How to Use'}</div>
        <div class="detail-how-to">${zh ? c.howToZh : c.howToEn}</div>
      </div>

      <a class="detail-github-link" href="${c.githubUrl}" target="_blank">
        <div>
          <div class="github-link-text">${zh ? '在 GitHub 查看完整文档' : 'View Full Documentation on GitHub'}</div>
          <div class="github-link-sub">${c.githubUrl.replace('https://github.com/', '')}</div>
        </div>
        <div class="github-arrow">↗</div>
      </a>

      <div id="markdownSection"></div>
    `;

    fetchMarkdown(c);
  }

  // ── Fetch markdown from GitHub ───────────────────────────────────────────
  function fetchMarkdown(c) {
    const rawUrl = c.githubUrl
      .replace('https://github.com/', 'https://raw.githubusercontent.com/')
      .replace('/blob/', '/');

    const section = document.getElementById('markdownSection');
    if (!section) return;

    section.innerHTML = `<div class="loading-spinner">${currentLang === 'zh' ? '正在从 GitHub 加载原始文档…' : 'Loading original docs from GitHub…'}</div>`;

    fetch(rawUrl)
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.text(); })
      .then(md => {
        section.innerHTML = `
          <div class="detail-card">
            <div class="detail-card-title">${currentLang === 'zh' ? '原始文档（英文）' : 'Original Documentation'}</div>
            <div class="markdown-content">${parseMarkdown(md)}</div>
          </div>`;
      })
      .catch(() => {
        section.innerHTML = `
          <div class="detail-card" style="text-align:center;color:var(--text-tertiary);font-size:14px;">
            ${currentLang === 'zh' ? '无法加载 GitHub 文档，请直接访问链接查看。' : 'Could not load GitHub docs. Please visit the link directly.'}
          </div>`;
      });
  }

  // ── Minimal markdown parser ──────────────────────────────────────────────
  function parseMarkdown(md) {
    return md
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/```[\s\S]*?```/g, m => `<pre><code>${m.slice(3, -3).replace(/^[a-z]*\n/, '')}</code></pre>`)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hupblo])/gm, '')
      .replace(/(<\/h[123]>|<\/pre>|<\/ul>|<\/blockquote>)\n/g, '$1');
  }

  renderDetail(currentCase);
})();
