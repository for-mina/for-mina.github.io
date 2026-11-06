/* Drawing kit for the Sunday movie.
   Every helper returns an SVG string in the 360 x 640 stage space.
   Colours only through classes (see app.css and movie/movie.css). */
(() => {
  'use strict';
  const KIT = (window.KIT = {});
  const rnd = (a, b) => a + Math.random() * (b - a);
  KIT.rnd = rnd;
  KIT.W = 360;
  KIT.H = 640;
  if (window.gsap && window.CustomEase && window.CustomWiggle) {
    gsap.registerPlugin(...['CustomEase', 'CustomWiggle', 'CustomBounce', 'DrawSVGPlugin', 'MotionPathPlugin'].map((n) => window[n]).filter(Boolean));
    if (!gsap.parseEase('wiggle6')) CustomWiggle.create('wiggle6', { wiggles: 6, type: 'easeOut' });
    if (!gsap.parseEase('wiggle3')) CustomWiggle.create('wiggle3', { wiggles: 3, type: 'easeOut' });
  }

  /* ---------- defs: gradients used by skies, rivers and glows ---------- */
  KIT.defs = () => `<defs>
    <linearGradient id="gk-morning" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s-m1"/><stop offset="1" class="s-m2"/></linearGradient>
    <linearGradient id="gk-noon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s-n1"/><stop offset="1" class="s-n2"/></linearGradient>
    <linearGradient id="gk-sunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s-s3"/><stop offset="0.55" class="s-s2"/><stop offset="1" class="s-s1"/></linearGradient>
    <linearGradient id="gk-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s-t1"/><stop offset="1" class="s-t2"/></linearGradient>
    <linearGradient id="gk-river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s-r1"/><stop offset="1" class="s-r2"/></linearGradient>
    <radialGradient id="gk-glow"><stop offset="0" class="s-glow"/><stop offset="1" class="s-glow0"/></radialGradient>
  </defs>`;

  /* ---------- sky and weather ---------- */
  KIT.sky = (kind = 'noon') => `<rect class="k-sky" width="360" height="640" fill="url(#gk-${kind})"/>`;
  KIT.sun = (x, y, r = 22) => `<g class="k-sun" transform="translate(${x} ${y})"><circle r="${r * 2.2}" fill="url(#gk-glow)"/><circle class="f-gold" r="${r}"/></g>`;
  KIT.moon = (x, y, r = 16) => `<g class="k-moon" transform="translate(${x} ${y})"><circle r="${r * 2}" fill="url(#gk-glow)" opacity="0.45"/><path class="f-cream" d="M0 ${-r} A${r} ${r} 0 1 0 ${r * 0.85} ${r * 0.55} A${r * 0.78} ${r * 0.78} 0 1 1 0 ${-r} Z"/></g>`;
  KIT.cloud = (x, y, s = 1) => `<g class="k-cloud" transform="translate(${x} ${y}) scale(${s})"><path class="f-paper2" d="M-34 0 C-36 -10 -24 -18 -14 -13 C-10 -27 12 -28 17 -14 C27 -19 38 -10 35 0 Z"/></g>`;
  KIT.stars = (n = 22, maxY = 300) => {
    let s = '';
    for (let i = 0; i < n; i += 1) {
      const x = rnd(10, 350), y = rnd(14, maxY), r = rnd(1, 2.4);
      s += `<path class="k-star f-cream" d="M${x} ${y - r * 2} L${x + r * 0.6} ${y - r * 0.6} L${x + r * 2} ${y} L${x + r * 0.6} ${y + r * 0.6} L${x} ${y + r * 2} L${x - r * 0.6} ${y + r * 0.6} L${x - r * 2} ${y} L${x - r * 0.6} ${y - r * 0.6} Z"/>`;
    }
    return `<g class="k-stars">${s}</g>`;
  };

  /* ---------- land ---------- */
  // A ridge path across `width` px with peaks of height `amp` above `y`.
  KIT.ridge = (y, amp, width = 720, seg = 9, cls = 'f-mtn-3', seed = 1) => {
    let d = `M0 640 L0 ${y}`;
    const step = width / seg;
    for (let i = 0; i < seg; i += 1) {
      const x1 = i * step + step / 2, x2 = (i + 1) * step;
      const h = amp * (0.55 + 0.45 * Math.abs(Math.sin((i + 1) * 1.7 * seed)));
      d += ` Q${x1} ${y - h} ${x2} ${y - (i % 2 ? amp * 0.15 : amp * 0.3)}`;
    }
    d += ` L${width} 640 Z`;
    return `<path class="${cls}" d="${d}"/>`;
  };
  // Autumn hills: three layers; wrap each in its own <g> to parallax them.
  KIT.mountains = (y = 380) => ({
    far: `<g class="k-far">${KIT.ridge(y - 40, 70, 720, 7, 'f-mtn-far', 1.3)}</g>`,
    mid: `<g class="k-mid">${KIT.ridge(y, 60, 720, 9, 'f-mtn-2', 2.1)}${KIT.ridge(y + 26, 46, 720, 11, 'f-mtn-1', 0.7)}</g>`,
    near: `<g class="k-near">${KIT.ridge(y + 60, 34, 720, 12, 'f-mtn-3', 1.9)}</g>`
  });
  KIT.river = (y, h, width = 720) => `<g class="k-river"><rect y="${y}" width="${width}" height="${h}" fill="url(#gk-river)"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path class="st-paper nf" d="M${30 + i * 110} ${y + 14 + (i % 3) * 16} q8 -5 16 0 t16 0"/>`).join('')}</g>`;

  /* ---------- trees (reuse the site's symbols) ---------- */
  const TREE = { meta: 'i-meta', ginkgo: 'i-gtree', pine: 'i-pine' };
  KIT.tree = (type, x, groundY, h = 60) => {
    if (type === 'maple') {
      return `<g class="k-tree" data-tree="maple"><path class="st-ink nf" d="M${x} ${groundY} V${groundY - h * 0.35}"/><circle class="f-maple" cx="${x}" cy="${groundY - h * 0.62}" r="${h * 0.34}"/><circle class="f-rust" cx="${x + h * 0.14}" cy="${groundY - h * 0.5}" r="${h * 0.18}"/></g>`;
    }
    const w = h * (type === 'meta' ? 0.62 : 1);
    return `<g class="k-tree" data-tree="${type}"><use href="#${TREE[type] || 'i-gtree'}" x="${x - w / 2}" y="${groundY - h}" width="${w}" height="${h}"/></g>`;
  };

  /* ---------- people ----------
     Origin = between the feet. About 58 px tall at s = 1.
     who: 'mina' (pink coat, pink beanie) or 'me' (navy coat, plum beanie, glasses).
     Parts for animation: .p-leg-l .p-leg-r .p-arm-l .p-arm-r .p-head .p-body */
  KIT.person = (who = 'mina', { x = 0, y = 0, s = 1, flip = false, pose = 'stand' } = {}) => {
    const coat = who === 'mina' ? 'f-coat-mina' : 'f-coat-me';
    const arm = who === 'mina' ? 'st-arm-mina' : 'st-arm-me';
    const up = pose === 'hang' || pose === 'cheer';
    const armL = up ? 'M-8 -32 L-11 -52' : 'M-8 -31 L-13 -17';
    const armR = up ? 'M8 -32 L11 -52' : 'M8 -31 L13 -17';
    const hat = who === 'mina'
      ? `<path class="f-door st-face" d="M-10.5 -47 C-10.5 -59 10.5 -59 10.5 -47 Z"/><rect class="f-door-panel" x="-11" y="-49" width="22" height="4" rx="2"/><circle class="f-gold" cx="0" cy="-59" r="3"/>`
      : `<path class="f-ink2 st-face" d="M-10.5 -47 C-10.5 -58 10.5 -58 10.5 -47 Z"/><rect class="f-ink" x="-11" y="-49" width="22" height="4" rx="2"/>`;
    const extra = who === 'mina'
      ? `<path class="st-thin" stroke-width="3" d="M-7 -35 H7" style="stroke:var(--color-matcha)"/>`
      : `<g class="p-glasses"><circle class="st-thin" cx="-4" cy="-44" r="3.2"/><circle class="st-thin" cx="4" cy="-44" r="3.2"/><path class="st-thin" d="M-0.8 -44 H0.8"/></g>`;
    return `<g class="person" data-who="${who}" transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
      <ellipse class="f-shadow" cx="0" cy="1" rx="12" ry="2.5"/>
      <g class="p-leg-l"><path class="st-legs" d="M-4 -15 L-5 -1"/></g>
      <g class="p-leg-r"><path class="st-legs" d="M4 -15 L5 -1"/></g>
      <g class="p-body"><path class="${coat} st-face" d="M-11 -13 C-11 -29 -8 -36 0 -36 C8 -36 11 -29 11 -13 Z"/></g>
      <g class="p-arm-l"><path class="${arm}" d="${armL}"/></g>
      <g class="p-arm-r"><path class="${arm}" d="${armR}"/></g>
      <g class="p-head">
        <circle class="f-face st-face" cx="0" cy="-45" r="10"/>
        <circle class="f-ink" cx="-3.6" cy="-44" r="1.3"/><circle class="f-ink" cx="3.6" cy="-44" r="1.3"/>
        <ellipse class="f-blush" cx="-6.5" cy="-40.5" rx="2.2" ry="1.3"/><ellipse class="f-blush" cx="6.5" cy="-40.5" rx="2.2" ry="1.3"/>
        <path class="st-thin" d="M-2.4 -40.2 Q0 -38.4 2.4 -40.2"/>
        ${hat}${extra}
      </g>
    </g>`;
  };
  // Just a head, for windows of cars and boats.
  KIT.head = (who, x, y, s = 1) => `<g class="k-head" data-who="${who}" transform="translate(${x} ${y}) scale(${s})"><g transform="translate(0 45)">${KIT.person(who).replace(/<ellipse class="f-shadow"[^>]*\/>|<g class="p-leg-[lr]">[\s\S]*?<\/g>|<g class="p-arm-[lr]">[\s\S]*?<\/g>|<g class="p-body">[\s\S]*?<\/g>/g, '')}</g></g>`;

  /* ---------- the car ----------
     Side view facing right. Origin = road contact point, centre of the car.
     About 124 px long at s = 1. Parts: .car-body .car-wheel */
  KIT.car = ({ x = 0, y = 0, s = 1, flip = false, mina = true, me = true } = {}) => `<g class="car" transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
    <ellipse class="f-shadow" cx="2" cy="1" rx="62" ry="4"/>
    <g class="car-body">
      <path class="f-paper2 st-out" d="M-58 -14 C-58 -24 -52 -28 -44 -29 L-30 -30 L-18 -46 C-15 -50 -10 -52 -4 -52 L22 -52 C28 -52 32 -50 36 -45 L46 -31 L56 -29 C60 -28 62 -24 62 -18 L62 -12 C62 -9 60 -8 58 -8 L-56 -8 C-58 -8 -58 -10 -58 -14 Z"/>
      <path class="f-glass st-thin" d="M-15 -45 L-25 -31 H6 V-48 H-8 C-11 -48 -13 -47 -15 -45 Z"/>
      <path class="f-glass st-thin" d="M10 -48 V-31 H42 L33 -44 C31 -47 28 -48 24 -48 Z"/>
      ${me ? KIT.head('me', 24, -33, 0.62) : ''}
      ${mina ? KIT.head('mina', -8, -33, 0.62) : ''}
      <path class="f-accent" d="M-58 -20 H-52 V-15 H-58 Z"/>
      <path class="f-gold" d="M56 -22 H61 V-16 H56 Z"/>
      <path class="st-thin" d="M-30 -22 H52"/>
      <rect class="f-ink2" x="2" y="-27" width="7" height="2" rx="1"/>
    </g>
    <g class="car-wheel" data-wheel="back"><circle class="f-ink" cx="-34" cy="-8" r="10"/><circle class="f-metal" cx="-34" cy="-8" r="4.6"/><path class="st-thin" d="M-34 -16 V0" style="stroke:var(--color-paper-2)"/></g>
    <g class="car-wheel" data-wheel="front"><circle class="f-ink" cx="38" cy="-8" r="10"/><circle class="f-metal" cx="38" cy="-8" r="4.6"/><path class="st-thin" d="M38 -16 V0" style="stroke:var(--color-paper-2)"/></g>
  </g>`;

  /* ---------- the ostrich officer (same drawing as the site) ---------- */
  KIT.OSTRICH = '<ellipse class="f-shadow o-shadow" cx="58" cy="144" rx="30" ry="4"/>' +
    '<g class="o-leg-l"><path class="st-leg" d="M50 114 L46 141 H38"/></g><g class="o-leg-r"><path class="st-leg" d="M68 114 L72 141 H80"/></g>' +
    '<g class="o-body"><circle class="f-ink2" cx="22" cy="92" r="11"/><circle class="f-ink2" cx="17" cy="104" r="9"/><ellipse class="f-ink" cx="56" cy="99" rx="36" ry="24"/>' +
    '<path class="o-wing f-ink2" d="M38 93 C50 80 74 82 80 96 C70 105 50 107 38 93Z"/><g class="o-neckhead"><path class="st-neck" d="M80 88 C85 71 78 56 83 40"/>' +
    '<g class="o-head"><ellipse class="f-skin" cx="86" cy="33" rx="14" ry="12"/><path class="f-maple" d="M98 32 C105 32 111 34 111 36 C109 39 103 40 97 39Z"/>' +
    '<circle class="f-paper2" cx="89" cy="31" r="5.5"/><circle class="o-pupil f-ink" cx="90.5" cy="32.2" r="2.6"/>' +
    '<g class="o-lid"><path class="f-skin" d="M82.5 31 C84 25 94 25 95.5 30 L95.5 24 L82.5 24Z"/><path class="st-lid" d="M83 30 C86 28.5 92 28 96 29"/></g>' +
    '<path class="o-brow st-lid" d="M84 24.5 L93 26.5"/><g class="o-cap"><path class="f-accent" d="M73 25 C73 12 97 10 99 23 Z"/><path class="f-ink" d="M86 23 C92 22 101 22 105 24 C101 26.5 92 26.5 86 25Z"/><circle class="f-gold" cx="85" cy="17.5" r="3.2"/></g>' +
    '</g></g></g>';
  // x, y = feet position. h = height in px.
  KIT.ostrich = (x, y, h = 90, flip = false) => {
    const w = h * 0.8;
    return `<g class="k-ostrich" transform="translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}"><svg x="${-w / 2}" y="${-h}" width="${w}" height="${h}" viewBox="0 0 120 150" overflow="visible">${KIT.OSTRICH}</svg></g>`;
  };

  /* ---------- signs and text ---------- */
  // Korean expressway direction sign: green panel, white text.
  KIT.sign = (x, y, { ko = '가평', en = 'Gapyeong', sub = '', arrow = 'up', w = 150, color = 'f-sign' } = {}) => {
    const h = sub ? 70 : 56;
    const arrows = { up: 'M0 8 V-8 M-6 -2 L0 -8 L6 -2', right: 'M-8 0 H8 M2 -6 L8 0 L2 6', upright: 'M-6 6 L6 -6 M-2 -6 H6 V2' };
    return `<g class="k-sign" transform="translate(${x} ${y})">
      <rect class="f-metal" x="${-w / 2 + 12}" y="0" width="5" height="120"/><rect class="f-metal" x="${w / 2 - 17}" y="0" width="5" height="120"/>
      <rect class="${color}" x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="6"/>
      <rect class="st-sign" x="${-w / 2 + 3}" y="${-h + 3}" width="${w - 6}" height="${h - 6}" rx="4"/>
      <text class="k-sign-text" x="${-w / 2 + 14}" y="${-h + 26}" font-size="20">${ko}</text>
      <text class="k-sign-text" x="${-w / 2 + 14}" y="${-h + 44}" font-size="11">${en}</text>
      ${sub ? `<text class="k-sign-text" x="${-w / 2 + 14}" y="${-h + 60}" font-size="10">${sub}</text>` : ''}
      <g transform="translate(${w / 2 - 22} ${-h / 2})"><path d="${arrows[arrow] || arrows.up}" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--color-paper-2)"/></g>
    </g>`;
  };
  KIT.text = (x, y, str, { cls = 'k-text', size = 14, anchor = 'start', extra = '' } = {}) => `<text class="${cls}" x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" ${extra}>${str}</text>`;
  // A speech bubble pointing down-left at its tail.
  KIT.bubble = (x, y, str, { w = 96, size = 14 } = {}) => `<g class="k-bubble" transform="translate(${x} ${y})">
    <path class="f-paper2 st-out" d="M0 0 h${w} a10 10 0 0 1 10 10 v14 a10 10 0 0 1 -10 10 h${-w + 24} l-12 10 l2 -10 h-14 a10 10 0 0 1 -10 -10 v-14 a10 10 0 0 1 10 -10 z"/>
    <text class="k-hand" x="${w / 2}" y="23" font-size="${size}" text-anchor="middle" font-weight="700">${str}</text></g>`;
  // Small HUD panel in the corner (the "IT guy" layer): monospace, dark.
  KIT.hud = (x, y, w, h, inner) => `<g class="k-hud" transform="translate(${x} ${y})"><rect class="f-term" width="${w}" height="${h}" rx="10" opacity="0.88"/>${inner}</g>`;

  /* ---------- city ---------- */
  // Korean apartment block with the big building number on its side.
  KIT.apartment = (x, y, w = 120, h = 230, num = '101동') => {
    let win = '';
    const cols = 4, rows = Math.floor((h - 50) / 22);
    for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) {
      win += `<rect class="f-glass k-win" data-r="${r}" data-c="${c}" x="${x + 14 + c * ((w - 28) / cols)}" y="${y + 40 + r * 22}" width="${(w - 28) / cols - 8}" height="12" rx="2"/>`;
    }
    return `<g class="k-apt"><rect class="f-cream st-out" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>
      <rect class="f-door-panel" x="${x}" y="${y}" width="${w}" height="10" rx="4"/>
      <text class="k-display" x="${x + 12}" y="${y + 30}" font-size="17" style="fill:var(--color-accent)">${num}</text>
      ${win}
      <rect class="f-door st-out" x="${x + w / 2 - 12}" y="${y + h - 30}" width="24" height="30" rx="3"/></g>`;
  };
  KIT.seoulSkyline = (y = 330) => `<g class="k-skyline">
    <path class="f-mtn-far" d="M0 ${y + 40} Q40 ${y - 10} 90 ${y + 10} Q120 ${y + 20} 150 ${y + 40} L150 ${y + 80} L0 ${y + 80} Z"/>
    <g transform="translate(78 ${y - 6})"><rect class="f-mtn-far" x="-2.5" y="-70" width="5" height="70"/><rect class="f-mtn-far" x="-8" y="-58" width="16" height="9" rx="3"/><rect class="f-mtn-far" x="-1" y="-92" width="2" height="24"/></g>
    <path class="f-mtn-far" d="M300 ${y + 40} L306 ${y - 120} Q309 ${y - 135} 312 ${y - 120} L318 ${y + 40} Z"/>
    <rect class="f-mtn-far" x="180" y="${y}" width="22" height="60"/><rect class="f-mtn-far" x="206" y="${y - 20}" width="26" height="80"/><rect class="f-mtn-far" x="236" y="${y + 10}" width="20" height="50"/>
    <rect class="f-mtn-far" x="330" y="${y + 6}" width="24" height="54"/></g>`;

  /* ---------- animation helpers (all take a timeline and a time) ---------- */
  const q = (el, s) => (el ? el.querySelectorAll(s) : []);
  KIT.walk = (tl, el, at, dur, { swing = 24 } = {}) => {
    const n = Math.max(1, Math.round(dur / 0.16)) | 1;
    tl.to(q(el, '.p-leg-l'), { rotation: swing, transformOrigin: '50% 0%', duration: 0.16, yoyo: true, repeat: n, ease: 'sine.inOut' }, at)
      .to(q(el, '.p-leg-r'), { rotation: -swing, transformOrigin: '50% 0%', duration: 0.16, yoyo: true, repeat: n, ease: 'sine.inOut' }, at)
      .to(q(el, '.p-arm-l'), { rotation: -swing * 0.6, transformOrigin: '50% 0%', duration: 0.16, yoyo: true, repeat: n, ease: 'sine.inOut' }, at)
      .to(q(el, '.p-arm-r'), { rotation: swing * 0.6, transformOrigin: '50% 0%', duration: 0.16, yoyo: true, repeat: n, ease: 'sine.inOut' }, at)
      .to(q(el, '.p-body, .p-head'), { y: -1.5, duration: 0.08, yoyo: true, repeat: n * 2 + 1, ease: 'sine.inOut' }, at);
    return tl;
  };
  KIT.wave = (tl, el, at, { arm = '.p-arm-r', times = 3 } = {}) => {
    tl.to(q(el, arm), { rotation: -150, transformOrigin: '50% 0%', duration: 0.18 }, at)
      .to(q(el, arm), { rotation: -120, transformOrigin: '50% 0%', duration: 0.14, yoyo: true, repeat: times * 2 - 1 }, at + 0.18)
      .to(q(el, arm), { rotation: 0, transformOrigin: '50% 0%', duration: 0.2 }, at + 0.18 + times * 0.28);
    return tl;
  };
  KIT.hop = (tl, el, at, h = 14) => tl.to(el, { y: `-=${h}`, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 1 }, at);
  KIT.wheels = (tl, car, at, dur, turnsPerSec = 2.2) => tl.to(q(car, '.car-wheel'), { rotation: `+=${360 * turnsPerSec * dur}`, transformOrigin: '50% 50%', duration: dur, ease: 'none' }, at);
  KIT.bob = (tl, el, at, dur, amp = 1.2, period = 0.18) => {
    const n = Math.max(1, Math.round(dur / period)) | 1;
    return tl.to(el, { y: `-=${amp}`, duration: period, yoyo: true, repeat: n, ease: 'sine.inOut' }, at);
  };
  KIT.pop = (tl, els, at, { stagger = 0.06, from = 0 } = {}) => tl.fromTo(els, { scale: from, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.45, ease: 'back.out(2.4)', stagger }, at);
  // Endless loop scroller for parallax groups that are 720 px wide (two copies of 360).
  KIT.scroll = (tl, el, at, dur, px) => tl.fromTo(el, { x: 0 }, { x: -px, duration: dur, ease: 'none' }, at);
  // Count a number in a <text> element from a to b.
  KIT.count = (tl, textEl, at, dur, a, b, fmt = (v) => v.toFixed(1)) => {
    const o = { v: a };
    return tl.to(o, { v: b, duration: dur, ease: 'none', onUpdate: () => { if (textEl) textEl.textContent = fmt(o.v); } }, at);
  };
  // Little dust puffs behind a moving thing, drawn into `layer`.
  KIT.puffs = (tl, layer, at, x, y, n = 4) => {
    for (let i = 0; i < n; i += 1) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('class', 'f-paper2');
      c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 5 + i);
      c.setAttribute('opacity', '0');
      layer.append(c);
      tl.fromTo(c, { opacity: 0.9, scale: 0.4, x: 0, y: 0, transformOrigin: '50% 50%' }, { opacity: 0, scale: 1.8, x: -18 - i * 10, y: -6 - i * 3, duration: 0.6, ease: 'power2.out' }, at + i * 0.05);
    }
    return tl;
  };
})();
