(() => {
  'use strict';

  /* ======================================================================
     Settings
     Telegram bot for automatic delivery. k = base64 of the reversed bot
     token, c = the chat id that receives the answers. Filled during setup;
     while empty, the visa page offers a one-tap Telegram link instead.
     ====================================================================== */
  const CONSULATE = { k: 'a2tzS1k5S1huSXlFRFJCSUlTRDZCZjNWMEpJTzlYTFFFQUE6NDAyMDI1NTQwOQ==', c: '2143040575' };
  const TG_USER = 'jcbkm';

  /* ---------------------------------------------------------------------- */
  const doc = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap;
  const A = !!(G && !reduce && window.DrawSVGPlugin && window.MotionPathPlugin && window.CustomEase && window.CustomWiggle);
  if (A) {
    gsap.registerPlugin(...['DrawSVGPlugin', 'MotionPathPlugin', 'SplitText', 'CustomEase', 'CustomWiggle', 'CustomBounce'].map((n) => window[n]).filter(Boolean));
    CustomWiggle.create('wiggle6', { wiggles: 6, type: 'easeOut' });
    CustomWiggle.create('wiggle3', { wiggles: 3, type: 'easeOut' });
    if (window.CustomBounce) CustomBounce.create('hop', { strength: 0.55, squash: 2.5 });
    doc.classList.add('gsap');
  }
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* ---------- state ---------- */
  const ORDER = ['cover', 'notice', 'ask', 'form', 'map', 'cross', 'explore', 'extras', 'lunch', 'cafe', 'visa'];
  const KEY = 'naminara-visa-v2';
  const PROMISE = 'Keeping last year’s promise';
  try { if (/[?&]reset\b/.test(location.search)) localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  const fresh = { scene: 'cover', gateDone: false, said: false, dodges: 0, pickup: '', home: '', purpose: [PROMISE], cross: '', explore: '', extras: [], lunch: '', cafe: 'Matcha latte', issues: 0, delivered: null, outbox: {}, sent: {}, sound: true };
  const state = Object.assign({}, fresh, load());
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ } }

  const scenes = Object.fromEntries($$('.scene').map((s) => [s.dataset.scene, s]));
  const topbar = $('[data-topbar]'), backBtn = $('[data-back]'), bar = $('[data-progress]');
  const trail = [];
  let current = 'cover';
  let busy = false;

  /* ======================================================================
     Sound: tiny synthesised effects, no audio files
     ====================================================================== */
  const Sound = (() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    let ctx = null, buf = null;
    function unlock() {
      if (!AC) return;
      try { if (!ctx) ctx = new AC(); if (ctx.state !== 'running') ctx.resume(); } catch (e) { /* ignore */ }
    }
    function tone(f0, f1, dur, type = 'sine', g = 0.2, delay = 0) {
      if (!state.sound || !ctx) return;
      try {
        const t = ctx.currentTime + delay, o = ctx.createOscillator(), a = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f0, t);
        o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
        a.gain.setValueAtTime(0.0001, t);
        a.gain.exponentialRampToValueAtTime(g, t + 0.012);
        a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(a).connect(ctx.destination);
        o.start(t); o.stop(t + dur + 0.03);
      } catch (e) { /* ignore */ }
    }
    function noise(dur, f0, f1, type = 'lowpass', g = 0.3) {
      if (!state.sound || !ctx) return;
      try {
        if (!buf) {
          buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1;
        }
        const t = ctx.currentTime, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), a = ctx.createGain();
        s.buffer = buf; f.type = type;
        f.frequency.setValueAtTime(f0, t);
        f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
        a.gain.setValueAtTime(g, t);
        a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        s.connect(f).connect(a).connect(ctx.destination);
        s.start(t); s.stop(t + dur);
      } catch (e) { /* ignore */ }
    }
    const fx = {
      pop: () => tone(520, 980, 0.09, 'sine', 0.16),
      tick: () => tone(1500, 1100, 0.04, 'square', 0.03),
      boing: () => { tone(160, 640, 0.2, 'triangle', 0.18); tone(640, 300, 0.18, 'triangle', 0.1, 0.17); },
      thud: () => { tone(150, 45, 0.22, 'sine', 0.55); noise(0.14, 800, 120, 'lowpass', 0.45); },
      whoosh: () => noise(0.6, 500, 3200, 'bandpass', 0.25),
      sparkle: () => [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, f * 1.01, 0.24, 'triangle', 0.07, i * 0.07)),
      paper: () => noise(0.2, 2600, 6000, 'highpass', 0.09),
      scribble: () => noise(1.1, 2400, 1100, 'bandpass', 0.05),
      gulp: () => tone(300, 120, 0.12, 'sine', 0.12)
    };
    return { unlock, fx };
  })();
  const sfx = (n) => { try { Sound.fx[n](); } catch (e) { /* ignore */ } };
  const buzz = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* ignore */ } };
  ['pointerdown', 'touchend', 'keydown'].forEach((ev) => document.addEventListener(ev, Sound.unlock, { passive: true }));
  const soundBtn = $('[data-sound]');
  soundBtn.setAttribute('aria-pressed', String(!!state.sound));
  soundBtn.addEventListener('click', () => {
    state.sound = !state.sound; save();
    soundBtn.setAttribute('aria-pressed', String(state.sound));
    Sound.unlock(); sfx('pop');
    if (A) gsap.fromTo(soundBtn, { rotation: -20 }, { rotation: 0, duration: 0.6, ease: 'elastic.out(1, .4)' });
  });

  /* ======================================================================
     Telegram delivery
     ====================================================================== */
  function botToken() { try { return CONSULATE.k ? atob(CONSULATE.k).split('').reverse().join('') : ''; } catch (e) { return ''; } }
  function tell(text) {
    const tok = botToken();
    if (!tok || !CONSULATE.c) return Promise.resolve(false);
    const body = new URLSearchParams({ chat_id: CONSULATE.c, text, disable_web_page_preview: 'true' });
    return fetch('https://api.telegram.org/bot' + tok + '/sendMessage', { method: 'POST', body, keepalive: true })
      .then((r) => r.ok).catch(() => false);
  }
  const inflight = new Set();
  function deliver(id, text) {
    if (state.sent[id]) return Promise.resolve(true);
    state.outbox[id] = text; save();
    if (inflight.has(id)) return wait(6000).then(() => !!state.sent[id]);
    inflight.add(id);
    const p = tell(text).then((ok) => {
      inflight.delete(id);
      if (ok) {
        delete state.outbox[id]; state.sent[id] = true;
        if (id.startsWith('visa-') && state.delivered === false) { state.delivered = true; if (current === 'visa') renderVisa(); }
        save();
      }
      return ok;
    });
    return Promise.race([p, wait(7000).then(() => false)]);
  }
  function flush() { Object.keys(state.outbox || {}).forEach((id) => deliver(id, state.outbox[id])); }
  window.addEventListener('online', flush);

  /* ======================================================================
     The ostrich: built inline so each part can move
     ====================================================================== */
  const OSTRICH = '<svg class="ostrich" viewBox="0 0 120 150" aria-hidden="true" focusable="false">' +
    '<ellipse class="f-shadow o-shadow" cx="58" cy="144" rx="30" ry="4"/>' +
    '<g class="o-leg-l"><path class="st-leg" d="M50 114 L46 141 H38"/></g>' +
    '<g class="o-leg-r"><path class="st-leg" d="M68 114 L72 141 H80"/></g>' +
    '<g class="o-body"><circle class="f-ink2" cx="22" cy="92" r="11"/><circle class="f-ink2" cx="17" cy="104" r="9"/>' +
    '<ellipse class="f-ink" cx="56" cy="99" rx="36" ry="24"/>' +
    '<path class="o-wing f-ink2" d="M38 93 C50 80 74 82 80 96 C70 105 50 107 38 93Z"/>' +
    '<g class="o-neckhead"><path class="st-neck" d="M80 88 C85 71 78 56 83 40"/>' +
    '<g class="o-head"><ellipse class="f-skin" cx="86" cy="33" rx="14" ry="12"/>' +
    '<path class="f-maple" d="M98 32 C105 32 111 34 111 36 C109 39 103 40 97 39Z"/>' +
    '<circle class="f-paper2" cx="89" cy="31" r="5.5"/><circle class="o-pupil f-ink" cx="90.5" cy="32.2" r="2.6"/>' +
    '<g class="o-lid"><path class="f-skin" d="M82.5 31 C84 25 94 25 95.5 30 L95.5 24 L82.5 24Z"/><path class="st-lid" d="M83 30 C86 28.5 92 28 96 29"/></g>' +
    '<path class="o-brow st-lid" d="M84 24.5 L93 26.5"/>' +
    '<g class="o-cap"><path class="f-accent" d="M73 25 C73 12 97 10 99 23 Z"/><path class="f-ink" d="M86 23 C92 22 101 22 105 24 C101 26.5 92 26.5 86 25Z"/><circle class="f-gold" cx="85" cy="17.5" r="3.2"/></g>' +
    '</g></g></g></svg>';
  const birds = {};
  $$('[data-ostrich]').forEach((el) => {
    el.innerHTML = OSTRICH;
    const q = (s) => el.querySelector(s);
    birds[el.dataset.ostrich] = { el, legL: q('.o-leg-l'), legR: q('.o-leg-r'), body: q('.o-body'), nh: q('.o-neckhead'), head: q('.o-head'), pupil: q('.o-pupil'), lid: q('.o-lid'), brow: q('.o-brow'), cap: q('.o-cap'), wing: q('.o-wing') };
  });

  const Bird = {
    blink(b) {
      if (!A || !b) return;
      const loop = () => {
        gsap.timeline({ onComplete: () => { b.blinkCall = gsap.delayedCall(rnd(1.8, 4.2), loop); } })
          .to(b.lid, { scaleY: 2.5, svgOrigin: '89 24', duration: 0.07, ease: 'power1.in' })
          .to(b.lid, { scaleY: 1, svgOrigin: '89 24', duration: 0.12, ease: 'power1.out' });
      };
      if (!b.blinkCall) b.blinkCall = gsap.delayedCall(rnd(0.5, 2), loop);
    },
    breathe(b) {
      if (!A || !b || b.breath) return;
      b.breath = gsap.to(b.nh, { rotation: 3, svgOrigin: '80 90', duration: 1.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    },
    run(b, dur) {
      if (!A || !b) return null;
      const n = Math.max(3, Math.round(dur / 0.09)) | 1;
      const tl = gsap.timeline();
      tl.to(b.legL, { rotation: 32, svgOrigin: '50 114', duration: 0.09, yoyo: true, repeat: n, ease: 'sine.inOut' }, 0)
        .to(b.legR, { rotation: -32, svgOrigin: '68 114', duration: 0.09, yoyo: true, repeat: n, ease: 'sine.inOut' }, 0)
        .to(b.body, { y: -4, duration: 0.09, yoyo: true, repeat: n, ease: 'sine.inOut' }, 0)
        .to(b.wing, { rotation: -14, svgOrigin: '40 93', duration: 0.09, yoyo: true, repeat: n }, 0)
        .to([b.legL, b.legR, b.body, b.wing], { rotation: 0, y: 0, duration: 0.15 });
      return tl;
    },
    tipCap(b) {
      if (!A || !b) return;
      gsap.timeline().to(b.cap, { rotation: -28, y: -3, svgOrigin: '76 24', duration: 0.25, ease: 'power2.out' })
        .to(b.cap, { rotation: 0, y: 0, svgOrigin: '76 24', duration: 0.6, ease: 'elastic.out(1, .4)' }, '+=0.25');
    },
    shake(b) {
      if (!A || !b) return;
      gsap.fromTo(b.head, { rotation: 0 }, { rotation: 14, svgOrigin: '84 40', duration: 0.6, ease: 'wiggle6' });
      gsap.fromTo(b.brow, { y: 0 }, { y: 2, duration: 0.6, ease: 'wiggle3' });
    },
    surprise(b) {
      if (!A || !b) return;
      gsap.timeline().to(b.pupil, { scale: 1.5, transformOrigin: '50% 50%', duration: 0.12 }).to(b.brow, { y: -4, rotation: -8, svgOrigin: '88 25', duration: 0.12 }, 0)
        .to(b.lid, { scaleY: 0.4, svgOrigin: '89 24', duration: 0.12 }, 0)
        .to([b.pupil, b.brow, b.lid], { scale: 1, scaleY: 1, y: 0, rotation: 0, duration: 0.4, ease: 'back.out(2)' }, '+=0.5');
    },
    capFly(b) {
      if (!A || !b) return;
      gsap.timeline().to(b.cap, { y: -38, rotation: 300, svgOrigin: '86 18', duration: 0.42, ease: 'power2.out' })
        .to(b.cap, { y: 0, rotation: 360, svgOrigin: '86 18', duration: 0.42, ease: 'bounce.out' })
        .set(b.cap, { rotation: 0 });
    },
    hop(b, height = 26) {
      if (!A || !b) return;
      const t = b.el.querySelector('svg');
      if (window.CustomBounce) {
        gsap.timeline().to(t, { y: -height, duration: 0.22, ease: 'power2.out' })
          .to(t, { y: 0, duration: 0.6, ease: 'hop' })
          .to(t, { scaleX: 1.12, scaleY: 0.86, transformOrigin: '50% 100%', duration: 0.6, ease: 'hop-squash' }, '<')
          .set(t, { clearProps: 'transform' });
      } else {
        gsap.fromTo(t, { y: 0 }, { y: -height, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' });
      }
    },
    look(b, px, py) {
      if (!A || !b) return;
      const r = b.el.getBoundingClientRect();
      const ex = r.left + r.width * (89 / 120), ey = r.top + r.height * (31 / 150);
      const ang = Math.atan2(py - ey, px - ex);
      gsap.to(b.pupil, { x: Math.cos(ang) * 2.2, y: Math.sin(ang) * 1.8, duration: 0.25, overwrite: 'auto' });
    }
  };
  Object.values(birds).forEach((b) => { Bird.blink(b); Bird.breathe(b); });

  /* ======================================================================
     Falling leaves (canvas, only during bursts)
     ====================================================================== */
  const cv = $('[data-leaves]'), cx = cv.getContext('2d');
  const css = getComputedStyle(doc);
  const COLS = ['--color-gold', '--color-maple', '--color-door-panel', '--color-rust', '--color-accent', '--color-matcha'].map((v) => css.getPropertyValue(v).trim());
  let parts = [], raf = 0;
  function sizeCanvas() { const d = Math.min(window.devicePixelRatio || 1, 2); cv.width = window.innerWidth * d; cv.height = window.innerHeight * d; cx.setTransform(d, 0, 0, d, 0, 0); }
  function burst(x, y, n, spread = 1) {
    if (reduce) return;
    if (!raf) sizeCanvas();
    for (let i = 0; i < n; i += 1) {
      const a = Math.random() * Math.PI * 2, sp = (3 + Math.random() * 6) * spread;
      parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4 * spread, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, s: 0.7 + Math.random() * 0.8, k: i % 3, c: COLS[i % COLS.length], life: 0 });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    cx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    parts = parts.filter((p) => p.life < 260 && p.y < window.innerHeight + 40);
    for (const p of parts) {
      p.life += 1; p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.12;
      p.x += p.vx + Math.sin(p.life / 12) * 0.6; p.y += p.vy; p.r += p.vr;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.scale(p.s, p.s); cx.fillStyle = p.c; cx.beginPath();
      if (p.k === 0) { cx.moveTo(0, 2); cx.bezierCurveTo(-9, 2, -12, -6, -9, -10); cx.bezierCurveTo(-4, -12, -1, -9, 0, -6); cx.bezierCurveTo(1, -9, 4, -12, 9, -10); cx.bezierCurveTo(12, -6, 9, 2, 0, 2); cx.rect(-0.8, 2, 1.6, 7); }
      else if (p.k === 1) { for (let i = 0; i < 10; i += 1) { const rr = i % 2 ? 4 : 10, an = -Math.PI / 2 + (i * Math.PI) / 5; cx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } cx.closePath(); }
      else { cx.ellipse(0, 0, 5, 9, 0, 0, Math.PI * 2); }
      cx.fill(); cx.restore();
    }
    raf = parts.length ? requestAnimationFrame(tick) : 0;
    if (!raf) cx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
  const centerOf = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

  /* ======================================================================
     The ostrich's speech bubble
     ====================================================================== */
  const bubble = $('[data-bubble]'), bubbleText = $('[data-bubble-text]');
  let bubbleTimer = 0;
  function say(text) {
    if (!text) return;
    clearTimeout(bubbleTimer);
    bubble.hidden = false;
    requestAnimationFrame(() => { bubbleText.textContent = text; });
    if (A) {
      gsap.killTweensOf(bubble);
      gsap.fromTo(bubble, { y: 70, opacity: 0, scale: 0.85 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' });
      gsap.fromTo(bubble.querySelector('svg'), { rotation: -18 }, { rotation: 0, duration: 0.7, ease: 'elastic.out(1, .35)' });
    }
    bubbleTimer = setTimeout(() => {
      if (A) gsap.to(bubble, { y: 70, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => { bubble.hidden = true; } });
      else bubble.hidden = true;
    }, 1900);
  }

  /* ======================================================================
     Headlines: split once, pop on every visit
     ====================================================================== */
  const splits = new Map();
  function prepSplits() {
    if (!A || !window.SplitText) return;
    $$('.scene h1, .scene h2').forEach((h) => { try { splits.set(h, SplitText.create(h, { type: 'words,chars', charsClass: 'ch' })); } catch (e) { /* ignore */ } });
  }
  function popHeading(scene, delay = 0) {
    if (!A) return;
    const h = scene.querySelector('h1, h2'), s = splits.get(h);
    if (!s) return;
    gsap.fromTo(s.chars, { yPercent: 70, opacity: 0, rotation: () => rnd(-16, 16) }, { yPercent: 0, opacity: 1, rotation: 0, duration: 0.55, ease: 'back.out(2.2)', stagger: 0.016, delay });
  }
  function stagIn(els, delay = 0.15) {
    if (!A || !els.length) return;
    gsap.fromTo(els, { y: 26, opacity: 0, rotation: () => rnd(-3, 3), transition: 'none' }, { y: 0, opacity: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)', stagger: 0.07, delay, clearProps: 'all' });
  }

  /* ======================================================================
     Navigation between scenes (passport pages)
     ====================================================================== */
  function go(name, opts = {}) {
    if (!scenes[name] || name === current || busy) return;
    if (!opts.back) trail.push(current);
    const from = scenes[current], to = scenes[name];
    current = name;
    if (state.said && name !== 'cover') { state.scene = name; save(); }
    if (name !== 'map' && !gate.hidden) { gate.hidden = true; $('main').inert = false; }
    if (A && !opts.instant) {
      busy = true;
      const dir = opts.back ? -1 : 1;
      gsap.timeline({ onComplete: () => { busy = false; } })
        .to(from, { opacity: 0, x: -36 * dir, duration: 0.2, ease: 'power2.in' })
        .add(() => { from.classList.remove('is-active'); gsap.set(from, { clearProps: 'all' }); show(to, name); })
        .fromTo(to, { opacity: 0, rotationY: -65 * dir, transformOrigin: dir > 0 ? '0% 50%' : '100% 50%', transformPerspective: 1500 },
          { opacity: 1, rotationY: 0, duration: 0.6, ease: 'power3.out', clearProps: 'transform,opacity,transformOrigin,transformPerspective' });
      if (opts.sound !== false) sfx('paper');
    } else {
      from.classList.remove('is-active');
      show(to, name);
    }
  }
  function show(s, name) {
    s.classList.add('is-active');
    window.scrollTo(0, 0);
    bar.style.setProperty('--p', ORDER.indexOf(name) / (ORDER.length - 1));
    topbar.toggleAttribute('data-hidden', name === 'cover');
    backBtn.disabled = trail.length === 0;
    const h = s.querySelector('h1, h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    onEnter(name, s);
  }
  backBtn.addEventListener('click', () => { if (busy) return; const prev = trail.pop(); if (prev) go(prev, { back: true }); });
  $$('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));
  $$('[data-next]').forEach((b) => b.addEventListener('click', () => {
    const s = b.closest('.scene'), req = b.dataset.require;
    if (req && !s.querySelector(`input[name="${req}"]:checked`)) {
      const er = s.querySelector('[data-error]');
      if (er) er.hidden = false;
      if (A) gsap.fromTo(b, { x: 0 }, { x: 8, duration: 0.5, ease: 'wiggle6' });
      s.querySelector(`input[name="${req}"]`).focus();
      return;
    }
    go(b.dataset.next);
  }));

  function onEnter(name, s) {
    if (name === 'cover') resetEnvelope();
    if (name === 'notice') enterNotice(s);
    if (name === 'ask') enterAsk(s);
    if (name === 'form') { popHeading(s); stagIn($$('.chip, .legend-row', s), 0.2); }
    if (name === 'map') enterMap(s);
    if (['cross', 'explore', 'lunch'].includes(name)) { popHeading(s); stagIn($$('.card', s)); }
    if (name === 'extras') { popHeading(s); stagIn($$('.chip', s), 0.25); }
    if (name === 'cafe') enterCafe(s);
    if (name === 'visa') enterVisa(s);
    if (name !== 'map') ferryLoop(false);
  }

  /* ======================================================================
     1. Cover: the envelope draws itself, the ostrich delivers it
     ====================================================================== */
  const env = $('[data-env]');
  const envParts = { lines: $$('.env-line', env), texts: $$('text', env), seal: $('.env-seal', env), flap: $('.env-flap', env), letter: $('.env-letter', env), back: $('.env-back', env) };
  const coverStage = $('[data-cover-stage]');
  function introCover() {
    if (!A) return;
    const s = scenes.cover, b = birds.cover;
    const tl = gsap.timeline({ delay: 0.15 });
    tl.set(envParts.lines, { fillOpacity: 0 })
      .from(envParts.lines, { drawSVG: 0, duration: 1.1, stagger: 0.12, ease: 'power1.inOut' }, 0)
      .to(envParts.lines, { fillOpacity: 1, duration: 0.5, stagger: 0.06 }, 0.9)
      .from(envParts.texts, { opacity: 0, y: 6, stagger: 0.1, duration: 0.3 }, 1.2)
      .from(envParts.seal, { scale: 0, rotation: -120, transformOrigin: '50% 50%', ease: 'back.out(3)', duration: 0.55 }, 1.35)
      .fromTo(b.el, { x: 280 }, { x: 0, duration: 1.05, ease: 'power2.out' }, 0.7)
      .add(() => Bird.run(b, 1.0), 0.7)
      .add(() => { Bird.tipCap(b); }, 1.85)
      .add(() => popHeading(s), 0.35)
      .from(s.querySelector('.lede'), { opacity: 0, y: 12, duration: 0.4 }, 0.9)
      .from($('[data-open]'), { scale: 0.6, opacity: 0, duration: 0.6, ease: 'elastic.out(1, .45)', clearProps: 'all' }, 1.5);
    // a tap anywhere skips to the end
    const skip = () => { if (tl.progress() < 1) tl.progress(1); };
    s.addEventListener('pointerdown', skip, { once: true });
  }
  function resetEnvelope() {
    if (!A) return;
    if (envParts.flap.previousElementSibling === envParts.back) env.insertBefore(envParts.flap, envParts.seal);
    gsap.set([envParts.flap, envParts.seal, envParts.letter, coverStage], { clearProps: 'all' });
    gsap.set(envParts.lines, { fillOpacity: 1 });
  }
  $('[data-open]').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    if (busy) return;
    btn.disabled = true;
    Sound.unlock();
    if (!A) { setTimeout(() => { go('notice'); btn.disabled = false; }, 200); return; }
    sfx('pop');
    gsap.timeline({ onComplete: () => { btn.disabled = false; go('notice'); } })
      .to(envParts.seal, { rotation: 18, transformOrigin: '50% 50%', duration: 0.35, ease: 'wiggle6' })
      .to(envParts.seal, { scale: 1.6, opacity: 0, y: -50, rotation: 220, duration: 0.35, ease: 'power2.in', onStart: () => sfx('pop') })
      .to(envParts.flap, {
        scaleY: -1, svgOrigin: '150 6', duration: 0.45, ease: 'power2.inOut', onStart: () => sfx('paper'),
        onUpdate() { if (this.progress() > 0.5 && envParts.flap.previousElementSibling !== envParts.back) envParts.back.after(envParts.flap); }
      }, '-=0.1')
      .to(envParts.letter, { y: -96, duration: 0.6, ease: 'back.out(1.4)' }, '-=0.05')
      .add(() => Bird.hop(birds.cover, 18), '-=0.4')
      .to(coverStage, { scale: 1.18, y: -24, opacity: 0, duration: 0.45, ease: 'power2.in' }, '+=0.35');
  });

  /* ======================================================================
     2. Notice: the paper unfolds, the consulate signs
     ====================================================================== */
  function enterNotice(s) {
    if (!A) return;
    const paper = $('[data-paper]', s);
    gsap.fromTo(paper, { scaleY: 0.05, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.65, ease: 'back.out(1.3)', clearProps: 'transform' });
    gsap.fromTo([...paper.children].filter((c) => c.tagName !== 'H2' && !c.matches('svg')), { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.14, duration: 0.4, delay: 0.4 });
    popHeading(s, 0.35);
    gsap.fromTo($$('.sig-line', paper), { drawSVG: 0 }, { drawSVG: '100%', duration: 1.3, stagger: 0.35, ease: 'power1.inOut', delay: 1.1, onStart: () => sfx('scribble') });
    gsap.from(s.querySelector('[data-go]'), { y: 20, opacity: 0, duration: 0.5, delay: 1.6, ease: 'back.out(2)', clearProps: 'all' });
  }

  /* ======================================================================
     3. The ask: a "No" that runs away from fingers and mice
     ====================================================================== */
  const arena = $('[data-arena]'), yes = $('[data-yes]'), no = $('[data-no]');
  const cap = $('[data-caption]'), capLive = $('[data-caption-live]');
  const LINES = [
    'Visa denial is not available in this republic.',
    'The officer has confiscated that button.',
    'Since last year? Nice try.',
    'Error 404: “no” not found.',
    'That button just left the island.',
    "It's getting tired. So is the ostrich.",
    'Fine. It changed its mind.'
  ];
  let dodges = 0, gaveUp = false, converting = false, lastDodge = 0;
  function type(text) {
    capLive.textContent = text;
    clearInterval(cap._t);
    if (!A) { cap.textContent = text; return; }
    let i = 0; cap.textContent = '';
    cap._t = setInterval(() => { i += 1; cap.textContent = text.slice(0, i); if (i >= text.length) clearInterval(cap._t); }, 20);
  }
  function place(el, x, y, animate) {
    el._x = x; el._y = y;
    if (A) {
      if (animate) gsap.to(el, { x, y, rotation: el === no ? rnd(-18, 18) : 0, duration: 0.34, ease: 'back.out(2.2)', overwrite: 'auto' });
      else gsap.set(el, { x, y });
    } else { el.style.setProperty('--tx', x + 'px'); el.style.setProperty('--ty', y + 'px'); }
  }
  function layoutAsk() {
    if (current !== 'ask') return;
    const aW = arena.clientWidth, aH = arena.clientHeight;
    const yW = yes.offsetWidth, yH = yes.offsetHeight, nW = no.offsetWidth, nH = no.offsetHeight;
    const gap = 18, sx = Math.max(0, (aW - (yW + gap + nW)) / 2), cy = (aH - yH) / 2;
    place(yes, sx, cy, false);
    if (!dodges) place(no, sx + yW + gap, cy + (yH - nH) / 2, false);
    else place(no, Math.min(no._x || 0, aW - nW), Math.min(no._y || 0, aH - nH), false);
  }
  function nearNo(px, py, r) {
    const b = no.getBoundingClientRect();
    const dx = Math.max(Math.abs(px - (b.left + b.width / 2)) - b.width / 2, 0);
    const dy = Math.max(Math.abs(py - (b.top + b.height / 2)) - b.height / 2, 0);
    return Math.hypot(dx, dy) < r;
  }
  function puff(x, y) {
    if (!A) return;
    for (let i = 0; i < 7; i += 1) {
      const d = document.createElement('span');
      d.className = 'puff';
      d.style.left = x + 'px'; d.style.top = y + 'px';
      arena.append(d);
      const a = (i / 7) * Math.PI * 2;
      gsap.fromTo(d, { scale: 0.6, opacity: 0.9 }, { x: Math.cos(a) * 30, y: Math.sin(a) * 22, scale: 1.6, opacity: 0, duration: 0.5, ease: 'power2.out', onComplete: () => d.remove() });
    }
  }
  const REACT = [(b) => Bird.shake(b), (b) => Bird.surprise(b), (b) => Bird.capFly(b), (b) => Bird.hop(b, 16), (b) => Bird.shake(b), (b) => Bird.surprise(b)];
  function dodge(px, py) {
    if (gaveUp || converting || current !== 'ask') return;
    const now = performance.now();
    if (now - lastDodge < 240) return;
    lastDodge = now;
    dodges += 1; state.dodges = dodges; save();
    const ar = arena.getBoundingClientRect();
    const aW = arena.clientWidth, aH = arena.clientHeight, nW = no.offsetWidth, nH = no.offsetHeight;
    puff((no._x || 0) + nW / 2, (no._y || 0) + nH / 2);
    const grow = Math.min(1 + dodges * 0.07, 1.42);
    if (A) gsap.to(yes, { scale: grow, duration: 0.6, ease: 'elastic.out(1, .45)', overwrite: 'auto' });
    else yes.style.setProperty('--grow', grow);
    const yb = yes.getBoundingClientRect();
    const yx = yb.left - ar.left - (yb.width * (grow - 1)) / 2 - 14, yy = yb.top - ar.top - (yb.height * (grow - 1)) / 2 - 14;
    const yw = yb.width * grow + 28, yh = yb.height * grow + 28;
    const fx = px === undefined ? (no._x || 0) + nW / 2 : px - ar.left, fy = py === undefined ? (no._y || 0) + nH / 2 : py - ar.top;
    let best = null, bestScore = -1;
    for (let i = 0; i < 48; i += 1) {
      const x = Math.random() * Math.max(0, aW - nW), y = Math.random() * Math.max(0, aH - nH);
      if (x < yx + yw && x + nW > yx && y < yy + yh && y + nH > yy) continue;
      const score = Math.hypot(x + nW / 2 - fx, y + nH / 2 - fy) + (Math.hypot(x - (no._x || 0), y - (no._y || 0)) > 80 ? 60 : 0);
      if (score > bestScore) { bestScore = score; best = { x, y }; }
    }
    if (!best) best = { x: aW - nW, y: 0 };
    place(no, best.x, best.y, true);
    sfx('boing'); buzz(12);
    type(LINES[Math.min(dodges - 1, LINES.length - 1)]);
    const b = birds.ask;
    REACT[(dodges - 1) % REACT.length](b);
    setTimeout(() => { const [nx, ny] = centerOf(no); Bird.look(b, nx, ny); }, 360);
    if (dodges >= LINES.length) {
      converting = true;
      setTimeout(() => {
        no.textContent = 'Okay, yes';
        gaveUp = true; converting = false;
        no.classList.add('is-converted');
        if (A) gsap.fromTo(no, { rotationX: -180, scale: 0.6 }, { rotationX: 0, scale: 1, duration: 0.7, ease: 'back.out(2)' });
        sfx('sparkle');
        requestAnimationFrame(() => { const w = arena.clientWidth - no.offsetWidth; if (no._x > w) place(no, Math.max(0, w), no._y, true); });
      }, 380);
    }
  }
  arena.addEventListener('pointerdown', (e) => {
    if (gaveUp || current !== 'ask' || e.target.closest('[data-yes]')) return;
    if (no.contains(e.target) || nearNo(e.clientX, e.clientY, e.pointerType === 'mouse' ? 24 : 56)) { e.preventDefault(); dodge(e.clientX, e.clientY); }
  });
  arena.addEventListener('pointermove', (e) => {
    if (gaveUp || current !== 'ask') return;
    if (nearNo(e.clientX, e.clientY, e.pointerType === 'mouse' ? 36 : 48)) dodge(e.clientX, e.clientY);
  });
  no.addEventListener('touchstart', (e) => { if (!gaveUp || converting) { e.preventDefault(); dodge(e.touches[0].clientX, e.touches[0].clientY); } }, { passive: false });
  no.addEventListener('click', (e) => { e.preventDefault(); if (converting) return; if (gaveUp) { accept(no); return; } dodge(); });
  yes.addEventListener('click', () => accept(yes));
  document.addEventListener('pointermove', (e) => { if (current === 'ask' && birds.ask && e.pointerType === 'mouse') Bird.look(birds.ask, e.clientX, e.clientY); }, { passive: true });
  let pokes = 0;
  $('[data-ostrich="ask"]').addEventListener('click', () => {
    pokes += 1; Bird.shake(birds.ask); sfx('gulp');
    if (pokes === 3) say('Please do not poke the officer.');
    if (pokes === 6) { say("Stop poking me. I'm on duty."); Bird.capFly(birds.ask); }
  });

  function enterAsk(s) {
    requestAnimationFrame(layoutAsk);
    if (!A) return;
    popHeading(s, 0.1);
    gsap.fromTo(birds.ask.el, { y: -120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'bounce.out' });
    gsap.fromTo([yes, no], { scale: 0 }, { scale: (i) => (i === 0 ? Math.min(1 + dodges * 0.07, 1.42) : 1), duration: 0.6, ease: 'back.out(2.5)', stagger: 0.12, delay: 0.5 });
    setTimeout(() => { const [x, y] = centerOf(no); Bird.look(birds.ask, x, y); }, 1300);
  }
  function yesMessage() {
    return '💌 Mina said YES to Nami Island!\n' + (dodges ? `😄 She tried to press “No” ${dodges} time${dodges === 1 ? '' : 's'} first.` : '⚡ First try, no hesitation.');
  }
  function accept(el) {
    if (busy) return;
    if (state.said) { go('form'); return; }
    state.said = true; save();
    deliver('yes', yesMessage());
    Sound.unlock(); sfx('sparkle'); buzz(30);
    const [x, y] = centerOf(el);
    burst(x, y, 56);
    if (A) {
      gsap.fromTo(el, { scaleX: 1.35, scaleY: 0.75 }, { scaleX: 1, scaleY: 1, duration: 0.9, ease: 'elastic.out(1, .3)' });
      Bird.hop(birds.ask, 34); Bird.capFly(birds.ask);
    }
    type(dodges ? 'Approved. The ostrich is relieved.' : 'Approved on the first try. The ostrich is impressed.');
    setTimeout(() => go('form'), reduce ? 400 : 1300);
  }

  /* ======================================================================
     4. Times: clocks that spin to her answer
     ====================================================================== */
  const clockState = {};
  function setClock(name, value, animate) {
    const c = $(`[data-clock="${name}"]`);
    if (!c) return;
    const h = c.querySelector('.clock-h'), m = c.querySelector('.clock-m');
    const st = clockState[name] || (clockState[name] = { h: 0, m: 0 });
    let hh = 10, mm = 10, extra = 720;
    if (/^\d\d:\d\d$/.test(value)) { [hh, mm] = value.split(':').map(Number); }
    else { extra = 1440; hh = (st.h / 30) % 12; mm = 0; }
    const ha = ((hh % 12) + mm / 60) * 30, ma = mm * 6;
    const nh = st.h + (((ha - st.h) % 360) + 360) % 360 + (animate ? 360 : 0);
    const nm = st.m + (((ma - st.m) % 360) + 360) % 360 + (animate ? extra : 0);
    st.h = nh; st.m = nm;
    if (A && animate) {
      gsap.to(h, { rotation: nh, svgOrigin: '24 24', duration: 1.1, ease: 'elastic.out(1, .5)' });
      gsap.to(m, { rotation: nm, svgOrigin: '24 24', duration: 1.1, ease: 'elastic.out(1, .5)' });
      gsap.fromTo(c, { scale: 1.25 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' });
    } else {
      h.setAttribute('transform', `rotate(${ha} 24 24)`);
      m.setAttribute('transform', `rotate(${ma} 24 24)`);
    }
  }

  /* ---------- answers ---------- */
  const multi = ['purpose', 'extras'];
  function restore() {
    $$('input').forEach((i) => {
      if (i.type === 'radio' && state[i.name] !== undefined && state[i.name] !== '') i.checked = state[i.name] === i.value;
      if (i.type === 'checkbox' && Array.isArray(state[i.name]) && !i.disabled) i.checked = state[i.name].includes(i.value);
    });
    ['pickup', 'home'].forEach((n) => { hintFor(n); if (state[n]) setClock(n, state[n], false); });
    syncCards();
  }
  function hintFor(name) {
    const hint = $(`[data-hint-for="${name}"]`), on = $(`input[name="${name}"]:checked`);
    if (hint) hint.textContent = on ? on.dataset.hint : hint.dataset.default;
  }
  function syncCards() { $$('.card').forEach((c) => c.classList.toggle('is-checked', !!c.querySelector('input:checked'))); }

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (!t.name) return;
    if (t.type === 'radio') state[t.name] = t.value;
    if (t.type === 'checkbox' && multi.includes(t.name)) {
      state[t.name] = $$(`input[name="${t.name}"]:checked`).map((i) => i.value);
      if (t.name === 'purpose' && !state.purpose.includes(PROMISE)) state.purpose.unshift(PROMISE);
    }
    if (t.name === 'pickup' || t.name === 'home') {
      hintFor(t.name); setClock(t.name, t.value, true);
      $(`[data-error-for="${t.name}"]`).hidden = true;
      if (A) gsap.fromTo($(`[data-hint-for="${t.name}"]`), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 });
    }
    const s = t.closest('.scene');
    if (s) { const er = s.querySelector('[data-error]'); if (er) er.hidden = true; }
    syncCards(); save();
    // reactions
    const card = t.closest('.card'), chip = t.closest('.chip');
    if (card && t.checked) {
      sfx('pop');
      const art = card.querySelector('.card-art svg');
      if (A) gsap.fromTo(art, { scale: 0.5, rotation: -25 }, { scale: 1, rotation: 0, duration: 0.8, ease: 'elastic.out(1.1, .4)' });
      const [x, y] = centerOf(card.querySelector('.card-art'));
      burst(x, y, 12, 0.6);
      say(t.dataset.say);
    } else if (chip) {
      sfx(t.checked ? 'pop' : 'tick');
      if (A) gsap.fromTo(chip, { scale: t.checked ? 0.86 : 1.06 }, { scale: 1, duration: 0.5, ease: 'back.out(3)', clearProps: 'transform' });
      if (t.checked && t.dataset.say) say(t.dataset.say);
    }
  });
  $$('.card input').forEach((i) => {
    i.addEventListener('focus', () => { if (i.matches(':focus-visible')) i.closest('.card').classList.add('is-focus'); });
    i.addEventListener('blur', () => i.closest('.card').classList.remove('is-focus'));
  });
  $('[data-form]').addEventListener('submit', (e) => {
    e.preventDefault();
    let first = null;
    ['pickup', 'home'].forEach((k) => {
      const has = !!$(`input[name="${k}"]:checked`);
      $(`[data-error-for="${k}"]`).hidden = has;
      if (!has && !first) first = $(`input[name="${k}"]`);
    });
    if (first) {
      if (A) gsap.fromTo(e.submitter || $('[data-form] [type=submit]'), { x: 0 }, { x: 8, duration: 0.5, ease: 'wiggle6' });
      first.focus(); return;
    }
    go('map');
  });

  /* ======================================================================
     5. The gate, the stamp, and the island drawing itself
     ====================================================================== */
  const gate = $('[data-gate]'), stampBtn = $('[data-stamp]');
  const gParts = { doorL: $('.door-l', gate), doorR: $('.door-r', gate), sign: $('.gate-sign', gate), front: $('.gate-front', gate), visa: $('.gate-visa', gate), tool: $('.stamp-tool', gate), mark: $('.stamp-mark', gate), status: $('[data-gate-status]') };
  const map = $('[data-map]');
  const M = {
    ripples: $$('[data-m="ripples"] path', map), shore: $('[data-m="shore"]', map), texts: $$('[data-m="main"] text, [data-m="label"]', map),
    coast: $('[data-m="coast"]', map), flood: $('[data-flood]', map), paths: $$('[data-m="path"]', map), masks: $$('[data-mask-line]', map),
    pops: $$('[data-pop]', map), tower: $('[data-m="tower"]', map), ferry: $('[data-m="ferry"]', map), route: $('[data-m="route"]', map), rider: $('[data-m="rider"]', map)
  };
  const stickers = $$('.sticker-in');
  let mapPrepped = false, mapDrawn = false, toolFloat = null;

  function prepMap() {
    if (!A || mapPrepped || mapDrawn) return;
    mapPrepped = true;
    gsap.set(M.pops, { scale: 0, transformOrigin: '50% 100%' });
    gsap.set([M.coast, M.shore, ...M.paths, ...M.masks, ...M.ripples], { drawSVG: 0 });
    gsap.set(M.flood, { attr: { r: 0 } });
    gsap.set(M.texts, { opacity: 0 });
    gsap.set(M.ferry, { opacity: 0 });
    gsap.set(M.tower, { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(stickers, { opacity: 0, scale: 2.2, y: -30, rotation: () => rnd(-35, 35) });
  }
  function drawMap(delay = 0) {
    if (!A || mapDrawn) return;
    mapDrawn = true;
    const tl = gsap.timeline({ delay });
    tl.to(M.ripples, { drawSVG: '100%', duration: 0.6, stagger: 0.08 }, 0)
      .to(M.shore, { drawSVG: '100%', duration: 0.9, ease: 'power1.inOut' }, 0.1)
      .to(M.coast, { drawSVG: '100%', duration: 1.5, ease: 'power1.inOut', onStart: () => sfx('scribble') }, 0.2)
      .to(M.texts, { opacity: 1, duration: 0.5, stagger: 0.2 }, 0.6)
      .to(M.tower, { scaleY: 1, duration: 0.55, ease: 'back.out(2.5)' }, 0.9)
      .to(M.flood, { attr: { r: 640 }, duration: 1.2, ease: 'power2.out' }, 1.25)
      .to(M.paths, { drawSVG: '100%', duration: 0.8, stagger: 0.2, ease: 'power1.inOut' }, 1.6)
      .to(M.masks, { drawSVG: '100%', duration: 0.7, stagger: 0.15 }, 1.75)
      .to(M.pops, { scale: 1, duration: 0.45, ease: 'back.out(2.6)', stagger: { each: 0.022, from: 'random' } }, 1.85)
      .to(M.ferry, { opacity: 1, duration: 0.3 }, 2.3)
      .add(() => ferryLoop(true), 2.3)
      .to(stickers, { opacity: 1, scale: 1, y: 0, rotation: 0, duration: 0.5, ease: 'back.out(2.6)', stagger: 0.09 }, 2.5);
    stickers.forEach((_, i) => tl.call(() => sfx('pop'), null, 2.5 + i * 0.09));
    tl.add(() => { const s = stickers[0]; if (s) gsap.fromTo(s, { scale: 1 }, { scale: 1.15, duration: 0.4, yoyo: true, repeat: 3, ease: 'sine.inOut' }); }, 3.8);
  }
  let ferryTween = null, riderTl = null;
  function ferryLoop(on) {
    if (!A) return;
    if (!on) { if (ferryTween) ferryTween.pause(); if (riderTl) riderTl.pause(); return; }
    if (!ferryTween) {
      ferryTween = gsap.to(M.ferry, { motionPath: { path: M.route, align: M.route, alignOrigin: [0.5, 0.5], autoRotate: true }, duration: 3.4, ease: 'sine.inOut', repeat: -1, yoyo: true, repeatDelay: 0.8 });
      riderTl = gsap.timeline({ repeat: -1, repeatDelay: 3.5, delay: 1.2 })
        .set(M.rider, { opacity: 1, x: 290, y: 18 })
        .to(M.rider, { x: 232, y: 178, duration: 1.7, ease: 'power1.in' })
        .to(M.rider, { opacity: 0, duration: 0.2 });
    } else { ferryTween.resume(); riderTl.resume(); }
  }

  function enterMap(s) {
    if (state.gateDone) {
      popHeading(s);
      if (A) { if (!mapDrawn && !mapPrepped) ferryLoop(true); else ferryLoop(true); }
      return;
    }
    gate.hidden = false;
    $('main').inert = true;
    topbar.setAttribute('data-hidden', '');
    stampBtn.disabled = false;
    prepMap();
    if (!A) { stampBtn.focus({ preventScroll: true }); return; }
    const b = birds.gate;
    gsap.set([gParts.doorL, gParts.doorR, gParts.sign, gParts.front], { clearProps: 'all' });
    gsap.timeline()
      .from(gParts.sign, { y: -120, rotation: -6, duration: 0.8, ease: 'bounce.out' }, 0.1)
      .fromTo(b.el, { x: -220 }, { x: 0, duration: 0.9, ease: 'power2.out' }, 0.3)
      .add(() => Bird.run(b, 0.85), 0.3)
      .add(() => Bird.tipCap(b), 1.25)
      .from(gParts.visa, { y: 80, rotation: 6, opacity: 0, duration: 0.6, ease: 'back.out(1.8)' }, 0.5)
      .from(gParts.tool, { y: -140, opacity: 0, duration: 0.6, ease: 'bounce.out' }, 0.8)
      .from(stampBtn, { scale: 0.5, opacity: 0, duration: 0.6, ease: 'elastic.out(1, .45)', clearProps: 'all' }, 1.1)
      .add(() => { toolFloat = gsap.to(gParts.tool, { y: -6, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut' }); stampBtn.focus({ preventScroll: true }); }, 1.4);
  }
  stampBtn.addEventListener('click', () => {
    if (stampBtn.disabled) return;
    stampBtn.disabled = true;
    Sound.unlock();
    if (!A) {
      gate.classList.add('is-stamping');
      setTimeout(() => { gate.classList.add('is-stamped'); gParts.status.textContent = 'Approved'; }, 190);
      setTimeout(() => gate.classList.add('is-open'), 900);
      setTimeout(finishGate, 2300);
      return;
    }
    if (toolFloat) toolFloat.kill();
    const b = birds.gate;
    gsap.timeline()
      .to(gParts.tool, { y: -26, rotation: -8, duration: 0.2, ease: 'power2.out' })
      .to(gParts.tool, { y: 62, rotation: 0, duration: 0.12, ease: 'power4.in' })
      .add(() => {
        sfx('thud'); buzz(45);
        gParts.status.textContent = 'Approved';
        gsap.fromTo(gParts.mark, { opacity: 1, scale: 1.5, rotation: -14 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
        gsap.fromTo(gParts.visa, { scaleY: 0.92 }, { scaleY: 1, duration: 0.5, ease: 'elastic.out(1, .35)', transformOrigin: '50% 100%' });
        gsap.fromTo(gParts.front, { x: 0 }, { x: 9, duration: 0.5, ease: 'wiggle6' });
        inkSplat();
        Bird.hop(b, 20); Bird.surprise(b);
      })
      .to(gParts.tool, { y: -150, rotation: 20, opacity: 0, duration: 0.5, ease: 'back.in(1.6)' }, '+=0.25')
      .add(openDoors, '+=0.2');
  });
  function inkSplat() {
    const v = gParts.visa, r = v.getBoundingClientRect(), m = gParts.mark.getBoundingClientRect();
    for (let i = 0; i < 9; i += 1) {
      const d = document.createElement('span');
      d.className = 'ink';
      d.style.left = (m.left - r.left + m.width / 2) + 'px'; d.style.top = (m.top - r.top + m.height / 2) + 'px';
      v.append(d);
      const a = rnd(0, Math.PI * 2), dist = rnd(40, 70);
      gsap.fromTo(d, { scale: rnd(0.5, 1.4) }, { x: Math.cos(a) * dist, y: Math.sin(a) * dist, scale: 0, duration: rnd(0.4, 0.7), ease: 'power2.out', onComplete: () => d.remove() });
    }
  }
  function openDoors() {
    sfx('whoosh'); buzz(15);
    const [x, y] = [window.innerWidth / 2, window.innerHeight * 0.45];
    gsap.timeline({ onComplete: finishGate })
      .to(gParts.front, { y: 260, opacity: 0, duration: 0.6, ease: 'back.in(1.4)' }, 0)
      .to(gParts.sign, { y: -160, opacity: 0, duration: 0.6, ease: 'back.in(1.4)' }, 0)
      .to(gParts.doorL, { rotationY: -112, transformOrigin: '0% 50%', duration: 1.3, ease: 'power3.inOut' }, 0.25)
      .to(gParts.doorR, { rotationY: 112, transformOrigin: '100% 50%', duration: 1.3, ease: 'power3.inOut' }, 0.3)
      .to([gParts.doorL, gParts.doorR], { opacity: 0, duration: 0.3 }, 1.2)
      .add(() => burst(x, y, 70, 1.1), 0.45)
      .add(() => drawMap(0), 0.35)
      .fromTo(scenes.map, { scale: 1.12, transformOrigin: '50% 30%' }, { scale: 1, duration: 1.6, ease: 'power2.out', clearProps: 'transform,transformOrigin' }, 0.25)
      .add(() => popHeading(scenes.map), 0.6);
  }
  function finishGate() {
    gate.hidden = true;
    $('main').inert = false;
    gate.classList.remove('is-stamping', 'is-stamped', 'is-open');
    state.gateDone = true; save();
    topbar.removeAttribute('data-hidden');
    const h = scenes.map.querySelector('h2');
    if (h) h.focus({ preventScroll: true });
  }

  /* ---------- map cards ---------- */
  const dlg = $('[data-card]'), dlgBody = $('[data-card-body]');
  const closeCard = () => {
    if (A && dlg.open) gsap.to(dlg, { y: 30, opacity: 0, scale: 0.96, duration: 0.2, ease: 'power2.in', onComplete: () => { dlg.close(); gsap.set(dlg, { clearProps: 'all' }); } });
    else if (dlg.close) dlg.close(); else dlg.removeAttribute('open');
  };
  $$('[data-spot]').forEach((st) => st.addEventListener('click', () => {
    const info = $(`[data-info="${st.dataset.spot}"]`);
    dlgBody.replaceChildren(info.cloneNode(true));
    const ttl = dlgBody.querySelector('h3');
    if (ttl) { ttl.id = 'card-title'; dlg.setAttribute('aria-labelledby', 'card-title'); }
    const img = dlgBody.querySelector('img');
    if (img) img.loading = 'eager';
    st.setAttribute('data-seen', '');
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.scrollTop = 0;
    dlg.focus({ preventScroll: true });
    sfx('paper');
    if (!A) return;
    gsap.fromTo(dlg, { y: 50, scale: 0.88, rotation: -3, opacity: 0 }, { y: 0, scale: 1, rotation: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.8)' });
    if (img) { gsap.set(img, { filter: 'grayscale(1) contrast(1.35) brightness(1.15)', scale: 1.12 }); (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => gsap.to(img, { filter: 'grayscale(0) contrast(1) brightness(1)', scale: 1, duration: 1.5, ease: 'power2.out' })); }
    const grows = $$('[data-grow]', dlgBody);
    if (grows.length) gsap.fromTo(grows, { scale: 0, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.55, ease: 'back.out(2.4)', stagger: 0.09, delay: 0.2 });
    gsap.fromTo($$('h3, p', dlgBody), { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: 0.07, duration: 0.35, delay: 0.25 });
  }));
  $('[data-card-close]').addEventListener('click', closeCard);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) closeCard(); });

  /* ======================================================================
     10. Cafe and issuing the visa: a paper plane to the consulate
     ====================================================================== */
  function enterCafe(s) {
    popHeading(s);
    stagIn($$('.card', s));
    const mat = $('input[name="cafe"][value="Matcha latte"]', s);
    if (A && mat && mat.checked) {
      const art = mat.closest('.card').querySelector('.card-art svg');
      gsap.fromTo(art, { rotation: 0 }, { rotation: 16, duration: 0.8, ease: 'wiggle6', delay: 0.9 });
      setTimeout(() => { if (current === 'cafe' && mat.checked) say('Matcha latte. Obviously.'); }, 1100);
    }
  }
  function outValues() {
    return {
      pickup: state.pickup || '10:00', home: state.home || 'No rush',
      cross: state.cross || 'Decide there', explore: state.explore || 'A bit of everything',
      lunch: state.lunch || 'Decide there', cafe: state.cafe || 'Matcha latte',
      extras: state.extras && state.extras.length ? state.extras.join(', ') : 'Whatever we find'
    };
  }
  function visaMessage(updated) {
    const o = outValues();
    return [
      updated ? '✏️ Mina updated her Naminara visa' : '🛂 Mina’s Naminara visa is issued!',
      '',
      '🕘 Pickup in Seoul: ' + o.pickup,
      '🏠 Home by: ' + o.home,
      '⛴ Crossing: ' + o.cross,
      '🚲 Exploring: ' + o.explore,
      '✨ Extras: ' + o.extras,
      '🍜 Lunch: ' + o.lunch,
      '🍵 Cafe Daenerys: ' + o.cafe,
      '🎯 Purpose: ' + state.purpose.join(', ')
    ].join('\n');
  }
  $('[data-issue]').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    if (btn.disabled || busy) return;
    btn.disabled = true;
    Sound.unlock();
    state.issues = (state.issues || 0) + 1; save();
    const sending = deliver('visa-' + state.issues, visaMessage(state.issues > 1));
    const ok = await flight(sending);
    state.delivered = ok; save();
    btn.disabled = false;
    go('visa', { sound: false });
  });
  function flight(sending) {
    const fl = $('[data-flight]'), plane = $('[data-plane]', fl), path = $('[data-trail-path]', fl), mask = $('[data-trail-mask]', fl);
    const text = $('[data-flight-text]', fl), check = $('[data-flight-check]', fl), tickEl = $('.fc-tick', check);
    text.textContent = 'Delivering your visa to the consulate…';
    fl.hidden = false;
    $('main').inert = true;
    if (!A) {
      check.style.opacity = '0';
      return sending.then((ok) => { text.textContent = ok ? 'Delivered to the consulate.' : 'Almost there.'; check.style.opacity = ok ? '1' : '0'; return wait(900).then(() => { fl.hidden = true; $('main').inert = false; return ok; }); });
    }
    sfx('whoosh');
    gsap.set(check, { scale: 0, opacity: 0 });
    gsap.set(mask, { drawSVG: 0 });
    gsap.set(plane, { opacity: 0 });
    const tl = gsap.timeline();
    tl.fromTo(fl, { opacity: 0 }, { opacity: 1, duration: 0.25 })
      .fromTo(text, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 }, 0.1)
      .set(plane, { opacity: 1 }, 0.2)
      .to(plane, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true }, duration: 2.1, ease: 'power1.inOut' }, 0.2)
      .to(mask, { drawSVG: '100%', duration: 2.1, ease: 'power1.inOut' }, 0.2)
      .add(() => sfx('whoosh'), 1.3);
    const done = new Promise((r) => tl.eventCallback('onComplete', r));
    return Promise.all([done, sending]).then(([, ok]) => {
      text.textContent = ok ? 'Delivered to the consulate.' : 'Almost there.';
      if (ok) {
        sfx('sparkle'); buzz(25);
        gsap.fromTo(check, { scale: 0, opacity: 0, rotation: -90 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.5)' });
        gsap.fromTo(tickEl, { drawSVG: 0 }, { drawSVG: '100%', duration: 0.4, delay: 0.25 });
      }
      return wait(ok ? 1300 : 600)
        .then(() => gsap.to(fl, { opacity: 0, duration: 0.3 }))
        .then(() => { fl.hidden = true; $('main').inert = false; gsap.set([fl, plane], { clearProps: 'all' }); return ok; });
    });
  }

  /* ======================================================================
     11. The visa
     ====================================================================== */
  const isTime = (v) => /^\d\d:\d\d$/.test(v || '');
  function addMin(hhmm, m) {
    const [h, mi] = hhmm.split(':').map(Number), t = h * 60 + mi + m;
    return String(Math.floor(t / 60) % 24).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
  }
  function renderVisa() {
    const o = outValues();
    $$('[data-out]').forEach((dd) => { dd.textContent = o[dd.dataset.out]; });
    const base = isTime(state.pickup) ? state.pickup : '10:00';
    const lunchAt = addMin(base, 150);
    const extras = (state.extras || []).filter((x) => x !== 'Hotteok hunt');
    const rows = [
      [base, 'Pickup in Seoul'],
      [addMin(base, 75), 'Parking at Gapyeong wharf, visa check'],
      state.cross === 'Zip-wire' ? [addMin(base, 90), 'Zip-wire over the river'] : [addMin(base, 90), 'Ferry to Naminara'],
      [addMin(base, 105), o.explore + ': pine lane, the officer, the ginkgo lane'],
      [lunchAt, state.lunch && state.lunch !== 'Decide there' ? 'Lunch: ' + o.lunch : 'Lunch, picked on the spot'],
      [addMin(lunchAt, 75), 'Metasequoia lane and hotteok' + (extras.length ? ', plus ' + extras.join(', ').toLowerCase() : '')],
      ['16:00', 'Ferry back to the car'],
      ['17:00', 'Cafe Daenerys: ' + o.cafe.toLowerCase()],
      ['17:27', 'Sunset over the river'],
      [isTime(state.home) ? state.home : 'then', isTime(state.home) ? 'Home' : 'Home, no rush']
    ];
    $('[data-timeline]').replaceChildren(...rows.map(([t, txt]) => {
      const li = document.createElement('li'), a = document.createElement('span'), b = document.createElement('span');
      a.className = 't'; a.textContent = t; b.textContent = txt; li.append(a, b); return li;
    }));
    const ok = state.delivered === true;
    $('[data-delivered]').hidden = !ok;
    $('[data-fallback]').hidden = ok;
    $('[data-visa-lede]').textContent = ok ? 'The consulate already has a copy. Take a screenshot for Sunday.' : 'Take a screenshot for Sunday, and send a copy to the consulate below.';
    $('[data-tg-fallback]').href = 'https://t.me/' + TG_USER + '?text=' + encodeURIComponent(visaMessage(state.issues > 1));
    countdown();
  }
  function countdown() {
    const el = $('[data-countdown]');
    const [h, m] = (isTime(state.pickup) ? state.pickup : '10:00').split(':').map(Number);
    const diff = Date.UTC(2026, 10, 8, h - 9, m) - Date.now(); /* Seoul is UTC+9 */
    if (diff <= 0) { el.textContent = diff > -16 * 3600e3 ? 'Today is the day.' : 'Promise kept.'; return; }
    const d = Math.floor(diff / 864e5), hr = Math.floor((diff % 864e5) / 36e5), mi = Math.floor((diff % 36e5) / 6e4);
    el.textContent = 'Pickup in ' + (d ? d + (d > 1 ? ' days, ' : ' day, ') : '') + hr + ' h ' + mi + ' min.';
  }
  setInterval(() => { if (current === 'visa') countdown(); }, 30000);
  function enterVisa(s) {
    renderVisa();
    if (!A) return;
    popHeading(s);
    const v = $('[data-visa]', s), stamp = $('[data-visa-stamp]', s);
    gsap.timeline()
      .fromTo(v, { y: 70, rotation: -5, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.65, ease: 'back.out(1.6)', clearProps: 'transform' })
      .fromTo($$('.visa-fields > div', v), { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.3 }, 0.35)
      .fromTo(stamp, { scale: 2.8, opacity: 0, rotation: -45 }, { scale: 1, opacity: 0.92, rotation: -14, duration: 0.3, ease: 'power4.in' }, 1.0)
      .add(() => {
        sfx('thud'); buzz(40);
        const [x, y] = centerOf(stamp);
        burst(x, y, 34, 0.8);
        gsap.fromTo(v, { x: 0 }, { x: 7, duration: 0.45, ease: 'wiggle6' });
      }, 1.3)
      .fromTo($$('[data-delivered], [data-fallback], [data-change]', s).filter((x) => !x.hidden), { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, clearProps: 'all' }, 1.5);
  }
  $('[data-change]').addEventListener('click', () => go('cross'));

  /* ======================================================================
     Start
     ====================================================================== */
  restore();
  flush();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { prepSplits(); if (current === 'ask') layoutAsk(); });
  } else prepSplits();
  window.addEventListener('resize', () => { if (current === 'ask') layoutAsk(); });

  if (state.said && ORDER.indexOf(state.scene) > 2) {
    const idx = ORDER.indexOf(state.scene);
    go(state.scene, { back: true, instant: true });
    trail.splice(0, trail.length, ...ORDER.slice(0, idx));
    backBtn.disabled = false;
  } else if (A) {
    introCover();
  }

  try {
    console.log('%cNaminara consulate', 'font: 700 20px sans-serif; color: ' + css.getPropertyValue('--color-accent').trim());
    console.log('Hand-built for Mina. No templates were harmed.');
  } catch (e) { /* ignore */ }
})();
