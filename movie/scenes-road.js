/* Road scenes: pickup in Seoul, the drive to Gapyeong, home at night, credits.
   These are the reference scenes for style and for the scene API. */
(() => {
  'use strict';
  const M = window.MOVIE, K = window.KIT;
  const $ = (el, s) => el.querySelector(s);
  const $$ = (el, s) => [...el.querySelectorAll(s)];

  /* ---------- 1. Pickup in Seoul ---------- */
  M.scene('pickup', (ctx) => {
    const { st } = ctx;
    ctx.add(K.sky('morning'));
    const sun = ctx.add(K.sun(296, 196, 20));
    const clouds = ctx.add(`<g>${K.cloud(70, 120, 0.9)}${K.cloud(250, 76, 0.7)}${K.cloud(410, 150, 0.8)}</g>`);
    ctx.add(K.seoulSkyline(338));
    const apt = ctx.add(K.apartment(200, 230, 132, 240, '101동'));
    ctx.add(`<g>${K.tree('ginkgo', 172, 470, 48)}${K.tree('maple', 346, 470, 40)}${K.tree('ginkgo', 30, 470, 40)}</g>`);
    ctx.add('<rect class="f-paper3" y="470" width="360" height="30"/><rect class="f-asphalt" y="500" width="360" height="140"/><path class="st-lane" d="M0 572 H360"/>');
    const hud = ctx.add(K.hud(16, 34, 136, 62,
      `<text class="k-mono k-light" x="12" y="20" font-size="10">sun 08 nov, seoul</text>
       <text class="k-mono" data-a x="12" y="48" font-size="26" style="fill:var(--color-gold)">${ctx.addMin(st.pickup, -1)}</text>
       <text class="k-mono" data-b x="12" y="48" font-size="26" style="fill:var(--color-gold)" opacity="0">${st.pickup}</text>`));
    const car = ctx.add(`<g transform="translate(-150 552)">${K.car({ mina: true })}</g>`);
    const minaInCar = $(car, '.k-head[data-who="mina"]');
    const mina = ctx.add(K.person('mina', { x: 266, y: 470, s: 0.92 }));
    const door = $(apt, '.f-door');
    const honk = ctx.add(K.bubble(150, 420, 'Beep beep!', { w: 96, size: 15 }));
    const tl = gsap.timeline();
    gsap.set([mina, minaInCar], { opacity: 0 });
    gsap.set(honk, { scale: 0, transformOrigin: '0% 100%' });

    tl.from(sun, { y: '+=46', duration: 5.6, ease: 'sine.out' }, 0)
      .to(clouds, { x: -36, duration: 5.6, ease: 'none' }, 0)
      .from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, 0.05)
      .to($(hud, '[data-a]'), { opacity: 0, y: -8, duration: 0.2 }, 0.9)
      .fromTo($(hud, '[data-b]'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: 'back.out(3)' }, 0.95)
      .to(car, { x: 132, duration: 1.5, ease: 'power3.out' }, 0.3);
    K.wheels(tl, car, 0.3, 1.5, 1.4);
    tl.to($(car, '.car-body'), { rotation: 2.5, transformOrigin: '50% 100%', duration: 0.12, yoyo: true, repeat: 1 }, 1.75)
      .to(honk, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, 1.95)
      .to(honk, { scale: 0, duration: 0.2 }, 3.2)
      .to(door, { scaleX: 0.12, transformOrigin: '0% 50%', duration: 0.3 }, 2.2)
      .to(mina, { opacity: 1, duration: 0.2 }, 2.35)
      .to(mina, { x: 176, duration: 1.15, ease: 'none' }, 2.45);
    K.walk(tl, mina, 2.45, 1.15);
    ctx.sfx(tl, 'honk', 1.95);
    tl.to(mina, { opacity: 0, duration: 0.2 }, 3.6)
      .to(minaInCar, { opacity: 1, duration: 0.2 }, 3.7)
      .to(door, { scaleX: 1, duration: 0.3 }, 3.7)
      .to(car, { x: 540, duration: 1.4, ease: 'power2.in' }, 3.95);
    K.wheels(tl, car, 3.95, 1.4, 2.6);
    K.puffs(tl, ctx.layer, 4.05, 96, 548, 4);
    ctx.sfx(tl, 'whoosh', 4.1);
    tl.to({}, { duration: 0.2 }, 5.4);

    ctx.say(`${st.pickup}, Sunday. Pickup in Seoul.`, 0.2, 2.2);
    ctx.say('Right on time. The ostrich would be proud.', 2.5, 2.6);
    return tl;
  });

  /* ---------- 2. The road to Gapyeong ---------- */
  M.scene('drive', (ctx) => {
    const { st } = ctx;
    const D = 6.4;
    ctx.add(K.sky('noon'));
    ctx.add(K.sun(302, 92, 17));
    const clouds = ctx.add(`<g>${K.cloud(60, 128, 1)}${K.cloud(240, 82, 0.8)}${K.cloud(420, 140, 0.9)}${K.cloud(600, 92, 0.7)}</g>`);
    const m = K.mountains(352);
    const far = ctx.add(m.far), mid = ctx.add(m.mid);
    const river = ctx.add(K.river(424, 44));
    const near = ctx.add(`<g>${K.ridge(430, 22, 720, 12, 'f-mtn-3', 1.9)}</g>`);
    ctx.add('<rect class="f-land2" y="466" width="360" height="30"/>');
    let trees = '';
    const kinds = ['ginkgo', 'maple', 'meta', 'ginkgo', 'pine', 'maple'];
    for (let i = 0; i < 12; i += 1) trees += K.tree(kinds[i % 6], 30 + i * 60, 494, i % 3 === 2 ? 58 : 44);
    const treeRow = ctx.add(`<g>${trees}</g>`);
    ctx.add('<rect class="f-asphalt" y="494" width="360" height="110"/><rect class="f-metal" y="494" width="360" height="4"/><rect class="f-land2" y="604" width="360" height="36"/>');
    let posts = '';
    for (let i = 0; i < 18; i += 1) posts += `<rect class="f-metal" x="${i * 40}" y="486" width="4" height="12"/>`;
    const rail = ctx.add(`<g><rect class="f-metal" y="488" width="720" height="3"/>${posts}</g>`);
    const lanes = ctx.add('<g><path class="st-lane" d="M0 552 H760"/></g>');
    const sign = ctx.add(K.sign(470, 372, { ko: '남이섬', en: 'Nami Island', sub: '가평 Gapyeong  2 km', arrow: 'upright', w: 156 }));
    const car = ctx.add(`<g transform="translate(150 560)">${K.car({})}</g>`);
    const hud = ctx.add(K.hud(16, 30, 200, 78,
      `<text class="k-mono k-light" x="12" y="18" font-size="9.5">gps: seoul → nami island</text>
       <text class="k-mono" data-km x="12" y="44" font-size="22" style="fill:var(--color-gold)">63.0</text>
       <text class="k-mono k-light" x="74" y="44" font-size="11">km left</text>
       <rect x="12" y="56" width="176" height="3" rx="1.5" class="f-ink2"/>
       <rect data-bar x="12" y="56" width="176" height="3" rx="1.5" class="f-matcha"/>
       <text class="k-mono k-light" x="12" y="72" font-size="9">eta ${ctx.addMin(st.pickup, 75)}</text>`));
    const tl = gsap.timeline();
    gsap.set($(hud, '[data-bar]'), { scaleX: 0, transformOrigin: '0% 50%' });
    tl.from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, 0.05);
    K.count(tl, $(hud, '[data-km]'), 0.2, D - 0.4, 63, 0.4);
    tl.to($(hud, '[data-bar]'), { scaleX: 1, duration: D - 0.4, ease: 'none' }, 0.2)
      .to(clouds, { x: -60, duration: D, ease: 'none' }, 0);
    K.scroll(tl, far, 0, D, 70);
    K.scroll(tl, mid, 0, D, 160);
    K.scroll(tl, river, 0, D, 220);
    K.scroll(tl, near, 0, D, 260);
    K.scroll(tl, treeRow, 0, D, 360);
    K.scroll(tl, rail, 0, D, 400);
    K.scroll(tl, lanes, 0, D, 408);
    tl.to(sign, { x: '-=640', duration: 3.6, ease: 'none' }, 1.6);
    K.wheels(tl, car, 0, D, 3);
    K.bob(tl, $(car, '.car-body'), 0, D, 1.1, 0.14);
    tl.to({}, { duration: 0.1 }, D);

    ctx.say('Seoul to Gapyeong. About an hour and a half.', 0.2, 2.8);
    ctx.say('Snacks: packed. Playlist: yours.', 3.2, 2.8);
    return tl;
  });

  /* ---------- 9. Home at night ---------- */
  M.scene('home', (ctx) => {
    const { st } = ctx;
    const time = /^\d\d:\d\d$/.test(st.home) ? st.home : null;
    ctx.add(K.sky('night'));
    const stars = ctx.add(K.stars(26, 300));
    ctx.add(K.moon(84, 110, 15));
    const sky = ctx.add(K.seoulSkyline(338));
    $$(sky, 'rect, path').forEach((el) => el.setAttribute('class', 'f-ink2'));
    let lights = '';
    for (let i = 0; i < 16; i += 1) lights += `<rect class="f-lit" x="${180 + (i % 8) * 10}" y="${348 + Math.floor(i / 8) * 16}" width="3" height="5" opacity="${0.5 + (i % 3) * 0.2}"/>`;
    ctx.add(`<g>${lights}</g>`);
    const apt = ctx.add(K.apartment(200, 230, 132, 240, '101동'));
    $$(apt, '.k-win').forEach((w, i) => { if ((i * 7) % 5 < 2) w.setAttribute('class', 'f-lit k-win'); });
    const target = $$(apt, '.k-win').find((w) => w.dataset.r === '3' && w.dataset.c === '2');
    if (target) target.setAttribute('class', 'f-glass k-win');
    const glow = target ? ctx.add(`<rect class="f-lit" x="${target.getAttribute('x')}" y="${target.getAttribute('y')}" width="${target.getAttribute('width')}" height="12" rx="2" opacity="0"/>`) : null;
    ctx.add(`<g>${K.tree('ginkgo', 172, 470, 48)}${K.tree('maple', 346, 470, 40)}</g>`);
    ctx.add('<rect class="f-ink2" y="470" width="360" height="30" opacity="0.6"/><rect class="f-asphalt" y="500" width="360" height="140"/><path class="st-lane" d="M0 572 H360"/>');
    const hud = ctx.add(K.hud(16, 34, 150, 62,
      `<text class="k-mono k-light" x="12" y="20" font-size="10">${time ? 'home by' : 'home'}</text>
       <text class="k-mono" x="12" y="48" font-size="${time ? 26 : 20}" style="fill:var(--color-gold)">${time || 'no rush'}</text>`));
    const car = ctx.add(`<g transform="translate(520 552)"><path class="f-beam" d="M-62 -18 L-190 -46 L-190 12 Z"/>${K.car({ flip: true, mina: true })}</g>`);
    const minaInCar = $(car, '.k-head[data-who="mina"]');
    const mina = ctx.add(K.person('mina', { x: 214, y: 470, s: 0.92 }));
    const door = $(apt, '.f-door');
    const tl = gsap.timeline();
    gsap.set(mina, { opacity: 0 });
    tl.to($$(stars, '.k-star'), { opacity: 0.35, duration: 0.6, ease: 'sine.inOut', stagger: { each: 0.08, from: 'random', repeat: 7, yoyo: true } }, 0)
      .from(hud, { y: '-=16', opacity: 0, duration: 0.4 }, 0.05)
      .to(car, { x: 238, duration: 1.4, ease: 'power3.out' }, 0.2);
    K.wheels(tl, car, 0.2, 1.4, -1.4);
    tl.to(minaInCar, { opacity: 0, duration: 0.2 }, 1.7)
      .to(mina, { opacity: 1, duration: 0.2 }, 1.75);
    K.wave(tl, mina, 1.95, { times: 2 });
    tl.to(door, { scaleX: 0.12, transformOrigin: '0% 50%', duration: 0.3 }, 2.6)
      .to(mina, { x: 266, duration: 0.8, ease: 'none' }, 2.75);
    K.walk(tl, mina, 2.75, 0.8);
    tl.to(mina, { opacity: 0, duration: 0.2 }, 3.5)
      .to(door, { scaleX: 1, duration: 0.3 }, 3.6);
    if (glow) tl.to(glow, { opacity: 1, duration: 0.3 }, 4.1);
    tl.to(car, { x: -180, duration: 1.4, ease: 'power2.in' }, 4.3);
    K.wheels(tl, car, 4.3, 1.4, -2.4);
    tl.to({}, { duration: 0.2 }, 5.8);

    ctx.say(time ? `Home by ${time}. Safe and sound.` : 'Home, no rush. Safe and sound.', 0.3, 2.6);
    ctx.say('A window on the fourth floor lights up. Mission complete.', 3.3, 2.6);
    return tl;
  });

  /* ---------- 10. Credits ---------- */
  M.scene('credits', (ctx) => {
    const { st } = ctx;
    ctx.add('<rect class="f-term" width="360" height="640"/>');
    ctx.add(K.stars(30, 640));
    const lines = [
      ['k-display k-light', 34, 'Our Sunday', 52],
      ['k-mono k-light', 11, 'a Naminara consulate production', 44],
      ['k-mono k-light', 10, 'starring', 22], ['k-display k-light', 24, 'Mina', 40],
      ['k-mono k-light', 10, 'driver and consulate', 22], ['k-display k-light', 20, 'Me', 36],
      ['k-mono k-light', 10, 'border officer', 22], ['k-display k-light', 18, 'A very serious ostrich', 36],
      ['k-mono k-light', 10, 'the crossing', 22], ['k-display k-light', 18, st.cross, 36],
      ['k-mono k-light', 10, 'lunch', 22], ['k-display k-light', 18, st.lunch, 36],
      ['k-mono k-light', 10, 'official drink', 22], ['k-display k-light', 18, st.cafe, 36],
      ['k-mono k-light', 10, 'filmed on location', 22], ['k-display k-light', 18, 'Nami Island, Gapyeong', 36],
      ['k-mono k-light', 10, 'rendered with', 22], ['k-display k-light', 16, 'SVG, GSAP and one late night', 40],
      ['k-hand k-light', 20, 'No templates were harmed.', 30]
    ];
    let y = 0, s = '';
    lines.forEach(([cls, size, text, gap]) => { y += gap; s += K.text(180, y, String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;'), { cls, size, anchor: 'middle' }); });
    const roll = ctx.add(`<g transform="translate(0 660)">${s}</g>`);
    const fin = ctx.add(`<g opacity="0">${K.ostrich(180, 330, 110)}${K.text(180, 392, 'See you Sunday.', { cls: 'k-display k-light', size: 30, anchor: 'middle' })}${K.text(180, 418, '08.11.2026  build ok', { cls: 'k-mono k-light', size: 11, anchor: 'middle' })}</g>`);
    const tl = gsap.timeline();
    tl.to(roll, { y: -(y + 40), duration: 7.2, ease: 'none' }, 0)
      .to(fin, { opacity: 1, duration: 0.6 }, 6.6)
      .from($(fin, '.k-ostrich'), { y: '+=30', duration: 0.6, ease: 'back.out(2)' }, 6.6);
    const cap = $(fin, '.o-cap');
    if (cap) tl.to(cap, { rotation: -28, y: -3, transformOrigin: '20% 80%', duration: 0.25, yoyo: true, repeat: 1, repeatDelay: 0.3 }, 7.3);
    ctx.sfx(tl, 'sparkle', 6.7);
    tl.to({}, { duration: 0.1 }, 8.6);
    return tl;
  });
})();
