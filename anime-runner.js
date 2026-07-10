/* ============================================
   NX — Studio companion
   Very slow foot patrol · rides bike / cycle / car to clicks
   ============================================ */

(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const SIZE = 96;
  const NAME = 'NX';
  const VEHICLES = ['bike', 'cycle', 'car'];

  let busy = false;
  let cycling = false;
  let facingRight = true;
  let cycleIndex = 0;
  let cycleRaf = 0;
  let bubbleTimer = null;
  let idleChatTimer = null;
  let clickCount = 0;
  let lastX = 64;
  let lastY = 0;
  let activeVehicle = null;

  function floorY() {
    const pad =
      document.body.classList.contains('has-mobile-cta') && window.innerWidth <= 720
        ? 100
        : 28;
    return window.innerHeight - 96 - pad;
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function cyclePoints() {
    const y = floorY();
    const midY = Math.max(160, window.innerHeight * 0.48);
    const left = 56;
    const right = window.innerWidth - 56;
    const mid = window.innerWidth * 0.5;
    return [
      { x: left, y: y },
      { x: mid * 0.5, y: y },
      { x: mid, y: y - 8 },
      { x: mid + (right - mid) * 0.5, y: y },
      { x: right, y: y },
      { x: mid * 1.1, y: midY },
      { x: mid * 0.65, y: midY + 30 },
      { x: left + 30, y: y },
    ];
  }

  const greetings = [
    "I'm NX. I stroll on foot — but for clicks, I grab a ride.",
    "NX here. Slow patrol. Random wheels when you click.",
    "Welcome. Watch me walk… then bike, cycle, or car.",
  ];

  const vehicleLines = {
    bike: ['Bike time.', 'Pedaling over…', 'Two wheels. One NX.'],
    cycle: ['Motorcycle mode.', 'Cycle engaged.', 'Vroom — gently.'],
    car: ['Car service.', 'Driving over…', 'NX rides gold.'],
  };

  const arriveLines = {
    bike: ['Parked. Clicking…', 'Bike lock. Go.'],
    cycle: ['Kickstand. Opening…', 'Cycle stowed.'],
    car: ['Parked. Here we go.', 'Doors open…'],
  };

  const chatLines = [
    "I'm NX. Foot patrol is slow on purpose.",
    'Click anything — I roll over on a bike, cycle, or car. Random each time.',
    'Need a path? Try Services or Begin Journey.',
    'I walk so you can catch me. I drive so you wait stylishly.',
    'Still named NX. Still gold.',
  ];

  const tipByPage = {
    'index.html': 'Home. Send me somewhere with a click — random ride each time.',
    'about.html': 'Studio soul page. Four principles.',
    'services.html': 'Three pillars: web, markets, automation.',
    'pricing.html': 'Tiers are starting points.',
    'testimonials.html': 'Client voices — swipe or arrows.',
    'contact.html': 'Quick note, or Journey for a full brief.',
    'journey.html': "Four steps. I'll keep strolling nearby.",
  };

  const root = document.createElement('div');
  root.id = 'animeRunner';
  root.className = 'anime-runner';
  root.setAttribute('role', 'button');
  root.setAttribute('tabindex', '0');
  root.setAttribute('aria-label', 'NX, studio companion. Click to talk.');
  root.innerHTML = `
    <div class="anime-bubble" id="animeBubble" hidden>
      <span class="anime-bubble-text"></span>
      <span class="anime-bubble-tail" aria-hidden="true"></span>
    </div>
    <div class="anime-stage">
      <div class="anime-runner-shadow" aria-hidden="true"></div>

      <!-- Vehicles (shown only when riding). Wheels are groups at local origin so spin works. -->
      <div class="anime-vehicle anime-vehicle--bike" data-vehicle="bike" aria-hidden="true">
        <svg viewBox="0 0 120 56" fill="none">
          <path d="M28 40 L48 22 L72 22 L92 40" stroke="#eef1f6" stroke-width="2" stroke-linejoin="round"/>
          <path d="M48 22 L48 14 M44 14 H56" stroke="#eef1f6" stroke-width="2" stroke-linecap="round"/>
          <path d="M72 22 L78 14 H88" stroke="#eef1f6" stroke-width="2" stroke-linecap="round"/>
          <circle cx="60" cy="28" r="3" fill="#8a6a2a"/>
          <g class="av-wheel av-wheel-r" data-cx="92" data-cy="40" transform="translate(92 40) rotate(0)">
            <circle cx="0" cy="0" r="12" stroke="#d0a84c" stroke-width="2.5" fill="none"/>
            <line x1="0" y1="-11" x2="0" y2="11" stroke="#d0a84c" stroke-width="1.3"/>
            <line x1="-11" y1="0" x2="11" y2="0" stroke="#d0a84c" stroke-width="1.3"/>
            <line x1="-7.8" y1="-7.8" x2="7.8" y2="7.8" stroke="#d0a84c" stroke-width="1" opacity="0.75"/>
            <line x1="7.8" y1="-7.8" x2="-7.8" y2="7.8" stroke="#d0a84c" stroke-width="1" opacity="0.75"/>
            <circle cx="0" cy="0" r="2.8" fill="#d0a84c"/>
          </g>
          <g class="av-wheel av-wheel-f" data-cx="28" data-cy="40" transform="translate(28 40) rotate(0)">
            <circle cx="0" cy="0" r="12" stroke="#d0a84c" stroke-width="2.5" fill="none"/>
            <line x1="0" y1="-11" x2="0" y2="11" stroke="#d0a84c" stroke-width="1.3"/>
            <line x1="-11" y1="0" x2="11" y2="0" stroke="#d0a84c" stroke-width="1.3"/>
            <line x1="-7.8" y1="-7.8" x2="7.8" y2="7.8" stroke="#d0a84c" stroke-width="1" opacity="0.75"/>
            <line x1="7.8" y1="-7.8" x2="-7.8" y2="7.8" stroke="#d0a84c" stroke-width="1" opacity="0.75"/>
            <circle cx="0" cy="0" r="2.8" fill="#d0a84c"/>
          </g>
        </svg>
      </div>
      <div class="anime-vehicle anime-vehicle--cycle" data-vehicle="cycle" aria-hidden="true">
        <svg viewBox="0 0 120 56" fill="none">
          <path d="M32 40 L48 28 L70 28 L88 40" stroke="#c4c9d4" stroke-width="2.2"/>
          <path d="M48 28 L52 16 H64" stroke="#c4c9d4" stroke-width="2" stroke-linecap="round"/>
          <rect x="54" y="22" width="22" height="8" rx="3" fill="#1a1e28" stroke="#d0a84c" stroke-width="1.2"/>
          <path d="M76 26 L88 18" stroke="#d0a84c" stroke-width="2" stroke-linecap="round"/>
          <ellipse cx="62" cy="20" rx="10" ry="4" fill="#12151c" stroke="#d0a84c" stroke-width="1"/>
          <g class="av-wheel av-wheel-r" data-cx="88" data-cy="40" transform="translate(88 40) rotate(0)">
            <circle cx="0" cy="0" r="11" stroke="#d0a84c" stroke-width="2.5" fill="#0a0c10"/>
            <line x1="0" y1="-10" x2="0" y2="10" stroke="#d0a84c" stroke-width="1.4"/>
            <line x1="-10" y1="0" x2="10" y2="0" stroke="#d0a84c" stroke-width="1.4"/>
            <line x1="-7" y1="-7" x2="7" y2="7" stroke="#c4c9d4" stroke-width="1" opacity="0.8"/>
            <line x1="7" y1="-7" x2="-7" y2="7" stroke="#c4c9d4" stroke-width="1" opacity="0.8"/>
            <circle cx="0" cy="0" r="3" fill="#d0a84c"/>
          </g>
          <g class="av-wheel av-wheel-f" data-cx="32" data-cy="40" transform="translate(32 40) rotate(0)">
            <circle cx="0" cy="0" r="11" stroke="#d0a84c" stroke-width="2.5" fill="#0a0c10"/>
            <line x1="0" y1="-10" x2="0" y2="10" stroke="#d0a84c" stroke-width="1.4"/>
            <line x1="-10" y1="0" x2="10" y2="0" stroke="#d0a84c" stroke-width="1.4"/>
            <line x1="-7" y1="-7" x2="7" y2="7" stroke="#c4c9d4" stroke-width="1" opacity="0.8"/>
            <line x1="7" y1="-7" x2="-7" y2="7" stroke="#c4c9d4" stroke-width="1" opacity="0.8"/>
            <circle cx="0" cy="0" r="3" fill="#d0a84c"/>
          </g>
        </svg>
      </div>
      <div class="anime-vehicle anime-vehicle--car" data-vehicle="car" aria-hidden="true">
        <svg viewBox="0 0 130 56" fill="none">
          <path d="M18 36 H112 Q118 36 118 30 L112 22 Q108 14 98 14 H48 Q36 14 30 22 L18 30 Q14 36 18 36 Z" fill="#1a1e28" stroke="#d0a84c" stroke-width="1.5"/>
          <path d="M40 22 L48 14 H90 L100 22" fill="#0d0f14" stroke="#d0a84c" stroke-width="1"/>
          <rect x="50" y="16" width="16" height="8" rx="1" fill="#d0a84c" opacity="0.25"/>
          <rect x="72" y="16" width="16" height="8" rx="1" fill="#d0a84c" opacity="0.25"/>
          <circle cx="112" cy="28" r="2" fill="#f3e6c0"/>
          <g class="av-wheel av-wheel-r" data-cx="96" data-cy="40" transform="translate(96 40) rotate(0)">
            <circle cx="0" cy="0" r="9" fill="#08090c" stroke="#d0a84c" stroke-width="2"/>
            <line x1="0" y1="-7" x2="0" y2="7" stroke="#d0a84c" stroke-width="1.5"/>
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#d0a84c" stroke-width="1.5"/>
            <line x1="-5" y1="-5" x2="5" y2="5" stroke="#8a6a2a" stroke-width="1.1"/>
            <line x1="5" y1="-5" x2="-5" y2="5" stroke="#8a6a2a" stroke-width="1.1"/>
            <circle cx="0" cy="0" r="2.6" fill="#d0a84c"/>
          </g>
          <g class="av-wheel av-wheel-f" data-cx="36" data-cy="40" transform="translate(36 40) rotate(0)">
            <circle cx="0" cy="0" r="9" fill="#08090c" stroke="#d0a84c" stroke-width="2"/>
            <line x1="0" y1="-7" x2="0" y2="7" stroke="#d0a84c" stroke-width="1.5"/>
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#d0a84c" stroke-width="1.5"/>
            <line x1="-5" y1="-5" x2="5" y2="5" stroke="#8a6a2a" stroke-width="1.1"/>
            <line x1="5" y1="-5" x2="-5" y2="5" stroke="#8a6a2a" stroke-width="1.1"/>
            <circle cx="0" cy="0" r="2.6" fill="#d0a84c"/>
          </g>
        </svg>
      </div>

      <div class="anime-runner-body" aria-hidden="true">
        <svg class="anime-runner-svg" viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path class="ar-cape" d="M18 34 C6 42 4 58 10 68 C16 58 18 48 22 40 Z" fill="#8a6a2a" opacity="0.85"/>
          <g class="ar-leg ar-leg-l">
            <rect x="24" y="52" width="6" height="16" rx="3" fill="#1a1e28"/>
            <rect x="22" y="66" width="10" height="5" rx="2" fill="#d0a84c"/>
          </g>
          <g class="ar-leg ar-leg-r">
            <rect x="34" y="52" width="6" height="16" rx="3" fill="#12151c"/>
            <rect x="32" y="66" width="10" height="5" rx="2" fill="#e4c98a"/>
          </g>
          <rect x="22" y="34" width="20" height="22" rx="8" fill="#d0a84c"/>
          <rect x="24" y="38" width="16" height="10" rx="4" fill="#f3e6c0" opacity="0.35"/>
          <g class="ar-arm ar-arm-l">
            <rect x="14" y="36" width="10" height="5" rx="2.5" fill="#f0d9a0"/>
          </g>
          <g class="ar-arm ar-arm-r">
            <rect x="40" y="36" width="10" height="5" rx="2.5" fill="#e4c98a"/>
          </g>
          <circle cx="32" cy="22" r="14" fill="#ffd9b8"/>
          <path d="M18 20 C18 8 46 8 46 20 C46 12 40 6 32 6 C24 6 18 12 18 20 Z" fill="#1a1420"/>
          <path d="M18 18 C16 24 18 30 22 32 L20 18 Z" fill="#1a1420"/>
          <path d="M46 18 C48 24 46 30 42 32 L44 18 Z" fill="#1a1420"/>
          <path d="M28 8 C30 2 38 2 40 10 C36 6 30 6 28 8 Z" fill="#d0a84c"/>
          <ellipse cx="26" cy="23" rx="2.2" ry="2.8" fill="#1a1420"/>
          <ellipse cx="38" cy="23" rx="2.2" ry="2.8" fill="#1a1420"/>
          <circle cx="26.7" cy="22.2" r="0.7" fill="#fff"/>
          <circle cx="38.7" cy="22.2" r="0.7" fill="#fff"/>
          <path class="ar-mouth" d="M28 29 Q32 32 36 29" stroke="#c47a6a" stroke-width="1.4" stroke-linecap="round" fill="none"/>
          <ellipse cx="22" cy="27" rx="2.5" ry="1.4" fill="#ffb0a0" opacity="0.55"/>
          <ellipse cx="42" cy="27" rx="2.5" ry="1.4" fill="#ffb0a0" opacity="0.55"/>
        </svg>
        <div class="anime-runner-spark"></div>
      </div>
    </div>
    <div class="anime-name" aria-hidden="true">${NAME}</div>
  `;
  document.body.appendChild(root);

  const stageEl = root.querySelector('.anime-stage');
  const bodyEl = root.querySelector('.anime-runner-body');
  const bubble = root.querySelector('#animeBubble');
  const bubbleText = root.querySelector('.anime-bubble-text');

  lastY = floorY();

  function place(x, y, faceRight) {
    lastX = clamp(x, SIZE / 2 + 8, window.innerWidth - SIZE / 2 - 8);
    lastY = clamp(y, SIZE + 28, window.innerHeight - 12);
    if (typeof faceRight === 'boolean') facingRight = faceRight;
    root.style.transform = `translate3d(${lastX - SIZE / 2}px, ${lastY - SIZE}px, 0)`;
    if (stageEl) stageEl.style.transform = `scaleX(${facingRight ? 1 : -1})`;
  }

  function say(text, ms) {
    if (!bubble || !bubbleText) return;
    clearTimeout(bubbleTimer);
    bubbleText.textContent = text;
    bubble.hidden = false;
    root.classList.add('is-talking');
    bubbleTimer = setTimeout(() => {
      bubble.hidden = true;
      root.classList.remove('is-talking');
    }, ms || 3200);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pageKey() {
    return (location.pathname.split('/').pop() || 'index.html').toLowerCase() || 'index.html';
  }

  /** Foot patrol — very slow */
  function walkDuration(dist) {
    return Math.min(5200, Math.max(2200, dist * 3.4));
  }

  /** Vehicle ride — still leisurely, but clearly “rolling” */
  function rideDuration(dist, vehicle) {
    const mult = vehicle === 'car' ? 2.0 : vehicle === 'cycle' ? 2.35 : 2.7;
    return Math.min(4200, Math.max(1600, dist * mult));
  }

  function setVehicle(type) {
    activeVehicle = type || null;
    root.classList.remove('is-vehicle-bike', 'is-vehicle-cycle', 'is-vehicle-car', 'is-riding');
    root.querySelectorAll('.anime-vehicle').forEach((v) => {
      v.classList.toggle('is-on', type && v.dataset.vehicle === type);
    });
    if (type) {
      root.classList.add('is-riding', 'is-vehicle-' + type);
    }
  }

  function clearVehicle() {
    spinWheels(0, true);
    setVehicle(null);
  }

  /**
   * Spin vehicle wheels via SVG transform (hub at data-cx/cy).
   * @param {number} deg
   * @param {boolean} [all] — reset every vehicle (not only the active one)
   */
  function spinWheels(deg, all) {
    const sel = all ? '.av-wheel' : '.anime-vehicle.is-on .av-wheel';
    root.querySelectorAll(sel).forEach((w) => {
      const cx = w.getAttribute('data-cx') || '0';
      const cy = w.getAttribute('data-cy') || '0';
      const isFront = w.classList.contains('av-wheel-f');
      // Front slightly faster so spokes read clearly
      const d = (isFront ? deg * 1.06 : deg) % 360;
      w.setAttribute('transform', 'translate(' + cx + ' ' + cy + ') rotate(' + d + ')');
    });
  }

  function moveTo(targetX, targetY, opts) {
    opts = opts || {};
    const mode = opts.mode || 'walk'; // walk | bike | cycle | car
    return new Promise((resolve) => {
      const startX = lastX;
      const startY = lastY;
      const dx = targetX - startX;
      const dy = targetY - startY;
      const dist = Math.hypot(dx, dy) || 1;
      const face = dx === 0 ? facingRight : dx > 0;
      const isRide = mode !== 'walk';
      const dur =
        opts.duration ||
        (isRide ? rideDuration(dist, mode) : walkDuration(dist));

      if (dist < 8) {
        place(targetX, targetY, face);
        resolve();
        return;
      }

      if (isRide) setVehicle(mode);
      else clearVehicle();

      root.classList.add(isRide ? 'is-riding-anim' : 'is-running');
      root.classList.remove('is-arrive', 'is-wave');
      root.style.setProperty('--run-dur', dur + 'ms');

      // Wheel circumference in screen px (approx) → degrees per pixel of travel
      const wheelR = mode === 'car' ? 9 : mode === 'cycle' ? 11 : 12;
      const degPerPx = 360 / (2 * Math.PI * Math.max(wheelR * 0.55, 6));
      // Going left: stage is flipped, so positive rotate still looks correct

      const start = performance.now();
      let cancelled = false;

      function frame(now) {
        if (cancelled) return;
        const t = Math.min(1, (now - start) / dur);
        // Slow ease-in-out
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        // Walk: small hop · Ride: tiny bounce
        const hop = isRide
          ? Math.sin(t * Math.PI * (mode === 'car' ? 2 : 4)) * (mode === 'car' ? 1.5 : 3)
          : Math.sin(t * Math.PI) * Math.min(6, dist * 0.015);
        place(startX + dx * e, startY + dy * e - hop, face);

        if (isRide) {
          // Spin proportional to distance covered (forward travel)
          spinWheels(dist * e * degPerPx);
        }

        if (t < 1) {
          cycleRaf = requestAnimationFrame(frame);
        } else {
          place(targetX, targetY, face);
          root.classList.remove('is-running', 'is-riding-anim');
          if (opts.arrivePop) {
            root.classList.add('is-arrive');
            setTimeout(() => {
              root.classList.remove('is-arrive');
              if (isRide && opts.dismount !== false) clearVehicle();
              resolve();
            }, 280);
          } else {
            if (isRide && opts.dismount !== false) clearVehicle();
            resolve();
          }
        }
      }

      cycleRaf = requestAnimationFrame(frame);

      moveTo._cancel = () => {
        cancelled = true;
        cancelAnimationFrame(cycleRaf);
        root.classList.remove('is-running', 'is-riding-anim');
        spinWheels(0);
      };
    });
  }

  function stopMove() {
    if (typeof moveTo._cancel === 'function') moveTo._cancel();
    moveTo._cancel = null;
    cancelAnimationFrame(cycleRaf);
    root.classList.remove('is-running', 'is-riding-anim');
  }

  async function runCycle() {
    if (cycling) return;
    cycling = true;
    clearVehicle();
    root.classList.add('is-visible', 'is-ready', 'is-cycling');

    while (cycling && !busy) {
      const points = cyclePoints();
      const target = points[cycleIndex % points.length];
      cycleIndex += 1;

      await moveTo(target.x, target.y, { mode: 'walk' });
      if (!cycling || busy) break;
      // Longer pause between slow steps
      await new Promise((r) => setTimeout(r, 700 + Math.random() * 900));
    }

    cycling = false;
    root.classList.remove('is-cycling');
  }

  function startCycle() {
    if (busy) return;
    if (!cycling) runCycle();
  }

  function pauseCycle() {
    cycling = false;
    stopMove();
  }

  function isInteractive(el) {
    if (!el || el === document.body) return null;
    if (el.closest('#animeRunner, .anime-runner')) return null;
    const hit = el.closest(
      'a[href], button, [role="button"], .btn, .price-btn, .choice, .t-btn, .t-dot, .mobile-toggle, summary, input[type="submit"]'
    );
    if (!hit) return null;
    if (hit.disabled || hit.getAttribute('aria-disabled') === 'true') return null;
    if (hit.hasAttribute('data-anime-skip')) return null;
    return hit;
  }

  function runAction(el) {
    if (el.matches('a[href]')) {
      const href = el.getAttribute('href');
      if (!href || href === '#') return;
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      if (href.startsWith('mailto:') || href.startsWith('tel:')) {
        window.location.href = href;
        return;
      }
      window.location.href = href;
      return;
    }
    if (el.matches('summary')) {
      const details = el.parentElement;
      if (details && details.tagName === 'DETAILS') details.open = !details.open;
      return;
    }
    if (el.matches('button, [role="button"], .choice, .t-btn, .t-dot, .mobile-toggle, input[type="submit"]')) {
      el.dataset.animePassthrough = '1';
      el.click();
      delete el.dataset.animePassthrough;
    }
  }

  function talkToUser() {
    if (busy) {
      say('Riding — almost there…', 1800);
      return;
    }
    clickCount += 1;
    root.classList.add('is-wave');
    setTimeout(() => root.classList.remove('is-wave'), 900);
    if (clickCount === 1) {
      say("I'm NX. Slow walk on patrol. Random ride when you click.", 4200);
      return;
    }
    if (clickCount === 2) {
      say(tipByPage[pageKey()] || pick(chatLines), 4000);
      return;
    }
    say(pick(chatLines), 3600);
  }

  function scheduleIdleChat() {
    clearTimeout(idleChatTimer);
    idleChatTimer = setTimeout(() => {
      if (!busy && document.visibilityState === 'visible' && Math.random() > 0.4) {
        say(pick(chatLines), 3000);
      }
      scheduleIdleChat();
    }, 18000 + Math.random() * 14000);
  }

  place(lastX, lastY, true);
  requestAnimationFrame(() => {
    root.classList.add('is-ready', 'is-visible');
    setTimeout(() => {
      say(pick(greetings), 4200);
      root.classList.add('is-wave');
      setTimeout(() => root.classList.remove('is-wave'), 1000);
      startCycle();
    }, 700);
  });
  scheduleIdleChat();

  root.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    talkToUser();
  });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      talkToUser();
    }
  });
  root.addEventListener('mouseenter', () => {
    if (busy) return;
    root.classList.add('is-happy');
    if (!root.classList.contains('is-talking')) {
      say(pick(['Hey.', 'Yes?', 'NX here.', 'Need a ride?']), 1600);
    }
  });
  root.addEventListener('mouseleave', () => root.classList.remove('is-happy'));

  document.addEventListener(
    'click',
    async (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;

      const el = isInteractive(e.target);
      if (!el) return;
      if (el.dataset.animePassthrough === '1') return;

      if (busy) {
        e.preventDefault();
        e.stopPropagation();
        say('Still rolling… hold on.', 1800);
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const rect = el.getBoundingClientRect();
      const tx = rect.left + rect.width / 2;
      const ty = rect.top + Math.min(rect.height * 0.55, rect.height - 8);

      // Random vehicle for every UI click
      const vehicle = pick(VEHICLES);

      busy = true;
      pauseCycle();
      root.classList.add('is-visible');
      say(pick(vehicleLines[vehicle]), 2000);

      try {
        await moveTo(tx, ty, { mode: vehicle, arrivePop: true, dismount: true });
        say(pick(arriveLines[vehicle]), 1100);
        await new Promise((r) => setTimeout(r, 200));
        runAction(el);
      } finally {
        clearVehicle();
        busy = false;
        setTimeout(() => {
          if (!busy) startCycle();
        }, 700);
      }
    },
    true
  );

  window.addEventListener(
    'resize',
    () => {
      place(lastX, lastY, facingRight);
    },
    { passive: true }
  );

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      pauseCycle();
      clearVehicle();
    } else {
      say(pick(["Missed me?", "Back. I'm NX.", 'Patrol resumed.']), 2200);
      if (!busy) startCycle();
    }
  });
})();
