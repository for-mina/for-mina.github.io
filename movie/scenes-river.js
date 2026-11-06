/* River scenes: Gapyeong wharf and Naminara immigration, then the crossing
   (ferry, zip-wire, or a coin that lands on its edge).
   Extra paint lives in scenes-river.css (loaded from here). */
(() => {
  'use strict';
  const M = window.MOVIE, K = window.KIT;
  const $ = (el, s) => el.querySelector(s);
  const $$ = (el, s) => [...el.querySelectorAll(s)];
  const rnd = K.rnd;

  const script = document.currentScript;
  if (script && script.src && !document.querySelector('link[data-rv-css]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.dataset.rvCss = '1';
    link.href = script.src.replace(/scenes-river\.js(\?.*)?$/, 'scenes-river.css');
    document.head.append(link);
  }

  /* ---------- flags (tiny, w x h, top-left at 0 0) ---------- */
  const R = (cls, x, y, w, h) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
  const FLAG = {
    kr: (w, h) => R('f-paper2', 0, 0, w, h) + `<path class="f-rv-fred" d="M${w / 2 - h * 0.27} ${h / 2} a${h * 0.27} ${h * 0.27} 0 0 1 ${h * 0.54} 0Z"/><path class="f-rv-fblue" d="M${w / 2 - h * 0.27} ${h / 2} a${h * 0.27} ${h * 0.27} 0 0 0 ${h * 0.54} 0Z"/>`,
    uz: (w, h) => R('f-rv-fblue', 0, 0, w, h) + R('f-paper2', 0, h / 3, w, h / 3) + R('f-rv-green', 0, h * 2 / 3, w, h / 3) + R('f-rv-fred', 0, h / 3 - 0.4, w, 0.8) + R('f-rv-fred', 0, h * 2 / 3 - 0.4, w, 0.8),
    jp: (w, h) => R('f-paper2', 0, 0, w, h) + `<circle class="f-rv-fred" cx="${w / 2}" cy="${h / 2}" r="${h * 0.26}"/>`,
    us: (w, h) => R('f-rv-fred', 0, 0, w, h) + R('f-paper2', 0, h * 0.2, w, h * 0.13) + R('f-paper2', 0, h * 0.47, w, h * 0.13) + R('f-paper2', 0, h * 0.74, w, h * 0.13) + R('f-rv-fblue', 0, 0, w * 0.42, h * 0.55),
    cn: (w, h) => R('f-rv-fred', 0, 0, w, h) + `<circle class="f-gold" cx="${w * 0.25}" cy="${h * 0.3}" r="${h * 0.16}"/>`,
    th: (w, h) => R('f-rv-fred', 0, 0, w, h) + R('f-paper2', 0, h * 0.18, w, h * 0.64) + R('f-rv-fblue', 0, h * 0.36, w, h * 0.28),
    de: (w, h) => R('f-rv-black', 0, 0, w, h / 3) + R('f-rv-fred', 0, h / 3, w, h / 3) + R('f-gold', 0, h * 2 / 3, w, h / 3),
    my: (w, h) => R('f-rv-fred', 0, 0, w, h) + R('f-paper2', 0, h * 0.25, w, h * 0.12) + R('f-paper2', 0, h * 0.5, w, h * 0.12) + R('f-paper2', 0, h * 0.75, w, h * 0.12) + R('f-rv-fblue', 0, 0, w * 0.45, h * 0.5) + `<circle class="f-gold" cx="${w * 0.22}" cy="${h * 0.25}" r="${h * 0.12}"/>`,
    gb: (w, h) => R('f-rv-fblue', 0, 0, w, h) + R('f-paper2', 0, h * 0.36, w, h * 0.28) + R('f-paper2', w * 0.4, 0, w * 0.2, h) + R('f-rv-fred', 0, h * 0.43, w, h * 0.14) + R('f-rv-fred', w * 0.45, 0, w * 0.1, h),
    fr: (w, h) => R('f-rv-fblue', 0, 0, w / 3, h) + R('f-paper2', w / 3, 0, w / 3, h) + R('f-rv-fred', w * 2 / 3, 0, w / 3, h),
    it: (w, h) => R('f-rv-green', 0, 0, w / 3, h) + R('f-paper2', w / 3, 0, w / 3, h) + R('f-rv-fred', w * 2 / 3, 0, w / 3, h),
    br: (w, h) => R('f-rv-green', 0, 0, w, h) + `<path class="f-gold" d="M${w / 2} ${h * 0.12} L${w * 0.88} ${h / 2} L${w / 2} ${h * 0.88} L${w * 0.12} ${h / 2}Z"/><circle class="f-rv-fblue" cx="${w / 2}" cy="${h / 2}" r="${h * 0.18}"/>`,
    ca: (w, h) => R('f-paper2', 0, 0, w, h) + R('f-rv-fred', 0, 0, w / 4, h) + R('f-rv-fred', w * 0.75, 0, w / 4, h) + `<circle class="f-rv-fred" cx="${w / 2}" cy="${h / 2}" r="${h * 0.2}"/>`,
    in: (w, h) => R('f-rv-orange', 0, 0, w, h / 3) + R('f-paper2', 0, h / 3, w, h / 3) + R('f-rv-green', 0, h * 2 / 3, w, h / 3) + `<circle class="st-rv-dome nf" cx="${w / 2}" cy="${h / 2}" r="${h * 0.12}" style="stroke:var(--rv-flag-blue)"/>`,
    nl: (w, h) => R('f-rv-fred', 0, 0, w, h / 3) + R('f-paper2', 0, h / 3, w, h / 3) + R('f-rv-fblue', 0, h * 2 / 3, w, h / 3),
    se: (w, h) => R('f-rv-fblue', 0, 0, w, h) + R('f-gold', 0, h * 0.4, w, h * 0.2) + R('f-gold', w * 0.3, 0, w * 0.14, h),
    nami: (w, h) => R('f-rv-banner', 0, 0, w, h) + `<circle class="f-paper2" cx="${w / 2}" cy="${h / 2}" r="${h * 0.24}"/><circle class="f-rv-fred" cx="${w / 2}" cy="${h / 2}" r="${h * 0.1}"/>`
  };
  const FAN = ['kr', 'uz', 'us', 'jp', 'th', 'de', 'cn', 'gb', 'my', 'fr', 'br', 'it', 'ca', 'in', 'nl', 'se', 'nami', 'kr', 'uz'];
  const flag = (kind, x, y, w = 16, h = 11) => `<g class="rv-flag" transform="translate(${x} ${y})">${(FLAG[kind] || FLAG.kr)(w, h)}</g>`;
  const pole = (x, yBase, h, kind, w = 16, fh = 11) => `<rect class="f-metal" x="${x - 1.2}" y="${yBase - h}" width="2.4" height="${h}"/><circle class="f-gold" cx="${x}" cy="${yBase - h}" r="2"/>${flag(kind, x + 1, yBase - h + 1, w, fh)}`;
  const wave = (tl, els, at, dur, { skew = 7, sx = 0.86, period = 0.32 } = {}) => {
    if (!els.length) return tl;
    const n = Math.max(1, Math.round(dur / period)) | 1;
    return tl.to(els, { skewY: skew, scaleX: sx, transformOrigin: '0% 50%', duration: period, yoyo: true, repeat: n, ease: 'sine.inOut', stagger: 0.05 }, at);
  };

  /* ---------- the zip tower: a tapered white lattice A-frame ---------- */
  const tower = (x, baseY, h, wBase, wTop = wBase * 0.34) => {
    const n = Math.max(6, Math.round(h / 26));
    let zig = '', rungs = '';
    const hw = (t) => (wBase + (wTop - wBase) * t) / 2;
    for (let i = 0; i <= n; i += 1) {
      const t = i / n, y = baseY - h * t;
      rungs += `M${x - hw(t)} ${y} H${x + hw(t)} `;
      if (i < n) {
        const t2 = (i + 1) / n, y2 = baseY - h * t2;
        zig += i % 2 ? `M${x + hw(t)} ${y} L${x - hw(t2)} ${y2} ` : `M${x - hw(t)} ${y} L${x + hw(t2)} ${y2} `;
      }
    }
    return `<g class="rv-tower">
      <path class="st-rv-tower" d="${zig}${rungs}"/>
      <path class="st-rv-tower-w" d="M${x - wBase / 2} ${baseY} L${x - wTop / 2} ${baseY - h} M${x + wBase / 2} ${baseY} L${x + wTop / 2} ${baseY - h}"/>
      <rect class="f-rv-tower st-thin" x="${x - wTop / 2 - 9}" y="${baseY - h - 9}" width="${wTop + 18}" height="9" rx="2"/>
      <rect class="f-glass st-thin" x="${x - wTop / 2 - 1}" y="${baseY - h - 22}" width="${wTop + 2}" height="13" rx="2"/>
    </g>`;
  };

  /* ---------- the NAMI ferry: side view facing right, origin = waterline centre ---------- */
  const ferry = ({ x = 0, y = 0, s = 1, flags = 11, people = true } = {}) => {
    let fan = '';
    for (let i = 0; i < flags; i += 1) {
      const a = (58 + 64 * (flags > 1 ? i / (flags - 1) : 0.5)) * Math.PI / 180;
      const len = 30 + (i % 2) * 7;
      const px = 86 + Math.cos(a) * len, py = -54 - Math.sin(a) * len;
      fan += `<path class="st-thin" d="M86 -54 L${px.toFixed(1)} ${py.toFixed(1)}"/>${flag(FAN[i % FAN.length], px, py - 8, 12, 8)}`;
    }
    let win = '';
    for (let i = 0; i < 5; i += 1) win += `<rect class="f-glass" x="${-62 + i * 24}" y="-48" width="15" height="12" rx="2"/>`;
    let rail = 'M-74 -70 H82';
    for (let i = -74; i <= 82; i += 16) rail += ` M${i} -56 V-70`;
    return `<g class="rv-ferry" transform="translate(${x} ${y}) scale(${s})">
      <g class="rv-wake"><path class="st-rv-ripple" d="M-88 -2 q-10 3 -22 1"/><path class="st-rv-ripple" d="M-92 6 q-14 4 -30 1"/><path class="st-rv-ripple" d="M-86 13 q-8 3 -20 2"/></g>
      <path class="f-rv-hull st-out" d="M-82 3 L-78 -26 L86 -26 L97 -10 L93 3 Z"/>
      <rect class="f-rv-navy" x="-78" y="-14" width="172" height="3.5"/>
      <path class="f-rv-navy" d="M66 -26 L86 -26 L95 -13 L66 -13 Z"/>
      <text class="k-rv-white" x="80" y="-15.5" font-size="10" text-anchor="middle">NAMI</text>
      <rect class="f-rv-hull-shade" x="-76" y="-56" width="150" height="4"/>
      <rect class="f-rv-hull st-thin" x="-70" y="-52" width="136" height="26" rx="3"/>
      ${win}
      <rect class="f-rv-hull st-thin" x="-74" y="-86" width="26" height="30" rx="2"/><rect class="f-glass" x="-70" y="-82" width="18" height="11" rx="2"/>
      <path class="st-thin" d="${rail}"/>
      <path class="st-thin" d="M-60 -70 V-128 M-10 -70 V-128 M40 -70 V-128 M72 -70 V-128"/>
      <rect class="f-rv-hull st-thin" x="-66" y="-133" width="146" height="6" rx="3"/>
      ${pole(-30, -70, 16, 'kr', 11, 7.5)}${pole(12, -70, 16, 'uz', 11, 7.5)}${pole(60, -70, 16, 'nami', 11, 7.5)}
      ${fan}
      ${people ? K.person('me', { x: 16, y: -56, s: 0.82 }) + K.person('mina', { x: 44, y: -56, s: 0.82 }) : ''}
      <path class="st-rv-ripple" d="M96 -1 q8 -4 16 2"/>
    </g>`;
  };

  /* ---------- small helpers on people ---------- */
  const scarf = (person, who) => {
    person.insertAdjacentHTML('beforeend', `<path class="rv-scarf ${who === 'mina' ? 'st-rv-scarf-mina' : 'st-rv-scarf-me'}" d="M-7 -34 q-7 1 -12 9"/>`);
    return person.lastElementChild;
  };
  const beanie = (person) => $$(person, '.p-head > path.f-ink2, .p-head > rect.f-ink, .p-head > path.f-door, .p-head > rect.f-door-panel, .p-head > circle.f-gold');
  const gull = (x, y, s = 1) => `<g class="rv-gull" transform="translate(${x} ${y}) scale(${s})">
    <ellipse class="f-paper2 st-thin" cx="0" cy="-4" rx="6" ry="3.4"/><circle class="f-paper2 st-thin" cx="5" cy="-7" r="2.6"/>
    <path class="f-gold" d="M7.4 -7.4 l3.4 1 l-3.4 1.2z"/><circle class="f-ink" cx="5.6" cy="-7.6" r="0.7"/>
    <path class="rv-wing f-paper2 st-thin" d="M-2 -5 Q-6 -14 -13 -11 Q-9 -7 -1 -3 Z"/></g>`;
  const skyGull = (x, y) => `<path class="rv-skygull st-thin" transform="translate(${x} ${y})" d="M-7 0 q3.5 -4 7 0 q3.5 -4 7 0"/>`;
  const ripples = (y0, y1, n, width = 720) => {
    let s = '';
    for (let i = 0; i < n; i += 1) { const x = (i * 97) % width, y = y0 + ((i * 53) % (y1 - y0)); s += `<path class="st-rv-ripple" d="M${x} ${y} q7 -3 14 0 t14 0"/>`; }
    return `<g class="rv-ripples">${s}</g>`;
  };
  const mmss = (v) => { v = Math.max(0, Math.round(v)); return String(Math.floor(v / 60)).padStart(2, '0') + ':' + String(v % 60).padStart(2, '0'); };

  /* =====================================================================
     1. Gapyeong wharf: park under the P, walk to Naminara immigration
     ===================================================================== */
  M.scene('wharf', (ctx) => {
    const { st } = ctx;
    const END = 5.5;
    ctx.add(K.sky('noon'));
    ctx.add(K.sun(300, 86, 16));
    const clouds = ctx.add(`<g>${K.cloud(70, 150, 0.8)}${K.cloud(230, 110, 0.6)}${K.cloud(400, 170, 0.7)}</g>`);
    ctx.add(`<g>${K.ridge(262, 60, 720, 7, 'f-mtn-far', 1.3)}${K.ridge(292, 34, 720, 9, 'f-mtn-2', 2.1)}</g>`);
    ctx.add(`<g><rect y="300" width="360" height="40" fill="url(#gk-river)"/>${ripples(306, 334, 6, 360)}</g>`);
    ctx.add('<rect class="f-rv-paving" y="338" width="360" height="174"/><rect class="f-rv-paving2" y="338" width="360" height="3"/><rect class="f-rv-paving2" y="500" width="360" height="1.5" opacity="0.7"/>');
    // the zip-wire tower at the car park, cables off towards the island
    ctx.add(`<g>${tower(30, 344, 250, 36)}<path class="st-rv-cable" d="M34 90 L360 74 M34 96 L360 82"/></g>`);
    // flag poles along the back of the plaza
    let poles = '';
    const kinds = ['kr', 'uz', 'jp', 'th', 'de', 'nami', 'cn'];
    for (let i = 0; i < 7; i += 1) poles += pole(20 + i * 52, 344, 100 - (i % 2) * 6, kinds[i]);
    const flagRow = ctx.add(`<g>${poles}</g>`);
    // the black geodesic dome ticket hall
    const dome = ctx.add(`<g class="rv-dome" transform="translate(84 470)">
      <path class="f-rv-black" d="M-76 0 A76 76 0 0 1 76 0 Z"/>
      <path class="st-rv-dome" d="M-69 -32 Q0 -52 69 -32 M-53 -53 Q0 -69 53 -53 M-26 -71 Q0 -76 26 -71 M-48 0 L-36 -52 L-10 -74 M48 0 L36 -52 L10 -74 M-36 -52 L0 -46 L36 -52 M-10 -74 L0 -46 L10 -74 M-69 -32 L-36 -52 M69 -32 L36 -52 M-53 -53 L-10 -74 M53 -53 L10 -74"/>
      <path class="f-rv-fred" d="M0 -58 l2 4.3 l4.6 .5 l-3.4 3.2 l.9 4.6 l-4.1 -2.3 l-4.1 2.3 l.9 -4.6 l-3.4 -3.2 l4.6 -.5z"/>
      <text class="k-rv-white" x="0" y="-31" font-size="13" text-anchor="middle">NAMI ISLAND</text>
      <text class="k-mono k-light" x="0" y="-19" font-size="6.5" text-anchor="middle" letter-spacing="0.7">NAMINARA REPUBLIC</text>
      <rect class="f-glass st-thin" x="-22" y="-26" width="44" height="26" rx="1"/><path class="st-thin" d="M0 -26 V0"/>
    </g>`);
    // the red hanok immigration gate with its grey tiled roof and blue banners
    const gate = ctx.add(`<g class="rv-gate">
      <rect class="f-rv-red-deep" x="240" y="405" width="7" height="65"/><rect class="f-rv-red-deep" x="312" y="405" width="7" height="65"/>
      <rect class="f-rv-banner rv-banner" x="248" y="408" width="9" height="26"/><rect class="f-rv-banner rv-banner" x="302" y="408" width="9" height="26"/>
      <rect class="f-rv-red" x="214" y="395" width="11" height="75"/><rect class="f-rv-red" x="335" y="395" width="11" height="75"/>
      <rect class="f-rv-red" x="200" y="388" width="160" height="10"/>
      <path class="f-rv-roof" d="M190 396 Q280 388 370 396 L350 364 Q280 355 210 364 Z"/>
      <path class="st-rv-roof" d="M200 387 Q280 380 360 387 M209 377 Q280 371 351 377"/>
      <rect class="f-rv-black" x="206" y="357" width="148" height="6" rx="2"/>
      <rect class="f-rv-black st-thin" x="238" y="376" width="84" height="17" rx="2"/>
      <text class="k-rv-white" x="280" y="389" font-size="9.5" text-anchor="middle" letter-spacing="0.5">IMMIGRATION</text>
      <g class="rv-banner-f"><rect class="f-rv-banner rv-banner" x="218" y="406" width="12" height="36"/><circle class="f-paper2" cx="224" cy="424" r="2.8"/><circle class="f-rv-fred" cx="224" cy="424" r="1.1"/></g>
      <g class="rv-banner-f"><rect class="f-rv-banner rv-banner" x="336" y="406" width="12" height="36"/><circle class="f-paper2" cx="342" cy="424" r="2.8"/><circle class="f-rv-fred" cx="342" cy="424" r="1.1"/></g>
    </g>`);
    const ostrich = ctx.add(K.ostrich(318, 472, 74, true));
    const booth = ctx.add(`<g><rect class="f-wood st-out" x="288" y="446" width="30" height="26" rx="2"/><rect class="f-cream" x="292" y="451" width="22" height="6" rx="1"/></g>`);
    const pass = ctx.add(`<g class="rv-passports">
      <g transform="translate(294 439)"><rect class="f-rv-navy st-thin" x="-5" y="-3.5" width="10" height="7" rx="1"/><circle class="st-stamp rv-mark" cx="0" cy="0" r="2.6" stroke-width="1.6"/></g>
      <g transform="translate(308 439)"><rect class="f-rv-navy st-thin" x="-5" y="-3.5" width="10" height="7" rx="1"/><circle class="st-stamp rv-mark" cx="0" cy="0" r="2.6" stroke-width="1.6"/></g>
    </g>`);
    const stamp = ctx.add(`<g class="rv-stamp" transform="translate(294 434)"><rect class="f-ink2" x="-3" y="-15" width="6" height="11" rx="2"/><rect class="f-rv-red st-thin" x="-7" y="-5" width="14" height="5" rx="1"/></g>`);
    ctx.add('<rect class="f-asphalt" y="512" width="360" height="128"/><rect class="f-metal" y="512" width="360" height="3"/><path class="st-lane" d="M20 560 V518 M200 560 V518" stroke-dasharray="none" stroke-width="3"/>');
    ctx.add('<g transform="translate(178 440)"><rect class="f-metal" x="-1.5" y="22" width="3" height="50"/><rect class="f-sign-blue st-out" x="-12" y="0" width="24" height="24" rx="3"/><text class="k-rv-white" x="0" y="18" font-size="16" text-anchor="middle">P</text></g>');
    const car = ctx.add(`<g transform="translate(-150 552)">${K.car({})}</g>`);
    const heads = $$(car, '.k-head');
    const mina = ctx.add(K.person('mina', { x: 216, y: 548, s: 1 }));
    const me = ctx.add(K.person('me', { x: 190, y: 548, s: 1 }));
    const hud = ctx.add(K.hud(16, 30, 170, 50,
      `<text class="k-mono k-light" x="12" y="18" font-size="9.5">naminara immigration</text>
       <text class="k-mono k-light" x="12" y="38" font-size="10">queue 0, visas</text>
       <text class="k-mono" data-v x="112" y="39" font-size="17" style="fill:var(--color-gold)">0</text>
       <text class="k-mono k-light" x="128" y="38" font-size="10">/ 2</text>`));
    const tl = gsap.timeline();
    gsap.set([mina, me], { opacity: 0 });
    gsap.set($$(pass, '.rv-mark'), { scale: 0, transformOrigin: '50% 50%' });

    wave(tl, $$(flagRow, '.rv-flag'), 0, END);
    tl.to($$(gate, '.rv-banner'), { skewX: 4, transformOrigin: '50% 0%', duration: 0.4, yoyo: true, repeat: 13, ease: 'sine.inOut', stagger: 0.1 }, 0)
      .to(clouds, { x: -24, duration: END, ease: 'none' }, 0)
      .from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, 0.05)
      .to(car, { x: 112, duration: 1.4, ease: 'power3.out' }, 0.2);
    K.wheels(tl, car, 0.2, 1.4, 1.5);
    tl.to($(car, '.car-body'), { rotation: -2.5, transformOrigin: '50% 100%', duration: 0.14, yoyo: true, repeat: 1, ease: 'power1.out' }, 1.5);
    ctx.sfx(tl, 'click', 1.65);
    tl.to(heads, { opacity: 0, duration: 0.2 }, 1.75)
      .to([mina, me], { opacity: 1, duration: 0.2, stagger: 0.08 }, 1.8)
      .to(mina, { x: '+=52', y: '-=72', scale: 0.9, duration: 1.2, ease: 'none' }, 1.95)
      .to(me, { x: '+=52', y: '-=72', scale: 0.9, duration: 1.2, ease: 'none' }, 2.05);
    K.walk(tl, mina, 1.95, 1.2);
    K.walk(tl, me, 2.05, 1.2);
    // the ostrich stamps two passports, thud, thud
    const slam = (at, dx) => {
      if (dx) tl.to(stamp, { x: `+=${dx}`, duration: 0.12, ease: 'power1.inOut' }, at - 0.3);
      tl.to(stamp, { y: '-=12', duration: 0.18, ease: 'power2.out' }, at - 0.2)
        .to(stamp, { y: '+=12', duration: 0.07, ease: 'power4.in' }, at)
        .to(stamp, { scaleY: 0.72, transformOrigin: '50% 100%', duration: 0.06, yoyo: true, repeat: 1 }, at + 0.07)
        .to($(ostrich, '.o-body'), { y: 2, duration: 0.06, yoyo: true, repeat: 1 }, at + 0.07)
        .to(booth, { y: 1.5, duration: 0.05, yoyo: true, repeat: 1 }, at + 0.07);
      ctx.sfx(tl, 'thud', at + 0.07);
    };
    slam(3.3, 0);
    tl.to($$(pass, '.rv-mark')[0], { scale: 1, duration: 0.25, ease: 'back.out(3)' }, 3.4);
    K.count(tl, $(hud, '[data-v]'), 3.4, 0.05, 0, 1, (v) => String(Math.round(v)));
    slam(3.75, 14);
    tl.to($$(pass, '.rv-mark')[1], { scale: 1, duration: 0.25, ease: 'back.out(3)' }, 3.85);
    K.count(tl, $(hud, '[data-v]'), 3.85, 0.05, 1, 2, (v) => String(Math.round(v)));
    // squint at "me"
    tl.to($(ostrich, '.o-lid'), { y: 3.5, duration: 0.2 }, 3.95)
      .to($(ostrich, '.o-brow'), { rotation: 14, transformOrigin: '0% 50%', duration: 0.2 }, 3.95)
      .to($(ostrich, '.o-neckhead'), { rotation: 10, transformOrigin: '20% 100%', duration: 0.3, ease: 'power2.out' }, 3.95)
      .to(me, { rotation: -3, transformOrigin: '50% 100%', duration: 0.2, yoyo: true, repeat: 1 }, 4.1)
      .to($(ostrich, '.o-lid'), { y: 0, duration: 0.2 }, 4.55)
      .to($(ostrich, '.o-brow'), { rotation: 0, duration: 0.2 }, 4.55)
      .to($(ostrich, '.o-neckhead'), { rotation: 0, duration: 0.3, ease: 'power2.inOut' }, 4.55)
      // then waves them through, reluctantly
      .to($(ostrich, '.o-wing'), { rotation: -55, transformOrigin: '12% 60%', duration: 0.16, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 4.7);
    ctx.sfx(tl, 'pop', 4.75);
    K.hop(tl, mina, 4.85, 14);
    K.hop(tl, me, 4.95, 10);
    tl.to([mina, me], { x: '+=22', duration: 0.4, ease: 'power1.in' }, 5.1);
    K.walk(tl, mina, 5.1, 0.4);
    K.walk(tl, me, 5.1, 0.4);
    tl.to({}, { duration: 0.1 }, END);

    ctx.say('Naminara immigration. Visas, please.', 1.9, 2.1);
    ctx.say('Approved. Reluctantly.', 4.5, 1.0);
    return tl;
  });

  /* =====================================================================
     2. The ferry: five minutes across the North Han River
     ===================================================================== */
  M.scene('cross-ferry', (ctx) => {
    const END = 6.3;
    ctx.add(K.sky('noon'));
    ctx.add(K.sun(66, 84, 18));
    const clouds = ctx.add(`<g>${K.cloud(150, 130, 0.8)}${K.cloud(300, 90, 0.7)}${K.cloud(440, 150, 0.6)}</g>`);
    ctx.add(`<g>${K.ridge(304, 58, 720, 7, 'f-mtn-far', 1.3)}${K.ridge(336, 40, 720, 9, 'f-mtn-2', 2.1)}${K.ridge(360, 26, 720, 11, 'f-mtn-1', 0.7)}</g>`);
    // the island, autumn: rust metasequoias and a yellow ginkgo glow
    ctx.add(`<g class="rv-island"><circle cx="296" cy="352" r="52" fill="url(#gk-glow)" opacity="0.7"/>
      <path class="f-land2" d="M196 384 Q230 362 280 366 Q320 356 360 360 L360 392 L196 392 Z"/>
      ${K.tree('meta', 222, 374, 54)}${K.tree('ginkgo', 248, 374, 40)}${K.tree('meta', 268, 372, 64)}${K.tree('pine', 292, 372, 34)}${K.tree('ginkgo', 312, 370, 44)}${K.tree('meta', 334, 370, 60)}${K.tree('ginkgo', 356, 372, 38)}${K.tree('meta', 206, 378, 44)}
      <path class="f-rv-concrete" d="M300 382 H360 V392 H300 Z"/></g>`);
    // the wharf we leave: dome and flags on the shore, a pier in front with the officer
    ctx.add(`<g><path class="f-rv-black" d="M-14 374 A30 30 0 0 1 46 374 Z"/>
      ${pole(60, 376, 44, 'kr', 12, 8)}
      <path class="f-rv-concrete st-thin" d="M0 374 L84 374 L96 392 L0 392 Z"/></g>`);
    ctx.add('<rect y="388" width="360" height="252" fill="url(#gk-river)"/>');
    const rip = ctx.add(ripples(420, 600, 10));
    const gulls = ctx.add(`<g>${skyGull(250, 150)}${skyGull(290, 128)}</g>`);
    const boat = ctx.add(ferry({ x: 100, y: 492, s: 1.15, flags: 9 }));
    const wharf = ctx.add(`<g class="rv-wharf"><rect class="f-rv-roof" x="10" y="468" width="5" height="14"/><rect class="f-rv-roof" x="78" y="468" width="5" height="14"/>
      <path class="f-rv-concrete st-thin" d="M0 452 L98 452 L98 470 L0 470 Z"/>${pole(90, 452, 42, 'uz', 12, 8)}${K.ostrich(46, 454, 60)}</g>`);
    const meOnDeck = $(boat, '.person[data-who="me"]'), minaOnDeck = $(boat, '.person[data-who="mina"]');
    const minaScarf = scarf(minaOnDeck, 'mina');
    boat.insertAdjacentHTML('beforeend', gull(250, -230, 0.9));
    const bird = boat.lastElementChild;
    boat.insertAdjacentHTML('beforeend', K.bubble(14, -170, '...?', { w: 40, size: 14 }));
    const bub = boat.lastElementChild;
    const hud = ctx.add(K.hud(190, 30, 154, 58,
      `<text class="k-mono k-light" x="12" y="18" font-size="9.5">crossing, nami ferry</text>
       <text class="k-mono" data-t x="12" y="42" font-size="20" style="fill:var(--color-gold)">05:00</text>
       <text class="k-mono k-light" x="12" y="54" font-size="8.5">hdg 078°, spd 9 kn</text>`));
    const tl = gsap.timeline();
    gsap.set(bub, { scale: 0, transformOrigin: '0% 100%' });

    wave(tl, [...$$(boat, '.rv-flag'), ...$$(wharf, '.rv-flag')], 0, END, { period: 0.26 });
    tl.from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, 0.05)
      .to(clouds, { x: -30, duration: END, ease: 'none' }, 0)
      .to(rip, { x: -60, duration: END, ease: 'none' }, 0)
      .to($$(gulls, '.rv-skygull'), { scaleY: -0.6, transformOrigin: '50% 50%', duration: 0.22, yoyo: true, repeat: 27, ease: 'sine.inOut', stagger: 0.1 }, 0)
      .to(gulls, { x: -120, y: 10, duration: END, ease: 'none' }, 0)
      // rocking, anticipation, the crossing, then the dock bump
      .to(boat, { rotation: 1.4, transformOrigin: '50% 100%', duration: 0.7, yoyo: true, repeat: 9, ease: 'sine.inOut' }, 0)
      .to(boat, { x: '-=8', duration: 0.4, ease: 'power1.out' }, 0.3)
      .to(boat, { x: '+=140', duration: 4.2, ease: 'power1.inOut' }, 0.7)
      .to($$(boat, '.rv-wake path'), { scaleX: 1.6, opacity: 0.1, transformOrigin: '100% 50%', duration: 0.5, repeat: 8, stagger: 0.12, ease: 'power1.out' }, 0.8)
      .to(boat, { scaleX: 0.95, transformOrigin: '100% 100%', duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 4.9)
      .to(boat, { rotation: -2.5, duration: 0.12 }, 4.9)
      .to(boat, { rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, 5.02);
    ctx.sfx(tl, 'splash', 0.75);
    ctx.sfx(tl, 'thud', 4.98);
    K.count(tl, $(hud, '[data-t]'), 0.7, 4.2, 300, 0, mmss);
    // scarf and the officer waving goodbye
    tl.to(minaScarf, { scaleY: 0.5, skewX: 8, transformOrigin: '100% 0%', duration: 0.2, yoyo: true, repeat: 29, ease: 'sine.inOut' }, 0.6)
      .to($(wharf, '.o-wing'), { rotation: -60, transformOrigin: '12% 60%', duration: 0.16, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 1.1)
      .to($(wharf, '.o-neckhead'), { rotation: -6, transformOrigin: '20% 100%', duration: 0.3, yoyo: true, repeat: 3 }, 1.1);
    // the funny beat: a gull picks my beanie as a landing pad
    tl.to($(bird, '.rv-wing'), { rotation: 40, transformOrigin: '90% 90%', duration: 0.14, yoyo: true, repeat: 9, ease: 'sine.inOut' }, 2.3)
      .to(bird, { x: 16, y: -104, duration: 1.1, ease: 'power2.out' }, 2.4)
      .to(bird, { scaleY: 0.7, transformOrigin: '50% 100%', duration: 0.1, yoyo: true, repeat: 1 }, 3.5)
      .to($(meOnDeck, '.p-head'), { rotation: -12, transformOrigin: '50% 100%', duration: 0.3, ease: 'back.out(2)' }, 3.6)
      .to(bub, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, 3.75)
      .to(bub, { scale: 0, duration: 0.2 }, 4.9)
      .to($(meOnDeck, '.p-head'), { rotation: 0, duration: 0.3 }, 4.9);
    ctx.sfx(tl, 'pop', 3.55);
    K.hop(tl, minaOnDeck, 3.9, 8);
    K.hop(tl, minaOnDeck, 4.3, 8);
    tl.to({}, { duration: 0.1 }, END);

    ctx.say('Five minutes on the river. Flags: all of them.', 0.4, 2.6);
    ctx.say('Passengers: 2. Plus one gull.', 3.7, 2.2);
    return tl;
  });

  /* =====================================================================
     3. The zip-wire: 80 m up, 940 m across
     ===================================================================== */
  M.scene('cross-zip', (ctx) => {
    const END = 5.7;
    ctx.add(K.sky('noon'));
    ctx.add(K.sun(300, 64, 16));
    const clouds = ctx.add(`<g>${K.cloud(190, 150, 0.7)}${K.cloud(330, 230, 0.6)}${K.cloud(120, 250, 0.5)}</g>`);
    ctx.add(`<g>${K.ridge(360, 50, 720, 7, 'f-mtn-far', 1.3)}${K.ridge(392, 30, 720, 9, 'f-mtn-2', 2.1)}</g>`);
    ctx.add(`<g class="rv-island"><path class="f-land2" d="M236 428 Q290 414 360 416 L360 436 L236 436 Z"/>
      ${K.tree('meta', 258, 424, 36)}${K.tree('ginkgo', 282, 422, 30)}${K.tree('meta', 304, 420, 42)}${K.tree('ginkgo', 328, 418, 32)}${K.tree('meta', 350, 418, 40)}</g>`);
    ctx.add('<rect y="430" width="360" height="210" fill="url(#gk-river)"/>');
    const rip = ctx.add(ripples(450, 620, 12));
    // near bank with the tower
    ctx.add('<path class="f-rv-paving" d="M0 522 Q70 516 140 524 L150 640 L0 640 Z"/><path class="f-rv-concrete" d="M0 522 Q70 516 140 524 L142 530 Q70 522 0 528 Z"/>');
    ctx.add(tower(71, 476, 380, 74));
    ctx.add(`<g><rect class="f-rv-black st-thin" x="30" y="474" width="82" height="50" rx="3"/>
      <rect class="f-rv-led" x="38" y="480" width="40" height="22" rx="2"/><path class="st-thin" d="M44 487 H70 M44 493 H62" style="stroke:var(--rv-black)"/>
      <text class="k-rv-white" x="88" y="492" font-size="7.5" text-anchor="middle">SKY</text><text class="k-rv-white" x="88" y="501" font-size="7.5" text-anchor="middle">LINE</text>
      <text class="k-text k-light" x="71" y="517" font-size="8" text-anchor="middle">스카이라인 짚와이어</text></g>`);
    const C1 = { x0: 72, y0: 94, x1: 390, y1: 318 }, C2 = { x0: 79, y0: 107, x1: 397, y1: 331 };
    ctx.add(`<path class="st-rv-cable" d="M${C1.x0} ${C1.y0} L${C1.x1} ${C1.y1} M${C2.x0} ${C2.y0} L${C2.x1} ${C2.y1}"/>`);
    const at = (c, s) => ({ x: c.x0 + (c.x1 - c.x0) * s, y: c.y0 + (c.y1 - c.y0) * s });
    // river glitter under the cable
    let g = '';
    const spots = [];
    for (let i = 0; i < 14; i += 1) {
      const x = 130 + i * 16 + rnd(-6, 6), y = 446 + rnd(0, 110);
      spots.push(x);
      g += `<path class="rv-glit f-paper2" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" d="M0 -5 L1.5 0 L0 5 L-1.5 0 Z M-5 0 L0 -1.5 L5 0 L0 1.5 Z"/>`;
    }
    const glitter = ctx.add(`<g>${g}</g>`);
    const rider = (who, c, s) => {
      const p = at(c, s);
      return `<g class="rv-rider" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})">
        <g class="rv-speed" transform="rotate(35)" opacity="0"><path class="st-rv-speed" d="M-22 -6 H-42 M-26 3 H-58 M-20 12 H-36 M-28 21 H-52"/></g>
        <circle class="f-rv-black2" cx="-5" cy="-1" r="3.4"/><circle class="f-rv-black2" cx="5" cy="-1" r="3.4"/>
        <rect class="f-metal st-thin" x="-8" y="0" width="16" height="7" rx="2"/>
        <path class="st-rv-strap" d="M-4 7 L-11 21 M4 7 L11 21"/>
        ${K.person(who, { x: 0, y: 74, s: 1.05, pose: 'hang' })}
      </g>`;
    };
    const rMe = ctx.add(rider('me', C2, 0.02));
    const rMina = ctx.add(rider('mina', C1, 0.11));
    const pMe = $(rMe, '.person'), pMina = $(rMina, '.person');
    const sMe = scarf(pMe, 'me'), sMina = scarf(pMina, 'mina');
    const hat = beanie(pMe);
    rMina.insertAdjacentHTML('beforeend', K.bubble(-26, -66, 'Wheee!', { w: 58, size: 15 }));
    const bMina = rMina.lastElementChild;
    rMe.insertAdjacentHTML('beforeend', K.bubble(-44, -70, 'AAAAAA', { w: 86, size: 15 }));
    const bMe = rMe.lastElementChild;
    const hud = ctx.add(K.hud(200, 30, 144, 58,
      `<text class="k-mono k-light" x="12" y="18" font-size="9.5">skyline zip-wire</text>
       <text class="k-mono k-light" x="12" y="37" font-size="9">alt</text><text class="k-mono" data-alt x="36" y="38" font-size="15" style="fill:var(--color-gold)">80</text><text class="k-mono k-light" x="60" y="37" font-size="9">m</text>
       <text class="k-mono k-light" x="12" y="53" font-size="9">spd</text><text class="k-mono" data-spd x="36" y="54" font-size="15" style="fill:var(--color-gold)">0</text><text class="k-mono k-light" x="60" y="53" font-size="9">km/h</text>`));
    const tl = gsap.timeline();
    gsap.set([bMina, bMe], { scale: 0, transformOrigin: '0% 100%' });
    gsap.set($$(glitter, '.rv-glit'), { scale: 0, transformOrigin: '50% 50%' });

    const LAUNCH = 1.25, RIDE = 3.6;
    tl.from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, 0.05)
      .to(clouds, { x: -20, duration: END, ease: 'none' }, 0)
      .to(rip, { x: -40, duration: END, ease: 'none' }, 0);
    // dangling at the top, a small lean back, then off
    [[rMina, pMina, C1, 0], [rMe, pMe, C2, 0.3]].forEach(([r, p, c, d]) => {
      const end = at(c, 1.1);
      tl.to(p, { rotation: 4, transformOrigin: '50% 0%', duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.1 + d)
        .to(r, { x: '-=5', y: '-=3.5', duration: 0.3, ease: 'power1.out' }, LAUNCH - 0.35 + d)
        .to(r, { x: end.x, y: end.y, duration: RIDE, ease: 'power2.in' }, LAUNCH + d)
        .to($(r, '.rv-speed'), { opacity: 1, duration: 0.4 }, LAUNCH + 0.8 + d)
        .to($(r, '.rv-speed'), { x: -6, duration: 0.08, yoyo: true, repeat: 25, ease: 'none' }, LAUNCH + 0.8 + d)
        .to(p, { rotation: -9, transformOrigin: '50% 0%', duration: 0.35, ease: 'power1.out' }, LAUNCH + d)
        .to(p, { rotation: -4, duration: 0.5, yoyo: true, repeat: 5, ease: 'sine.inOut' }, LAUNCH + 0.35 + d)
        .to($$(p, '.p-leg-l'), { rotation: 22, transformOrigin: '50% 0%', duration: 0.28, yoyo: true, repeat: 11, ease: 'sine.inOut' }, LAUNCH + d)
        .to($$(p, '.p-leg-r'), { rotation: -22, transformOrigin: '50% 0%', duration: 0.28, yoyo: true, repeat: 11, ease: 'sine.inOut' }, LAUNCH + 0.1 + d);
    });
    tl.to([sMina, sMe], { scaleY: 0.4, skewX: 10, transformOrigin: '100% 0%', duration: 0.14, yoyo: true, repeat: 23, ease: 'sine.inOut', stagger: 0.07 }, LAUNCH + 0.2);
    ctx.sfx(tl, 'whoosh', LAUNCH + 0.1);
    K.count(tl, $(hud, '[data-alt]'), LAUNCH, RIDE, 80, 0, (v) => String(Math.round(v)));
    K.count(tl, $(hud, '[data-spd]'), LAUNCH, 2.2, 0, 50, (v) => String(Math.round(v)));
    // bubbles: a clean "Wheee!" and a long shaky "AAAAAA"
    tl.to(bMina, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, LAUNCH + 0.45)
      .to(bMe, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, LAUNCH + 0.65)
      .to(bMe, { rotation: 5, x: '+=3', duration: 0.07, yoyo: true, repeat: 31, ease: 'none' }, LAUNCH + 1.0)
      .to([bMina, bMe], { scale: 0, duration: 0.2, ease: 'power2.in' }, LAUNCH + 2.9);
    ctx.sfx(tl, 'pop', LAUNCH + 0.45);
    ctx.sfx(tl, 'boing', LAUNCH + 0.65);
    // my beanie nearly flies off
    tl.to(hat, { y: -10, rotation: 24, transformOrigin: '50% 100%', duration: 0.3, ease: 'power2.out' }, LAUNCH + 1.5)
      .to(hat, { y: -13, duration: 0.12, yoyo: true, repeat: 7, ease: 'sine.inOut' }, LAUNCH + 1.8)
      .to(hat, { y: 0, rotation: 0, duration: 0.4, ease: 'back.out(2)' }, LAUNCH + 2.85);
    ctx.sfx(tl, 'sparkle', LAUNCH + 1.6);
    // glitter pops along the water under them
    $$(glitter, '.rv-glit').forEach((el, i) => {
      const t = LAUNCH + 0.9 + ((spots[i] - 130) / 230) * 2.3;
      tl.to(el, { scale: 1, duration: 0.2, ease: 'back.out(2)' }, t).to(el, { scale: 0, duration: 0.3, ease: 'power1.in' }, t + 0.25);
    });
    tl.to({}, { duration: 0.1 }, END);

    ctx.say('Zip-wire: 80 m up, 940 m across. Deep breath.', 0.3, 2.3);
    ctx.say('Mina: Wheee! Me: a sound not in any dictionary.', 2.9, 2.6);
    return tl;
  });

  /* =====================================================================
     4. Decide there: the Naminara coin lands on its edge
     ===================================================================== */
  M.scene('cross-coin', (ctx) => {
    const END = 6.3;
    ctx.add(K.sky('noon'));
    ctx.add(K.sun(292, 80, 16));
    const clouds = ctx.add(`<g>${K.cloud(90, 140, 0.8)}${K.cloud(250, 110, 0.6)}${K.cloud(420, 170, 0.7)}</g>`);
    ctx.add(`<g>${K.ridge(286, 54, 720, 7, 'f-mtn-far', 1.3)}${K.ridge(316, 34, 720, 9, 'f-mtn-2', 2.1)}</g>`);
    ctx.add(`<g class="rv-island"><path class="f-land2" d="M160 346 Q230 332 300 336 Q340 334 360 338 L360 352 L160 352 Z"/>
      ${K.tree('meta', 190, 344, 30)}${K.tree('ginkgo', 214, 343, 24)}${K.tree('meta', 238, 342, 34)}${K.tree('ginkgo', 270, 340, 26)}${K.tree('meta', 296, 340, 32)}${K.tree('pine', 322, 340, 22)}${K.tree('meta', 346, 340, 30)}</g>`);
    ctx.add('<rect y="350" width="360" height="86" fill="url(#gk-river)"/>');
    const rip = ctx.add(ripples(364, 426, 8));
    ctx.add(tower(44, 436, 296, 44));
    ctx.add(`<path class="st-rv-cable" d="M41 142 L360 334 M47 150 L360 342"/><rect class="f-rv-black" x="24" y="414" width="40" height="22" rx="2"/>`);
    const boat = ctx.add(ferry({ x: 282, y: 428, s: 0.4, flags: 7, people: false }));
    let rail = 'M0 441 H360';
    for (let i = 0; i < 11; i += 1) rail += ` M${8 + i * 35} 436 V450`;
    ctx.add(`<rect class="f-rv-paving" y="436" width="360" height="204"/><rect class="f-rv-concrete" y="436" width="360" height="6"/><path class="st-thin" d="${rail}"/><rect class="f-rv-paving2" y="500" width="360" height="1.5" opacity="0.7"/><rect class="f-rv-paving2" y="586" width="360" height="1.5" opacity="0.5"/>`);
    const me = ctx.add(K.person('me', { x: 92, y: 522, s: 1.15 }));
    const mina = ctx.add(K.person('mina', { x: 140, y: 522, s: 1.15 }));
    const coin = ctx.add(`<g class="rv-coin" transform="translate(108 500) scale(0.45)">
      <rect class="f-rv-coin-edge" x="-3" y="-34" width="6" height="68" rx="3"/>
      <g class="rv-face-a"><circle class="f-rv-coin st-rv-coin" r="34"/><circle class="st-rv-coin" r="28" stroke-dasharray="3 3"/>
        <path class="st-rv-coin" d="M-4 6 C-2 14 -8 18 -10 24" stroke-width="5"/>
        <ellipse class="f-rv-coin-deep" cx="-2" cy="-2" rx="11" ry="9"/><path class="f-rv-coin-deep" d="M8 -3 L20 -1 L8 2 Z"/>
        <circle class="f-rv-coin" cx="1" cy="-4" r="2.4"/><circle class="f-rv-coin-deep" cx="1.6" cy="-3.6" r="1.1"/>
        <path class="f-rv-coin-deep" d="M-10 -10 C-8 -18 6 -18 6 -10 Z"/>
        <text class="k-mono" x="0" y="-16" font-size="6" text-anchor="middle" style="fill:var(--rv-coin-deep)">NAMINARA</text>
        <text class="k-mono" x="0" y="23" font-size="6" text-anchor="middle" style="fill:var(--rv-coin-deep)">· 1 NAMI ·</text></g>
      <g class="rv-face-b" opacity="0"><circle class="f-rv-coin st-rv-coin" r="34"/><circle class="st-rv-coin" r="28" stroke-dasharray="3 3"/>
        <path class="f-rv-coin-deep" d="M-19 8 L-17 -3 H14 L20 4 L18 8 Z"/><rect class="f-rv-coin-deep" x="-14" y="-11" width="24" height="8" rx="1"/>
        <path class="st-rv-coin" d="M-8 -11 V-18 M-1 -11 V-20 M6 -11 V-18" stroke-width="1.6"/>
        <path class="st-rv-coin" d="M-26 12 q6 -3 12 0 t12 0 t12 0 t12 0" stroke-width="1.6"/>
        <text class="k-mono" x="0" y="-22" font-size="6" text-anchor="middle" style="fill:var(--rv-coin-deep)">FERRY</text>
        <text class="k-mono" x="0" y="24" font-size="6" text-anchor="middle" style="fill:var(--rv-coin-deep)">2026</text></g>
    </g>`);
    const A = $(coin, '.rv-face-a'), B = $(coin, '.rv-face-b');
    let sp = '';
    for (let i = 0; i < 5; i += 1) { const a = -Math.PI / 2 + i * 1.25; sp += `<path class="rv-spark f-gold" transform="translate(${(206 + Math.cos(a) * 34).toFixed(1)} ${(500 + Math.sin(a) * 34).toFixed(1)})" d="M0 -5 L1.5 0 L0 5 L-1.5 0 Z M-5 0 L0 -1.5 L5 0 L0 1.5 Z"/>`; }
    const sparks = ctx.add(`<g>${sp}</g>`);
    const q = ctx.add(K.bubble(106, 412, '?', { w: 26, size: 20 }));
    const hud = ctx.add(K.hud(16, 30, 182, 62,
      `<text class="k-mono k-light" data-l1 x="12" y="19" font-size="9">&gt; random.seed('sunday')</text>
       <text class="k-mono k-light" data-l2 x="12" y="36" font-size="9">&gt; flip()  ferry 50%, zip 50%</text>
       <text class="k-mono" data-l3 x="12" y="53" font-size="9" style="fill:var(--color-gold)">&gt; result: EDGE  (p = 0.01%)</text>`));
    const tl = gsap.timeline();
    gsap.set([$(hud, '[data-l2]'), $(hud, '[data-l3]')], { opacity: 0 });
    gsap.set(q, { scale: 0, transformOrigin: '0% 100%' });
    gsap.set($$(sparks, '.rv-spark'), { scale: 0, transformOrigin: '50% 50%' });
    gsap.set([A, B], { transformOrigin: '50% 50%' });
    gsap.set(coin, { opacity: 0 });

    const FLIP = 1.0, HALF = 0.105;
    tl.from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, 0.05)
      .to(clouds, { x: -24, duration: END, ease: 'none' }, 0)
      .to(rip, { x: -40, duration: END, ease: 'none' }, 0)
      .to(boat, { x: '+=30', duration: END, ease: 'none' }, 0)
      .to(boat, { rotation: 1.5, transformOrigin: '50% 100%', duration: 0.6, yoyo: true, repeat: 11, ease: 'sine.inOut' }, 0)
      .to($(hud, '[data-l2]'), { opacity: 1, duration: 0.2 }, FLIP - 0.2)
      // the flick
      .to($(me, '.p-arm-r'), { rotation: 30, transformOrigin: '50% 0%', duration: 0.3, ease: 'power1.in' }, FLIP - 0.45)
      .to($(me, '.p-arm-r'), { rotation: -150, duration: 0.18, ease: 'power3.out' }, FLIP - 0.12)
      .to($(me, '.p-arm-r'), { rotation: 0, duration: 0.5, ease: 'power2.inOut' }, FLIP + 0.6)
      .to(coin, { opacity: 1, duration: 0.1 }, FLIP - 0.4)
      .to(coin, { x: 206, duration: 2.15, ease: 'none' }, FLIP)
      .to(coin, { y: 156, duration: 1.1, ease: 'power2.out' }, FLIP)
      .to(coin, { scale: 1, duration: 0.8, ease: 'power1.out' }, FLIP)
      .to(coin, { y: 500, duration: 1.05, ease: 'power2.in' }, FLIP + 1.1)
      .to(coin, { scale: 0.6, duration: 1.0, ease: 'power1.in' }, FLIP + 1.15)
      .to([$(me, '.p-head'), $(mina, '.p-head')], { rotation: -10, transformOrigin: '50% 100%', duration: 0.5, ease: 'power1.out' }, FLIP)
      .to([$(me, '.p-head'), $(mina, '.p-head')], { rotation: 6, duration: 0.9, ease: 'power1.inOut' }, FLIP + 1.1);
    ctx.sfx(tl, 'whoosh', FLIP);
    ctx.sfx(tl, 'tick', FLIP + 0.05);
    // the spin: face, edge, other face, edge ... then it stops on the edge
    const spin = gsap.timeline({ repeat: 4 });
    spin.to(A, { scaleX: 0.06, duration: HALF, ease: 'sine.in' })
      .set(A, { opacity: 0 }).set(B, { opacity: 1 })
      .fromTo(B, { scaleX: 0.06 }, { scaleX: 1, duration: HALF, ease: 'sine.out', immediateRender: false })
      .to(B, { scaleX: 0.06, duration: HALF, ease: 'sine.in' })
      .set(B, { opacity: 0 }).set(A, { opacity: 1 })
      .fromTo(A, { scaleX: 0.06 }, { scaleX: 1, duration: HALF, ease: 'sine.out', immediateRender: false });
    tl.add(spin, FLIP)
      .to(A, { scaleX: 0.22, duration: HALF, ease: 'sine.in' }, FLIP + 2.1)
      .to(coin, { rotation: 10, duration: 0.3, yoyo: true, repeat: 5, ease: 'sine.inOut' }, FLIP + 0.2);
    const LAND = FLIP + 2.15;
    tl.to(coin, { scaleY: 0.5, transformOrigin: '50% 100%', duration: 0.07, yoyo: true, repeat: 1 }, LAND)
      .to(coin, { y: '-=14', duration: 0.17, ease: 'power1.out', yoyo: true, repeat: 1 }, LAND + 0.07)
      .to(coin, { scaleY: 0.55, transformOrigin: '50% 100%', duration: 0.06, yoyo: true, repeat: 1 }, LAND + 0.41)
      .to(coin, { rotation: -14, duration: 0.12 }, LAND + 0.47)
      .to(coin, { rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.3)' }, LAND + 0.59)
      .to($(hud, '[data-l3]'), { opacity: 1, duration: 0.2 }, LAND + 0.6)
      .to([$(me, '.p-head'), $(mina, '.p-head')], { rotation: 0, duration: 0.3 }, LAND);
    ctx.sfx(tl, 'click', LAND);
    ctx.sfx(tl, 'tick', LAND + 0.41);
    ctx.sfx(tl, 'chime', LAND + 0.7);
    tl.to($$(sparks, '.rv-spark'), { scale: 1, duration: 0.25, ease: 'back.out(2)', stagger: 0.05 }, LAND + 0.65)
      .to($$(sparks, '.rv-spark'), { scale: 0, duration: 0.3, stagger: 0.05 }, LAND + 1.0);
    // quick look: tower, ferry, tower, ferry... then "?"
    const heads = [$(me, '.p-head'), $(mina, '.p-head')];
    tl.to(heads, { rotation: -14, transformOrigin: '50% 100%', duration: 0.25, ease: 'power2.out', stagger: 0.08 }, LAND + 1.3)
      .to(heads, { rotation: 12, duration: 0.3, ease: 'power2.inOut', stagger: 0.08 }, LAND + 1.75)
      .to(heads, { rotation: -14, duration: 0.3, ease: 'power2.inOut', stagger: 0.08 }, LAND + 2.2)
      .to(heads, { rotation: 0, duration: 0.3, ease: 'power2.inOut', stagger: 0.08 }, LAND + 2.65)
      .to(q, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, LAND + 2.75)
      .to(q, { rotation: -6, duration: 0.25, yoyo: true, repeat: 3, transformOrigin: '0% 100%', ease: 'sine.inOut' }, LAND + 3.1);
    ctx.sfx(tl, 'pop', LAND + 2.75);
    K.hop(tl, mina, LAND + 2.75, 10);
    tl.to({}, { duration: 0.1 }, END);

    ctx.say('Ferry or zip-wire? A Naminara coin decides.', 0.3, 2.4);
    ctx.say('It landed on its edge. We’ll decide there.', 3.4, 2.7);
    return tl;
  });
})();
