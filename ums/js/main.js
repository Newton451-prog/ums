/* ============================================================
   UPTECH MICROSYSTEMS — Frontend Interactions
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Header scroll state ---------- */
  const header = document.querySelector('.site-header');
  const backTop = document.querySelector('.back-top');

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 20);
    if (backTop) backTop.classList.toggle('show', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile drawer ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');

  if (navToggle && drawer) {
    navToggle.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        drawer.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      })
    );
  }

  /* ---------- Back to top ---------- */
  if (backTop) {
    backTop.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- Animated counters (only genuine data-count values) ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const fmt = (n) => new Intl.NumberFormat('en-US').format(n);
    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(target * eased)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));
  }

  /* ---------- Project filtering ---------- */
  const filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    const chips = filterBar.querySelectorAll('.filter-chip');
    const items = document.querySelectorAll('[data-project-status], [data-project-category]');

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => {
          c.classList.remove('active');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-pressed', 'true');

        const filter = chip.dataset.filter;
        items.forEach((item) => {
          const status = item.dataset.projectStatus || '';
          const category = item.dataset.projectCategory || '';
          const match =
            filter === 'all' ||
            filter === status ||
            filter === category;
          item.style.display = match ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Contact form validation ---------- */
  /* ---------- Contact form validation + send to WhatsApp ---------- */
const form = document.getElementById('enquiry-form');
if (form) {
  const success = form.querySelector('.form-success');
  const fields = form.querySelectorAll('input, select, textarea');
  const WA_NUMBER = '256785801617'; // UPTECH MICROSYSTEMS

  const validators = {
    name:          (v) => v.trim().length >= 2  || 'Please enter your full name.',
    organization:  (v) => v.trim().length >= 1  || 'Please enter your organisation.',
    email:         (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email address.',
    telephone:     (v) => /^[+\d][\d\s\-()]{6,}$/.test(v.trim())       || 'Please enter a valid telephone number.',
    category:      (v) => v !== ''             || 'Please select a project category.',
    description:   (v) => v.trim().length >= 15 || 'Please describe your project (at least 15 characters).',
  };

  function validateField(input) {
    const rule = validators[input.name];
    if (!rule) return true;
    const result = rule(input.value);
    const wrap = input.closest('.field');
    const err = wrap.querySelector('.field__err');
    if (result === true) {
      wrap.classList.remove('error');
      if (err) err.textContent = '';
      return true;
    }
    wrap.classList.add('error');
    if (err) err.textContent = result;
    return false;
  }

  fields.forEach((f) => {
    f.addEventListener('blur', () => validateField(f));
    f.addEventListener('input', () => {
      if (f.closest('.field').classList.contains('error')) validateField(f);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let ok = true;
    fields.forEach((f) => { if (!validateField(f)) ok = false; });
    if (!ok) {
      const firstErr = form.querySelector('.field.error input, .field.error select, .field.error textarea');
      if (firstErr) firstErr.focus();
      return;
    }

    // Collect form data
    const getVal = (id) => (document.getElementById(id)?.value || '').trim();
    const data = {
      name:         getVal('name'),
      organization: getVal('organization'),
      email:        getVal('email'),
      telephone:    getVal('telephone'),
      category:     getVal('category'),
      description:  getVal('description'),
    };

    // Build a formatted WhatsApp message
    const message =
      '*New Project Enquiry — UPTECH MICROSYSTEMS*\n\n' +
      '*Name:* ' + data.name + '\n' +
      '*Organization:* ' + data.organization + '\n' +
      '*Email:* ' + data.email + '\n' +
      '*Telephone:* ' + data.telephone + '\n' +
      '*Project Category:* ' + data.category + '\n\n' +
      '*Project Description:*\n' + data.description;

    const waUrl = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message);

    // Open WhatsApp in a new tab (must be first, before DOM changes)
    const newWin = window.open(waUrl, '_blank', 'noopener');

    // Show a success message with a fallback link (in case popup was blocked)
    if (success) {
      success.innerHTML =
        'Your enquiry is ready — ' +
        '<a href="' + waUrl + '" target="_blank" rel="noopener" ' +
        'style="color:#1a7f4b;font-weight:600;text-decoration:underline;">' +
        'tap here to open WhatsApp</a> if it did not open automatically.';
      success.classList.add('show');
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Silence an unused-variable warning if the browser blocked the popup
    if (newWin === null) { /* fallback link above is the recovery path */ }

    // Clear the form fields but keep the success message visible
    form.reset();
  });
}  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();