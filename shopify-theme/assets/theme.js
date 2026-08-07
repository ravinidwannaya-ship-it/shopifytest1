(function () {
  var T = window.theme || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Drawers ---------- */
  function openDrawer(id) {
    var d = document.getElementById(id); if (!d) return;
    d.classList.add('is-open'); document.body.style.overflow = 'hidden';
    var f = d.querySelector('button,a,input'); if (f) f.focus();
  }
  function closeDrawer(d) { d.classList.remove('is-open'); document.body.style.overflow = ''; }
  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-drawer-open]');
    if (open) { e.preventDefault(); openDrawer(open.getAttribute('data-drawer-open')); return; }
    if (e.target.closest('[data-drawer-close]') || e.target.classList.contains('drawer__overlay')) {
      var d = e.target.closest('.drawer'); if (d) closeDrawer(d);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') $$('.drawer.is-open').forEach(closeDrawer);
  });

  /* ---------- Notice ---------- */
  var notice = document.getElementById('proto-notice');
  if (notice) {
    if (sessionStorage.getItem('kyathi-notice') === 'off') notice.remove();
    var nb = notice.querySelector('[data-dismiss-notice]');
    if (nb) nb.addEventListener('click', function () { sessionStorage.setItem('kyathi-notice', 'off'); notice.remove(); });
  }

  /* ---------- Reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else { $$('.reveal').forEach(function (el) { el.classList.add('is-in'); }); }

  /* ---------- Back to top ---------- */
  var top = $('[data-back-to-top]');
  if (top) {
    window.addEventListener('scroll', function () { top.classList.toggle('is-on', window.scrollY > 500); }, { passive: true });
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- Layout offsets ---------- */
  function offsets() {
    var nav = $('.mobnav.is-on');
    document.documentElement.style.setProperty('--bottom-nav-h', nav ? nav.offsetHeight + 'px' : '0px');
    var bar = $('.sticky-buy.is-on');
    document.documentElement.style.setProperty('--sticky-bar-h', bar ? bar.offsetHeight + 'px' : '0px');
  }
  window.addEventListener('resize', offsets); offsets(); setTimeout(offsets, 400);

  /* ---------- Slideshow ---------- */
  $$('[data-slideshow]').forEach(function (root) {
    var track = $('[data-slides]', root), slides = $$('.slide', root);
    if (slides.length < 2) return;
    var i = 0, dots = $$('[data-dot]', root), speed = parseInt(root.dataset.autoplay || '0', 10), timer;
    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + i * 100 + '%)';
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i); });
    }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); restart(); }); });
    var p = $('[data-prev]', root), n = $('[data-next]', root);
    if (p) p.addEventListener('click', function () { go(i - 1); restart(); });
    if (n) n.addEventListener('click', function () { go(i + 1); restart(); });
    function restart() { if (!speed) return; clearInterval(timer); timer = setInterval(function () { go(i + 1); }, speed); }
    restart();
    var x0 = null;
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) { go(dx < 0 ? i + 1 : i - 1); restart(); } x0 = null;
    });
  });

  /* ---------- Product gallery ---------- */
  $$('[data-gallery]').forEach(function (g) {
    var main = $('[data-gallery-main]', g);
    $$('[data-thumb]', g).forEach(function (t) {
      t.addEventListener('click', function () {
        if (main) { main.src = t.dataset.full; main.srcset = ''; }
        $$('[data-thumb]', g).forEach(function (o) { o.setAttribute('aria-current', o === t); });
      });
    });
  });

  /* ---------- Quantity ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-qty]'); if (!b) return;
    var input = $('input', b.parentNode); if (!input) return;
    var v = parseInt(input.value || '1', 10) + (b.dataset.qty === 'up' ? 1 : -1);
    input.value = Math.max(parseInt(input.min || '1', 10), v);
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  /* ---------- Variant picker ---------- */
  $$('[data-product-form]').forEach(function (form) {
    var data = $('[data-variants]', form);
    if (!data) return;
    var variants = JSON.parse(data.textContent);
    var idInput = $('[name="id"]', form);
    var priceEl = $('[data-price]');
    var compareEl = $('[data-compare]');
    var btn = $('[data-add]', form);
    var stockEl = $('[data-stock]');
    function selected() {
      var vals = $$('[data-option]', form).map(function (s) {
        if (s.tagName === 'SELECT') return s.value;
        var on = s.querySelector('[aria-pressed="true"]'); return on ? on.dataset.value : null;
      });
      return variants.find(function (v) { return vals.every(function (val, k) { return v.options[k] === val; }); });
    }
    function update() {
      var v = selected();
      if (!v) { if (btn) { btn.disabled = true; btn.textContent = T.strings.unavailable; } return; }
      if (idInput) idInput.value = v.id;
      if (priceEl) priceEl.innerHTML = v.price;
      if (compareEl) compareEl.innerHTML = v.compare_at && v.compare_at_raw > v.price_raw ? v.compare_at : '';
      if (stockEl) stockEl.textContent = v.available ? (v.inventory > 0 && v.inventory < 10 ? 'Only ' + v.inventory + ' left' : 'In stock') : 'Sold out';
      if (btn) { btn.disabled = !v.available; btn.textContent = v.available ? T.strings.addToCart : T.strings.soldOut; }
      if (window.history.replaceState && v.id) {
        var u = new URL(window.location.href); u.searchParams.set('variant', v.id); window.history.replaceState({}, '', u);
      }
      if (v.image) { var m = $('[data-gallery-main]'); if (m) { m.src = v.image; m.srcset = ''; } }
    }
    $$('[data-option]', form).forEach(function (s) {
      if (s.tagName === 'SELECT') s.addEventListener('change', update);
      else s.addEventListener('click', function (e) {
        var b = e.target.closest('[data-value]'); if (!b) return;
        $$('[data-value]', s).forEach(function (o) { o.setAttribute('aria-pressed', o === b); });
        update();
      });
    });
    update();

    form.addEventListener('submit', function (e) {
      if (T.cartType !== 'drawer' || !$('#CartDrawer')) return;
      e.preventDefault();
      var fd = new FormData(form);
      if (btn) btn.disabled = true;
      fetch(T.routes.cart_add, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function () { return refreshCart(); })
        .then(function () { openDrawer('CartDrawer'); })
        .catch(function () { form.submit(); })
        .finally(function () { if (btn) btn.disabled = false; });
    });
  });

  /* ---------- Quick add ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-quick-add]'); if (!b) return;
    e.preventDefault();
    b.disabled = true;
    fetch(T.routes.cart_add, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: [{ id: parseInt(b.dataset.quickAdd, 10), quantity: 1 }] })
    }).then(function () { return refreshCart(); })
      .then(function () { if ($('#CartDrawer')) openDrawer('CartDrawer'); else window.location = T.routes.cart; })
      .finally(function () { b.disabled = false; });
  });

  /* ---------- Cart drawer + line updates ---------- */
  function refreshCart() {
    return fetch(T.routes.cart + '?section_id=cart-drawer')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var fresh = doc.querySelector('[data-cart-contents]');
        var cur = document.querySelector('[data-cart-contents]');
        if (fresh && cur) cur.innerHTML = fresh.innerHTML;
        var count = doc.querySelector('[data-cart-count]');
        $$('[data-cart-count]').forEach(function (el) { el.textContent = count ? count.textContent : el.textContent; });
        offsets();
      });
  }
  window.refreshCart = refreshCart;

  document.addEventListener('click', function (e) {
    var rm = e.target.closest('[data-line-remove]');
    if (rm) { e.preventDefault(); changeLine(rm.dataset.lineRemove, 0); }
  });
  document.addEventListener('change', function (e) {
    var q = e.target.closest('[data-line-qty]');
    if (q) changeLine(q.dataset.lineQty, q.value);
  });
  function changeLine(line, qty) {
    fetch(T.routes.cart_change, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ line: parseInt(line, 10), quantity: parseInt(qty, 10) })
    }).then(function () {
      if (document.body.classList.contains('template-cart')) window.location.reload();
      else refreshCart();
    });
  }

  /* ---------- Predictive search ---------- */
  var si = $('[data-search-input]'), sr = $('[data-search-results]'), st;
  if (si && sr) {
    si.addEventListener('input', function () {
      clearTimeout(st);
      var q = si.value.trim();
      if (q.length < 2) { sr.innerHTML = ''; return; }
      st = setTimeout(function () {
        fetch(T.routes.predictive_search + '?q=' + encodeURIComponent(q) + '&resources[type]=product,collection,page&section_id=predictive-search')
          .then(function (r) { return r.text(); })
          .then(function (html) {
            var doc = new DOMParser().parseFromString(html, 'text/html');
            var res = doc.querySelector('[data-predictive]');
            sr.innerHTML = res ? res.innerHTML : '';
          });
      }, 250);
    });
  }

  /* ---------- Facets toggle & sort ---------- */
  var ft = $('[data-facets-toggle]');
  if (ft) ft.addEventListener('click', function () { $('.facets').classList.toggle('is-open'); });
  var sort = $('[data-sort]');
  if (sort) sort.addEventListener('change', function () {
    var u = new URL(window.location.href); u.searchParams.set('sort_by', sort.value); u.searchParams.delete('page');
    window.location = u.toString();
  });
  $$('[data-facet-form]').forEach(function (f) {
    f.addEventListener('change', function () { f.submit(); });
  });

  /* ---------- Sticky buy bar ---------- */
  var bar = $('.sticky-buy'), anchor = $('[data-buy-anchor]');
  if (bar && anchor && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      bar.classList.toggle('is-on', !es[0].isIntersecting);
      offsets();
    }, { rootMargin: '-10px' }).observe(anchor);
  }

  /* ---------- Countdown ---------- */
  $$('[data-countdown]').forEach(function (el) {
    var end = new Date(el.dataset.countdown).getTime();
    if (isNaN(end)) return;
    function tick() {
      var d = end - Date.now(); if (d < 0) { el.textContent = 'Offer ended'; return; }
      var days = Math.floor(d / 864e5), h = Math.floor(d / 36e5) % 24, m = Math.floor(d / 6e4) % 60, s = Math.floor(d / 1e3) % 60;
      el.innerHTML = '<div><b>' + days + '</b><br><small>Days</small></div><div><b>' + h + '</b><br><small>Hrs</small></div><div><b>' + m + '</b><br><small>Min</small></div><div><b>' + s + '</b><br><small>Sec</small></div>';
      setTimeout(tick, 1000);
    }
    tick();
  });
})();
