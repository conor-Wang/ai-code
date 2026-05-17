// main.js — Homepage logic
(function () {
  let currentLang = 'zh';
  let currentCategory = 'all';

  const t = (el) => el.dataset[currentLang] || el.textContent;

  // ── Language toggle ──────────────────────────────────────────────────────
  function applyLang(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-zh]').forEach(el => {
      el.textContent = el.dataset[lang] || el.dataset.zh;
    });
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    renderAll();
  }

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  // ── Build category filter ────────────────────────────────────────────────
  function buildFilter() {
    const bar = document.getElementById('filterBar');
    bar.innerHTML = '';
    CATEGORIES.forEach(cat => {
      const count = cat.id === 'all' ? CASES.length : CASES.filter(c => c.category === cat.id).length;
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (cat.id === currentCategory ? ' active' : '');
      btn.dataset.cat = cat.id;
      btn.innerHTML = `<span>${cat.icon}</span><span class="cat-label">${currentLang === 'zh' ? cat.zh : cat.en}</span><span class="filter-count">${count}</span>`;
      btn.addEventListener('click', () => {
        currentCategory = cat.id;
        buildFilter();
        renderAll();
      });
      bar.appendChild(btn);
    });
  }

  // ── Render cards ─────────────────────────────────────────────────────────
  function renderAll() {
    const main = document.getElementById('main');
    main.innerHTML = '';

    const filtered = currentCategory === 'all'
      ? CASES
      : CASES.filter(c => c.category === currentCategory);

    if (filtered.length === 0) {
      main.innerHTML = `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-text">${currentLang === 'zh' ? '暂无案例' : 'No cases found'}</div></div>`;
      return;
    }

    if (currentCategory === 'all') {
      CATEGORIES.slice(1).forEach(cat => {
        const catCases = CASES.filter(c => c.category === cat.id);
        if (!catCases.length) return;
        const section = document.createElement('section');
        section.innerHTML = `
          <div class="section-header">
            <div class="section-title">${cat.icon} ${currentLang === 'zh' ? cat.zh : cat.en}</div>
            <div class="section-title-en">${currentLang === 'zh' ? cat.en : cat.zh}</div>
            <div class="section-count">${catCases.length} ${currentLang === 'zh' ? '个案例' : 'cases'}</div>
          </div>
          <div class="cards-grid" id="grid-${cat.id}"></div>
        `;
        main.appendChild(section);
        const grid = section.querySelector(`#grid-${cat.id}`);
        catCases.forEach((c, i) => grid.appendChild(buildCard(c, i)));
      });
    } else {
      const cat = CATEGORIES.find(c => c.id === currentCategory);
      const section = document.createElement('section');
      section.innerHTML = `
        <div class="section-header">
          <div class="section-title">${cat.icon} ${currentLang === 'zh' ? cat.zh : cat.en}</div>
          <div class="section-title-en">${currentLang === 'zh' ? cat.en : cat.zh}</div>
          <div class="section-count">${filtered.length} ${currentLang === 'zh' ? '个案例' : 'cases'}</div>
        </div>
        <div class="cards-grid" id="grid-single"></div>
      `;
      main.appendChild(section);
      const grid = section.querySelector('#grid-single');
      filtered.forEach((c, i) => grid.appendChild(buildCard(c, i)));
    }
  }

  // ── Build single card ────────────────────────────────────────────────────
  function buildCard(c, idx) {
    const cat = CATEGORIES.find(k => k.id === c.category);
    const zh = currentLang === 'zh';
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${idx * 0.03}s`;

    const skillsHtml = (zh ? c.skillsZh : c.skillsEn)
      .map(s => `<span class="skill-tag">${s}</span>`).join('');
    const tagsHtml = c.tags.map(t => `<span class="tag">${t}</span>`).join('');

    card.innerHTML = `
      <div class="card-header">
        <div class="card-category">${cat.icon} ${zh ? cat.zh : cat.en}</div>
        <div class="card-name">${zh ? c.nameZh : c.nameEn}</div>
        <div class="card-name-en">${zh ? c.nameEn : c.nameZh}</div>
        <div class="card-desc">${zh ? c.descZh : c.descEn}</div>
      </div>
      <div class="card-toggle">
        <span>${zh ? '查看详情' : 'View Details'}</span>
        <span class="toggle-icon">▾</span>
      </div>
      <div class="card-body">
        <div class="card-body-inner">
          <div class="detail-section">
            <div class="detail-label">${zh ? '所需技能' : 'Skills Required'}</div>
            <div class="skills-list">${skillsHtml}</div>
          </div>
          <div class="detail-section">
            <div class="detail-label">${zh ? '使用方法' : 'How to Use'}</div>
            <div class="how-to">${zh ? c.howToZh : c.howToEn}</div>
          </div>
          <div class="detail-section">
            <div class="tags-list">${tagsHtml}</div>
          </div>
          <div class="card-actions">
            <a class="btn-detail" href="case.html?id=${c.id}">${zh ? '查看完整详情' : 'Full Details'}</a>
            <a class="btn-github" href="${c.githubUrl}" target="_blank">GitHub ↗</a>
          </div>
        </div>
      </div>
    `;

    const toggle = card.querySelector('.card-toggle');
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.toggle('expanded');
      const label = card.querySelector('.card-toggle span:first-child');
      label.textContent = card.classList.contains('expanded')
        ? (zh ? '收起' : 'Collapse')
        : (zh ? '查看详情' : 'View Details');
    });

    return card;
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  buildFilter();
  renderAll();
})();
