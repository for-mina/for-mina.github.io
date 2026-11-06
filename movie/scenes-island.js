/* Island scenes: exploring Nami Island in early November, plus the side quests.
   explore-walk, explore-tandem, explore-race, explore-train, explore-mix, extras.
   Places: Metasequoia Lane (메타세쿼이아길), Songpa Ginkgo Lane (송파은행나무길),
   the Nami train (나눔열차), Sonata Cafe hotteok, the ostrich pen (깡타의집).
   Only existing paint classes and tokens are used, so no extra CSS file. */
(() => {
  'use strict';
  const M = window.MOVIE, K = window.KIT;
  const $ = (el, s) => el.querySelector(s);
  const $$ = (el, s) => [...el.querySelectorAll(s)];
  const add = (parent, str) => { parent.insertAdjacentHTML('beforeend', str); return parent.lastElementChild; };
  const grp = (ctx, extra = '') => ctx.add(`<g ${extra}></g>`);
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const lerp = (a, b, t) => a + (b - a) * t;
  const padN = (v) => Math.round(v).toLocaleString('en-US');
  // odd repeat count so a yoyo tween ends where it started, and (repeat + 1) * per never exceeds D
  const reps = (D, per) => { let n = Math.floor(D / per) - 1; if (n % 2 === 0) n -= 1; return Math.max(1, n); };
  const bob = (tl, el, at, D, amp = 1.2, per = 0.18) => tl.to(el, { y: `-=${amp}`, duration: per, yoyo: true, repeat: reps(D, per), ease: 'sine.inOut' }, at);
  const lap = (v) => { const c = Math.round(v * 100); return `00:${String(Math.floor(c / 100)).padStart(2, '0')}.${String(c % 100).padStart(2, '0')}`; };

  /* ====================================================================
     Shared builders. Each takes (ctx, tl, g, at, D, opts) and draws into
     group g, adding tweens to tl starting at scene-local time `at`.
     ==================================================================== */

  /* ---------- falling leaves (metasequoia needles or ginkgo fans) ---------- */
  function leaves(tl, g, at, D, { n = 10, kind = 'ginkgo', top = -30, yMax = 620 } = {}) {
    let s = '';
    for (let i = 0; i < n; i += 1) {
      const x = 14 + ((i * 97) % 332), y = top - (i * 53) % 260;
      s += kind === 'ginkgo'
        ? `<use class="lf" href="#i-ginkgo" x="${x}" y="${y}" width="17" height="17"/>`
        : `<ellipse class="lf ${i % 2 ? 'f-maple' : 'f-rust'}" cx="${x}" cy="${y}" rx="6" ry="2"/>`;
    }
    const box = add(g, `<g>${s}</g>`);
    // every leaf makes k whole falls in exactly D seconds, so nothing overshoots the scene
    $$(box, '.lf').forEach((el, i) => {
      const k = D > 3 ? 2 + (i % 2) : 1, d = D / k, fall = yMax - (top - (i * 53) % 260);
      tl.fromTo(el, { y: 0 }, { y: fall, duration: d, repeat: k - 1, ease: 'none' }, at)
        .fromTo(el, { x: 0 }, { x: i % 2 ? 26 : -26, duration: d * 0.5, yoyo: true, repeat: k * 2 - 1, ease: 'sine.inOut' }, at)
        .to(el, { rotation: i % 2 ? 360 : -360, transformOrigin: '50% 50%', duration: d, repeat: k - 1, ease: 'none' }, at);
    });
    return box;
  }

  /* ---------- Metasequoia Lane in perspective ----------
     Two rows of very tall, narrow rust-copper cones and a straight gravel path
     between them, converging on a vanishing point. */
  const VP = { x: 180, y: 296 };
  function metaLane(g, { rows = 8 } = {}) {
    let s = K.sky('noon');
    s += `<circle fill="url(#gk-glow)" cx="${VP.x}" cy="${VP.y - 20}" r="120"/>`;
    s += `<rect class="f-mtn-1" y="${VP.y}" width="360" height="${640 - VP.y}"/>`;
    s += `<rect class="f-river-deep" x="${VP.x - 60}" y="${VP.y - 6}" width="120" height="8"/>`;
    s += `<path class="f-land" d="M${VP.x - 5} ${VP.y} L${VP.x + 5} ${VP.y} L306 640 L54 640 Z"/>`;
    s += `<path class="f-cream" d="M${VP.x - 1} ${VP.y} L${VP.x + 1} ${VP.y} L232 640 L128 640 Z" opacity="0.5"/>`;
    let trees = '';
    for (let i = rows - 1; i >= 0; i -= 1) {
      const d = 1 / (1 + i * 0.82);
      const by = VP.y + 372 * d, h = 1050 * d, w = h * 0.15;
      const cls = i % 2 ? 'f-maple' : 'f-rust';
      [-1, 1].forEach((side) => {
        const x = VP.x + side * 205 * d;
        trees += `<rect class="f-ink2" x="${x - w * 0.06}" y="${by - h * 0.12}" width="${w * 0.12}" height="${h * 0.14}"/>`;
        trees += `<path class="${cls}" d="M${x - w / 2} ${by - h * 0.08} Q${x - w * 0.42} ${by - h * 0.5} ${x} ${by - h} Q${x + w * 0.42} ${by - h * 0.5} ${x + w / 2} ${by - h * 0.08} Z"/>`;
        if (i < 3) trees += `<path class="f-rust" d="M${x} ${by - h * 0.1} Q${x + w * 0.22 * side} ${by - h * 0.5} ${x} ${by - h * 0.9} Z" opacity="0.55"/>`;
      });
    }
    s += `<g class="meta-trees">${trees}</g>`;
    return add(g, `<g class="meta-lane">${s}</g>`);
  }

  /* ---------- Songpa Ginkgo Lane, side view, scrollable layers ----------
     Yellow canopy tunnel, trunks, a brick path and a thick yellow leaf carpet. */
  function ginkgoLane(g, { px = 380, heartAt = null, finishAt = null, lite = false } = {}) {
    const W = 360 + px + 120, sp = lite ? 1.8 : 1;
    let s = K.sky('noon');
    s += `<rect class="f-gold" y="462" width="360" height="178"/>`;
    const lane = add(g, `<g>${s}</g>`);
    // far canopy band (slow)
    let far = '';
    for (let x = -40; x < W; x += 92) far += `<circle class="f-gold" cx="${x}" cy="${140 + ((x / 92) % 2) * 34}" r="78"/>`;
    for (let x = 10; x < W; x += 138) far += `<circle class="f-gold-soft" cx="${x}" cy="${96 + ((x / 138) % 2) * 20}" r="34" opacity="0.7"/>`;
    if (!lite) for (let x = 24; x < W; x += 64) far += `<rect class="f-ink2" x="${x}" y="190" width="4" height="280" opacity="0.35"/><circle class="f-gold-deep" cx="${x + 10}" cy="${228 + ((x / 64) % 3) * 24}" r="30" opacity="0.35"/>`;
    const farG = add(g, `<g>${far}</g>`);
    // near tree row with trunks (and optional heart / finish)
    let near = '';
    for (let x = 30; x < W; x += 118) {
      near += `<rect class="f-ink2" x="${x - 5}" y="300" width="10" height="170"/>`;
      near += `<circle class="f-gold" cx="${x}" cy="${292}" r="60"/><circle class="f-gold-deep" cx="${x + 20}" cy="${314}" r="22" opacity="0.5"/>`;
    }
    const nearG = add(g, `<g>${near}</g>`);
    let heart = null, finish = null;
    if (heartAt !== null) {
      heart = add(nearG, `<g class="heart" transform="translate(${heartAt} 474)">
        <rect class="f-wood st-out" x="-14" y="-6" width="28" height="8" rx="3"/>
        <path fill="none" stroke-width="7" stroke-linejoin="round" style="stroke:var(--color-wood)" d="M0 -6 C-34 -34 -40 -72 -18 -78 C-8 -80 -2 -72 0 -64 C2 -72 8 -80 18 -78 C40 -72 34 -34 0 -6 Z"/>
        <path fill="none" stroke-width="2" stroke-dasharray="3 6" style="stroke:var(--color-rust)" d="M0 -12 C-26 -34 -32 -66 -16 -70 C-8 -72 -3 -66 0 -58 C3 -66 8 -72 16 -70 C32 -66 26 -34 0 -12 Z"/>
      </g>`);
    }
    if (finishAt !== null) {
      let chq = '';
      for (let r = 0; r < 2; r += 1) for (let c = 0; c < 12; c += 1) chq += `<rect class="${(r + c) % 2 ? 'f-ink' : 'f-paper2'}" x="${-60 + c * 10}" y="${-96 + r * 10}" width="10" height="10"/>`;
      let line = '';
      for (let c = 0; c < 6; c += 1) line += `<rect class="${c % 2 ? 'f-ink' : 'f-paper2'}" x="-4" y="${22 + c * 10}" width="8" height="10"/>`;
      finish = add(nearG, `<g class="finish" transform="translate(${finishAt} 474)">
        <rect class="f-ink2" x="-72" y="-112" width="6" height="110"/><rect class="f-ink2" x="66" y="-112" width="6" height="110"/>
        <path class="st-ink2 nf" d="M-69 -108 Q0 -98 69 -108"/>
        ${chq}<rect class="st-out nf" x="-60" y="-96" width="120" height="20"/>
        <text class="k-mono" x="0" y="-64" font-size="9" text-anchor="middle" style="fill:var(--color-ink)">FINISH, 결승</text>
        ${line}
      </g>`);
    }
    // ground: brick path + leaf blobs
    let gr = `<rect class="f-mtn-1" y="498" width="${W}" height="58"/><path class="st-paper nf" opacity="0.35" d="M0 517 H${W} M0 537 H${W}"/>`;
    for (let x = 6; x < W; x += 46 * sp) gr += `<ellipse class="f-gold-deep" cx="${x}" cy="${476 + ((x / 46) % 3) * 6}" rx="9" ry="3" opacity="0.55"/>`;
    const groundG = add(g, `<g>${gr}</g>`);
    let fg = '';
    for (let x = 0; x < W; x += 58 * sp) fg += `<ellipse class="f-gold-deep" cx="${x}" cy="${580 + ((x / 58) % 3) * 18}" rx="14" ry="4" opacity="0.6"/>`;
    const fgG = add(g, `<g>${fg}</g>`);
    return { lane, farG, nearG, groundG, fgG, heart, finish, W };
  }
  function scrollLane(tl, L, at, D, px) {
    K.scroll(tl, L.farG, at, D, px * 0.3);
    K.scroll(tl, L.nearG, at, D, px);
    K.scroll(tl, L.groundG, at, D, px);
    K.scroll(tl, L.fgG, at, D, px * 1.35);
  }

  /* ---------- bikes ----------
     Side view facing right. Origin = front crank; ground = +21. Parts: .b-wheel, .person */
  const wheel = (cx, cy) => `<g class="b-wheel"><circle class="st-ink nf" cx="${cx}" cy="${cy}" r="15" stroke-width="3"/>
    <path class="st-ink2 nf" stroke-width="1.4" d="M${cx - 14} ${cy} H${cx + 14} M${cx} ${cy - 14} V${cy + 14} M${cx - 10} ${cy - 10} L${cx + 10} ${cy + 10} M${cx - 10} ${cy + 10} L${cx + 10} ${cy - 10}"/>
    <circle class="f-metal" cx="${cx}" cy="${cy}" r="3.2"/></g>`;
  const basket = (x) => `<rect class="f-wood st-out" x="${x}" y="-38" width="16" height="11" rx="2"/><path class="st-thin nf" d="M${x + 4} -38 V-27 M${x + 8} -38 V-27 M${x + 12} -38 V-27"/>`;
  function bikeStr(who, { x = 0, y = 0, s = 1.15, cls = 'st-accent' } = {}) {
    return `<g class="bike" transform="translate(${x} ${y}) scale(${s})">
      <ellipse class="f-shadow" cx="2" cy="22" rx="40" ry="3"/>
      <path class="${cls} nf" stroke-width="3.2" d="M-30 6 L-8 -18 L0 0 L24 -18 L-8 -18 M24 -18 L34 6 M0 0 L-30 6 M24 -18 L28 -27 M20 -27 H36"/>
      <rect class="f-ink" x="-16" y="-23" width="15" height="4" rx="2"/>
      ${K.person(who, { x: 0, y: 2, s: 1 })}
      <circle class="f-ink" cx="0" cy="0" r="3"/>
      ${wheel(-30, 6)}${wheel(34, 6)}${basket(30)}
    </g>`;
  }
  function tandemStr({ x = 0, y = 0, s = 1.15 } = {}) {
    return `<g class="bike" transform="translate(${x} ${y}) scale(${s})">
      <ellipse class="f-shadow" cx="-20" cy="22" rx="62" ry="3"/>
      <path class="st-accent nf" stroke-width="3.2" d="M-76 6 L-54 -18 L-46 0 L-20 -18 L-8 -18 L0 0 L24 -18 L34 6 M0 0 L-46 0 L-76 6 M-54 -18 L-20 -18 M24 -18 L-8 -18 M24 -18 L28 -27 M20 -27 H36 M-20 -18 L-18 -27 M-26 -27 H-10"/>
      <rect class="f-ink" x="-16" y="-23" width="15" height="4" rx="2"/><rect class="f-ink" x="-62" y="-23" width="15" height="4" rx="2"/>
      ${K.person('me', { x: -46, y: 2, s: 1 })}
      ${K.person('mina', { x: 0, y: 2, s: 1 })}
      <circle class="f-ink" cx="0" cy="0" r="3"/><circle class="f-ink" cx="-46" cy="0" r="3"/>
      ${wheel(-76, 6)}${wheel(34, 6)}${basket(30)}
      <g class="bell"><circle class="f-gold st-thin" cx="18" cy="-30" r="3"/></g>
    </g>`;
  }
  function rideSetup(bike) {
    $$(bike, '.person').forEach((p) => gsap.set($$(p, '.p-arm-l, .p-arm-r'), { rotation: -62, transformOrigin: '50% 0%' }));
  }
  function pedal(tl, bike, at, D, turns = 2.2) {
    tl.to($$(bike, '.b-wheel'), { rotation: `+=${360 * turns * D}`, transformOrigin: '50% 50%', duration: D, ease: 'none' }, at);
    $$(bike, '.person').forEach((p) => {
      const n = reps(D, 0.2);
      tl.to($$(p, '.p-leg-l'), { rotation: 34, transformOrigin: '50% 0%', duration: 0.2, yoyo: true, repeat: n, ease: 'sine.inOut' }, at)
        .to($$(p, '.p-leg-r'), { rotation: -34, transformOrigin: '50% 0%', duration: 0.2, yoyo: true, repeat: n, ease: 'sine.inOut' }, at)
        .to($$(p, '.p-body, .p-head'), { y: -1.2, duration: 0.1, yoyo: true, repeat: n * 2 + 1, ease: 'sine.inOut' }, at);
    });
  }

  /* ---------- the Nami train (나눔열차): royal-blue steam-style loco + open carriages ---------- */
  const car = (x, who, flipArm) => `<g class="t-car" transform="translate(${x} 0)">
      <rect class="f-metal" x="-30" y="-50" width="4" height="18"/><rect class="f-metal" x="26" y="-50" width="4" height="18"/>
      <rect class="f-cream st-out" x="-34" y="-54" width="68" height="6" rx="2"/>
      ${who ? `<path class="${who === 'mina' ? 'st-arm-mina' : 'st-arm-me'} t-wave" d="M${flipArm ? -14 : 14} -32 L${flipArm ? -22 : 22} -46"/>` : ''}
      ${who ? K.head(who, 0, -38, 0.8) : ''}
      <rect class="f-sign-blue st-out" x="-32" y="-32" width="64" height="22" rx="4"/>
      <path class="st-thin nf" d="M-26 -27 H26" style="stroke:var(--color-gold)"/>
      <g class="t-wheel"><circle class="f-ink" cx="-18" cy="-6" r="6"/><path class="st-paper nf" stroke-width="1.5" d="M-18 -11 V-1"/></g>
      <g class="t-wheel"><circle class="f-ink" cx="18" cy="-6" r="6"/><path class="st-paper nf" stroke-width="1.5" d="M18 -11 V-1"/></g>
    </g>`;
  function trainStr({ x = 0, y = 0 } = {}) {
    return `<g class="train" transform="translate(${x} ${y})">
      <ellipse class="f-shadow" cx="-150" cy="1" rx="170" ry="3"/>
      <path class="st-ink nf" stroke-width="3" d="M-100 -14 H-70 M-166 -14 H-138 M-234 -14 H-206"/>
      ${car(-96, 'mina', false)}${car(-164, 'me', false)}${car(-232, null)}
      <g class="loco">
        <rect class="f-sign-blue st-out" x="-70" y="-36" width="62" height="26" rx="8"/>
        <rect class="f-sign-blue st-out" x="-96" y="-54" width="30" height="44" rx="3"/>
        <rect class="f-accent" x="-100" y="-58" width="38" height="6" rx="2"/>
        <rect class="f-glass st-thin" x="-91" y="-49" width="20" height="14" rx="2"/>
        <rect class="f-ink" x="-30" y="-56" width="12" height="22" rx="1"/><rect class="f-gold" x="-33" y="-58" width="18" height="5" rx="2"/>
        <path class="f-gold" d="M-54 -36 C-54 -44 -40 -44 -40 -36 Z"/>
        <circle class="f-gold st-out" cx="-8" cy="-23" r="9"/><circle class="f-ink" cx="-8" cy="-23" r="3.5"/>
        <path class="f-accent st-out" d="M-8 -10 L8 -2 L8 0 L-8 0 Z"/>
        <path class="st-thin nf" d="M-66 -24 H-14" style="stroke:var(--color-gold)"/>
        <rect class="f-accent" x="-70" y="-12" width="62" height="3"/>
        <g class="t-wheel"><circle class="f-accent st-out" cx="-26" cy="-11" r="11"/><path class="st-ink nf" stroke-width="2" d="M-26 -20 V-2 M-35 -11 H-17"/><circle class="f-gold" cx="-26" cy="-11" r="3"/></g>
        <g class="t-wheel"><circle class="f-accent st-out" cx="-58" cy="-11" r="11"/><path class="st-ink nf" stroke-width="2" d="M-58 -20 V-2 M-67 -11 H-49"/><circle class="f-gold" cx="-58" cy="-11" r="3"/></g>
        <g class="t-wheel"><circle class="f-ink" cx="-86" cy="-7" r="7"/><path class="st-paper nf" stroke-width="1.5" d="M-86 -12 V-2"/></g>
        <g class="t-rod"><rect class="f-metal st-thin" x="-60" y="-13" width="36" height="4" rx="2"/></g>
      </g>
    </g>`;
  }
  function trainRun(tl, train, at, D, turns = 1.2) {
    tl.to($$(train, '.t-wheel'), { rotation: `+=${360 * turns * D}`, transformOrigin: '50% 50%', duration: D, ease: 'none' }, at);
    const rod = $(train, '.t-rod');
    const k = Math.max(1, Math.round(D * turns));
    tl.to(rod, { motionPath: { path: 'M6 0 A6 6 0 1 1 -6 0 A6 6 0 1 1 6 0' }, duration: D / k, repeat: k - 1, ease: 'none' }, at);
    bob(tl, $(train, '.loco'), at, D, 0.9, 0.22);
    $$(train, '.t-car').forEach((c, i) => bob(tl, c, at + i * 0.07, D - i * 0.07, 0.8, 0.22));
  }
  function steam(tl, g, at, D, x, y) {
    let s = '';
    for (let i = 0; i < 5; i += 1) s += `<circle class="f-paper2" cx="${x}" cy="${y}" r="${7 + i * 1.5}" opacity="0"/>`;
    const box = add(g, `<g>${s}</g>`);
    const k = Math.max(1, Math.round(D / 1.5));
    $$(box, 'circle').forEach((c, i) => {
      const per = (D - i * 0.3) / k;
      tl.fromTo(c, { x: 0, y: 0, scale: 0.4, opacity: 0.95, transformOrigin: '50% 50%' }, { x: -56 - i * 6, y: -70 - i * 4, scale: 2.2, opacity: 0, duration: per, repeat: k - 1, ease: 'power1.out' }, at + i * 0.3);
    });
  }

  /* ---------- the walkers in Metasequoia Lane ---------- */
  function buildWalk(ctx, tl, g, at, D, { full = true } = {}) {
    metaLane(g, { rows: full ? 8 : 6 });
    const prints = add(g, '<g></g>');
    const steps = full ? 7 : 3;
    const walkD = full ? 3.8 : D - 0.1;
    const persons = [];
    ['mina', 'me'].forEach((who, i) => {
      const dir = i ? 1 : -1;
      let s = '';
      for (let k = 0; k < steps; k += 1) {
        const t = (k + 0.5) / steps, sc = lerp(0.82, 1.22, t);
        const y = lerp(462, 536, t), x = 180 + dir * lerp(24, 36, t) + (k % 2 ? 4 : -4) * sc;
        s += `<ellipse class="f-ink2 fp" data-t="${(t * walkD).toFixed(2)}" cx="${x}" cy="${y}" rx="${3.2 * sc}" ry="${1.6 * sc}" opacity="0.32"/>`;
      }
      add(prints, `<g>${s}</g>`);
      persons.push(add(g, K.person(who, { x: 180 + dir * 24, y: 462, s: 0.82 })));
    });
    $$(prints, '.fp').forEach((p) => tl.fromTo(p, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.25, ease: 'back.out(3)' }, at + parseFloat(p.dataset.t)));
    persons.forEach((p, i) => {
      tl.to(p, { y: '+=74', x: `${i ? '+' : '-'}=12`, scale: 1.22, duration: walkD, ease: 'none' }, at);
      K.walk(tl, p, at, walkD);
    });
    leaves(tl, g, at, D, { n: full ? 12 : 6, kind: 'meta' });
    const hud = add(g, K.hud(190, 30, 154, 58,
      `<text class="k-mono k-light" x="12" y="18" font-size="10">steps, 메타세쿼이아길</text>
       <text class="k-mono" data-n x="12" y="46" font-size="24" style="fill:var(--color-gold)">0</text>`));
    tl.from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, at + 0.05);
    K.count(tl, $(hud, '[data-n]'), at + 0.3, full ? D - 0.9 : D - 0.4, 0, 4812, padN);
    if (!full) return;

    /* the leaf-pile beat */
    const me = persons[1], mina = persons[0];
    const pile = add(g, `<g transform="translate(272 550)">
      <path class="f-rust" d="M-30 0 C-26 -16 -10 -22 0 -20 C12 -22 26 -14 30 0 Z"/>
      <path class="f-maple" d="M-16 -4 C-12 -14 -2 -16 4 -12 C10 -16 18 -10 20 -2 Z" opacity="0.9"/>
      <ellipse class="f-gold-deep" cx="-8" cy="-7" rx="5" ry="2" opacity="0.7"/></g>`);
    let burst = '';
    for (let i = 0; i < 10; i += 1) burst += `<ellipse class="${i % 3 ? 'f-maple' : 'f-rust'}" cx="272" cy="542" rx="5" ry="2" opacity="0"/>`;
    const burstG = add(g, `<g>${burst}</g>`);
    const big = add(g, `<g transform="translate(238 -140)">
      <path class="f-rust" d="M-52 0 C-48 -34 -22 -56 0 -54 C22 -56 48 -34 52 0 Z"/>
      <path class="f-maple" d="M-32 -8 C-24 -32 -6 -42 8 -34 C20 -38 34 -24 38 -6 Z" opacity="0.9"/>
      <ellipse class="f-gold-deep" cx="-14" cy="-14" rx="7" ry="3" opacity="0.7"/><ellipse class="f-gold-deep" cx="18" cy="-26" rx="6" ry="2.5" opacity="0.7"/><ellipse class="f-gold-deep" cx="4" cy="-44" rx="5" ry="2" opacity="0.7"/>
      <path class="f-ink2" d="M-8 -52 C-8 -61 10 -61 10 -52 Z"/><rect class="f-ink" x="-9" y="-54" width="19" height="3.5" rx="1.5"/>
      <g class="pile-arm"><path class="st-arm-me" d="M30 -30 L40 -50"/></g>
    </g>`);
    const T = at + walkD;
    // one more step to the right, then anticipation and the kick
    tl.to(me, { x: '+=20', duration: 0.4, ease: 'none' }, T);
    K.walk(tl, me, T, 0.4);
    tl.to($(me, '.p-leg-r'), { rotation: 34, transformOrigin: '50% 0%', duration: 0.26, ease: 'power2.out' }, T + 0.45)
      .to($(me, '.p-body, .p-head'), { rotation: -6, transformOrigin: '50% 100%', duration: 0.26 }, T + 0.45)
      .to($(me, '.p-leg-r'), { rotation: -78, duration: 0.12, ease: 'power3.in' }, T + 0.72)
      .to($(me, '.p-body, .p-head'), { rotation: 5, duration: 0.12 }, T + 0.72)
      .to(pile, { scale: 0, transformOrigin: '50% 100%', duration: 0.12 }, T + 0.84)
      .to($(me, '.p-leg-r'), { rotation: 0, duration: 0.3 }, T + 1.1)
      .to($(me, '.p-body, .p-head'), { rotation: 0, duration: 0.3 }, T + 1.1);
    ctx.sfx(tl, 'whoosh', T + 0.74);
    $$(burstG, 'ellipse').forEach((e, i) => {
      const dx = -36 + i * 8 + (i % 2 ? 6 : -6), up = -40 - (i % 4) * 14;
      tl.fromTo(e, { x: 0, y: 0, opacity: 1, rotation: 0 }, { x: dx, y: up, rotation: 200, duration: 0.38, ease: 'power2.out' }, T + 0.82)
        .to(e, { y: up + 90, opacity: 0, duration: 0.5, ease: 'power1.in' }, T + 1.2);
    });
    // the big pile comes down on him
    tl.to(big, { y: '+=690', duration: 0.6, ease: 'power2.in' }, T + 1.15)
      .to(me, { opacity: 0, duration: 0.08 }, T + 1.7)
      .to(big, { scaleY: 0.72, scaleX: 1.22, transformOrigin: '50% 100%', duration: 0.1 }, T + 1.75)
      .to(big, { scaleY: 1, scaleX: 1, duration: 0.5, ease: 'elastic.out(1, 0.45)' }, T + 1.85);
    ctx.sfx(tl, 'thud', T + 1.75);
    tl.fromTo($(big, '.pile-arm'), { rotation: 40, transformOrigin: '0% 100%' }, { rotation: -30, duration: 0.14, yoyo: true, repeat: 7 }, T + 2.0);
    // Mina laughs: bounce, head wobble
    K.hop(tl, mina, T + 1.9, 12);
    K.hop(tl, mina, T + 2.3, 9);
    tl.to($(mina, '.p-body'), { scaleY: 0.9, transformOrigin: '50% 100%', duration: 0.12, yoyo: true, repeat: 7, ease: 'sine.inOut' }, T + 1.85)
      .to($(mina, '.p-head'), { rotation: -9, transformOrigin: '50% 100%', duration: 0.12, yoyo: true, repeat: 7, ease: 'sine.inOut' }, T + 1.85);
    ctx.sfx(tl, 'boing', T + 1.9);
    ctx.say('Metasequoia Lane. Every leaf is copper, every step is loud.', at + 0.2, 2.8);
    ctx.say('Rule one of leaf piles: look before you kick.', T + 1.2, 2.6);
  }

  /* ---------- the tandem through the ginkgo lane ---------- */
  function buildTandem(ctx, tl, g, at, D, { full = true } = {}) {
    const L = ginkgoLane(g, { px: full ? 460 : 180, heartAt: full ? 580 : null, lite: !full });
    scrollLane(tl, L, at, D, full ? 460 : 180);
    const bike = add(g, tandemStr({ x: 190, y: 496 }));
    rideSetup(bike);
    pedal(tl, bike, at, D, 2.4);
    tl.to(bike, { rotation: 3, transformOrigin: '50% 100%', duration: 0.25, yoyo: true, repeat: reps(D, 0.25), ease: 'sine.inOut' }, at)
      .to(bike, { y: '-=3', duration: 0.18, yoyo: true, repeat: reps(D, 0.18), ease: 'sine.inOut' }, at);
    leaves(tl, g, at, D, { n: full ? 10 : 5, kind: 'ginkgo' });
    const hud = add(g, K.hud(16, 30, 190, 50,
      `<text class="k-mono k-light" x="12" y="19" font-size="10">teamwork: <tspan style="fill:var(--color-matcha)">98%</tspan></text>
       <text class="k-mono k-light" x="12" y="38" font-size="10">steering: <tspan data-st style="fill:var(--color-gold)">disputed</tspan></text>`));
    tl.from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, at + 0.05)
      .to($(hud, '[data-st]'), { opacity: 0.25, duration: 0.3, yoyo: true, repeat: reps(D - 0.5, 0.3) }, at + 0.5);
    const bell = add(g, K.bubble(214, 414, 'ring ring!', { w: 86, size: 14 }));
    gsap.set(bell, { scale: 0, transformOrigin: '0% 100%' });
    const bellT = full ? 1.2 : 0.5;
    tl.to(bell, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, at + bellT)
      .to($(bike, '.bell'), { rotation: 25, transformOrigin: '50% 50%', duration: 0.08, yoyo: true, repeat: 7 }, at + bellT)
      .to(bell, { scale: 0, duration: 0.2 }, at + bellT + 1.3);
    ctx.sfx(tl, 'chime', at + bellT + 0.05);
    ctx.sfx(tl, 'chime', at + bellT + 0.35);
    if (!full) return;
    // the heart passes the bike at scroll time: heart x = 660 - 460*t/D; bike front at ~218 → t ≈ 5.8*0.96
    // the heart reaches the front wheel (x ≈ 250) at hitT; swerve up just before, wobble, land with overshoot
    const hitT = at + D * ((580 - 250) / 460);
    tl.to(bike, { y: '-=26', rotation: -11, duration: 0.2, ease: 'power2.out' }, hitT - 0.35)
      .to(bike, { rotation: 7, duration: 0.3, ease: 'sine.inOut' }, hitT - 0.15)
      .to(bike, { y: '+=26', rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)' }, hitT + 0.15)
      .to(L.heart, { rotation: 7, transformOrigin: '50% 100%', duration: 0.6, ease: 'wiggle6' }, hitT - 0.05);
    $$(bike, '.person .p-head').forEach((h) => tl.to(h, { y: -4, duration: 0.2, yoyo: true, repeat: 1 }, hitT - 0.35));
    ctx.sfx(tl, 'boing', hitT - 0.33);
    ctx.say('Songpa Ginkgo Lane. One bike, two seats, no manual.', at + 0.2, 2.6);
    ctx.say('Steering is negotiable. The heart sculpture is not.', at + 3.0, 2.8);
  }

  /* ---------- the train through the trees ---------- */
  function buildTrain(ctx, tl, g, at, D, { full = true } = {}) {
    const px = full ? 320 : 150, W = 360 + px + 120, sp = full ? 1 : 1.7;
    add(g, K.sky('noon') + K.sun(300, 80, 16));
    const far = add(g, K.mountains(380).far);
    let tr = '';
    const kinds = ['meta', 'ginkgo', 'pine', 'meta', 'ginkgo', 'meta', 'pine', 'ginkgo'];
    let i = 0;
    for (let x = 20; x < W; x += 52 * sp, i += 1) tr += K.tree(kinds[i % 8], x, 484, kinds[i % 8] === 'meta' ? 190 : 96);
    const trees = add(g, `<g>${tr}</g>`);
    add(g, '<rect class="f-mtn-1" y="482" width="360" height="52"/>');
    let track = `<rect class="f-land" y="520" width="${W}" height="14"/>`;
    for (let x = 0; x < W; x += 24 * sp) track += `<rect class="f-wood" x="${x}" y="522" width="10" height="10" rx="1"/>`;
    track += `<path class="st-ink2 nf" stroke-width="2.5" d="M0 524 H${W} M0 531 H${W}"/>`;
    const trackG = add(g, `<g>${track}</g>`);
    let fg = `<rect class="f-gold" y="534" width="${W}" height="106"/>`;
    for (let x = 0; x < W; x += 60 * sp) fg += `<ellipse class="f-gold-deep" cx="${x}" cy="${560 + ((x / 60) % 3) * 22}" rx="14" ry="4" opacity="0.55"/>`;
    const fgG = add(g, `<g>${fg}</g>`);
    K.scroll(tl, far, at, D, px * 0.18);
    K.scroll(tl, trees, at, D, px);
    K.scroll(tl, trackG, at, D, px);
    K.scroll(tl, fgG, at, D, px * 1.3);
    const train = add(g, trainStr({ x: 326, y: 532 }));
    trainRun(tl, train, at, D, 1.1);
    tl.to(train, { x: '+=18', duration: D, ease: 'none' }, at);
    steam(tl, g, at, D, 310, 470);
    tl.to($$(train, '.t-wave'), { rotation: -40, transformOrigin: '0% 100%', duration: 0.3 }, at + 0.3)
      .to($$(train, '.t-wave'), { rotation: -10, duration: 0.22, yoyo: true, repeat: reps(D - 0.6, 0.22), ease: 'sine.inOut' }, at + 0.6);
    leaves(tl, g, at, D, { n: full ? 8 : 4, kind: 'ginkgo', yMax: 540 });
    const hud = add(g, K.hud(16, 30, 196, 50,
      `<text class="k-mono k-light" x="12" y="19" font-size="10">나눔열차, speed</text>
       <text class="k-mono" x="12" y="40" font-size="13"><tspan style="fill:var(--color-gold)">8 km/h</tspan> <tspan class="k-light" font-size="10">· very civilised</tspan></text>`));
    tl.from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, at + 0.05);
    if (!full) return;
    // the funny beat: an ostrich strolls past and overtakes the train
    const ost = add(g, K.ostrich(-70, 562, 86));
    const legs = { l: $(ost, '.o-leg-l'), r: $(ost, '.o-leg-r') };
    const oT = at + 1.5, oD = 3.6;
    tl.to(ost, { x: '+=520', duration: oD, ease: 'none' }, oT);
    const n = Math.round(oD / 0.16) | 1;
    tl.to(legs.l, { rotation: 22, transformOrigin: '50% 0%', duration: 0.16, yoyo: true, repeat: n, ease: 'sine.inOut' }, oT)
      .to(legs.r, { rotation: -22, transformOrigin: '50% 0%', duration: 0.16, yoyo: true, repeat: n, ease: 'sine.inOut' }, oT)
      .to($(ost, '.o-body'), { y: -2, duration: 0.16, yoyo: true, repeat: n, ease: 'sine.inOut' }, oT)
      .to($(ost, '.o-head'), { rotation: -14, transformOrigin: '20% 80%', duration: 0.3, yoyo: true, repeat: 1, repeatDelay: 0.6 }, oT + 1.4)
      .to($(ost, '.o-cap'), { rotation: -20, y: -2, transformOrigin: '20% 80%', duration: 0.2, yoyo: true, repeat: 1 }, oT + 1.5);
    $$(train, '.k-head').forEach((h) => tl.to(h, { rotation: 10, transformOrigin: '50% 100%', duration: 0.3, yoyo: true, repeat: 1, repeatDelay: 0.8 }, oT + 1.3));
    ctx.say('The Nami train. Eight km/h of pure dignity.', at + 0.2, 2.6);
    ctx.say('Overtaken by an ostrich. Nobody is surprised.', at + 3.2, 2.6);
  }

  /* ====================================================================
     Scenes
     ==================================================================== */

  /* ---------- 5a. Walk and talk ---------- */
  M.scene('explore-walk', (ctx) => {
    const D = 7.0, tl = gsap.timeline();
    buildWalk(ctx, tl, ctx.layer, 0, D, { full: true });
    tl.to({}, { duration: 0.1 }, D);
    return tl;
  });

  /* ---------- 5b. Two-seater bike ---------- */
  M.scene('explore-tandem', (ctx) => {
    const D = 6.2, tl = gsap.timeline();
    buildTandem(ctx, tl, ctx.layer, 0, D, { full: true });
    tl.to({}, { duration: 0.1 }, D);
    return tl;
  });

  /* ---------- 5c. Two single bikes: the race ---------- */
  M.scene('explore-race', (ctx) => {
    const D = 6.6, F = 4.4, tl = gsap.timeline();
    const g = ctx.layer, px = 420;
    const L = ginkgoLane(g, { px, finishAt: 360 + px - 150 });
    scrollLane(tl, L, 0, F, px);
    const me = add(g, bikeStr('me', { x: 104, y: 484, s: 1.04, cls: 'st-river' }));
    const mina = add(g, bikeStr('mina', { x: 148, y: 500, s: 1.18 }));
    rideSetup(me); rideSetup(mina);
    pedal(tl, me, 0, F, 2.8); pedal(tl, mina, 0, F, 2.8);
    // the duel: he surges, she answers, he leans, she wins by a wheel
    tl.to(me, { x: '+=70', duration: 1.1, ease: 'power2.inOut' }, 0.3)
      .to(mina, { x: '+=54', duration: 1.0, ease: 'power2.inOut' }, 1.3)
      .to(me, { x: '-=26', duration: 0.8, ease: 'sine.inOut' }, 1.6)
      .to(mina, { x: '+=8', duration: 0.9, ease: 'power1.out' }, 2.6)
      .to(me, { x: '+=22', duration: 1.0, ease: 'power2.in' }, 3.2)
      .to($(me, '.p-body, .p-head'), { rotation: 14, transformOrigin: '50% 100%', duration: 0.4 }, 3.2)
      .to($(mina, '.p-body, .p-head'), { rotation: 8, transformOrigin: '50% 100%', duration: 0.4 }, 3.6)
      .to([me, mina], { y: '-=2', duration: 0.12, yoyo: true, repeat: reps(F, 0.12), ease: 'sine.inOut' }, 0);
    const lv = leaves(tl, g, 0, F, { n: 8, kind: 'ginkgo' });
    tl.to(lv, { opacity: 0, duration: 0.05 }, F);
    const hud = add(g, K.hud(16, 30, 160, 60,
      `<text class="k-mono k-light" x="12" y="17" font-size="9.5">lap timer, 송파은행나무길</text>
       <text class="k-mono" x="12" y="36" font-size="12"><tspan class="k-light">mina </tspan><tspan data-a style="fill:var(--color-gold)">00:00.00</tspan></text>
       <text class="k-mono" x="12" y="52" font-size="12"><tspan class="k-light">me   </tspan><tspan data-b style="fill:var(--color-gold)">00:00.00</tspan></text>`));
    tl.from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, 0.05);
    K.count(tl, $(hud, '[data-a]'), 0.2, F - 0.2, 0, 41.27, lap);
    K.count(tl, $(hud, '[data-b]'), 0.2, F - 0.18, 0, 41.29, lap);
    // photo finish: flash, freeze frame, corner brackets, winner banner
    const flash = add(g, '<rect class="f-paper2" width="360" height="640" opacity="0"/>');
    const frame = add(g, `<g opacity="0">
      <path class="st-paper nf" stroke-width="4" d="M24 120 V96 H48 M312 96 H336 V120 M24 520 V544 H48 M312 544 H336 V520"/>
      <text class="k-mono k-light" x="180" y="112" font-size="11" text-anchor="middle">PHOTO FINISH, 1/4000 s</text></g>`);
    tl.to(flash, { opacity: 0.95, duration: 0.06 }, F).to(flash, { opacity: 0, duration: 0.4 }, F + 0.06)
      .to(frame, { opacity: 1, duration: 0.2 }, F + 0.1);
    ctx.sfx(tl, 'click', F);
    const banner = add(g, `<g transform="translate(180 236)">
      <rect class="f-paper2 st-out" x="-150" y="-40" width="300" height="80" rx="12"/>
      <rect class="f-accent" x="-150" y="-40" width="300" height="12" rx="6"/>
      <text class="k-display" x="0" y="2" font-size="20" text-anchor="middle">Winner: Mina</text>
      <text class="k-hand" x="0" y="26" font-size="15" text-anchor="middle" font-weight="700">The consulate buys hotteok.</text></g>`);
    gsap.set(banner, { scale: 0, transformOrigin: '50% 50%' });
    tl.to(banner, { scale: 1, duration: 0.5, ease: 'back.out(2.2)' }, F + 0.55);
    ctx.sfx(tl, 'sparkle', F + 0.6);
    K.wave(tl, $(mina, '.person'), F + 0.9, { arm: '.p-arm-r', times: 2 });
    tl.to($(me, '.p-head'), { rotation: -12, transformOrigin: '50% 100%', duration: 0.35, ease: 'power2.out' }, F + 0.9);
    tl.to({}, { duration: 0.1 }, D);
    ctx.say('Two bikes, one lane, zero mercy.', 0.2, 2.4);
    ctx.say('By a wheel. The consulate buys hotteok.', F + 0.7, 2.6);
    return tl;
  });

  /* ---------- 5d. The little train ---------- */
  M.scene('explore-train', (ctx) => {
    const D = 6.4, tl = gsap.timeline();
    buildTrain(ctx, tl, ctx.layer, 0, D, { full: true });
    tl.to({}, { duration: 0.1 }, D);
    return tl;
  });

  /* ---------- 5e. A bit of everything: three quick cuts ---------- */
  M.scene('explore-mix', (ctx) => {
    const D = 6.2, cut = 2.0, tl = gsap.timeline();
    const builders = [buildWalk, buildTandem, buildTrain];
    builders.forEach((b, i) => {
      const g = grp(ctx);
      const at = i * cut;
      b(ctx, tl, g, at, cut, { full: false });
      gsap.set(g, { autoAlpha: i ? 0 : 1 });
      if (i) tl.to(g, { autoAlpha: 1, duration: 0.01 }, at);
      if (i < builders.length - 1) tl.to(g, { autoAlpha: 0, duration: 0.01 }, at + cut);
      const tag = add(g, K.hud(16, 560, 92, 26, `<text class="k-mono k-light" x="10" y="17" font-size="10">cut ${i + 1}/3, rec</text><circle class="f-accent" cx="80" cy="13" r="3"/>`));
      tl.to($(tag, 'circle'), { opacity: 0.2, duration: 0.3, yoyo: true, repeat: 5 }, at);
      ctx.sfx(tl, 'click', at + 0.02);
    });
    tl.to({}, { duration: 0.1 }, D);
    ctx.say('A bit of everything: walk, tandem, train.', 0.2, 2.4);
    ctx.say('Three ways to see one island. Zero complaints.', 3.4, 2.6);
    return tl;
  });

  /* ====================================================================
     6. Side quests: a montage of ctx.st.extras, in order
     ==================================================================== */
  const QUEST = {
    'Rowing boat': { title: 'Rowing boat', build: vRow },
    'Hotteok hunt': { title: 'Hotteok hunt', build: vHotteok },
    'A photo for the island’s autumn contest': { title: 'The autumn photo contest', build: vPhoto },
    'Say hi to the grumpy ostrich': { title: 'The grumpy ostrich', build: vOstrich },
    'Hanbok photos': { title: 'Hanbok photos', build: vHanbok }
  };
  const flash = (ctx, tl, g, at, dur = 0.3) => {
    const f = add(g, '<rect class="f-paper2" width="360" height="640" opacity="0"/>');
    tl.to(f, { opacity: 0.95, duration: 0.05 }, at).to(f, { opacity: 0, duration: dur, ease: 'power2.out' }, at + 0.05);
    ctx.sfx(tl, 'click', at);
  };
  const label = (tl, g, at, i, n) => {
    const h = add(g, K.hud(16, 30, 118, 28, `<text class="k-mono k-light" x="10" y="18" font-size="11">quest ${i + 1}/${n} <tspan data-ok style="fill:var(--color-matcha)">✓</tspan></text>`));
    gsap.set($(h, '[data-ok]'), { opacity: 0 });
    tl.from(h, { y: '-=12', opacity: 0, duration: 0.3 }, at)
      .to($(h, '[data-ok]'), { opacity: 1, duration: 0.2 }, at + 1.35);
    return h;
  };

  /* --- Rowing boat: he rows, the boat goes in a circle --- */
  function vRow(ctx, tl, g, at, D) {
    add(g, K.sky('noon') + K.sun(296, 96, 16) + K.cloud(70, 130, 0.9) + K.cloud(230, 80, 0.7) + K.ridge(262, 54, 360, 6, 'f-mtn-far', 1.4) + K.ridge(300, 40, 360, 8, 'f-mtn-2', 2.2));
    add(g, `<rect class="f-land2" y="322" width="360" height="22"/>${K.tree('ginkgo', 40, 326, 60)}${K.tree('meta', 96, 326, 100)}${K.tree('maple', 150, 326, 54)}${K.tree('meta', 250, 326, 92)}${K.tree('ginkgo', 320, 326, 64)}${K.tree('pine', 200, 326, 46)}`);
    const river = add(g, K.river(342, 298, 360));
    const loop = add(g, '<ellipse class="st-paper nf" stroke-width="2.5" stroke-dasharray="8 7" cx="180" cy="486" rx="116" ry="34" opacity="0.8"/>');
    const boat = add(g, `<g transform="translate(180 470)">
      <ellipse class="f-shadow" cx="0" cy="12" rx="54" ry="4"/>
      <g class="oar oar-far"><path stroke-width="3" stroke-linecap="round" style="stroke:var(--color-wood)" d="M8 -16 L-24 -44"/><ellipse class="f-wood" cx="-24" cy="-44" rx="4" ry="7"/></g>
      ${K.person('mina', { x: -26, y: 2, s: 0.95 })}${K.person('me', { x: 16, y: 2, s: 0.95 })}
      <path class="f-wood st-out" d="M-54 -14 L54 -14 C50 2 36 10 0 10 C-36 10 -50 2 -54 -14 Z"/>
      <path class="st-thin nf" d="M-44 -6 H44"/>
      <g class="oar-near"><path stroke-width="3" stroke-linecap="round" style="stroke:var(--color-wood)" d="M8 -10 L42 22"/><ellipse class="f-wood" cx="42" cy="22" rx="4" ry="7"/></g>
      <g class="splash"><ellipse class="f-paper2" cx="46" cy="22" rx="8" ry="3" opacity="0"/><ellipse class="f-paper2" cx="40" cy="26" rx="5" ry="2" opacity="0"/></g>
    </g>`);
    gsap.set($$(boat, '.person .p-arm-l, .person .p-arm-r'), { rotation: -50, transformOrigin: '50% 0%' });
    bob(tl, boat, at, D, 2, 0.4);
    const n = reps(D, 0.25);
    tl.to($(boat, '.oar-near'), { rotation: -30, transformOrigin: '0% 0%', duration: 0.25, yoyo: true, repeat: n, ease: 'sine.inOut' }, at)
      .to($(boat, '.oar-far'), { rotation: 24, transformOrigin: '100% 100%', duration: 0.25, yoyo: true, repeat: n, ease: 'sine.inOut' }, at)
      .to($$(boat, '.person[data-who="me"] .p-arm-l, .person[data-who="me"] .p-arm-r'), { rotation: -92, duration: 0.25, yoyo: true, repeat: n, ease: 'sine.inOut' }, at);
    $$(boat, '.splash ellipse').forEach((e, i) => tl.fromTo(e, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' }, { opacity: 0.9, scale: 1.3, duration: 0.25, yoyo: true, repeat: reps(D - 0.4, 0.25), ease: 'power1.out' }, at + 0.2 + i * 0.1));
    ctx.sfx(tl, 'splash', at + 0.25);
    ctx.sfx(tl, 'splash', at + 1.25);
    // the circle: drift right, flip, drift left, flip back
    tl.fromTo(loop, { drawSVG: '0%' }, { drawSVG: '100%', duration: D - 0.2, ease: 'none' }, at)
      .to(boat, { x: '+=60', duration: 0.6, ease: 'sine.inOut' }, at)
      .to(boat, { scaleX: -1, transformOrigin: '50% 50%', duration: 0.3, ease: 'power1.inOut' }, at + 0.6)
      .to(boat, { x: '-=120', duration: 0.75, ease: 'sine.inOut' }, at + 0.75)
      .to(boat, { scaleX: 1, duration: 0.3, ease: 'power1.inOut' }, at + 1.35)
      .to(boat, { x: '+=60', duration: 0.3, ease: 'sine.out' }, at + 1.5);
    const bub = add(g, K.bubble(70, 362, 'Full circle!', { w: 86, size: 14 }));
    gsap.set(bub, { scale: 0, transformOrigin: '0% 100%' });
    tl.to(bub, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, at + 1.25);
    tl.to($$(river, 'path'), { x: -14, duration: D, ease: 'none' }, at);
  }

  /* --- Hotteok hunt at Sonata Cafe --- */
  function vHotteok(ctx, tl, g, at, D) {
    add(g, K.sky('noon') + K.sun(300, 90, 16) + K.cloud(60, 150, 0.9) + K.cloud(250, 200, 0.7) + K.ridge(360, 40, 360, 7, 'f-mtn-far', 1.1));
    add(g, `${K.tree('meta', 40, 470, 170)}${K.tree('meta', 14, 470, 130)}${K.tree('ginkgo', 320, 470, 90)}${K.tree('pine', 290, 470, 60)}${K.tree('meta', 350, 470, 150)}`);
    add(g, `<g transform="translate(150 470)">
      <rect class="f-wood st-out" x="-70" y="-96" width="140" height="96" rx="3"/>
      <path class="st-thin nf" d="M-66 -80 H66 M-66 -64 H66 M-66 -48 H66 M-66 -32 H66 M-66 -16 H66"/>
      <path class="f-cream st-out" d="M-82 -96 L0 -140 L82 -96 Z"/>
      <rect class="f-glass st-out" x="20" y="-72" width="34" height="26" rx="2"/><path class="st-thin nf" d="M37 -72 V-46 M20 -59 H54"/>
      <rect class="f-door-edge st-out" x="-48" y="-60" width="30" height="60" rx="2"/>
      <rect class="f-paper2 st-out" x="-60" y="-120" width="120" height="26" rx="4"/>
      <text class="k-hand" x="0" y="-101" font-size="15" font-weight="700" text-anchor="middle">소나타까페, 호떡</text>
    </g>`);
    add(g, `<g transform="translate(268 470)">
      <ellipse class="f-shadow" cx="0" cy="1" rx="26" ry="3"/>
      <circle class="f-paper2 st-out" cx="0" cy="-26" r="26"/><circle class="f-paper2 st-out" cx="0" cy="-66" r="19"/>
      <path class="f-accent" d="M-18 -50 C-10 -42 10 -42 18 -50 L16 -44 C8 -38 -8 -38 -16 -44 Z"/>
      <circle class="f-ink" cx="-6" cy="-70" r="2"/><circle class="f-ink" cx="6" cy="-70" r="2"/><path class="f-maple" d="M-1 -66 L14 -62 L-1 -60 Z"/>
      <circle class="f-ink" cx="0" cy="-30" r="2"/><circle class="f-ink" cx="0" cy="-20" r="2"/>
      <rect class="f-ink" x="-20" y="-86" width="40" height="4" rx="2"/><rect class="f-ink" x="-12" y="-104" width="24" height="20" rx="2"/>
    </g>`);
    add(g, '<rect class="f-land" y="470" width="360" height="170"/><path class="st-paper nf" opacity="0.5" d="M0 492 H360 M0 520 H360 M0 548 H360"/>');
    const mina = add(g, K.person('mina', { x: 72, y: 540, s: 1.15 }));
    const me = add(g, K.person('me', { x: 130, y: 540, s: 1.15 }));
    const cup = add(g, `<g transform="translate(146 500)">
      <ellipse class="f-gold st-gold" cx="-4" cy="-10" rx="5" ry="9"/><ellipse class="f-gold st-gold" cx="4" cy="-11" rx="5" ry="9"/>
      <path class="f-paper2 st-out" d="M-10 -8 H10 L8 10 H-8 Z"/><path class="f-pine" d="M-8.6 4 H8.6 L8 10 H-8 Z"/>
      <g class="stm"><path class="st-paper nf" d="M-5 -22 q3 -4 0 -8 q-3 -4 0 -8"/><path class="st-paper nf" d="M3 -24 q3 -4 0 -8 q-3 -4 0 -8"/></g>
    </g>`);
    gsap.set($(me, '.p-arm-r'), { rotation: 70, transformOrigin: '50% 0%' });
    gsap.set($(me, '.p-arm-l'), { rotation: -40, transformOrigin: '50% 0%' });
    $$(cup, '.stm path').forEach((p, i) => tl.fromTo(p, { y: 0, opacity: 0.9 }, { y: -16, opacity: 0, duration: (D - i * 0.3) / 2, repeat: 1, ease: 'power1.out' }, at + i * 0.3));
    const bub = add(g, K.bubble(118, 404, 'hot hot hot!', { w: 92, size: 14 }));
    gsap.set(bub, { scale: 0, transformOrigin: '0% 100%' });
    tl.to(bub, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, at + 0.5)
      .to($(me, '.p-arm-l'), { rotation: -160, duration: 0.2, ease: 'power2.out' }, at + 0.5)
      .to($(me, '.p-arm-l'), { rotation: -120, duration: 0.09, yoyo: true, repeat: 11, ease: 'sine.inOut' }, at + 0.7)
      .to($(me, '.p-head'), { y: -3, duration: 0.09, yoyo: true, repeat: 11, ease: 'sine.inOut' }, at + 0.7)
      .to([cup], { y: '-=3', duration: 0.09, yoyo: true, repeat: 11, ease: 'sine.inOut' }, at + 0.7)
      .to($(mina, '.p-head'), { rotation: -10, transformOrigin: '50% 100%', duration: 0.24, yoyo: true, repeat: 3, ease: 'sine.inOut' }, at + 0.8);
    K.hop(tl, mina, at + 1.0, 8);
    ctx.sfx(tl, 'pop', at + 0.5);
  }

  /* --- The autumn photo contest: flash, polaroid, stamp --- */
  function vPhoto(ctx, tl, g, at, D) {
    ginkgoLane(g, { px: 0 });
    const pair = add(g, `<g>${K.person('mina', { x: 150, y: 520, s: 1.0 })}${K.person('me', { x: 206, y: 520, s: 1.0 })}</g>`);
    const cam = add(g, `<g transform="translate(56 560)">
      <rect class="f-ink st-out" x="-30" y="-24" width="60" height="40" rx="6"/><circle class="f-metal" cx="0" cy="-4" r="13"/><circle class="f-glass" cx="0" cy="-4" r="8"/><circle class="f-paper2" cx="3" cy="-7" r="2"/>
      <rect class="f-ink2" x="-14" y="-32" width="18" height="9" rx="2"/><rect class="f-gold" x="12" y="-30" width="10" height="5" rx="1"/>
    </g>`);
    $$(pair, '.p-arm-r').forEach((a) => gsap.set(a, { rotation: -150, transformOrigin: '50% 0%' }));
    tl.to($$(pair, '.p-arm-r'), { rotation: -135, duration: 0.2, yoyo: true, repeat: 3 }, at);
    flash(ctx, tl, g, at + 0.45, 0.35);
    tl.to($(cam, '.f-gold'), { scale: 1.8, transformOrigin: '50% 50%', duration: 0.1, yoyo: true, repeat: 1 }, at + 0.4);
    const pol = add(g, `<g transform="translate(92 704)">
      <rect class="f-paper2 st-out" x="-46" y="-58" width="92" height="116" rx="3"/>
      <rect class="f-gold-soft" x="-40" y="-52" width="80" height="80"/>
      <g class="dev" opacity="0">
        <rect class="f-gold" x="-40" y="-52" width="80" height="80"/>
        <rect class="f-ink2" x="-30" y="-50" width="4" height="44"/><rect class="f-ink2" x="24" y="-50" width="4" height="44"/><circle class="f-gold-deep" cx="-28" cy="-44" r="14" opacity="0.6"/><circle class="f-gold-deep" cx="26" cy="-46" r="14" opacity="0.6"/>
        <rect class="f-mtn-1" x="-40" y="4" width="80" height="24"/>
        ${K.person('mina', { x: -10, y: 14, s: 0.5 })}${K.person('me', { x: 12, y: 14, s: 0.5 })}
      </g>
      <text class="k-hand" x="0" y="46" font-size="11" text-anchor="middle">nami, autumn 2026</text>
      <g class="stamp" transform="translate(16 -36) rotate(-14)"><rect class="st-stamp nf" stroke-width="2" x="-30" y="-9" width="60" height="18" rx="3"/><text class="k-mono f-stamp" x="0" y="4" font-size="10" text-anchor="middle" font-weight="700">ENTRY #001</text></g>
    </g>`);
    gsap.set($(pol, '.stamp'), { opacity: 0 });
    tl.to(pol, { y: '-=400', x: '+=72', rotation: -6, transformOrigin: '50% 50%', duration: 0.8, ease: 'back.out(1.4)' }, at + 0.6)
      .to($(pol, '.dev'), { opacity: 1, duration: 0.6, ease: 'power1.in' }, at + 1.0)
      .fromTo($(pol, '.stamp'), { opacity: 0, scale: 2.2 }, { opacity: 1, scale: 1, duration: 0.22, ease: 'power3.in' }, at + 1.5);
    ctx.sfx(tl, 'paper', at + 0.65);
    ctx.sfx(tl, 'thud', at + 1.7);
  }

  /* --- The grumpy ostrich at 깡타의집 --- */
  function vOstrich(ctx, tl, g, at, D) {
    add(g, K.sky('noon') + K.sun(60, 86, 16) + K.cloud(250, 110, 0.8) + K.ridge(258, 50, 360, 7, 'f-mtn-far', 1.6));
    add(g, `${K.tree('meta', 300, 334, 190)}${K.tree('meta', 340, 334, 160)}${K.tree('meta', 250, 334, 150)}${K.tree('pine', 60, 334, 70)}${K.tree('ginkgo', 20, 334, 66)}${K.tree('ginkgo', 120, 334, 60)}`);
    add(g, '<rect class="f-land" y="332" width="360" height="308"/><rect class="f-land2" y="332" width="360" height="14" opacity="0.6"/>');
    const wrap = add(g, `<g>${K.ostrich(262, 478, 136, true)}</g>`);
    const ost = $(wrap, '.k-ostrich');
    let logs = '';
    [412, 446, 480].forEach((y) => { logs += `<rect class="f-wood st-out" x="142" y="${y - 6}" width="230" height="12" rx="6"/>`; });
    add(g, `<g>${logs}<rect class="f-wood st-out" x="160" y="388" width="12" height="112" rx="5"/><rect class="f-wood st-out" x="262" y="388" width="12" height="112" rx="5"/><rect class="f-wood st-out" x="352" y="388" width="12" height="112" rx="5"/></g>`);
    add(g, `<g transform="translate(82 402)">
      <rect class="f-ink2" x="-3" y="0" width="6" height="96"/>
      <rect class="f-wood st-out" x="-60" y="-34" width="120" height="40" rx="4"/>
      <text class="k-hand" x="-10" y="-7" font-size="20" font-weight="700" text-anchor="middle" style="fill:var(--color-cream)">깡타의집</text>
      <use href="#i-ostrich" x="28" y="-31" width="30" height="30"/>
    </g>`);
    const mina = add(g, K.person('mina', { x: 50, y: 556, s: 1.15 }));
    const me = add(g, K.person('me', { x: 110, y: 556, s: 1.15 }));
    K.wave(tl, mina, at + 0.1, { times: 2 });
    K.wave(tl, me, at + 0.3, { times: 2 });
    const dots = add(g, K.bubble(232, 316, '. . .', { w: 60, size: 16 }));
    gsap.set(dots, { scale: 0, transformOrigin: '0% 100%' });
    // the side-eye: lid half down, pupil to the corner, head tilts away; then it turns its back
    tl.to($(ost, '.o-lid'), { y: 3.5, duration: 0.25 }, at + 0.4)
      .to($(ost, '.o-pupil'), { x: -2.4, y: 0.6, duration: 0.25 }, at + 0.4)
      .to($(ost, '.o-head'), { rotation: 8, transformOrigin: '20% 80%', duration: 0.3 }, at + 0.4)
      .to($(ost, '.o-brow'), { y: 2, duration: 0.25 }, at + 0.4)
      .to(dots, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, at + 0.7)
      .to(wrap, { y: -6, duration: 0.12, yoyo: true, repeat: 1 }, at + 1.15)
      .to(wrap, { scaleX: -1, svgOrigin: '262 478', duration: 0.26, ease: 'power1.inOut' }, at + 1.3)
      .to(dots, { scale: 0, duration: 0.15 }, at + 1.3)
      .to($(ost, '.o-cap'), { rotation: -16, y: -2, transformOrigin: '20% 80%', duration: 0.2, yoyo: true, repeat: 1 }, at + 1.6);
    tl.to($(me, '.p-head'), { rotation: 10, transformOrigin: '50% 100%', duration: 0.3 }, at + 1.5)
      .to($(mina, '.p-head'), { rotation: -10, transformOrigin: '50% 100%', duration: 0.3 }, at + 1.5);
    ctx.sfx(tl, 'honk', at + 1.32);
  }

  /* --- Hanbok photos: standing apart, posing for the camera --- */
  function vHanbok(ctx, tl, g, at, D) {
    ginkgoLane(g, { px: 0 });
    const mina = add(g, `<g class="hb" transform="translate(140 530) scale(1.3)">
      <ellipse class="f-shadow" cx="0" cy="1" rx="16" ry="2.5"/>
      <path class="f-river st-face" d="M-7 -30 C-17 -22 -22 -8 -22 0 L22 0 C22 -8 17 -22 7 -30 Z"/>
      <path class="st-thin nf" d="M-12 -22 C-11 -14 -10 -6 -10 0 M10 -22 C11 -14 10 -6 10 0" opacity="0.5"/>
      <g class="p-arm-l"><path stroke-width="5" stroke-linecap="round" style="stroke:var(--color-cream)" d="M-8 -31 L-14 -18"/></g>
      <g class="p-arm-r"><path stroke-width="5" stroke-linecap="round" style="stroke:var(--color-cream)" d="M8 -31 L14 -18"/></g>
      <path class="f-cream st-face" d="M-10 -28 C-10 -36 -6 -37 0 -37 C6 -37 10 -36 10 -28 Z"/>
      <path class="st-accent nf" stroke-width="2" d="M-3 -34 L-2 -29 L-6 -20 M-2 -29 L2 -20"/>
      ${K.head('mina', 0, -45, 1)}
    </g>`);
    const me = add(g, `<g class="hb" transform="translate(222 530) scale(1.3)">
      <ellipse class="f-shadow" cx="0" cy="1" rx="14" ry="2.5"/>
      <path class="st-legs" d="M-5 -8 L-5 -1 M5 -8 L5 -1"/>
      <path class="f-matcha st-face" d="M-13 -6 L-10 -36 C-10 -38 10 -38 10 -36 L13 -6 Z"/>
      <path class="st-thin nf" d="M-2 -36 L4 -22 L4 -6" opacity="0.6"/>
      <rect class="f-navy" x="-11" y="-24" width="22" height="3.5"/>
      <g class="p-arm-l"><path stroke-width="5" stroke-linecap="round" style="stroke:var(--color-matcha-deep)" d="M-8 -31 L-14 -18"/></g>
      <g class="p-arm-r"><path stroke-width="5" stroke-linecap="round" style="stroke:var(--color-matcha-deep)" d="M8 -31 L14 -18"/></g>
      ${K.head('me', 0, -45, 1)}
    </g>`);
    const cam = add(g, `<g transform="translate(44 500)">
      <path class="st-ink nf" stroke-width="3" d="M0 -14 V40 M0 10 L-14 44 M0 10 L14 44"/>
      <rect class="f-ink st-out" x="-16" y="-34" width="32" height="24" rx="4"/><circle class="f-metal" cx="12" cy="-22" r="7"/><circle class="f-glass" cx="12" cy="-22" r="4"/>
      <rect class="f-gold cam-flash" x="-8" y="-40" width="10" height="6" rx="1"/>
    </g>`);
    const poseAt = at + 0.3;
    [mina, me].forEach((p, i) => {
      tl.to($(p, '.p-arm-r'), { rotation: -150, transformOrigin: '50% 0%', duration: 0.3, ease: 'back.out(2)' }, poseAt + i * 0.12)
        .to($(p, '.p-arm-l'), { rotation: 30, transformOrigin: '50% 0%', duration: 0.3 }, poseAt + i * 0.12)
        .to($(p, '.k-head'), { rotation: i ? 8 : -8, transformOrigin: '50% 100%', duration: 0.3 }, poseAt + i * 0.12);
      K.hop(tl, p, poseAt + 0.3 + i * 0.12, 8);
    });
    tl.to(mina, { x: '-=8', duration: 0.3 }, poseAt).to(me, { x: '+=8', duration: 0.3 }, poseAt);
    flash(ctx, tl, g, at + 1.1, 0.4);
    tl.to($(cam, '.cam-flash'), { scale: 2, transformOrigin: '50% 50%', duration: 0.1, yoyo: true, repeat: 1 }, at + 1.05);
    const tag = add(g, K.bubble(190, 356, '찰칵!', { w: 60, size: 16 }));
    gsap.set(tag, { scale: 0, transformOrigin: '0% 100%' });
    tl.to(tag, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, at + 1.2);
  }

  M.scene('extras', (ctx) => {
    const list = (ctx.st.extras || []).filter((n) => QUEST[n]);
    const tl = gsap.timeline();
    const TITLE = 0.3, V = 1.8, STEP = TITLE + V;
    list.forEach((name, i) => {
      const q = QUEST[name], at = i * STEP;
      const card = grp(ctx);
      add(card, `<rect class="f-term" width="360" height="640" opacity="0.94"/>
        <text class="k-mono k-light" x="180" y="286" font-size="11" text-anchor="middle" opacity="0.7">side quest ${i + 1} of ${list.length}</text>
        <text class="k-display k-light" x="180" y="322" font-size="${q.title.length > 18 ? 22 : 26}" text-anchor="middle">${esc(q.title)}</text>
        <rect class="f-gold" x="150" y="340" width="60" height="4" rx="2"/>`);
      const g = grp(ctx);
      gsap.set([card, g], { autoAlpha: 0 });
      tl.to(card, { autoAlpha: 1, duration: 0.01 }, at)
        .from($(card, '.k-display'), { scale: 1.4, transformOrigin: '50% 50%', duration: 0.25, ease: 'power3.out' }, at)
        .to(card, { autoAlpha: 0, duration: 0.01 }, at + TITLE)
        .to(g, { autoAlpha: 1, duration: 0.01 }, at + TITLE)
        .to(g, { autoAlpha: i < list.length - 1 ? 0 : 1, duration: 0.01 }, at + STEP);
      ctx.sfx(tl, 'pop', at + 0.02);
      q.build(ctx, tl, g, at + TITLE, V);
      label(tl, g, at + TITLE, i, list.length);
    });
    const END = Math.max(0.5, list.length * STEP);
    tl.to({}, { duration: 0.1 }, END);
    if (list.length) ctx.say(list.length > 1 ? 'Side quests. The consulate takes these seriously.' : 'One side quest. The consulate takes it seriously.', 0.35, 2.2);
    if (list.length > 1) ctx.say('All quests complete. Stamp earned.', END - 1.7, 1.7);
    return tl;
  });
})();
