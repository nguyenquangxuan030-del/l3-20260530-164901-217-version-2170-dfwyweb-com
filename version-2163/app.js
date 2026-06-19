
(function () {
  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
  function getMovies() {
    return (window.SITE_DATA && window.SITE_DATA.movies) ? window.SITE_DATA.movies : [];
  }
  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
  function cardHtml(movie, rootPrefix = '') {
    const href = rootPrefix + movie.href;
    const tags = (movie.tags || []).slice(0, 3).map(t => `<span class="pill">${escapeHtml(t)}</span>`).join('');
    return `
      <a class="card" href="${href}">
        <div class="poster" style="--hue:${movie.hue}">
          <span class="type">${escapeHtml(movie.type || '影片')} · ${escapeHtml(movie.year || '')}</span>
          <h3>${escapeHtml(movie.title)}</h3>
          <p>${escapeHtml(movie.one_line || movie.summary || '')}</p>
          <div class="meta">
            <span class="badge">${escapeHtml(movie.region || '暂无地区')}</span>
            <span class="badge">${escapeHtml(movie.genre || '暂无类型')}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="tags">${tags}</div>
          <p class="line">${escapeHtml((movie.summary || movie.one_line || '').slice(0, 72))}${(movie.summary || movie.one_line || '').length > 72 ? '…' : ''}</p>
          <div class="foot">
            <strong>查看详情</strong>
            <span>编号 ${movie.id}</span>
          </div>
        </div>
      </a>`;
  }
  function listHtml(movie, rootPrefix = '') {
    const href = rootPrefix + movie.href;
    return `
      <a class="list-item" href="${href}">
        <div class="list-thumb poster" style="--hue:${movie.hue}; min-height:70px; padding:10px; border-radius:14px;">
          <span class="type">${escapeHtml(movie.year || '')}</span>
          <h3 style="font-size:0.88rem; margin:10px 0 0; line-height:1.2;">${escapeHtml(movie.title)}</h3>
        </div>
        <div>
          <p class="list-title">${escapeHtml(movie.title)}</p>
          <p class="list-sub">${escapeHtml(movie.region || '')} · ${escapeHtml(movie.genre || '')}</p>
        </div>
      </a>`;
  }
  function params() { return new URLSearchParams(location.search); }
  function initHeader() {
    const toggle = qs('[data-menu-toggle]');
    const nav = qs('[data-nav]');
    const form = qs('[data-search-form]');
    const input = qs('[data-search-input]');
    if (toggle && nav) {
      toggle.addEventListener('click', () => nav.classList.toggle('open'));
    }
    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = input.value.trim();
        const url = new URL(form.action || '/search.html', location.href);
        if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
        location.href = url.pathname + url.search;
      });
    }
  }
  function initBackTop() {
    const btn = qs('[data-backtop]');
    if (!btn) return;
    const onScroll = () => btn.classList.toggle('show', window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
  function initSearchPage() {
    const box = qs('[data-search-results]');
    if (!box) return;
    const movies = getMovies();
    const p = params();
    const q = (p.get('q') || '').trim().toLowerCase();
    const category = (p.get('category') || '').trim();
    const type = (p.get('type') || '').trim();
    const year = (p.get('year') || '').trim();

    const queryInput = qs('[data-query-input]');
    const categorySelect = qs('[data-category-select]');
    const typeSelect = qs('[data-type-select]');
    const yearSelect = qs('[data-year-select]');
    if (queryInput) queryInput.value = p.get('q') || '';
    if (categorySelect) categorySelect.value = category;
    if (typeSelect) typeSelect.value = type;
    if (yearSelect) yearSelect.value = year;

    function pass(movie) {
      if (q) {
        const hay = [movie.title, movie.region, movie.type, movie.genre, movie.one_line, movie.summary, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (category && movie.category_slug !== category && movie.category !== category) return false;
      if (type && movie.type !== type) return false;
      if (year && String(movie.year) !== year) return false;
      return true;
    }
    const filtered = movies.filter(pass);
    const head = qs('[data-search-head]');
    if (head) head.textContent = `共找到 ${filtered.length} 条结果`;
    box.innerHTML = filtered.slice(0, 600).map(m => cardHtml(m, '')).join('') || `<div class="card"><div class="card-body"><h3>没有找到匹配内容</h3><p class="line">请换一个关键词或清空筛选条件。</p></div></div>`;

    const apply = qs('[data-apply-filters]');
    if (apply) {
      apply.addEventListener('click', () => {
        const url = new URL(location.href);
        const qv = queryInput ? queryInput.value.trim() : '';
        const cv = categorySelect ? categorySelect.value : '';
        const tv = typeSelect ? typeSelect.value : '';
        const yv = yearSelect ? yearSelect.value : '';
        qv ? url.searchParams.set('q', qv) : url.searchParams.delete('q');
        cv ? url.searchParams.set('category', cv) : url.searchParams.delete('category');
        tv ? url.searchParams.set('type', tv) : url.searchParams.delete('type');
        yv ? url.searchParams.set('year', yv) : url.searchParams.delete('year');
        location.href = url.pathname + url.search;
      });
    }
  }
  function initDynamicBlocks() {
    const movies = getMovies();
    if (!movies.length) return;
    const blocks = qsa('[data-movie-block]');
    blocks.forEach(block => {
      const kind = block.getAttribute('data-movie-block');
      let subset = [];
      if (kind === 'hot') subset = movies.filter(m => m.rank <= 24);
      else if (kind === 'latest') subset = movies.filter(m => m.year >= movies[0].year).slice(0, 24);
      else if (kind === 'featured') subset = movies.slice(0, 6);
      else if (kind && kind.startsWith('category:')) {
        const slug = kind.split(':')[1];
        subset = movies.filter(m => m.category_slug === slug).slice(0, 18);
      }
      if (subset.length) {
        block.innerHTML = subset.map(m => cardHtml(m, block.getAttribute('data-root') || '')).join('');
      }
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initBackTop();
    initSearchPage();
    initDynamicBlocks();
  });
})();
