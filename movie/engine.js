/* Movie engine: turns Mina's answers into one GSAP master timeline.
   Scenes register with MOVIE.scene(name, fn). fn(ctx) returns a gsap.timeline
   whose children animate only elements inside ctx.layer.
   ctx = { layer, st, out, W, H, kit, say(text, at, dur), sfx(tl, name, at), add(svgString) } */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const MOVIE = (window.MOVIE = window.MOVIE || {});
  MOVIE.scenes = MOVIE.scenes || {};
  MOVIE.scene = (name, fn) => { MOVIE.scenes[name] = fn; };

  const NAMES = {
    cross: { 'Ferry': 'cross-ferry', 'Zip-wire': 'cross-zip', 'Decide there': 'cross-coin' },
    explore: { 'Walk and talk': 'explore-walk', 'Two-seater bike': 'explore-tandem', 'Two single bikes': 'explore-race', 'The little train': 'explore-train', 'A bit of everything': 'explore-mix' },
    lunch: { 'Korean home cooking': 'lunch-korean', 'Halal Asian at Dongmun': 'lunch-halal', 'Wood-fired pizza': 'lunch-pizza', 'Decide there': 'lunch-decide' }
  };
  MOVIE.plan = (st) => [
    { name: 'pickup', chapter: 'Pickup in Seoul' },
    { name: 'drive', chapter: 'The road to Gapyeong' },
    { name: 'wharf', chapter: 'Naminara immigration' },
    { name: NAMES.cross[st.cross] || 'cross-ferry', chapter: 'The crossing' },
    { name: NAMES.explore[st.explore] || 'explore-mix', chapter: 'Exploring the island' },
    ...(st.extras && st.extras.length ? [{ name: 'extras', chapter: 'Side quests' }] : []),
    { name: NAMES.lunch[st.lunch] || 'lunch-decide', chapter: 'Lunch' },
    { name: 'cafe', chapter: 'Cafe Daenerys at sunset' },
    { name: 'home', chapter: 'Home' },
    { name: 'credits', chapter: 'Credits' }
  ].filter((x) => MOVIE.scenes[x.name]);

  // Normalised answers every scene can read.
  MOVIE.normalise = (st = {}) => ({
    pickup: /^\d\d:\d\d$/.test(st.pickup || '') ? st.pickup : '10:00',
    home: st.home || 'No rush',
    cross: st.cross || 'Decide there',
    explore: st.explore || 'A bit of everything',
    extras: Array.isArray(st.extras) ? st.extras : [],
    lunch: st.lunch || 'Decide there',
    cafe: st.cafe || 'Matcha latte',
    purpose: Array.isArray(st.purpose) ? st.purpose : []
  });
  const addMin = (hhmm, m) => {
    const [h, mi] = hhmm.split(':').map(Number), t = h * 60 + mi + m;
    return String(Math.floor(t / 60) % 24).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
  };
  MOVIE.addMin = addMin;

  const sfx = (name) => { try { if (window.NAMI) window.NAMI.sfx(name); } catch (e) { /* ignore */ } };

  /* ---------- build ---------- */
  MOVIE.build = (svg, rawState, { only = null } = {}) => {
    const st = MOVIE.normalise(rawState);
    svg.innerHTML = window.KIT.defs();
    const cues = [], chapters = [];
    const master = gsap.timeline({ paused: true });
    const items = only ? [{ name: only, chapter: only }] : MOVIE.plan(st);
    let t = 0, prev = null, n = 0;
    items.forEach((it) => {
      const fn = MOVIE.scenes[it.name];
      if (!fn) return;
      const layer = document.createElementNS(NS, 'g');
      layer.setAttribute('class', 'scene-layer');
      layer.dataset.scene = it.name;
      svg.append(layer);
      gsap.set(layer, { autoAlpha: 0 });
      const local = [];
      const ctx = {
        layer, st, W: 360, H: 640, kit: window.KIT, addMin,
        say: (text, at = 0, dur = 2.4) => local.push({ at, dur, text }),
        sfx: (tl, name, at) => tl.call(() => sfx(name), null, at),
        add: (str) => { layer.insertAdjacentHTML('beforeend', str); return layer.lastElementChild; }
      };
      let tl;
      try { tl = fn(ctx) || gsap.timeline(); } catch (e) { console.warn('[movie] scene failed:', it.name, e); layer.remove(); return; }
      const start = n === 0 ? 0 : Math.max(0, t - 0.45);
      if (prev) master.to(prev, { autoAlpha: 0, duration: 0.45, ease: 'power1.inOut' }, start);
      master.fromTo(layer, { autoAlpha: 0 }, { autoAlpha: 1, duration: n === 0 ? 0.01 : 0.45, ease: 'power1.inOut', immediateRender: false }, start);
      // A scene's length is its end marker (the trailing tl.to({}, …) pad), not its longest
      // looping detail: looping flags, stars or steam are clipped there instead of stretching the film.
      const pads = tl.getChildren(false, true, false).filter((c) => c.targets && c.targets().length && c.targets().every((x) => !(x instanceof Element)));
      let D = pads.length ? Math.max(...pads.map((c) => c.endTime(true))) : Math.min(tl.duration(), 9);
      D = Math.max(0.5, Math.min(D, tl.duration()));
      master.add(tl.tweenFromTo(0, D, { duration: D, ease: 'none' }), start);
      local.forEach((c) => cues.push({ start: start + c.at, end: Math.min(start + c.at + c.dur, start + D), text: c.text }));
      chapters.push({ start, name: it.chapter, n: chapters.length + 1, scene: it.name });
      t = start + D;
      prev = layer; n += 1;
    });
    if (prev) master.to({}, { duration: 0.6 }, t); // hold the last frame
    return { master, cues, chapters, total: Math.max(t + 0.6, 0.1) };
  };

  /* ---------- music: a small procedural music box loop ---------- */
  const Music = (() => {
    let timer = 0, next = 0, step = 0, gain = null;
    const BPM = 100, EIGHTH = 60 / BPM / 2;
    const N = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const CHORDS = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]; // C G Am F
    const MEL = [76, 79, 77, 76, 74, 76, 72, 74, 74, 71, 74, 79, 77, 74, 71, 74, 72, 76, 74, 72, 69, 72, 76, 79, 77, 76, 74, 72, 77, 76, 74, 72];
    function note(ctx, f, t, dur, vol, type = 'triangle') {
      const o = ctx.createOscillator(), a = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      a.gain.setValueAtTime(0.0001, t); a.gain.exponentialRampToValueAtTime(vol, t + 0.01); a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(a).connect(gain); o.start(t); o.stop(t + dur + 0.05);
    }
    function tick() {
      const ctx = window.NAMI && window.NAMI.ctx();
      if (!ctx || !gain) return;
      while (next < ctx.currentTime + 0.4) {
        const bar = Math.floor(step / 8) % 4, beat = step % 8;
        if (window.NAMI.soundOn()) {
          note(ctx, N(MEL[step % MEL.length]), next, 0.5, 0.05, 'sine');
          if (beat === 0) CHORDS[bar].forEach((m) => note(ctx, N(m - 12), next, 1.6, 0.025));
          if (beat === 4) note(ctx, N(CHORDS[bar][0] - 24), next, 0.8, 0.04);
        }
        next += EIGHTH; step += 1;
      }
    }
    return {
      start() {
        const ctx = window.NAMI && window.NAMI.ctx();
        if (!ctx) return;
        if (!gain) { gain = ctx.createGain(); gain.gain.value = 0.9; gain.connect(ctx.destination); }
        next = ctx.currentTime + 0.05;
        clearInterval(timer); timer = setInterval(tick, 100); tick();
      },
      stop() { clearInterval(timer); timer = 0; }
    };
  })();
  MOVIE.music = Music;

  /* ---------- the player ---------- */
  const fmt = (s) => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  let P = null;
  MOVIE.play = (rawState, { onEnd = () => {}, onClose = () => {} } = {}) => {
    const root = document.querySelector('[data-movie]');
    if (!root || !window.gsap || !window.KIT) { onEnd(); return; }
    if (P) P.destroy();
    const svg = root.querySelector('[data-stage]');
    const sub = root.querySelector('[data-sub] span'), chap = root.querySelector('[data-chapter]');
    const fill = root.querySelector('[data-fill]'), track = root.querySelector('[data-track]'), timeEl = root.querySelector('[data-time]');
    const end = root.querySelector('[data-end]'), playBtn = root.querySelector('[data-play]');
    const { master, cues, chapters, total } = MOVIE.build(svg, rawState);
    root.hidden = false; end.hidden = true; root.classList.remove('is-paused');
    document.querySelector('main').inert = true;
    track.querySelectorAll('.movie-tick').forEach((x) => x.remove());
    chapters.slice(1).forEach((c) => { const k = document.createElement('i'); k.className = 'movie-tick'; k.style.left = (c.start / total) * 100 + '%'; track.append(k); });
    let lastText = null, lastChap = -1;
    const update = () => {
      const t = master.time();
      fill.style.transform = `scaleX(${Math.min(1, t / total)})`;
      timeEl.textContent = fmt(t) + ' / ' + fmt(total);
      const cue = cues.find((c) => t >= c.start && t < c.end);
      const text = cue ? cue.text : '';
      if (text !== lastText) { lastText = text; sub.textContent = text; if (text) gsap.fromTo(sub, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25 }); }
      let ci = -1; chapters.forEach((c, i) => { if (t >= c.start) ci = i; });
      if (ci !== lastChap) {
        lastChap = ci;
        const c = chapters[ci];
        if (c) {
          chap.innerHTML = `<b>ch.${String(c.n).padStart(2, '0')}</b> ${c.name}`;
          gsap.fromTo(chap, { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35 });
        }
      }
    };
    master.eventCallback('onUpdate', update);
    master.eventCallback('onComplete', () => { Music.stop(); end.hidden = false; gsap.fromTo(end, { opacity: 0 }, { opacity: 1, duration: 0.4 }); end.querySelector('button').focus({ preventScroll: true }); });
    const setPaused = (p) => { master.paused(p); root.classList.toggle('is-paused', p); playBtn.setAttribute('aria-label', p ? 'Play' : 'Pause'); if (p) Music.stop(); else Music.start(); };
    const onPlay = () => { if (master.progress() >= 1) { end.hidden = true; master.restart(); Music.start(); root.classList.remove('is-paused'); return; } setPaused(!master.paused()); };
    const seek = (e) => {
      const r = track.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      master.seek(p * total, true); end.hidden = true; update();
    };
    const onTrack = (e) => { seek(e); const mv = (ev) => seek(ev); const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); }; window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); };
    const close = () => { P.destroy(); onEnd(); };
    const replay = () => { end.hidden = true; master.restart(); Music.start(); root.classList.remove('is-paused'); };
    const onVis = () => { if (document.hidden && !master.paused()) setPaused(true); };
    playBtn.addEventListener('click', onPlay);
    track.addEventListener('pointerdown', onTrack);
    root.querySelectorAll('[data-skip], [data-to-visa]').forEach((b) => b.addEventListener('click', close));
    root.querySelector('[data-replay]').addEventListener('click', replay);
    document.addEventListener('visibilitychange', onVis);
    P = {
      destroy() {
        Music.stop(); master.kill();
        playBtn.removeEventListener('click', onPlay); track.removeEventListener('pointerdown', onTrack);
        root.querySelectorAll('[data-skip], [data-to-visa]').forEach((b) => b.replaceWith(b.cloneNode(true)));
        const rp = root.querySelector('[data-replay]'); rp.replaceWith(rp.cloneNode(true));
        document.removeEventListener('visibilitychange', onVis);
        root.hidden = true; svg.innerHTML = ''; document.querySelector('main').inert = false;
        P = null; onClose();
      }
    };
    update();
    Music.start();
    master.play(0);
    playBtn.focus({ preventScroll: true });
  };

  /* ---------- dev preview: movie/dev.html?scene=drive&t=2.5 ---------- */
  MOVIE.preview = (svg, rawState, { scene = null, t = 0, play = false } = {}) => {
    const { master, cues, total } = MOVIE.build(svg, rawState, { only: scene });
    const subEl = document.querySelector('[data-dev-sub]');
    master.eventCallback('onUpdate', () => {
      const tt = master.time(); const c = cues.find((x) => tt >= x.start && tt < x.end);
      if (subEl) subEl.textContent = (c ? c.text : '') + `   [${tt.toFixed(2)} / ${total.toFixed(2)}s]`;
    });
    if (play) master.play(0); else master.seek(t, true);
    return master;
  };
})();
