/* ============================================
   AURELIUS NEXUS — Interactions
   Cursor, nav, carousel, forms, journey
   ============================================ */

(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ===== CUSTOM CURSOR =====
  const cursor = document.querySelector('.cursor');
  const dot = document.querySelector('.cursor-dot');
  if (cursor && dot && finePointer && !reduced) {
    document.body.classList.add('has-cursor');
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener(
      'mousemove',
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      },
      { passive: true }
    );
    function loop() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();

    document.querySelectorAll('a, button, [data-cursor], .choice, summary').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  // ===== NAV SCROLLED =====
  const nav = document.getElementById('nav');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile sticky CTA — only when the bar exists
  if (document.querySelector('.mobile-cta-bar')) {
    document.body.classList.add('has-mobile-cta');
  }

  // ===== ACTIVE NAV LINK =====
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (
      href === path ||
      (path === '' && href === 'index.html') ||
      (path === 'index.html' && href === 'index.html')
    ) {
      a.setAttribute('aria-current', 'page');
    }
  });

  // ===== MOBILE MENU =====
  const toggle = document.getElementById('mobileToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    function setOpen(open) {
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    }
    toggle.addEventListener('click', () => {
      setOpen(!links.classList.contains('open'));
    });
    links.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  // ===== REVEAL FALLBACK (if motion.js absent) =====
  if (!window.__anMotion && typeof gsap === 'undefined') {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  }

  // ===== 3D TILT (no GSAP path) =====
  if (finePointer && typeof gsap === 'undefined') {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      let rect;
      let raf = null;
      let tx = 0, ty = 0, cx = 0, cy = 0;
      const max = parseFloat(card.dataset.tilt) || 8;

      function update() {
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        card.style.transform = `perspective(1000px) rotateX(${cy}deg) rotateY(${cx}deg) translateZ(0)`;
        if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
          raf = requestAnimationFrame(update);
        } else {
          raf = null;
        }
      }

      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
      });
      card.addEventListener('mousemove', (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        tx = (px - 0.5) * max * 2;
        ty = -(py - 0.5) * max * 2;
        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
        if (!raf) raf = requestAnimationFrame(update);
      });
      card.addEventListener('mouseleave', () => {
        tx = 0;
        ty = 0;
        rect = null;
        if (!raf) raf = requestAnimationFrame(update);
      });
    });
  }

  // ===== MAGNETIC (no GSAP) =====
  if (finePointer && typeof gsap === 'undefined') {
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      const strength = 0.35;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ===== TESTIMONIALS CAROUSEL =====
  const cards = document.querySelectorAll('.t-card');
  const dots = document.querySelectorAll('.t-dot');
  const prevBtn = document.getElementById('tPrev');
  const nextBtn = document.getElementById('tNext');
  let idx = 0;
  const total = cards.length;

  function updateCarousel() {
    cards.forEach((c, i) => {
      let rel = i - idx;
      if (rel < -Math.floor(total / 2)) rel += total;
      if (rel > Math.floor(total / 2)) rel -= total;
      c.setAttribute('data-pos', rel);
      c.setAttribute('aria-hidden', rel !== 0 ? 'true' : 'false');
    });
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === idx);
      d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
  }
  function go(delta) {
    idx = (idx + delta + total) % total;
    updateCarousel();
  }
  if (cards.length) {
    updateCarousel();
    if (prevBtn) prevBtn.addEventListener('click', () => go(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => go(1));
    dots.forEach((d, i) =>
      d.addEventListener('click', () => {
        idx = i;
        updateCarousel();
      })
    );

    let autoplay = null;
    if (!reduced) {
      autoplay = setInterval(() => go(1), 6000);
      const stage = document.querySelector('.testimonials-stage');
      if (stage) {
        stage.addEventListener('mouseenter', () => clearInterval(autoplay));
        stage.addEventListener('mouseleave', () => {
          autoplay = setInterval(() => go(1), 6000);
        });
        stage.addEventListener('focusin', () => clearInterval(autoplay));
      }
    }

    // Touch swipe
    const stage = document.querySelector('.testimonials-stage');
    if (stage) {
      let startX = 0;
      stage.addEventListener(
        'touchstart',
        (e) => {
          startX = e.changedTouches[0].screenX;
        },
        { passive: true }
      );
      stage.addEventListener(
        'touchend',
        (e) => {
          const dx = e.changedTouches[0].screenX - startX;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        },
        { passive: true }
      );
    }
  }

  // ===== WHATSAPP HANDOFF =====
  // Opens chat with studio number + pre-filled request details
  const WA_NUMBER = '919505570075'; // +91 95055 70075

  function openWhatsApp(message) {
    const url =
      'https://wa.me/' +
      WA_NUMBER +
      '?text=' +
      encodeURIComponent(message);
    // Prefer new tab; fall back to same-tab if popup is blocked
    let win = null;
    try {
      win = window.open(url, '_blank');
    } catch (_) {
      win = null;
    }
    if (!win) {
      window.location.assign(url);
    }
  }

  function line(label, value) {
    const v = String(value || '').trim();
    return v ? label + ': ' + v : null;
  }

  // ===== CONTACT FORM → WhatsApp =====
  const form = document.getElementById('contactForm');
  if (form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.setAttribute('data-anime-skip', 'true');

    const status = form.querySelector('.form-status');

    function setFieldError(field, msg) {
      field.classList.add('is-invalid');
      const err = field.querySelector('.field-error');
      if (err) err.textContent = msg;
    }
    function clearFieldError(field) {
      field.classList.remove('is-invalid');
    }

    form.querySelectorAll('input, select, textarea').forEach((input) => {
      input.addEventListener('blur', () => {
        const field = input.closest('.field');
        if (!field) return;
        if (input.required && !String(input.value).trim()) {
          setFieldError(field, 'This field is required.');
        } else if (input.type === 'email' && input.value) {
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
          if (!ok) setFieldError(field, 'Enter a valid email address.');
          else clearFieldError(field);
        } else {
          clearFieldError(field);
        }
      });
      input.addEventListener('input', () => {
        const field = input.closest('.field');
        if (field) clearFieldError(field);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      let firstInvalid = null;

      form.querySelectorAll('.field').forEach((field) => {
        const input = field.querySelector('input, select, textarea');
        if (!input) return;
        clearFieldError(field);
        if (input.required && !String(input.value).trim()) {
          setFieldError(field, 'This field is required.');
          valid = false;
          if (!firstInvalid) firstInvalid = input;
        } else if (input.type === 'email' && input.value) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
            setFieldError(field, 'Enter a valid email address.');
            valid = false;
            if (!firstInvalid) firstInvalid = input;
          }
        }
      });

      if (!valid) {
        if (status) {
          status.className = 'form-status is-error';
          status.textContent = 'Please fix the highlighted fields and try again.';
        }
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const name = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const subject = form.querySelector('[name="subject"]').value.trim();
      const message = form.querySelector('[name="message"]').value.trim();

      const parts = [
        'Hello Aurelius Nexus 👋',
        '',
        '*New website inquiry*',
        line('Name', name),
        line('Email', email),
        line('Subject', subject),
        '',
        '*Message*',
        message,
      ].filter((p) => p !== null);

      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.innerHTML = '<span>Opening WhatsApp…</span>';
      btn.disabled = true;
      if (status) {
        status.className = 'form-status';
        status.textContent = '';
      }

      openWhatsApp(parts.join('\n'));

      btn.innerHTML = '<span>Opened WhatsApp</span>';
      btn.style.background = 'var(--gold-100)';
      if (status) {
        status.className = 'form-status is-success';
        status.textContent =
          'WhatsApp opened with your message — hit Send in the chat to reach us.';
        status.setAttribute('role', 'status');
      }
      setTimeout(() => {
        form.reset();
        btn.innerHTML = original;
        btn.style.background = '';
        btn.disabled = false;
      }, 3200);
    });
  }

  // ===== ABOUT ORBIT TICKS =====
  const orbitContainer = document.querySelector('.about-orbit');
  if (orbitContainer) {
    const ringR3 = orbitContainer.querySelector('.r3');
    if (ringR3) {
      for (let i = 0; i < 12; i++) {
        const tick = document.createElement('div');
        tick.className = 'about-orbit-tick';
        tick.style.transform = `translateY(-50%) rotate(${i * 30}deg) translateX(${ringR3.offsetWidth / 2 || 120}px)`;
        ringR3.appendChild(tick);
      }
    }
  }

  // ===== JOURNEY FLOW =====
  const journeyPanel = document.getElementById('panel');
  if (journeyPanel) {
    const state = { step: 0, data: {} };
    const screens = document.querySelectorAll('.journey-screen');
    const stepDots = document.querySelectorAll('.journey-step');

    function render() {
      screens.forEach((s) =>
        s.classList.toggle('active', +s.dataset.screen === state.step)
      );
      stepDots.forEach((d, i) => {
        d.classList.remove('active', 'done');
        if (i < state.step) d.classList.add('done');
        else if (i === state.step) d.classList.add('active');
      });
      if (state.step === 3) renderSummary();
    }

    function renderSummary() {
      const sum = document.getElementById('summary');
      if (!sum) return;
      const labels = {
        service: 'Service',
        tier: 'Scope',
        name: 'Name',
        email: 'Email',
        company: 'Company',
        phone: 'Phone',
        vision: 'Vision',
      };
      const keys = ['service', 'tier', 'name', 'email', 'company', 'phone', 'vision'];
      sum.innerHTML = keys
        .map(
          (k) => `
        <div class="j-summary-row">
          <div class="j-summary-label">${labels[k]}</div>
          <div class="j-summary-value ${state.data[k] ? '' : 'muted'}">${
            state.data[k] || '— not provided —'
          }</div>
        </div>`
        )
        .join('');
    }

    function validateEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    document.querySelectorAll('.choice').forEach((c) => {
      c.addEventListener('click', () => {
        const key = c.dataset.key;
        const val = c.dataset.value;
        document
          .querySelectorAll(`.choice[data-key="${key}"]`)
          .forEach((s) => {
            s.classList.remove('selected');
            s.setAttribute('aria-pressed', 'false');
          });
        c.classList.add('selected');
        c.setAttribute('aria-pressed', 'true');
        state.data[key] = val;
        const screen = c.closest('.journey-screen');
        const next = screen.querySelector('[data-next]');
        if (next) next.disabled = false;
      });
    });

    document.querySelectorAll('[data-next]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (state.step === 2) {
          const nameEl = document.getElementById('j-name');
          const emailEl = document.getElementById('j-email');
          const name = nameEl.value.trim();
          const email = emailEl.value.trim();
          let ok = true;

          [nameEl, emailEl].forEach((el) => {
            const field = el.closest('.field');
            if (field) field.classList.remove('is-invalid');
          });

          if (!name) {
            const f = nameEl.closest('.field');
            if (f) {
              f.classList.add('is-invalid');
              const err = f.querySelector('.field-error');
              if (err) err.textContent = 'Name is required.';
            }
            ok = false;
          }
          if (!email || !validateEmail(email)) {
            const f = emailEl.closest('.field');
            if (f) {
              f.classList.add('is-invalid');
              const err = f.querySelector('.field-error');
              if (err) err.textContent = email ? 'Enter a valid email.' : 'Email is required.';
            }
            ok = false;
          }

          if (!ok) {
            btn.classList.remove('shake');
            void btn.offsetWidth;
            btn.classList.add('shake');
            return;
          }
          state.data.name = name;
          state.data.email = email;
          state.data.company = document.getElementById('j-company').value.trim();
          state.data.phone = document.getElementById('j-phone').value.trim();
          state.data.vision = document.getElementById('j-vision').value.trim();
        }
        state.step = Math.min(state.step + 1, 4);
        render();
        journeyPanel.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      });
    });

    for (let i = 0; i < 4; i++) {
      const b = document.getElementById(`back-${i}`);
      if (b)
        b.addEventListener('click', () => {
          state.step = Math.max(state.step - 1, 0);
          render();
        });
    }

    const submit = document.getElementById('submit-journey');
    if (submit) {
      // Don't let NX delay this click — WhatsApp must open from a direct user gesture
      submit.setAttribute('data-anime-skip', 'true');

      submit.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const d = state.data || {};
        if (!d.service || !d.tier || !d.name || !d.email) {
          // Missing earlier steps — send user back
          state.step = !d.service ? 0 : !d.tier ? 1 : 2;
          render();
          return;
        }

        const parts = [
          'Hello Aurelius Nexus 👋',
          '',
          '*New Journey request*',
          line('Service', d.service),
          line('Scope', d.tier),
          line('Name', d.name),
          line('Email', d.email),
          line('Company', d.company),
          line('Phone', d.phone),
          '',
          '*Vision*',
          d.vision && String(d.vision).trim()
            ? String(d.vision).trim()
            : '— not provided —',
        ].filter((p) => p !== null);

        submit.innerHTML = '<span>Opening WhatsApp…</span>';
        submit.disabled = true;

        // Open WhatsApp immediately (same tick as click)
        openWhatsApp(parts.join('\n'));

        // Success screen after handoff
        state.step = 4;
        render();
        submit.innerHTML =
          '<span>Send Request</span><span class="arrow" aria-hidden="true">→</span>';
        submit.disabled = false;
      });
    }
  }
})();
