/* ============================================
   AURELIUS NEXUS — Interactions
   Cursor, 3D tilt, magnetic buttons, scroll
   ============================================ */

(function() {
  // ===== CUSTOM CURSOR =====
  const cursor = document.querySelector('.cursor');
  const dot = document.querySelector('.cursor-dot');
  if (cursor && dot && window.matchMedia('(hover: hover)').matches) {
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    function loop() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();

    document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  // ===== NAV SCROLLED STATE =====
  const nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== MOBILE MENU =====
  const toggle = document.getElementById('mobileToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.addEventListener('click', e => {
      if (e.target.tagName === 'A') links.classList.remove('open');
    });
  }

  // ===== REVEAL ON SCROLL =====
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ===== 3D TILT CARDS =====
  document.querySelectorAll('[data-tilt]').forEach(card => {
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
    card.addEventListener('mousemove', e => {
      if (!rect) rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      tx = (px - 0.5) * max * 2;
      ty = -(py - 0.5) * max * 2;
      card.style.setProperty('--mx', (px * 100) + '%');
      card.style.setProperty('--my', (py * 100) + '%');
      if (!raf) raf = requestAnimationFrame(update);
    });
    card.addEventListener('mouseleave', () => {
      tx = 0; ty = 0;
      rect = null;
      if (!raf) raf = requestAnimationFrame(update);
    });
  });

  // ===== MAGNETIC BUTTONS =====
  document.querySelectorAll('[data-magnetic]').forEach(btn => {
    const strength = 0.35;
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ===== TESTIMONIALS CAROUSEL =====
  const cards = document.querySelectorAll('.t-card');
  const dots = document.querySelectorAll('.t-dot');
  const prevBtn = document.getElementById('tPrev');
  const nextBtn = document.getElementById('tNext');
  let idx = 0;
  const total = cards.length;

  function update() {
    cards.forEach((c, i) => {
      let rel = i - idx;
      if (rel < -Math.floor(total / 2)) rel += total;
      if (rel > Math.floor(total / 2)) rel -= total;
      c.setAttribute('data-pos', rel);
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }
  function go(delta) {
    idx = (idx + delta + total) % total;
    update();
  }
  if (cards.length) {
    update();
    if (prevBtn) prevBtn.addEventListener('click', () => go(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => go(1));
    dots.forEach((d, i) => d.addEventListener('click', () => { idx = i; update(); }));

    // Autoplay
    let autoplay = setInterval(() => go(1), 6000);
    const stage = document.querySelector('.testimonials-stage');
    if (stage) {
      stage.addEventListener('mouseenter', () => clearInterval(autoplay));
      stage.addEventListener('mouseleave', () => {
        autoplay = setInterval(() => go(1), 6000);
      });
    }
  }

  // ===== FORM =====
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.innerHTML;
      btn.innerHTML = '<span>Sending…</span>';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = '<span>Message sent ✓</span>';
        btn.style.background = 'var(--gold-100)';
        setTimeout(() => {
          form.reset();
          btn.innerHTML = original;
          btn.style.background = '';
          btn.disabled = false;
        }, 2400);
      }, 1200);
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
        tick.style.transform = `translateY(-50%) rotate(${i * 30}deg) translateX(${ringR3.offsetWidth / 2}px)`;
        ringR3.appendChild(tick);
      }
    }
  }
})();
