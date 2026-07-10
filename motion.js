/* ============================================
   AURELIUS NEXUS — Motion that whispers
   Short, intentional, transform/opacity only
   ============================================ */

(function () {
  'use strict';

  document.documentElement.classList.add('js');
  document.documentElement.classList.remove('no-js');
  window.__anMotion = true;

  const reduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isMobile = window.matchMedia('(max-width: 720px)').matches;

  // ----- Preloader (fast, quiet) -----
  const preloader = document.getElementById('preloader');
  const preBar = preloader && preloader.querySelector('.preloader-bar span');
  if (preloader && preBar) {
    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(100, p + (reduced ? 50 : 18 + Math.random() * 22));
      preBar.style.width = p + '%';
      if (p >= 100) {
        clearInterval(tick);
        requestAnimationFrame(() => {
          preloader.classList.add('is-done');
          document.body.classList.add('is-loaded');
          setTimeout(() => preloader.remove(), 500);
        });
      }
    }, reduced ? 30 : 50);
  } else {
    document.body.classList.add('is-loaded');
  }

  // ----- Scroll progress -----
  const progress = document.getElementById('scrollProgress');
  if (progress) {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function showHeroStatic() {
    document
      .querySelectorAll('.hero-title .line span, .hero-sub, .hero-actions, .hero-badge, .hero-marks')
      .forEach((el) => {
        if (!el) return;
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
  }

  function ioFallback() {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -32px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  }

  if (typeof gsap === 'undefined' || reduced) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    if (!reduced) ioFallback();
    showHeroStatic();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });

  // Whisper defaults — short travel, soft ease
  const ease = 'power2.out';
  const yIn = isMobile ? 14 : 18;
  const dur = isMobile ? 0.45 : 0.55;

  // ----- Hero: staggered lines, no theatrics -----
  const heroLines = document.querySelectorAll('.hero-title .line span');
  if (heroLines.length) {
    gsap.set(heroLines, { yPercent: 100, opacity: 0 });
    gsap.set(['.hero-badge', '.hero-sub', '.hero-actions', '.hero-marks'], {
      opacity: 0,
      y: 12,
    });

    const tl = gsap.timeline({ defaults: { ease }, delay: 0.08 });
    tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.45 }, 0)
      .to(heroLines, { yPercent: 0, opacity: 1, duration: 0.65, stagger: 0.06 }, 0.08)
      .to('.hero-sub', { opacity: 1, y: 0, duration: 0.5 }, 0.38)
      .to('.hero-actions', { opacity: 1, y: 0, duration: 0.5 }, 0.48)
      .to('.hero-marks', { opacity: 1, y: 0, duration: 0.5 }, 0.6);
  }

  const pageHead = document.querySelector('.page-head-content');
  if (pageHead && !document.querySelector('.hero')) {
    gsap.from(pageHead.children, {
      opacity: 0,
      y: 14,
      duration: 0.5,
      stagger: 0.05,
      ease,
      delay: 0.05,
    });
  }

  // ----- Scroll reveals: small y, no bounce -----
  document.querySelectorAll('.reveal').forEach((el) => {
    const delay =
      el.classList.contains('d1') ? 0.04 :
      el.classList.contains('d2') ? 0.08 :
      el.classList.contains('d3') ? 0.12 :
      el.classList.contains('d4') ? 0.16 : 0;

    gsap.fromTo(
      el,
      { opacity: 0, y: yIn },
      {
        opacity: 1,
        y: 0,
        duration: dur,
        delay,
        ease,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        onComplete: () => {
          el.classList.add('in');
          gsap.set(el, { clearProps: 'transform' });
        },
      }
    );
  });

  // ----- Grid stagger: tight, wave from start -----
  document.querySelectorAll('[data-stagger]').forEach((grid) => {
    const kids = Array.from(grid.children).slice(0, 8);
    if (!kids.length) return;
    gsap.from(kids, {
      opacity: 0,
      y: yIn,
      duration: dur,
      stagger: 0.05,
      ease,
      scrollTrigger: {
        trigger: grid,
        start: 'top 86%',
        toggleActions: 'play none none none',
      },
    });
  });

  // ----- Counters -----
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    if (Number.isNaN(target)) return;
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const obj = { v: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: target,
          duration: 1.15,
          ease: 'power2.out',
          onUpdate: () => {
            const n = decimals
              ? obj.v.toFixed(decimals)
              : Math.round(obj.v).toString().padStart(2, '0');
            el.textContent = prefix + n + suffix;
          },
        });
      },
    });
  });

  // ----- Parallax: desktop only, tiny -----
  if (finePointer && !isMobile) {
    document.querySelectorAll('[data-parallax]').forEach((layer) => {
      const speed = Math.min(parseFloat(layer.dataset.parallax) || 0.08, 0.12);
      gsap.to(layer, {
        yPercent: speed * 80,
        ease: 'none',
        scrollTrigger: {
          trigger: layer.closest('section') || layer.parentElement,
          scrub: 0.8,
          start: 'top bottom',
          end: 'bottom top',
        },
      });
    });
  }

  // ----- Magnetic: subtle -----
  if (finePointer) {
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      const strength = 0.22;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, {
          x: (e.clientX - r.left - r.width / 2) * strength,
          y: (e.clientY - r.top - r.height / 2) * strength,
          duration: 0.28,
          ease: 'power2.out',
        });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.45, ease: 'power3.out' });
      });
    });
  }

  // ----- Tilt: whisper -----
  if (finePointer && !isMobile) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const max = Math.min(parseFloat(card.dataset.tilt) || 4, 5);
      let rect;
      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
      });
      card.addEventListener('mousemove', (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        card.style.setProperty('--mx', px * 100 + '%');
        card.style.setProperty('--my', py * 100 + '%');
        gsap.to(card, {
          rotateY: (px - 0.5) * max * 2,
          rotateX: -(py - 0.5) * max * 2,
          transformPerspective: 900,
          duration: 0.28,
          ease: 'power2.out',
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.5, ease: 'power2.out' });
      });
    });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
