/* FIFA STORE — demo interactions */
(function () {
  'use strict';

  var WA_NUMBER = '201557550837';
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- loader ---------------- */
  var loader = document.getElementById('loader');
  var counter = document.querySelector('.loader__count');

  document.body.classList.add('is-locked');

  function runLoader() {
    if (!loader) return;
    var start = performance.now();
    var duration = prefersReduced ? 200 : 1450;

    function tick(now) {
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      if (counter) counter.textContent = String(Math.round(eased * 100)).padStart(2, '0');
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(finish, 180);
      }
    }
    requestAnimationFrame(tick);

    function finish() {
      loader.classList.add('is-done');
      document.body.classList.remove('is-locked');
      document.body.classList.add('is-ready');
      setTimeout(function () { loader.remove(); }, 1400);
      revealAll();
    }
  }

  runLoader();
  // safety: never leave the page locked if the animation frame loop stalls
  setTimeout(function () {
    if (document.getElementById('loader')) {
      document.getElementById('loader').classList.add('is-done');
      document.body.classList.remove('is-locked');
      revealAll();
    }
  }, 3200);

  /* ---------------- reveal on scroll ---------------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  function revealAll() {
    revealItems.forEach(function (el, i) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        setTimeout(function () { el.classList.add('is-in'); }, i * 45);
      }
    });
  }

  if ('IntersectionObserver' in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealItems.forEach(function (el) { io.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------- header state ---------------- */
  var header = document.getElementById('header');
  var lastY = -1;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (y === lastY) return;
    lastY = y;
    if (header) header.classList.toggle('is-stuck', y > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- mobile drawer ---------------- */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');

  function setDrawer(open) {
    if (!burger || !drawer) return;
    burger.setAttribute('aria-expanded', String(open));
    drawer.setAttribute('aria-hidden', String(!open));
    drawer.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
  }

  if (burger) {
    burger.addEventListener('click', function () {
      setDrawer(burger.getAttribute('aria-expanded') !== 'true');
    });
  }
  if (drawer) {
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setDrawer(false);
  });

  /* ---------------- spotlight ---------------- */
  var spot = document.getElementById('spotlight');
  if (spot && !prefersReduced && window.matchMedia('(pointer: fine)').matches) {
    var raf = null;
    window.addEventListener('pointermove', function (e) {
      spot.classList.add('is-on');
      if (raf) return;
      raf = requestAnimationFrame(function () {
        spot.style.setProperty('--mx', e.clientX + 'px');
        spot.style.setProperty('--my', e.clientY + 'px');
        raf = null;
      });
    }, { passive: true });
  }

  /* ---------------- hero parallax ---------------- */
  var frame = document.getElementById('heroFrame');
  if (frame && !prefersReduced && window.matchMedia('(pointer: fine)').matches) {
    frame.addEventListener('pointermove', function (e) {
      var r = frame.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      frame.style.transform = 'perspective(900px) rotateY(' + (x * -4).toFixed(2) + 'deg) rotateX(' + (y * 4).toFixed(2) + 'deg)';
    });
    frame.addEventListener('pointerleave', function () {
      frame.style.transform = '';
    });
  }

  /* ---------------- product filter ---------------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  var empty = document.getElementById('gridEmpty');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var key = chip.getAttribute('data-filter');
      chips.forEach(function (c) { c.classList.toggle('is-active', c === chip); });

      var shown = 0;
      cards.forEach(function (card) {
        var match = key === 'all' || card.getAttribute('data-cat') === key;
        card.classList.toggle('is-hidden', !match);
        if (match) {
          shown++;
          card.classList.remove('is-in');
          void card.offsetWidth;
          card.classList.add('is-in');
        }
      });
      if (empty) empty.hidden = shown !== 0;
    });
  });

  /* ---------------- sizes ---------------- */
  var sizeBtns = Array.prototype.slice.call(document.querySelectorAll('.size'));
  var chosenSize = '';

  sizeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var active = b.classList.contains('is-active');
      sizeBtns.forEach(function (o) { o.classList.remove('is-active'); });
      if (!active) {
        b.classList.add('is-active');
        chosenSize = b.getAttribute('data-size');
      } else {
        chosenSize = '';
      }
    });
  });

  /* ---------------- order form -> WhatsApp ---------------- */
  var form = document.getElementById('orderForm');
  var err = document.getElementById('formErr');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var el = function (n) { return form.querySelector('[name="' + n + '"]'); };
      var name = el('name').value.trim();
      var phone = el('phone').value.trim();
      var item = el('item').value;
      var note = el('note').value.trim();
      var digits = phone.replace(/[^\d]/g, '');

      var ok = name.length >= 2 && digits.length >= 10;
      form.querySelector('[name="name"]').parentNode.classList.toggle('has-error', name.length < 2);
      form.querySelector('[name="phone"]').parentNode.classList.toggle('has-error', digits.length < 10);
      if (err) err.hidden = ok;
      if (!ok) return;

      var lines = [
        'السلام عليكم، FIFA STORE',
        'عايز أطلب:',
        '• القطعة: ' + item,
        '• الاسم: ' + name,
        '• الموبايل: ' + phone
      ];
      if (chosenSize) lines.push('• المقاس: ' + chosenSize);
      if (note) lines.push('• ملاحظات: ' + note);

      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
    });
  }

  /* ---------------- band parallax ---------------- */
  var bandImg = document.getElementById('bandImg');
  if (bandImg && !prefersReduced) {
    var ticking = false;
    var move = function () {
      var r = bandImg.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) { ticking = false; return; }
      var progress = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      bandImg.style.transform = 'translate3d(0,' + (progress * -46).toFixed(1) + 'px,0)';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(move); }
    }, { passive: true });
    move();
  }

  /* ---------------- misc ---------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
