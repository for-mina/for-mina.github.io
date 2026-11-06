/* Lunch scenes (one per answer) and Cafe Daenerys at sunset.
   Same API and style as scenes-road.js. Colours only through classes (scenes-cafe.css). */
(() => {
  'use strict';
  const M = window.MOVIE, K = window.KIT;
  const $ = (el, s) => el.querySelector(s);
  const $$ = (el, s) => [...el.querySelectorAll(s)];
  const T = (x, y, inner, extra = '') => `<g transform="translate(${x} ${y})" ${extra}>${inner}</g>`;

  // Load this file's own stylesheet next to it (colour tokens and classes), once.
  (() => {
    const me = document.currentScript;
    if (!me || document.querySelector('link[data-scenes-cafe]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.dataset.scenesCafe = '1';
    l.href = me.src.replace(/scenes-cafe\.js.*$/, 'scenes-cafe.css');
    document.head.append(l);
  })();

  /* ---------- shared bits ---------- */
  // Steam curls above (x, y). Returns markup for n curls; animate with `steam()`.
  const steamMark = (x, y, n = 3, h = 34, cls = 'cs-steam') => {
    let s = '';
    for (let i = 0; i < n; i += 1) {
      const dx = (i - (n - 1) / 2) * 11, hh = h * (0.8 + (i % 2) * 0.35);
      s += `<path class="${cls}" data-steam d="M${x + dx} ${y} c -6 -${hh * 0.3} 6 -${hh * 0.5} 0 -${hh * 0.75} c -4 -${hh * 0.15} -1 -${hh * 0.3} 1 -${hh * 0.35}"/>`;
    }
    return `<g>${s}</g>`;
  };
  // Draw the curls on, lift and fade them, over and over until `until` (scene seconds).
  const steam = (tl, group, at, until, period = 1.2) => {
    const curls = $$(group, '[data-steam]');
    const n = Math.max(0, Math.floor((until - at) / period) - 1);
    curls.forEach((c, i) => {
      const d = i * 0.22;
      tl.fromTo(c, { drawSVG: '0% 0%', opacity: 0.9, y: 0 }, { drawSVG: '0% 100%', duration: period * 0.55, ease: 'sine.out', repeat: n, repeatDelay: period * 0.45 }, at + d)
        .fromTo(c, { y: 0 }, { y: -14, duration: period, ease: 'none', repeat: n }, at + d)
        .fromTo(c, { opacity: 0.9 }, { opacity: 0, duration: period * 0.4, ease: 'power1.in', repeat: n, repeatDelay: period * 0.6 }, at + d + period * 0.6);
    });
    return tl;
  };
  // Switch a text in a HUD: two texts stacked, the second starts hidden.
  const swapText = (tl, a, b, at) => tl.to(a, { opacity: 0, y: -6, duration: 0.18 }, at).fromTo(b, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.25, ease: 'back.out(3)' }, at + 0.05);

  /* A cosy restaurant room, three-quarter view: wall, window, hanging lamp, sign, a table and both of us behind it.
     Returns { mina, me, table, lamp } with the table drawn AFTER the people so it hides their legs. */
  const PX = { mina: 86, me: 274, y: 432, s: 1.4 };
  const room = (ctx, { sign = '', signCls = 'k-display', signSize = 14, wall = 'cf-wall', win = true, lamp: wantLamp = true } = {}) => {
    ctx.add(`<rect class="${wall}" width="360" height="640"/><rect class="cf-wall2" y="322" width="360" height="318"/><path class="cs-wood" d="M0 322 H360"/>
      <path class="st-thin nf" d="M0 500 H360 M0 540 H360 M0 580 H360 M0 620 H360 M60 500 V540 M200 500 V540 M300 500 V540 M120 540 V580 M250 540 V580 M40 580 V620 M180 580 V620 M320 580 V620" opacity="0.18"/>`);
    if (win) {
      ctx.add(`<g>${T(30, 128, `<rect class="f-cream st-out" width="104" height="104" rx="6"/><rect class="f-glass" x="6" y="6" width="92" height="92" rx="3"/>
        <path class="f-mtn-3" d="M6 76 Q36 54 62 70 Q84 82 98 68 V98 H6 Z"/>${K.tree('maple', 74, 98, 46)}${K.tree('ginkgo', 32, 98, 36)}
        <path class="st-out nf" d="M52 6 V98 M6 52 H98"/>`)}
        ${T(292, 190, '<rect class="cf-wood st-out" x="-30" y="-24" width="60" height="48" rx="3"/><rect class="f-cream" x="-24" y="-18" width="48" height="36"/><circle class="f-maple" cx="-4" cy="-2" r="9"/><path class="f-mtn-3" d="M-24 18 Q-6 2 10 12 Q18 18 24 12 V18 Z"/>')}
        ${T(292, 256, '<rect class="cf-wood st-out" x="-40" y="0" width="80" height="6" rx="2"/><rect class="cf-conifer2" x="-30" y="-20" width="12" height="20" rx="3"/><rect class="f-matcha" x="-14" y="-16" width="9" height="16" rx="2"/><ellipse class="cf-greens" cx="18" cy="-14" rx="12" ry="8"/><rect class="cf-brick2" x="12" y="-8" width="12" height="8" rx="1"/>')}</g>`);
    }
    const lamp = wantLamp ? ctx.add(`<g>${T(180, 0, `<path class="cs-iron" d="M0 0 V104"/><path class="cf-gold st-out" d="M-30 138 L-14 104 H14 L30 138 Z"/><ellipse class="f-lit" cx="0" cy="138" rx="24" ry="5"/><ellipse class="f-lit" data-pool cx="0" cy="330" rx="150" ry="34" opacity="0.22"/>`)}</g>`) : null;
    if (sign) ctx.add(`<g>${T(270, 44, `<rect class="cf-wood st-out" x="-74" y="-20" width="148" height="40" rx="6"/><rect class="cs-gold" x="-69" y="-15" width="138" height="30" rx="4"/><text class="${signCls}" x="0" y="6" font-size="${signSize}" text-anchor="middle" style="fill:var(--cafe-warm-white)">${sign}</text>`)}</g>`);
    ctx.add(`<g>${T(PX.mina, PX.y, '<rect class="cf-iron" x="-22" y="-76" width="44" height="8" rx="4"/><rect class="cf-iron" x="-20" y="-70" width="4" height="34"/><rect class="cf-iron" x="16" y="-70" width="4" height="34"/>')}${T(PX.me, PX.y, '<rect class="cf-iron" x="-22" y="-76" width="44" height="8" rx="4"/><rect class="cf-iron" x="-20" y="-70" width="4" height="34"/><rect class="cf-iron" x="16" y="-70" width="4" height="34"/>')}</g>`);
    const mina = ctx.add(K.person('mina', { x: PX.mina, y: PX.y, s: PX.s }));
    const me = ctx.add(K.person('me', { x: PX.me, y: PX.y, s: PX.s, flip: true }));
    const table = ctx.add(`<g><rect class="cf-table st-out" x="34" y="420" width="292" height="50" rx="8"/><path class="st-thin nf" d="M48 446 H312 M48 458 H312" opacity="0.35"/><path class="cf-table2 st-out" d="M24 412 Q180 388 336 412 Q180 436 24 412 Z"/><path class="st-thin nf" d="M60 414 Q180 400 300 414" opacity="0.45"/></g>`);
    return { mina, me, table, lamp };
  };
  // Seated-figure helper: a group at the person's origin with the person's scale, for things on the face (fog, sweat).
  const onFace = (who, inner) => T(PX[who], PX.y, `<g transform="scale(${who === 'me' ? -PX.s : PX.s} ${PX.s})">${inner}</g>`);
  // Seekable counter: tween the text itself (no callbacks).
  const count = (tl, el, at, dur, to) => tl.to(el, { textContent: to, snap: { textContent: 1 }, duration: dur, ease: 'none' }, at);
  // A spoon held out over the table, origin at the handle end.
  const spoon = (x, y, len = 34, flip = false) => T(x, y, `<path class="cs-spoon" d="M0 0 L${len} 0"/><ellipse class="cf-spoon st-thin" cx="${len + 6}" cy="0" rx="7" ry="4.5"/>`, `class="spoon"${flip ? ' data-flip' : ''}`);
  const lift = (tl, person, at, arm = '.p-arm-l', deg = -70) => tl.to($(person, arm), { rotation: deg, transformOrigin: '50% 0%', duration: 0.35, ease: 'back.out(2)' }, at);
  const lower = (tl, person, at, arm = '.p-arm-l') => tl.to($(person, arm), { rotation: 0, transformOrigin: '50% 0%', duration: 0.3, ease: 'power2.inOut' }, at);
  const laugh = (tl, person, at, n = 3) => tl.to($(person, '.p-head'), { y: -3, rotation: 6, transformOrigin: '50% 90%', duration: 0.12, yoyo: true, repeat: n * 2 - 1, ease: 'sine.inOut' }, at)
    .to($(person, '.p-body'), { scaleY: 0.96, transformOrigin: '50% 100%', duration: 0.12, yoyo: true, repeat: n * 2 - 1, ease: 'sine.inOut' }, at);

  /* ---------- Lunch 1: Korean home cooking (뚝배기 불고기) ---------- */
  M.scene('lunch-korean', (ctx) => {
    const D = 5.2;
    const r = room(ctx, { sign: '뚝배기 불고기 · 가정식', signSize: 14 });
    const hud = ctx.add(K.hud(16, 22, 150, 46,
      `<text class="k-mono k-light" x="12" y="18" font-size="9.5">temp: <tspan data-t style="fill:var(--color-gold)">61</tspan>°C</text>
       <text class="k-mono k-light" x="12" y="36" font-size="9.5">patience: <tspan data-pa style="fill:var(--color-matcha)">ok</tspan><tspan data-pb opacity="0" style="fill:var(--color-maple)">low</tspan></text>`));
    // banchan: four small dishes, then the stone pot in the middle
    const dishes = ctx.add(`<g>
      ${T(104, 416, '<ellipse class="cf-plate st-thin" rx="19" ry="7.5"/><ellipse class="cf-chili" rx="13" ry="4.5" cy="-1"/><ellipse class="cf-greens" rx="5" ry="2" cx="-4" cy="-2"/>')}
      ${T(136, 400, '<ellipse class="cf-plate st-thin" rx="16" ry="6.5"/><ellipse class="cf-greens" rx="11" ry="4" cy="-1"/>')}
      ${T(224, 400, '<ellipse class="cf-plate st-thin" rx="16" ry="6.5"/><ellipse class="cf-yolk" rx="11" ry="4" cy="-1"/><rect class="cf-egg" x="-7" y="-4" width="5" height="3" rx="1"/>')}
      ${T(256, 416, '<ellipse class="cf-plate st-thin" rx="19" ry="7.5"/><ellipse class="cf-rice st-thin" rx="14" ry="6.5" cy="-3"/>')}
      ${T(180, 432, '<ellipse class="cf-plate st-thin" rx="22" ry="8"/><ellipse class="cf-rice st-thin" rx="16" ry="8" cy="-4"/>')}
    </g>`);
    const pot = ctx.add(`<g>${T(180, 398, `<ellipse class="cf-pot2 st-out" cx="0" cy="9" rx="42" ry="13"/><path class="cf-pot st-out" d="M-38 -9 Q-40 11 -31 18 H31 Q40 11 38 -9 Z"/>
      <ellipse class="cf-pot2 st-out" rx="42" ry="12" cy="-9"/><ellipse class="cf-broth" rx="35" ry="9" cy="-9"/>
      <ellipse class="cf-beef" cx="-11" cy="-11" rx="10" ry="4.5"/><ellipse class="cf-beef" cx="13" cy="-8" rx="9" ry="4"/><ellipse class="cf-onion" cx="2" cy="-12" rx="5.5" ry="2.2"/><ellipse class="cf-greens" cx="-22" cy="-8" rx="4.5" ry="1.8"/><ellipse class="cf-greens" cx="24" cy="-11" rx="3.5" ry="1.6"/>
      <g data-bubbles>${[-20, -7, 7, 20, 0, -13, 13].map((bx, i) => `<circle class="cf-onion" cx="${bx}" cy="${-9 + (i % 3) - 1}" r="${2.4 + (i % 2)}" opacity="0.85"/>`).join('')}</g>`)}</g>`);
    const st = ctx.add(steamMark(180, 384, 4, 40));
    const spoonMe = ctx.add(spoon(246, 404, 30, true));
    gsap.set(spoonMe, { rotation: 180, transformOrigin: '0% 50%' });
    // fog on his glasses and a tiny cloth
    const fog = ctx.add(onFace('me', '<ellipse class="cf-steam" data-fog cx="-4" cy="-44" rx="3.2" ry="3.2"/><ellipse class="cf-steam" data-fog cx="4" cy="-44" rx="3.2" ry="3.2"/>'));
    const puff = ctx.add(T(258, 392, '<circle class="cf-steam" r="10" opacity="0.9"/><circle class="cf-steam" cx="-10" cy="4" r="7" opacity="0.9"/><circle class="cf-steam" cx="10" cy="5" r="7" opacity="0.9"/>'));
    const cloth = ctx.add(T(266, 371, '<rect class="st-thin" style="fill:var(--color-paper-2)" x="-7" y="-5" width="14" height="10" rx="2"/>'));
    const ow = ctx.add(K.bubble(196, 304, '앗, 뜨거!', { w: 72, size: 15 }));
    const tl = gsap.timeline();
    gsap.set($$(fog, '[data-fog]'), { opacity: 0 });
    gsap.set([puff, cloth], { opacity: 0 });
    gsap.set(ow, { scale: 0, transformOrigin: '0% 100%' });
    tl.from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, 0.05);
    count(tl, $(hud, '[data-t]'), 0.2, 2.2, 98);
    K.pop(tl, $$(dishes, 'g'), 0.1, { stagger: 0.07 });
    tl.from(pot, { y: '-=30', scaleY: 1.15, transformOrigin: '50% 100%', duration: 0.5, ease: 'bounce.out' }, 0.3);
    ctx.sfx(tl, 'thud', 0.55);
    // bubbling: each bubble swells and pops, offset
    $$(pot, '[data-bubbles] circle').forEach((b, i) => {
      tl.fromTo(b, { scale: 0.3, transformOrigin: '50% 50%', opacity: 0.9 }, { scale: 1.3, opacity: 0, duration: 0.5, ease: 'power1.out', repeat: Math.floor((D - 0.9) / 0.62), repeatDelay: 0.12 }, 0.7 + i * 0.09);
    });
    tl.to(pot, { y: '-=1.2', duration: 0.09, yoyo: true, repeat: 44, ease: 'sine.inOut' }, 0.8);
    steam(tl, st, 0.6, D, 1.1);
    // his spoon: into the pot, to the mouth, and the burn
    lift(tl, r.me, 0.9, '.p-arm-l', 60);
    tl.to(spoonMe, { x: '-=22', y: '-=4', duration: 0.35, ease: 'power2.inOut' }, 1.0)
      .to(spoonMe, { x: '+=16', y: '-=28', rotation: 150, duration: 0.4, ease: 'power2.inOut' }, 1.5)
      .to($(r.me, '.p-head'), { rotation: -6, transformOrigin: '50% 90%', duration: 0.3 }, 1.5);
    ctx.sfx(tl, 'gulp', 1.95);
    // burn: head snaps back, puff rises, glasses fog, bubble
    tl.to($(r.me, '.p-head'), { rotation: 10, y: -4, transformOrigin: '50% 90%', duration: 0.12, ease: 'power3.out' }, 2.0)
      .to($(r.me, '.p-head'), { rotation: 0, y: 0, duration: 0.5, ease: 'wiggle6' }, 2.12)
      .to(spoonMe, { x: '+=6', y: '+=32', rotation: 180, duration: 0.3, ease: 'power2.in' }, 2.05)
      .fromTo(puff, { opacity: 0, scale: 0.3, transformOrigin: '50% 50%' }, { opacity: 0.95, scale: 1.2, y: '-=26', duration: 0.55, ease: 'power2.out' }, 2.0)
      .to(puff, { opacity: 0, duration: 0.3 }, 2.5)
      .to($$(fog, '[data-fog]'), { opacity: 0.92, duration: 0.25, stagger: 0.05 }, 2.2)
      .to(ow, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, 2.1)
      .to(ow, { scale: 0, duration: 0.2 }, 3.4);
    ctx.sfx(tl, 'boing', 2.05);
    swapText(tl, $(hud, '[data-pa]'), $(hud, '[data-pb]'), 2.3);
    laugh(tl, r.mina, 2.4, 4);
    // wipe: cloth across the glasses, fog wipes away
    tl.to($(r.me, '.p-arm-l'), { rotation: 140, duration: 0.3, ease: 'back.out(2)' }, 3.0)
      .to(cloth, { opacity: 1, duration: 0.15 }, 3.05)
      .to(cloth, { x: '+=12', duration: 0.18, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 3.2)
      .to($$(fog, '[data-fog]'), { scaleX: 0, transformOrigin: '100% 50%', duration: 0.5, ease: 'power1.inOut', stagger: 0.15 }, 3.6)
      .to(cloth, { opacity: 0, duration: 0.15 }, 4.3);
    lower(tl, r.me, 4.4, '.p-arm-l');
    ctx.sfx(tl, 'scribble', 3.3);
    tl.to({}, { duration: 0.1 }, D);
    ctx.say('Stone-pot bulgogi. Still bubbling. Still too hot.', 0.2, 2.2);
    ctx.say('He burns his tongue. His glasses fog up. Classic.', 2.5, 2.6);
    return tl;
  });

  /* ---------- Lunch 2: Halal Asian at Dongmun ---------- */
  M.scene('lunch-halal', (ctx) => {
    const D = 5.2;
    const r = room(ctx, { sign: 'DONGMUN 동문 · HALAL', signCls: 'k-mono', signSize: 12 });
    const hud = ctx.add(K.hud(16, 22, 150, 46,
      `<text class="k-mono k-light" x="12" y="18" font-size="9.5">spice level</text>
       <g transform="translate(12 24)">${[0, 1, 2, 3, 4].map((i) => `<path class="cf-chili" data-chili="${i}" d="M${i * 14} 2 q4 -3 8 0 q-3 8 -8 10 q-4 -5 0 -10 z" opacity="${i < 2 ? 1 : 0.22}"/>`).join('')}</g>
       <text class="k-mono" data-la x="100" y="38" font-size="11" style="fill:var(--color-matcha)">2/5</text>
       <text class="k-mono" data-lb x="100" y="38" font-size="11" opacity="0" style="fill:var(--color-maple)">4/5 !</text>`));
    // her plate: nasi goreng with a fried egg; his plate: mee goreng noodles
    const plateA = ctx.add(T(120, 410, `<ellipse class="cf-plate st-thin" rx="34" ry="12"/><ellipse class="cf-plate2" rx="27" ry="9"/>
      <path class="cf-fried st-thin" d="M-24 2 Q-20 -14 0 -15 Q22 -14 24 2 Q0 8 -24 2 Z"/><ellipse class="cf-fried2" cx="-8" cy="-6" rx="2.5" ry="1.5"/><ellipse class="cf-fried2" cx="10" cy="-4" rx="2.5" ry="1.5"/><ellipse class="cf-greens" cx="2" cy="-9" rx="2.5" ry="1.4"/>
      <g data-egg><path class="cf-egg st-thin" d="M-14 -12 Q-10 -24 6 -23 Q20 -22 18 -10 Q10 -4 -2 -6 Q-14 -6 -14 -12 Z"/><ellipse class="cf-yolk st-thin" data-yolk cx="2" cy="-14" rx="7" ry="5"/></g>
      <ellipse class="cf-chili" cx="-18" cy="-8" rx="3" ry="1.5"/><path class="cf-greens" d="M20 -3 l6 -5 l2 4 z"/>`));
    const plateB = ctx.add(T(240, 410, `<ellipse class="cf-plate st-thin" rx="34" ry="12"/><ellipse class="cf-plate2" rx="27" ry="9"/>
      <path class="cs-noodle" d="M-22 -2 q6 -10 14 -3 t14 -2 M-18 -8 q8 -8 16 -1 t16 -3 M-20 2 q10 -9 20 -1 t14 -4 M-10 -12 q6 -5 12 -1 t12 -2"/>
      <ellipse class="cf-greens" cx="-12" cy="-9" rx="4" ry="2"/><ellipse class="cf-chili" cx="14" cy="-9" rx="3" ry="1.5"/><ellipse class="cf-egg" cx="4" cy="-2" rx="5" ry="2.4"/>`));
    const stA = ctx.add(steamMark(120, 392, 2, 26)), stB = ctx.add(steamMark(240, 392, 2, 26));
    const spMina = ctx.add(spoon(112, 400, 30));
    const spMe = ctx.add(spoon(248, 400, 30, true));
    gsap.set(spMe, { rotation: 180, transformOrigin: '0% 50%' });
    gsap.set(spMina, { rotation: 0, transformOrigin: '0% 50%' });
    // bites that travel on the spoons
    const biteA = ctx.add(T(148, 400, '<ellipse class="cf-fried st-thin" rx="6" ry="3.5"/><ellipse class="cf-yolk" cx="2" cy="-2" rx="3" ry="2"/>'));
    const biteB = ctx.add(T(212, 400, '<path class="cs-noodle" d="M-6 0 q3 -5 6 0 t6 0"/><ellipse class="cf-greens" cx="0" cy="-3" rx="2" ry="1.2"/>'));
    const sweat = ctx.add(onFace('me', '<path class="st-thin" style="fill:var(--color-river-deep)" data-drop d="M-17 -62 q-3.5 5 0 8 q3.5 -3 0 -8 z"/><path class="st-thin" style="fill:var(--color-river-deep)" data-drop d="M16 -58 q-3.5 5 0 8 q3.5 -3 0 -8 z"/>'));
    const bub = ctx.add(K.bubble(196, 304, 'Swap?', { w: 56, size: 15 }));
    const tl = gsap.timeline();
    gsap.set([biteA, biteB], { opacity: 0 });
    gsap.set($$(sweat, '[data-drop]'), { opacity: 0 });
    gsap.set(bub, { scale: 0, transformOrigin: '0% 100%' });
    tl.from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, 0.05);
    K.pop(tl, [plateA, plateB], 0.15, { stagger: 0.12 });
    ctx.sfx(tl, 'pop', 0.2);
    steam(tl, stA, 0.6, D, 1.3); steam(tl, stB, 0.8, D, 1.3);
    // the yolk: Mina's spoon pokes it, it wobbles and spills
    lift(tl, r.mina, 0.7, '.p-arm-r', -60);
    tl.to(spMina, { x: '+=4', y: '+=6', rotation: 18, duration: 0.3, ease: 'power2.in' }, 0.9)
      .to($(plateA, '[data-yolk]'), { scaleX: 1.35, scaleY: 0.75, transformOrigin: '50% 50%', duration: 0.5, ease: 'elastic.out(1, 0.35)' }, 1.2)
      .to($(plateA, '[data-yolk]'), { x: 3, y: 2, duration: 0.3 }, 1.2);
    ctx.sfx(tl, 'boing', 1.2);
    tl.to(bub, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, 1.4).to(bub, { scale: 0, duration: 0.2 }, 2.5);
    // the swap: both spoons cross the table, no contact, bites land on the other plate
    lift(tl, r.me, 1.6, '.p-arm-l', 60);
    tl.to(spMina, { x: '-=6', y: '-=10', rotation: 0, duration: 0.3, ease: 'power2.out' }, 1.7)
      .to(biteA, { opacity: 1, duration: 0.1 }, 1.9)
      .to(spMe, { x: '+=6', y: '-=10', duration: 0.3, ease: 'power2.out' }, 1.9)
      .to(biteB, { opacity: 1, duration: 0.1 }, 2.1)
      .to(spMina, { x: '+=78', y: '-=22', duration: 0.6, ease: 'power2.inOut' }, 2.3)
      .to(biteA, { x: '+=78', y: '-=22', duration: 0.6, ease: 'power2.inOut' }, 2.3)
      .to(spMe, { x: '-=78', y: '-=6', duration: 0.6, ease: 'power2.inOut' }, 2.45)
      .to(biteB, { x: '-=78', y: '-=6', duration: 0.6, ease: 'power2.inOut' }, 2.45)
      .to(biteA, { x: '+=8', y: '+=26', duration: 0.3, ease: 'bounce.out' }, 2.95)
      .to(biteB, { x: '-=10', y: '+=10', duration: 0.3, ease: 'bounce.out' }, 3.1)
      .to(spMina, { x: '-=78', y: '+=22', duration: 0.5, ease: 'power2.inOut' }, 3.1)
      .to(spMe, { x: '+=78', y: '+=16', duration: 0.5, ease: 'power2.inOut' }, 3.2);
    ctx.sfx(tl, 'whoosh', 2.3); ctx.sfx(tl, 'pop', 2.95);
    lower(tl, r.mina, 3.5, '.p-arm-r'); lower(tl, r.me, 3.6, '.p-arm-l');
    // spice: his bite was the spicy one. Chilis light up, sweat, blush.
    tl.to($$(hud, '[data-chili]'), { opacity: 1, duration: 0.2, stagger: 0.18 }, 3.5);
    swapText(tl, $(hud, '[data-la]'), $(hud, '[data-lb]'), 3.9);
    tl.to($$(r.me, '.f-blush'), { scale: 1.9, transformOrigin: '50% 50%', duration: 0.4, ease: 'back.out(2)' }, 3.7)
      .to($(r.me, '.p-head'), { x: -2, duration: 0.06, yoyo: true, repeat: 9, ease: 'none' }, 3.8)
      .fromTo($$(sweat, '[data-drop]'), { opacity: 0 }, { opacity: 1, duration: 0.12, stagger: 0.2 }, 3.8)
      .fromTo($$(sweat, '[data-drop]'), { y: -4, scale: 1.5, transformOrigin: '50% 50%' }, { y: 10, duration: 0.6, ease: 'power1.in', stagger: 0.2 }, 3.8)
      .to($$(sweat, '[data-drop]'), { opacity: 0, duration: 0.2, stagger: 0.2 }, 4.4);
    laugh(tl, r.mina, 4.0, 4);
    ctx.sfx(tl, 'sparkle', 3.9);
    tl.to({}, { duration: 0.1 }, D);
    ctx.say('Dongmun: halal nasi goreng, noodles, one fried egg.', 0.2, 2.3);
    ctx.say('Spoon diplomacy. His bite was the spicy one.', 2.6, 2.5);
    return tl;
  });

  /* ---------- Lunch 3: wood-fired pizza ---------- */
  M.scene('lunch-pizza', (ctx) => {
    const D = 5.4;
    const r = room(ctx, { sign: 'PIZZERIA · 화덕피자', signCls: 'k-mono', signSize: 12, win: false });
    ctx.add(`<g>${T(30, 128, `<rect class="f-cream st-out" width="104" height="104" rx="6"/><rect class="f-glass" x="6" y="6" width="92" height="92" rx="3"/><path class="f-mtn-3" d="M6 76 Q36 54 62 70 Q84 82 98 68 V98 H6 Z"/>${K.tree('maple', 74, 98, 46)}${K.tree('ginkgo', 32, 98, 36)}<path class="st-out nf" d="M52 6 V98 M6 52 H98"/>`)}</g>`);
    // the oven, back left, with a flickering fire
    const oven = ctx.add(`<g>${T(274, 322, `<rect class="cf-stone2 st-out" x="-56" y="-10" width="112" height="22" rx="3"/><path class="cf-oven st-out" d="M-50 -10 C-50 -70 50 -70 50 -10 Z"/><path class="cf-oven2" d="M-42 -12 C-42 -60 42 -60 42 -12 Z"/>
      <path class="cf-oven-mouth st-out" d="M-24 -10 C-24 -40 24 -40 24 -10 Z"/>
      <g data-fire><path class="cf-fire" d="M-14 -10 Q-16 -26 -6 -30 Q-2 -22 2 -32 Q10 -24 8 -14 Q4 -8 -14 -10 Z"/><path class="cf-fire2" d="M-8 -10 Q-9 -20 -2 -24 Q2 -18 4 -22 Q7 -16 4 -10 Z"/></g>
      <ellipse class="cf-ember" cx="0" cy="-10" rx="20" ry="2.5"/><rect class="cf-brick" x="-22" y="-74" width="14" height="22" rx="2"/><path class="cs-mortar" d="M-50 -30 H50 M-45 -45 H45"/>`)}</g>`);
    const hud = ctx.add(K.hud(16, 22, 150, 46,
      `<text class="k-mono k-light" x="12" y="18" font-size="9.5">oven: <tspan style="fill:var(--color-maple)">430°C</tspan></text>
       <text class="k-mono k-light" x="12" y="36" font-size="9.5">cheese pull: <tspan data-cm style="fill:var(--color-gold)">0</tspan> cm</text>`));
    const pizzaMark = `<circle class="cf-crust2 st-out" r="30"/><circle class="cf-crust" r="26"/><circle class="cf-tomato" r="23"/><circle class="cf-cheese" r="21"/>
      ${[[-9, -8], [8, -10], [10, 7], [-10, 9], [0, 0], [-16, 1], [16, -2]].map(([x, y]) => `<circle class="cf-cheese2" cx="${x}" cy="${y}" r="3.5"/>`).join('')}
      ${[[-4, -14], [13, 2], [-13, -3], [4, 12]].map(([x, y]) => `<path class="cf-basil" d="M${x} ${y} q5 -4 7 1 q-4 4 -7 -1 z"/>`).join('')}
      <path class="st-thin nf" d="M0 0 L0 -30 M0 0 L26 -15 M0 0 L26 15 M0 0 L0 30 M0 0 L-26 15 M0 0 L-26 -15" opacity="0.5"/>`;
    const peel = ctx.add(T(248, 304, '<path class="cs-wood" d="M-20 0 H160"/><path class="cf-wood st-out" d="M30 -14 H-24 V14 H30 Q40 0 30 -14 Z"/>', 'data-peel'));
    const pizza = ctx.add(T(252, 304, `<g transform="scale(1 0.55)">${pizzaMark}</g>`));
    const slice = ctx.add(T(180, 412, `<g transform="scale(1.3 0.8)"><path class="cf-crust2 st-out" d="M0 0 L-26 -15 A30 30 0 0 1 0 -30 Z"/><path class="cf-cheese" d="M0 -1 L-22 -13 A25 25 0 0 1 -1 -25 Z"/><circle class="cf-cheese2" cx="-9" cy="-14" r="3"/><path class="cf-basil" d="M-14 -8 q5 -4 7 1 q-4 4 -7 -1 z"/></g>`));
    const strings = ctx.add(`<g>${[-5, 0, 5].map((x) => `<line class="cs-cheese" data-string x1="${179 + x}" y1="410" x2="${179 + x}" y2="410"/>`).join('')}</g>`);
    const st = ctx.add(steamMark(180, 386, 3, 30));
    const tl = gsap.timeline();
    gsap.set(slice, { opacity: 0 });
    tl.from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, 0.05);
    // fire flickers the whole scene
    tl.to($(oven, '[data-fire]'), { scaleY: 1.18, scaleX: 0.92, transformOrigin: '50% 100%', duration: 0.14, yoyo: true, repeat: Math.round(D / 0.14) | 1, ease: 'sine.inOut' }, 0)
      .to($(oven, '.cf-fire2'), { x: 2, duration: 0.11, yoyo: true, repeat: Math.round(D / 0.11) | 1, ease: 'sine.inOut' }, 0);
    // peel slides out of the oven, pizza lands on the table, peel goes back
    tl.from(peel, { x: '+=70', duration: 0.6, ease: 'power2.out' }, 0.5)
      .from(pizza, { x: '+=70', duration: 0.6, ease: 'power2.out' }, 0.5)
      .to(peel, { x: '-=68', y: '+=72', duration: 0.7, ease: 'power2.inOut' }, 1.15)
      .to(pizza, { x: '-=72', y: '+=72', duration: 0.7, ease: 'power2.inOut' }, 1.15)
      .to(pizza, { y: '+=36', duration: 0.3, ease: 'power1.in' }, 1.85)
      .to($(pizza, 'g'), { scaleY: 0.45, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 2.15)
      .to(peel, { x: '+=150', y: '-=72', duration: 0.6, ease: 'power2.in' }, 1.95);
    ctx.sfx(tl, 'whoosh', 1.2); ctx.sfx(tl, 'thud', 2.15);
    steam(tl, st, 2.2, D, 1.2);
    // the cheese pull: Mina lifts a slice, the strings stretch and snap
    lift(tl, r.mina, 2.4, '.p-arm-r', -80);
    const S = $$(strings, '[data-string]');
    tl.to(slice, { opacity: 1, duration: 0.05 }, 2.55)
      .to(slice, { x: '-=4', y: '+=4', duration: 0.2, ease: 'power1.in' }, 2.6)       // anticipation
      .to($(r.mina, '.p-arm-r'), { rotation: -140, duration: 0.6, ease: 'power2.out' }, 2.8)
      .to(slice, { x: '-=58', y: '-=50', rotation: -14, duration: 0.7, ease: 'power2.out' }, 2.8)
      .to(S, { attr: { y2: '-=46', x2: '-=58' }, duration: 0.7, ease: 'power2.out', stagger: 0.03 }, 2.8)
      // she keeps pulling: rises off the chair, the strings stretch further
      .to(r.mina, { y: '-=18', duration: 0.5, ease: 'power2.out' }, 3.3)
      .to($(r.mina, '.p-arm-r'), { rotation: -165, duration: 0.5, ease: 'power2.out' }, 3.3)
      .to(slice, { y: '-=40', x: '-=6', duration: 0.6, ease: 'power2.out' }, 3.3)
      .to(S, { attr: { y2: '-=40', x2: '-=6' }, duration: 0.6, ease: 'power2.out', stagger: 0.03 }, 3.3);
    count(tl, $(hud, '[data-cm]'), 2.8, 1.2, 37);
    tl.to(slice, { y: '-=6', duration: 0.4, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 3.9)
      .to(S, { attr: { y2: '-=6' }, duration: 0.4, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 3.9)
      // snap
      .to(S, { attr: { y2: '+=92', x2: '+=64' }, duration: 0.16, ease: 'power3.in', stagger: 0.04 }, 4.3)
      .to(slice, { rotation: 6, y: '-=8', duration: 0.5, ease: 'wiggle6' }, 4.33)
      .to(r.mina, { y: '+=18', duration: 0.4, ease: 'bounce.out' }, 4.35)
      .to($(r.mina, '.p-arm-r'), { rotation: -120, duration: 0.5, ease: 'wiggle3' }, 4.35)
      .to($(r.mina, '.p-head'), { rotation: -8, transformOrigin: '50% 90%', duration: 0.5, ease: 'wiggle3' }, 4.33);
    ctx.sfx(tl, 'boing', 4.3);
    laugh(tl, r.me, 4.4, 3);
    tl.to($$(r.me, '.p-glasses'), { y: -2, duration: 0.15, yoyo: true, repeat: 1 }, 4.4);
    tl.to({}, { duration: 0.1 }, D);
    ctx.say('Wood-fired pizza. 430°C, ninety seconds, done.', 0.3, 2.3);
    ctx.say('Cheese pull: 37 cm. A new island record.', 2.9, 2.4);
    return tl;
  });

  /* ---------- Lunch 4: decide there (split-flap departures board) ---------- */
  M.scene('lunch-decide', (ctx) => {
    const D = 5.4;
    const r = room(ctx, { win: false, lamp: false });
    const words = ['BULGOGI', 'NASI GORENG', 'PIZZA', 'LUNCHBOX', 'BULGOGI', 'PIZZA', 'NASI GORENG', 'WHATEVER SMELLS BEST'];
    const rows = [['12:30', 'BULGOGI', 'ON TIME', 'k-flap-green'], ['12:30', 'NASI GORENG', 'ON TIME', 'k-flap-green'], ['12:35', 'PIZZA', 'DELAYED', 'k-flap-amber'], ['12:40', 'LUNCHBOX', 'CANCELLED', 'k-flap-red']];
    const board = ctx.add(`<g>${T(180, 172, `<rect class="cf-flap st-out" x="-150" y="-106" width="300" height="212" rx="10"/>
      <text class="k-flap-amber" x="-136" y="-84" font-size="11">LUNCH · DEPARTURES</text><text class="k-flap" x="136" y="-84" font-size="11" text-anchor="end" data-clock>12:2<tspan data-sec>8</tspan></text>
      <path class="cs-iron-thin" d="M-136 -74 H136" style="stroke:var(--flap-face)"/>
      ${rows.map(([t, n, s, c], i) => `<text class="k-flap" x="-136" y="${-54 + i * 20}" font-size="11">${t}</text><text class="k-flap" x="-92" y="${-54 + i * 20}" font-size="11">${n}</text><text class="${c}" x="136" y="${-54 + i * 20}" font-size="11" text-anchor="end">${s}</text>`).join('')}
      <text class="k-flap-amber" x="-136" y="48" font-size="10">NOW BOARDING</text>
      <g data-flaps>${words.map((w) => `<g data-flap><rect class="cf-flap2 st-out" x="-136" y="56" width="272" height="38" rx="5"/><text class="k-flap" x="0" y="82" font-size="${w.length > 12 ? 18 : 22}" text-anchor="middle" font-weight="700">${w}</text></g>`).join('')}</g>
      <path class="cs-iron-thin" d="M-136 75 H136" style="stroke:var(--flap-bg)"/>`)}</g>`);
    const hud = ctx.add(K.hud(16, 12, 150, 46,
      `<text class="k-mono k-light" x="12" y="18" font-size="9.5">lunch.decide()</text>
       <text class="k-mono" data-ra x="12" y="36" font-size="9.5" style="fill:var(--color-gold)">resolving<tspan data-dots>...</tspan></text>
       <text class="k-mono" data-rb x="12" y="36" font-size="9.5" opacity="0" style="fill:var(--color-matcha)">→ follow nose</text>`));
    const lunchbox = ctx.add(T(180, 410, '<rect class="cf-plate st-out" x="-30" y="-12" width="60" height="24" rx="4"/><path class="st-thin nf" d="M-30 -2 H30 M0 -12 V12"/><ellipse class="cf-rice" cx="-15" cy="-7" rx="10" ry="3.5"/><ellipse class="cf-chili" cx="15" cy="-7" rx="8" ry="3"/><ellipse class="cf-greens" cx="-15" cy="5" rx="9" ry="3"/><ellipse class="cf-yolk" cx="15" cy="5" rx="8" ry="3"/>'));
    const smell = ctx.add(`<g>${[0, 1, 2].map((i) => `<path class="cs-smell" data-smell d="M${392 + i * 16} ${336 + i * 22} c -30 -12 -40 14 -70 4 s -40 14 -70 2"/>`).join('')}</g>`);
    const sniffA = ctx.add(onFace('mina', '<path class="cs-sniff" data-sn d="M6 -38 q3 -2 2 -5 M9 -41 q3 -2 2 -5"/>'));
    const sniffB = ctx.add(onFace('me', '<path class="cs-sniff" data-sn d="M6 -38 q3 -2 2 -5 M9 -41 q3 -2 2 -5"/>'));
    const tl = gsap.timeline();
    const flaps = $$(board, '[data-flap]');
    gsap.set(flaps.slice(1), { scaleY: 0, transformOrigin: '50% 50%' });
    gsap.set([$(sniffA, '[data-sn]'), $(sniffB, '[data-sn]')], { drawSVG: '0% 0%' });
    gsap.set($$(smell, '[data-smell]'), { drawSVG: '0% 0%' });
    tl.from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, 0.05)
      .from(board, { y: '-=30', opacity: 0, duration: 0.5, ease: 'back.out(1.6)' }, 0.1);
    count(tl, $(board, '[data-sec]'), 0.3, D - 0.6, 9);
    // split-flap: each flip folds the old flap away and the next one down, slowing toward the end
    let t = 0.8;
    const gaps = [0.2, 0.2, 0.2, 0.24, 0.3, 0.4, 0.6];
    for (let i = 0; i < flaps.length - 1; i += 1) {
      tl.to(flaps[i], { scaleY: 0, duration: 0.09, ease: 'power1.in' }, t)
        .to(flaps[i + 1], { scaleY: 1, duration: 0.12, ease: 'power1.out' }, t + 0.09);
      ctx.sfx(tl, 'click', t);
      t += gaps[i];
    }
    const settle = t - 0.35; // the last flap landed; ~3.2
    tl.to(flaps[flaps.length - 1], { scaleY: 1.06, duration: 0.12, yoyo: true, repeat: 1 }, settle)
      .to($(hud, '[data-dots]'), { opacity: 0.2, duration: 0.3, yoyo: true, repeat: 7 }, 0.6);
    ctx.sfx(tl, 'chime', settle);
    swapText(tl, $(hud, '[data-ra]'), $(hud, '[data-rb]'), settle + 0.2);
    // the smell drifts in from the right; both of us sniff and lean toward it
    tl.fromTo($$(smell, '[data-smell]'), { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 1.4, ease: 'sine.out', stagger: 0.2 }, 1.6)
      .to($$(smell, '[data-smell]'), { x: -40, y: -16, duration: 2.4, ease: 'none', stagger: 0.2 }, 1.6)
      .to($$(smell, '[data-smell]'), { opacity: 0, duration: 0.5, stagger: 0.2 }, 3.6)
      .to([$(r.mina, '.p-head'), $(r.me, '.p-head')], { rotation: -14, y: -4, transformOrigin: '50% 90%', duration: 0.4, ease: 'back.out(2)' }, 2.2)
      .fromTo([$(sniffA, '[data-sn]'), $(sniffB, '[data-sn]')], { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 0.25, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 2.3)
      .to([$(r.mina, '.p-head'), $(r.me, '.p-head')], { rotation: 0, y: 0, duration: 0.3 }, 3.9);
    K.hop(tl, r.mina, settle + 0.1, 12);
    K.hop(tl, r.me, settle + 0.2, 12);
    tl.to([$(r.mina, '.p-arm-r'), $(r.me, '.p-arm-r')], { rotation: -150, transformOrigin: '50% 0%', duration: 0.3, ease: 'back.out(2)' }, settle + 0.1)
      .to([$(r.mina, '.p-arm-r'), $(r.me, '.p-arm-r')], { rotation: 0, duration: 0.3 }, settle + 1.0);
    tl.to({}, { duration: 0.1 }, D);
    ctx.say('Lunch is undecided. The board is working on it.', 0.3, 2.4);
    ctx.say('Final answer: whatever smells best. Follow the nose.', 3.3, 2.1);
    return tl;
  });

  /* ---------- Cafe Daenerys at sunset ----------
     Shot A (0–3.5 s): golden-hour drive along the Bukhan river, the ivy-covered brick facade, lamps on, we walk in.
     Shot B (3.5–8 s): 3rd-floor arched window, chandelier, river at sunset, two drinks and some latte art. */
  const ARCH = 'M100 420 V220 A100 100 0 0 1 300 220 V420 Z';
  // The facade, 260 wide, drawn with its bottom-left at (0, 0) and top at y = -316. Random ivy at build time.
  const facade = () => {
    const pick = () => { const r = Math.random(); return r < 0.42 ? 'cf-ivy-red' : r < 0.72 ? 'cf-ivy-orange' : r < 0.93 ? 'cf-ivy-rust' : 'cf-ivy-green'; };
    const bare = [[60, -170, 42], [200, -230, 36], [120, -60, 30]];
    const BLOB = 'M-14 0 C-17 -9 -8 -15 -2 -11 C1 -19 15 -17 15 -6 C21 -4 19 7 10 7 C6 13 -6 13 -10 7 C-17 7 -19 3 -14 0 Z';
    let leaves = '';
    for (let i = 0; i < 96; i += 1) {
      const x = K.rnd(4, 256), y = -316 + Math.pow(Math.random(), 1.4) * 306;
      if (Math.abs(x - 130) < 48 && y > -134) continue;                           // door and plaque stay clear
      if (bare.some(([bx, by, br]) => Math.hypot(x - bx, y - by) < br)) continue;   // shed patches
      if (y > -90 && Math.random() < 0.5) continue;                                // thinner at the bottom
      leaves += `<path class="${pick()}" d="${BLOB}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${K.rnd(0, 360).toFixed(0)}) scale(${K.rnd(0.55, 1.05).toFixed(2)})"/>`;
    }
    let mortar = '';
    for (let y = -304; y < 0; y += 14) mortar += `M0 ${y} H260 `;
    const win = (x, y, lit = false) => `<path class="cf-glass-warm cs-iron-thin" d="M${x - 20} ${y + 62} V${y + 20} A20 20 0 0 1 ${x + 20} ${y + 20} V${y + 62} Z"/><path class="cs-iron-thin" d="M${x} ${y + 2} V${y + 62} M${x - 20} ${y + 30} H${x + 20}"/>${lit ? '' : ''}<path class="f-lit" data-lit opacity="0" d="M${x - 18} ${y + 60} V${y + 20} A18 18 0 0 1 ${x + 18} ${y + 20} V${y + 60} Z"/>`;
    const lamp = (x) => `<g data-lamp transform="translate(${x} 0)"><rect class="cf-lamp st-thin" x="-7" y="-18" width="14" height="18" rx="2"/><path class="cs-lamp" d="M0 -18 V-70"/><path class="cs-lamp" d="M0 -62 C-12 -62 -16 -70 -14 -78 M0 -62 C12 -62 16 -70 14 -78 M0 -68 C-8 -70 -8 -78 -6 -84 M0 -68 C8 -70 8 -78 6 -84"/>
      ${[[-14, -80], [-6, -86], [0, -94], [6, -86], [14, -80]].map(([gx, gy]) => `<circle class="cf-warm st-thin" cx="${gx}" cy="${gy}" r="4.2"/>`).join('')}<circle class="cf-sun" data-glow cx="0" cy="-86" r="17" opacity="0"/></g>`;
    const conifer = (x) => `<g transform="translate(${x} 0)"><rect class="cf-brick2 st-thin" x="-9" y="-8" width="18" height="8" rx="2"/><path class="cf-conifer" d="M0 -84 L-16 -8 H16 Z"/><path class="cf-conifer2" d="M0 -84 L-6 -8 H6 Z"/></g>`;
    const mums = (x) => `<g transform="translate(${x} 0)"><rect class="cf-brick2 st-thin" x="-8" y="-9" width="16" height="9" rx="2"/><circle class="cf-mum" cx="-5" cy="-13" r="5"/><circle class="cf-mum" cx="5" cy="-13" r="5"/><circle class="cf-mum" cx="0" cy="-18" r="5"/></g>`;
    return `<g data-facade>
      <rect class="cf-brick st-out" x="0" y="-316" width="260" height="316"/><path class="cs-mortar" d="${mortar}"/>
      <rect class="cf-brick2" x="-4" y="-322" width="268" height="10" rx="2"/>
      ${win(50, -282)}${win(130, -282)}${win(210, -282)}${win(50, -184)}${win(130, -184)}${win(210, -184)}${win(50, -86)}${win(210, -86)}
      <path class="cs-vine" d="M20 -300 C40 -250 10 -200 40 -150 C60 -110 30 -60 60 -10 M230 -310 C210 -260 250 -220 220 -170 C200 -130 240 -90 210 -40 M100 -316 C120 -280 90 -240 110 -200 M160 -300 C180 -260 150 -230 175 -190 M70 -200 C90 -180 80 -150 100 -130 M190 -260 C210 -240 200 -210 220 -190"/>
      ${leaves}
      <rect class="cf-brick2 st-out" x="92" y="-76" width="76" height="76" rx="2"/>
      <g data-door-l><rect class="cf-iron st-out" x="102" y="-64" width="28" height="64"/><rect class="cf-glass-warm" x="106" y="-58" width="20" height="30" rx="1"/><circle class="cf-gold" cx="126" cy="-30" r="1.6"/></g>
      <g data-door-r><rect class="cf-iron st-out" x="130" y="-64" width="28" height="64"/><rect class="cf-glass-warm" x="134" y="-58" width="20" height="30" rx="1"/><circle class="cf-gold" cx="134" cy="-30" r="1.6"/></g>
      <g data-plaque><rect class="cf-navy st-out" x="88" y="-112" width="84" height="26" rx="2"/><rect class="cs-gold" x="91" y="-109" width="78" height="20" rx="1"/><text class="cf-serif" x="130" y="-94" font-size="11.5" text-anchor="middle" font-weight="700">DAENERYS</text>
        <circle class="cf-navy st-thin" cx="130" cy="-124" r="8"/><circle class="cs-gold" cx="130" cy="-124" r="6"/><text class="cf-serif" x="130" y="-120" font-size="9" text-anchor="middle" font-weight="700" letter-spacing="0">D</text></g>
      ${conifer(44)}${conifer(216)}${mums(78)}${mums(182)}${lamp(14)}${lamp(246)}
    </g>`;
  };
  // A latte cup, three-quarter view, origin at the saucer centre. `top` is the class of the drink surface.
  const cup = (x, y, top, extra = '') => T(x, y, `<ellipse class="cf-warm st-thin" rx="26" ry="8"/><ellipse class="cf-plate2" rx="17" ry="5" cy="-1"/>
    <path class="cf-warm st-thin" d="M-20 -34 C-22 -14 -16 -4 -13 -2 H13 C16 -4 22 -14 20 -34 Z"/><path class="cs-foam" d="M20 -28 C32 -28 32 -12 20 -10" style="stroke-width:4"/>
    <ellipse class="cf-warm st-thin" rx="21" ry="7" cy="-34"/><ellipse class="${top}" data-top rx="17" ry="5.4" cy="-34"/>${extra}`, 'data-cup');

  M.scene('cafe', (ctx) => {
    const { st } = ctx;
    const D = 8.0, CUT = 3.5;
    const choice = st.cafe;
    /* ----- shot A ----- */
    const A = ctx.add('<g data-shot="a"></g>');
    const addA = (s) => { A.insertAdjacentHTML('beforeend', s); return A.lastElementChild; };
    addA('<rect class="cf-sky1" width="360" height="110"/><rect class="cf-sky2" y="100" width="360" height="80"/><rect class="cf-sky3" y="170" width="360" height="70"/><rect class="cf-sky4" y="230" width="360" height="60"/><rect class="cf-sky5" y="280" width="360" height="90"/>');
    addA('<g><rect class="cf-sun" y="216" width="360" height="5" rx="2.5" opacity="0.5"/><rect class="cf-sun" x="40" y="258" width="320" height="4" rx="2" opacity="0.45"/><rect class="cf-sky3" x="0" y="150" width="200" height="4" rx="2" opacity="0.6"/></g>');
    const sun = addA(K.sun(66, 318, 22));
    const farA = addA(`<g>${K.ridge(338, 52, 720, 7, 'cf-hill1', 1.3)}</g>`);
    const midA = addA(`<g>${K.ridge(356, 36, 720, 9, 'cf-hill2', 2.1)}</g>`);
    const riverA = addA(`<g><rect class="cf-water" y="372" width="720" height="70"/><path class="cs-ripple" d="M40 392 H92 M120 404 H150 M20 418 H60 M200 388 H260 M300 410 H340 M420 396 H470 M520 386 H600 M560 414 H610 M660 400 H700"/><rect class="cf-sun" x="30" y="378" width="60" height="3" rx="1.5" opacity="0.6"/><rect class="cf-sun" x="52" y="396" width="36" height="3" rx="1.5" opacity="0.45"/><rect class="cf-hill3" y="442" width="720" height="26"/><path class="cs-vine" d="M30 442 V420 M26 428 L34 422 M160 442 V418 M156 426 L164 418 M600 442 V424 M596 430 L604 424"/></g>`);
    const world = addA(`<g transform="translate(320 0)">${T(50, 466, facade())}<rect class="cf-stone" x="-40" y="466" width="440" height="16"/><path class="cs-iron-thin" d="M-40 474 H400 M0 466 V482 M60 466 V482 M120 466 V482 M180 466 V482 M240 466 V482 M300 466 V482 M360 466 V482" opacity="0.35"/></g>`);
    addA('<rect class="cf-road" y="482" width="360" height="78"/><rect class="f-metal" y="482" width="360" height="3"/>');
    const lanes = addA('<g><path class="st-lane" d="M0 524 H760"/></g>');
    const car = addA(`<g transform="translate(118 552)">${K.car({ s: 0.78 })}</g>`);
    const mina = addA(K.person('mina', { x: 146, y: 548, s: 0.86 }));
    const me = addA(K.person('me', { x: 170, y: 548, s: 0.86 }));
    const fall = addA(`<g>${[0, 1, 2, 3, 4].map((i) => `<ellipse class="${i % 2 ? 'cf-ivy-orange' : 'cf-ivy-red'}" data-leaf cx="${80 + i * 48}" cy="${170 + (i % 3) * 30}" rx="5" ry="3"/>`).join('')}</g>`);
    /* ----- shot B ----- */
    const B = ctx.add('<g data-shot="b"></g>');
    const addB = (s) => { B.insertAdjacentHTML('beforeend', s); return B.lastElementChild; };
    let mortarB = '';
    for (let y = 8; y < 640; y += 16) mortarB += `M0 ${y} H360 `;
    for (let y = 8, k = 0; y < 640; y += 16, k += 1) for (let x = (k % 2) * 20; x < 360; x += 40) mortarB += `M${x} ${y} V${y + 16} `;
    addB(`<rect class="cf-brick2" width="360" height="640"/><path class="cs-mortar" d="${mortarB}" opacity="0.6"/>`);
    addB(`<clipPath id="cf-win-clip"><path d="${ARCH}"/></clipPath>`);
    const view = addB(`<g clip-path="url(#cf-win-clip)"><rect class="cf-sky2" x="100" y="110" width="200" height="70"/><rect class="cf-sky3" x="100" y="176" width="200" height="56"/><rect class="cf-sky4" x="100" y="228" width="200" height="46"/><rect class="cf-sky5" x="100" y="270" width="200" height="50"/>
      <rect class="cf-sun" x="100" y="246" width="200" height="4" rx="2" opacity="0.5"/>
      ${K.ridge(304, 30, 360, 6, 'cf-hill1', 1.7)}${K.ridge(318, 22, 360, 8, 'cf-hill2', 0.9)}
      <rect class="cf-water" x="100" y="330" width="200" height="90"/>
      <g data-refl><rect class="cf-sun" x="150" y="338" width="100" height="3" rx="1.5" opacity="0.7"/><rect class="cf-sun" x="166" y="350" width="68" height="3" rx="1.5" opacity="0.55"/><rect class="cf-sun" x="140" y="364" width="120" height="3" rx="1.5" opacity="0.4"/><rect class="cf-sun" x="176" y="380" width="48" height="3" rx="1.5" opacity="0.35"/></g>
      <path class="cs-ripple" d="M112 346 H130 M260 356 H286 M120 376 H146 M250 392 H276 M190 404 H214"/>
      <path class="cs-vine" d="M112 332 V310 M108 318 L116 310 M286 332 V306 M282 314 L290 306 M292 320 L286 314"/>
      <rect class="cf-sky1" data-dusk x="100" y="110" width="200" height="320" opacity="0"/></g>`);
    addB(`<path class="cs-arch" d="${ARCH}"/><path class="cs-iron" d="M200 120 V420 M100 220 H300"/><rect class="cf-iron" x="92" y="418" width="216" height="8" rx="2"/>`);
    const glow = addB('<rect class="cf-glass-warm" x="0" y="110" width="360" height="330" opacity="0.14"/>');
    const chand = addB(`<g>${T(200, 0, `<path class="cs-gold" d="M0 0 V26"/><circle class="cf-gold st-thin" cy="30" r="5"/><path class="cs-gold" d="M0 34 C-30 36 -46 50 -48 64 M0 34 C30 36 46 50 48 64 M0 34 C-14 40 -22 52 -24 66 M0 34 C14 40 22 52 24 66" style="stroke-width:2.5"/>
      ${[-48, -24, 0, 24, 48].map((cx) => `<rect class="cf-gold st-thin" x="${cx - 3}" y="62" width="6" height="7" rx="1"/><circle class="cf-sun" cx="${cx}" cy="56" r="5"/>`).join('')}
      ${[-44, -36, -28, -16, -8, 8, 16, 28, 36, 44].map((cx, i) => `<path class="cf-warm st-thin" data-xtal d="M${cx} ${70 + (i % 2) * 6} l3 5 l-3 6 l-3 -6 z"/>`).join('')}
      <circle class="cf-sun" data-cglow cy="58" r="52" opacity="0.1"/>`)}</g>`);
    addB(`<g>${T(50, 232, '<rect class="cf-gold st-out" x="-24" y="-30" width="48" height="60" rx="2"/><rect class="cf-warm" x="-18" y="-24" width="36" height="48"/><circle class="cf-navy" cx="0" cy="-4" r="9"/><path class="cf-navy" d="M-14 24 C-10 6 10 6 14 24 Z"/><circle class="cf-greens" cx="-24" cy="-30" r="6"/><circle class="cf-conifer2" cx="-10" cy="-34" r="6"/><circle class="cf-greens" cx="6" cy="-34" r="6"/><circle class="cf-conifer2" cx="22" cy="-30" r="6"/>')}</g>`);
    const minaB = addB(K.person('mina', { x: 86, y: 462, s: 1.3 }));
    const meB = addB(K.person('me', { x: 274, y: 462, s: 1.3, flip: true }));
    addB('<g><rect class="cf-wood" y="478" width="360" height="162"/><path class="st-thin nf" d="M0 520 H360 M0 560 H360 M0 600 H360" opacity="0.25"/><rect class="cf-iron" x="168" y="452" width="24" height="40"/><rect class="cf-iron st-out" x="130" y="486" width="100" height="8" rx="3"/><ellipse class="cf-iron st-out" cx="180" cy="452" rx="128" ry="20"/><ellipse class="cf-wood" cx="180" cy="450" rx="118" ry="15"/></g>');
    // drinks: hers depends on the answer, mine is an americano with "art"
    const leaf = '<path class="cs-foam" data-art d="M-10 -32 C-4 -38 8 -38 12 -34 M-9 -33 C-4 -32 2 -34 8 -34 M-7 -36 C-2 -37 4 -37 9 -36 M-11 -34 C-8 -35 -4 -36 -1 -36" style="stroke-width:1.6"/>';
    const topCls = { 'Matcha latte': 'cf-matcha', 'Salted milk tea': 'cf-milktea', 'Chestnut latte': 'cf-chestnut', 'Surprise me': 'cf-matcha' }[choice] || 'cf-matcha';
    let extra = leaf;
    if (choice === 'Salted milk tea') extra = '<ellipse class="cf-foam" rx="15" ry="4.6" cy="-34.4"/><circle class="cf-plate2" cx="-6" cy="-35" r="1"/><circle class="cf-plate2" cx="5" cy="-33" r="1"/><circle class="cf-plate2" cx="9" cy="-36" r="0.9"/>' + leaf.replace('cs-foam', 'cs-tea');
    if (choice === 'Chestnut latte') extra = leaf + '<g data-chestnut><ellipse class="cf-warm" cx="20" cy="-3" rx="7" ry="3"/><path class="cf-chestnut2 st-thin" d="M14 -3 C14 -12 20 -17 20 -17 C20 -17 26 -12 26 -3 Z"/><path class="cf-warm" d="M15 -3 C15 -7 25 -7 25 -3 Z"/></g>';
    const hers = addB(cup(144, 442, topCls, extra));
    const sleeve = choice === 'Surprise me' ? addB(T(144, 442, '<path class="cf-sleeve st-out" d="M-24 -42 C-26 -20 -18 -6 -14 -2 H14 C18 -6 26 -20 24 -42 Z"/><text class="k-display" x="0" y="-14" font-size="22" text-anchor="middle" style="fill:var(--cafe-warm-white)">?</text>')) : null;
    const mine = addB(cup(220, 442, 'cf-coffee', '<path class="cs-foam" data-art d="M-8 -34 C-8 -38 0 -39 4 -36 C10 -37 12 -33 8 -31 C4 -29 -2 -30 -4 -32 C-7 -32 -9 -33 -8 -34" style="stroke-width:1.8"/>'));
    const stH = addB(steamMark(144, 404, 2, 24)), stM = addB(steamMark(220, 404, 2, 24));
    const printer = addB(T(40, 446, '<rect class="cf-iron st-out" x="-16" y="-12" width="32" height="14" rx="3"/><rect class="cf-plate2" x="-10" y="-10" width="20" height="3" rx="1"/><g data-receipt><rect class="cf-warm st-thin" x="-9" y="-44" width="18" height="34" rx="1"/><path class="st-thin" d="M-5 -38 H5 M-5 -32 H3 M-5 -26 H5 M-5 -20 H1" style="stroke-width:1"/></g>'));
    const hud = ctx.add(K.hud(16, 22, 150, 46,
      `<text class="k-mono k-light" x="12" y="18" font-size="9.5">gps: 북한강로 914</text>
       <text class="k-mono" data-sa x="12" y="36" font-size="11" style="fill:var(--color-gold)">sunset in 00:0<tspan data-s>8</tspan></text>
       <text class="k-mono" data-sb x="12" y="36" font-size="10" opacity="0" style="fill:var(--color-matcha)">sun: set · order #2 ok</text>`));

    const tl = gsap.timeline();
    gsap.set(B, { autoAlpha: 0 });
    gsap.set([mina, me], { opacity: 0 });
    gsap.set($$(world, '[data-glow]'), { opacity: 0 });
    gsap.set($$(B, '[data-art]'), { drawSVG: '0% 0%' });
    gsap.set($(printer, '[data-receipt]'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set([hers, mine], { x: '+=280' });
    if (sleeve) gsap.set(sleeve, { x: '+=280' });
    tl.from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, 0.05);
    count(tl, $(hud, '[data-s]'), 0.2, 7.2, 0);
    // A: the drive. The world slides past and settles; the car rolls on the spot.
    tl.to(farA, { x: '-=40', duration: 2.0, ease: 'power2.out' }, 0)
      .to(midA, { x: '-=80', duration: 2.0, ease: 'power2.out' }, 0)
      .to(riverA, { x: '-=130', duration: 2.0, ease: 'power2.out' }, 0)
      .to(world, { x: '-=320', duration: 2.0, ease: 'power2.out' }, 0)
      .to(lanes, { x: '-=340', duration: 2.0, ease: 'power2.out' }, 0)
      .from(sun, { y: '+=14', duration: 3.4, ease: 'none' }, 0);
    K.wheels(tl, car, 0, 2.0, 2.2);
    K.bob(tl, $(car, '.car-body'), 0, 1.9, 1, 0.14);
    tl.to($(car, '.car-body'), { rotation: -2.5, transformOrigin: '50% 100%', duration: 0.15, yoyo: true, repeat: 1 }, 1.85);
    ctx.sfx(tl, 'whoosh', 0.1);
    // falling ivy leaves
    $$(fall, '[data-leaf]').forEach((l, i) => {
      tl.fromTo(l, { x: 0, y: 0, rotation: 0, opacity: 0 }, { x: -20 - i * 6, y: 260, rotation: 300, opacity: 1, duration: 2.6, ease: 'none', repeat: 1, repeatDelay: 0.1 }, 0.2 + i * 0.35)
        .fromTo(l, { opacity: 1 }, { opacity: 0, duration: 0.4, repeat: 1, repeatDelay: 2.3 }, 2.4 + i * 0.35);
    });
    // lamps flicker on, windows light up
    $$(world, '[data-glow]').forEach((g, i) => tl.to(g, { opacity: 0.45, duration: 0.07, yoyo: true, repeat: 5, ease: 'steps(1)' }, 2.0 + i * 0.12).to(g, { opacity: 0.45, duration: 0.2 }, 2.45 + i * 0.12));
    tl.to($$(world, '[data-lit]'), { opacity: 0.85, duration: 0.3, stagger: { each: 0.08, from: 'random' } }, 2.2);
    ctx.sfx(tl, 'click', 2.0); ctx.sfx(tl, 'sparkle', 2.4);
    // out of the car, up to the door
    tl.to($$(car, '.k-head'), { opacity: 0, duration: 0.2 }, 2.3)
      .to([mina, me], { opacity: 1, duration: 0.2, stagger: 0.1 }, 2.35)
      .to(mina, { x: '+=24', y: '-=70', duration: 0.9, ease: 'none' }, 2.5)
      .to(me, { x: '+=24', y: '-=70', duration: 0.9, ease: 'none' }, 2.6);
    K.walk(tl, mina, 2.5, 0.9); K.walk(tl, me, 2.6, 0.9);
    tl.to($(world, '[data-door-l]'), { scaleX: 0.2, transformOrigin: '0% 50%', duration: 0.35 }, 3.0)
      .to($(world, '[data-door-r]'), { scaleX: 0.2, transformOrigin: '100% 50%', duration: 0.35 }, 3.0)
      .to([mina, me], { opacity: 0, duration: 0.25, stagger: 0.1 }, 3.3);
    ctx.sfx(tl, 'chime', 3.05);
    // cut to the window seat
    tl.to(A, { autoAlpha: 0, duration: 0.45, ease: 'power1.inOut' }, CUT)
      .to(B, { autoAlpha: 1, duration: 0.45, ease: 'power1.inOut' }, CUT);
    // B: the light turns. Dusk creeps in, the river reflection narrows, the chandelier takes over.
    tl.to($(view, '[data-dusk]'), { opacity: 0.38, duration: D - CUT, ease: 'sine.in' }, CUT)
      .to($$(view, '[data-refl] rect'), { scaleX: 0.3, transformOrigin: '50% 50%', opacity: 0.2, duration: D - CUT, ease: 'sine.in', stagger: 0.1 }, CUT)
      .to(glow, { opacity: 0.04, duration: D - CUT, ease: 'sine.in' }, CUT)
      .to($(chand, '[data-cglow]'), { opacity: 0.24, duration: 2.5, ease: 'sine.inOut' }, CUT + 1)
      .to($$(chand, '[data-xtal]'), { opacity: 0.35, duration: 0.3, yoyo: true, repeat: 13, stagger: { each: 0.07, from: 'random' }, ease: 'sine.inOut' }, CUT);
    // drinks arrive from the right, with a little landing squash
    const arrive = (el, at) => tl.to(el, { x: '-=280', duration: 0.7, ease: 'power3.out' }, at).to(el, { scaleY: 0.92, transformOrigin: '50% 100%', duration: 0.1, yoyo: true, repeat: 1 }, at + 0.55);
    arrive(mine, CUT + 0.5); arrive(hers, CUT + 0.7); if (sleeve) arrive(sleeve, CUT + 0.7);
    ctx.sfx(tl, 'thud', CUT + 1.05); ctx.sfx(tl, 'thud', CUT + 1.25);
    tl.to($(printer, '[data-receipt]'), { scaleY: 1, duration: 0.9, ease: 'steps(9)' }, CUT + 0.4);
    ctx.sfx(tl, 'paper', CUT + 0.4);
    steam(tl, stM, CUT + 1.3, D, 1.3); steam(tl, stH, CUT + 1.5, D, 1.3);
    // the surprise sleeve lifts off; the leaf draws itself; my blob tries
    let artAt = CUT + 1.6;
    if (sleeve) {
      tl.to(sleeve, { y: '-=6', duration: 0.2, ease: 'power1.in' }, CUT + 1.5)
        .to(sleeve, { y: '-=60', opacity: 0, rotation: -12, duration: 0.5, ease: 'power2.in' }, CUT + 1.7);
      ctx.sfx(tl, 'pop', CUT + 1.75);
      artAt = CUT + 2.2;
    }
    tl.to($(hers, '[data-art]'), { drawSVG: '0% 100%', duration: 1.0, ease: 'power1.inOut' }, artAt)
      .to($(mine, '[data-art]'), { drawSVG: '0% 100%', duration: 0.6, ease: 'power1.inOut' }, artAt + 1.1)
      .to($(mine, '[data-art]'), { rotation: 8, x: 2, transformOrigin: '50% 50%', duration: 0.4, ease: 'wiggle6' }, artAt + 1.7);
    ctx.sfx(tl, 'scribble', artAt); ctx.sfx(tl, 'boing', artAt + 1.7);
    if (choice === 'Chestnut latte') tl.from($(hers, '[data-chestnut]'), { y: '-=30', duration: 0.5, ease: 'bounce.out' }, CUT + 1.4);
    tl.to($(meB, '.p-head'), { rotation: 8, transformOrigin: '50% 90%', duration: 0.3, ease: 'power2.out' }, artAt + 1.7)
      .to($(meB, '.p-head'), { rotation: 0, duration: 0.4 }, artAt + 2.3);
    laugh(tl, minaB, artAt + 1.8, 3);
    K.hop(tl, minaB, artAt + 0.2, 6);
    swapText(tl, $(hud, '[data-sa]'), $(hud, '[data-sb]'), 7.45);
    ctx.sfx(tl, 'chime', 7.5);
    tl.to({}, { duration: 0.1 }, D);

    ctx.say('Cafe Daenerys. Ivy wall, gold plaque, sunset at 17:27.', 0.3, 3.0);
    ctx.say('Her art: a leaf. Mine: a blob. The barista chose a side.', Math.min(artAt + 0.8, 5.4), 2.6);
    return tl;
  });
})();
