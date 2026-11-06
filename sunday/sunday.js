/* Sunday layer: the Naminara passport (six GPS stamps) and the letter sealed until sunset.
   Loads after app.js and talks to it only through window.NAMI. Colours only through classes. */
(() => {
  'use strict';

  /* ======================================================================
     The letter. Base64 so it is not readable at a glance. It says:

       Mina,

       Thank you for today: the ferry, the leaves, the hotteok and one
       very serious ostrich.

       I'm really glad we finally went.

       Same time next autumn?

       The consulate
     ====================================================================== */
  const LETTER_B64 = 'TWluYSwKClRoYW5rIHlvdSBmb3IgdG9kYXk6IHRoZSBmZXJyeSwgdGhlIGxlYXZlcywgdGhlIGhvdHRlb2sgYW5kIG9uZSB2ZXJ5IHNlcmlvdXMgb3N0cmljaC4KCkknbSByZWFsbHkgZ2xhZCB3ZSBmaW5hbGx5IHdlbnQuCgpTYW1lIHRpbWUgbmV4dCBhdXR1bW4/CgpUaGUgY29uc3VsYXRl';
  const letterText = () => { try { return new TextDecoder().decode(Uint8Array.from(atob(LETTER_B64), (c) => c.charCodeAt(0))); } catch (e) { return ''; } };

  /* ======================================================================
     Places (WGS84, from Kakao Map search, 6 Nov 2026) and the day
     ====================================================================== */
  const KST = 9 * 3600e3;
  const SUNDAY_START = Date.UTC(2026, 10, 7, 15);          /* 2026-11-08 00:00 KST */
  const LETTER_AT = Date.UTC(2026, 10, 8, 8, 27);          /* 2026-11-08 17:27 KST, sunset at Cafe Daenerys */
  const SLOTS = [
    { id: 'seoul', name: 'Departed Seoul', icon: 'i-train', shape: 'ring', ink: 'sk-river', r: -7, how: 'clock', say: 'Seoul left behind. The officer approves.' },
    { id: 'wharf', name: 'Naminara immigration', icon: 'i-ferry', shape: 'box', ink: 'sk-berry', r: 6, lat: 37.80375, lng: 127.52616, radius: 300, say: 'Welcome back. Visas, please.' },
    { id: 'island', name: 'Landed on Nami Island', icon: 'i-pine', shape: 'oval', ink: 'sk-matcha', r: -5, lat: 37.79145, lng: 127.52523, radius: 800, say: 'Landed. The ducks have been informed.' },
    { id: 'lane', name: 'Metasequoia lane', icon: 'i-meta', shape: 'hex', ink: 'sk-rust', r: 8, lat: 37.78943, lng: 127.52448, radius: 180, say: 'Hotteok detected nearby.' },
    { id: 'cafe', name: 'Cafe Daenerys', icon: 'i-cup', shape: 'rosette', ink: 'sk-gold', r: -9, lat: 37.59750, lng: 127.33905, radius: 250, say: 'Order confirmed. Sunset pending.' },
    { id: 'home', name: 'Home safe', icon: 's-ostrich', shape: 'tall', ink: 'sk-plum', r: 5, how: 'home', say: 'Home safe. Visa used. Promise kept.' }
  ];
  const HONOR = ['The ostrich trusts you.', 'Honor system. The officer blinked.', 'No GPS needed. Your word is enough.', 'Stamped on trust. Very Naminara.'];
  const GPS_LINES = ['GPS confirms. The officer pretends he did not check.', 'Satellites agree. Stamped.', 'Verified by three satellites and one bird.'];

  /* ---------------------------------------------------------------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const N = () => window.NAMI || {};
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const G = window.gsap && !reduce ? window.gsap : null;
  const q = new URLSearchParams(location.search);
  const sfx = (n) => { try { N().sfx(n); } catch (e) { /* ignore */ } };
  const buzz = (p) => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* ignore */ } };
  const pad = (n) => String(n).padStart(2, '0');
  const pick = (arr, i) => arr[i % arr.length];

  /* ---------- the clock: real, or ?clock=2026-11-08T17:30 (KST) ---------- */
  let clockOffset = 0;
  (() => {
    const m = (q.get('clock') || '').match(/^(\d{4})-(\d\d)-(\d\d)(?:T(\d\d):(\d\d)(?::(\d\d))?)?$/);
    if (m) clockOffset = Date.UTC(+m[1], m[2] - 1, +m[3], (+m[4] || 0) - 9, +m[5] || 0, +m[6] || 0) - Date.now();
  })();
  const now = () => Date.now() + clockOffset;
  const kst = (ms) => new Date(ms + KST);
  const hhmm = (ms) => { const d = kst(ms); return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()); };
  const atKST = (time) => { const [h, m] = time.split(':').map(Number); return Date.UTC(2026, 10, 8, h - 9, m); };
  const isTime = (v) => /^\d\d:\d\d$/.test(v || '');
  const isSunday = () => q.get('sunday') === '1' || now() >= SUNDAY_START;
  const answers = () => N().answers || { pickup: '10:00', home: 'No rush', cafe: 'Matcha latte', issued: false };

  /* ---------- stamps store (separate key) ---------- */
  const KEY = 'naminara-sunday-v1';
  const store = { stamps: {}, gpsOn: false, letterOpen: false, certShown: false };
  try {
    if (q.get('stamps') === 'reset') localStorage.removeItem(KEY);
    Object.assign(store, JSON.parse(localStorage.getItem(KEY)) || {});
  } catch (e) { /* private mode */ }
  if (q.get('stamps') === 'all') ['10:00', '11:20', '11:35', '13:40', '17:05', '20:50'].forEach((t, i) => { store.stamps[SLOTS[i].id] = { at: atKST(t), how: 'test' }; });
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignore */ } };
  const stamped = (id) => !!store.stamps[id];
  const count = () => SLOTS.filter((s) => stamped(s.id)).length;

  /* ======================================================================
     Drawing: stamps, the lock, the envelope
     ====================================================================== */
  const SHAPES = {
    ring: () => '<circle class="sk-line" cx="60" cy="60" r="54"/><circle class="sk-line-thin" cx="60" cy="60" r="45"/>',
    box: () => '<rect class="sk-line" x="8" y="12" width="104" height="96" rx="18"/><rect class="sk-line-thin" x="16" y="20" width="88" height="80" rx="12"/>',
    oval: () => '<ellipse class="sk-line" cx="60" cy="60" rx="57" ry="46"/><ellipse class="sk-line-thin" cx="60" cy="60" rx="48" ry="37"/>',
    hex: () => '<path class="sk-line" d="M60 5 L110 33 V87 L60 115 L10 87 V33 Z"/><path class="sk-line-thin" d="M60 16 L100 39 V81 L60 104 L20 81 V39 Z"/>',
    rosette: () => '<circle class="sk-dots" cx="60" cy="60" r="55"/><circle class="sk-line" cx="60" cy="60" r="46"/>',
    tall: () => '<ellipse class="sk-line" cx="60" cy="60" rx="46" ry="57"/><ellipse class="sk-line-thin" cx="60" cy="60" rx="38" ry="48"/>'
  };
  const GHOSTS = {
    ring: '<circle class="sk-ghost" cx="60" cy="60" r="50"/>', box: '<rect class="sk-ghost" x="12" y="16" width="96" height="88" rx="16"/>',
    oval: '<ellipse class="sk-ghost" cx="60" cy="60" rx="53" ry="42"/>', hex: '<path class="sk-ghost" d="M60 9 L106 35 V85 L60 111 L14 85 V35 Z"/>',
    rosette: '<circle class="sk-ghost" cx="60" cy="60" r="50"/>', tall: '<ellipse class="sk-ghost" cx="60" cy="60" rx="42" ry="53"/>'
  };
  const iconUse = (s, size) => s.icon === 's-ostrich'
    ? `<use href="#s-ostrich" x="${60 - size / 2 + 2}" y="${60 - size * 0.6}" width="${size}" height="${size * 1.25}"/>`
    : `<use href="#${s.icon}" x="${60 - size / 2}" y="${60 - size / 2}" width="${size}" height="${size}"${s.icon === 'i-cup' ? ' class="cup-matcha"' : ''}/>`;
  const stampSVG = (s) => `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">${SHAPES[s.shape]()}<text class="sk-small" x="60" y="27" text-anchor="middle">Naminara</text><g class="sk-icon">${iconUse(s, 34)}</g><text class="sk-small" x="60" y="100" text-anchor="middle">8 Nov 2026</text></svg>`;
  const ghostSVG = (s) => `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">${GHOSTS[s.shape]}</svg><span class="slot-icon"><svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">${s.icon === 's-ostrich' ? '<use href="#i-ostrich"/>' : `<use href="#${s.icon}"${s.icon === 'i-cup' ? ' class="cup-matcha"' : ''}/>`}</svg></span>`;
  const USED_SVG = '<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false"><circle class="sk-line" cx="60" cy="60" r="54"/><circle class="sk-line-thin" cx="60" cy="60" r="45"/><text class="sk-small" x="60" y="34" text-anchor="middle">Naminara</text><text class="sk-big" x="60" y="72" text-anchor="middle">Used</text><text class="sk-small" x="60" y="92" text-anchor="middle">8 Nov 2026</text></svg>';
  const LOCK_SVG = '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect class="f-paper2 st-lock" x="10" y="21" width="28" height="21" rx="6"/><path class="st-lock nf" d="M16 21 V15 a8 8 0 0 1 16 0 V21"/><circle class="f-accent" cx="24" cy="31" r="3"/></svg>';
  const ENV_SVG = '<svg class="letter-art" viewBox="0 0 300 200" aria-hidden="true" focusable="false">' +
    '<rect class="env-line f-door" x="6" y="6" width="288" height="188" rx="16"/>' +
    '<g class="ltr-paper"><rect class="env-line f-paper2" x="24" y="16" width="252" height="150" rx="10"/><path class="env-lines" d="M44 48 H200 M44 70 H230 M44 92 H180"/></g>' +
    '<path class="ltr-front env-line f-door-panel" d="M6 6 L150 116 L294 6 V178 Q294 194 278 194 H22 Q6 194 6 178 Z"/>' +
    '<path class="ltr-flap env-line f-door" d="M6 20 Q6 6 20 6 H280 Q294 6 294 20 L150 124 Z"/>' +
    '<g class="ltr-seal"><circle class="f-wax st-wax env-line" cx="150" cy="120" r="26"/><use href="#i-ginkgo" x="134" y="103" width="32" height="32"/><path class="ltr-crack st-crack" d="M132 104 L146 118 L140 130 L154 138 L166 136"/></g>' +
    '<text class="env-address-b" x="26" y="162">To: Mina</text><text class="env-address" x="26" y="184">Open at sunset</text></svg>';

  /* ======================================================================
     Build the passport overlay
     ====================================================================== */
  const pass = $('[data-pass]');
  if (!pass) return;
  pass.innerHTML = '<div class="pass-book"><div class="pass-in">' +
    '<header class="pass-head"><div><p class="pass-kicker">Naminara Republic</p><h2 id="pass-title" tabindex="-1">Sunday passport</h2></div><button class="pass-close" type="button" data-pass-close>Close</button></header>' +
    '<p class="pass-caption" data-pass-caption aria-live="polite"></p>' +
    '<p class="pass-count" data-pass-count></p>' +
    '<div class="gps-row"><p class="gps-chip" data-gps-chip data-gps="off"><i></i><b>gps off</b><span data-gps-text>tap below to arm the stamps</span><small data-gps-near hidden></small></p>' +
    '<button class="btn btn-wide gps-on" type="button" data-gps-on>Turn on GPS stamps</button></div>' +
    '<div class="cert" data-cert hidden><p class="cert-kicker">Certificate of visit</p><h3>The Naminara Republic certifies that Mina visited.</h3><p class="cert-text">Six stamps, one grumpy officer, zero visas left to use.</p><p class="cert-date">8 November 2026</p><p class="cert-hint">Take a screenshot. This one is a keeper.</p><div class="cert-used" data-cert-used>' + USED_SVG + '</div></div>' +
    '<ol class="stamps" data-stamps>' + SLOTS.map((s) => `<li><button class="slot ${s.ink}" type="button" data-slot="${s.id}" aria-pressed="false" style="--r:${s.r}deg">` +
      `<span class="slot-art"><span class="slot-ghost">${ghostSVG(s)}</span><span class="stamp-ink" data-ink>${stampSVG(s)}</span></span>` +
      `<span class="slot-name">${s.name}</span><span class="slot-time" data-time></span><span class="slot-gps" data-slot-gps></span></button></li>`).join('') + '</ol>' +
    '<p class="pass-honor">No GPS? Tap a stamp. The ostrich trusts you.</p>' +
    '<div data-letter-host></div>' +
    '</div></div>';
  const P = { book: $('.pass-book', pass), caption: $('[data-pass-caption]', pass), countEl: $('[data-pass-count]', pass), chip: $('[data-gps-chip]', pass), chipText: $('[data-gps-text]', pass), chipNear: $('[data-gps-near]', pass), gpsRow: $('.gps-row', pass), gpsBtn: $('[data-gps-on]', pass), cert: $('[data-cert]', pass), certUsed: $('[data-cert-used]', pass), close: $('[data-pass-close]', pass), title: $('#pass-title', pass) };
  const slotEl = (id) => $(`[data-slot="${id}"]`, pass);

  function slotHint(s) {
    if (s.how === 'clock') return 'auto at ' + answers().pickup;
    if (s.how === 'home') return isTime(answers().home) ? 'auto at ' + answers().home : 'tap when home';
    return s.lat.toFixed(4) + ' N ' + s.lng.toFixed(4) + ' E';
  }
  function renderSlots() {
    SLOTS.forEach((s) => {
      const el = slotEl(s.id), st = store.stamps[s.id];
      el.setAttribute('aria-pressed', String(!!st));
      el.setAttribute('aria-label', s.name + (st ? ', stamped at ' + hhmm(st.at) : ', not stamped yet'));
      $('[data-time]', el).textContent = st ? hhmm(st.at) : '';
      $('[data-slot-gps]', el).textContent = st ? (st.how === 'gps' ? 'gps verified' : st.how === 'auto' ? 'auto stamped' : 'on trust') : slotHint(s);
    });
    const n = count();
    P.countEl.textContent = n === 6 ? 'All six stamps. Visa used.' : n + ' of 6 stamps';
    P.gpsRow.hidden = n === 6;
    if (n === 6 && store.certShown) showCert(false);
  }
  function caption(text) {
    P.caption.textContent = text;
    if (G) G.fromTo(P.caption, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 });
  }

  /* ---------- stamping ---------- */
  let stampCount = 0;
  function stamp(id, how, quiet, at) {
    if (stamped(id)) return;
    const s = SLOTS.find((x) => x.id === id), el = slotEl(id), ink = $('[data-ink]', el);
    store.stamps[id] = { at: at || now(), how }; save();
    renderSlots();
    stampCount += 1;
    const line = how === 'gps' ? pick(GPS_LINES, stampCount) : how === 'tap' ? pick(HONOR, stampCount) : '';
    const cafe = answers().cafe;
    caption((id === 'cafe' && how !== 'tap' ? cafe + ' confirmed. Sunset pending.' : s.say) + (line ? ' ' + line : ''));
    if (!quiet) { sfx('thud'); buzz([40, 30, 70]); }
    if (G) {
      G.killTweensOf(ink);
      G.timeline()
        .fromTo(ink, { opacity: 0, scale: 2.3, rotation: s.r - 22 }, { opacity: 0.9, scale: 1, rotation: s.r, duration: 0.26, ease: 'power4.in' })
        .add(() => splat(el, s), '-=0.02')
        .fromTo(el, { x: 0 }, { x: 6, duration: 0.45, ease: G.parseEase('wiggle6') ? 'wiggle6' : 'elastic.out(1, .3)' }, '-=0.02')
        .fromTo(P.book, { scaleY: 0.985, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.5, ease: 'elastic.out(1, .4)', clearProps: 'transform' }, '<');
    } else {
      el.classList.remove('is-slam'); void el.offsetWidth; el.classList.add('is-slam');
      splat(el, s);
      setTimeout(() => el.classList.remove('is-slam'), 500);
    }
    if (count() === 6 && !store.certShown) setTimeout(() => showCert(true), G ? 700 : 300);
  }
  function splat(el, s) {
    if (reduce) return;
    const art = $('.slot-art', el);
    for (let i = 0; i < 8; i += 1) {
      const d = document.createElement('span');
      d.className = 'slot-splat';
      art.append(d);
      const a = (i / 8) * Math.PI * 2 + Math.random() * 0.6, dist = 36 + Math.random() * 30, sc = 0.4 + Math.random() * 1.1;
      if (G) G.fromTo(d, { scale: sc, x: 0, y: 0 }, { x: Math.cos(a) * dist, y: Math.sin(a) * dist, scale: 0, duration: 0.45 + Math.random() * 0.25, ease: 'power2.out', onComplete: () => d.remove() });
      else { d.style.transition = 'transform 500ms, opacity 500ms'; requestAnimationFrame(() => { d.style.transform = `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist}px) scale(0)`; d.style.opacity = '0'; }); setTimeout(() => d.remove(), 600); }
    }
  }
  function showCert(fresh) {
    const first = P.cert.hidden;
    P.cert.hidden = false;
    P.cert.classList.add('is-stamped');
    if (!fresh) return;
    if (first && G) G.fromTo(P.cert, { opacity: 0, y: 18, scaleY: 0.9, transformOrigin: '50% 0' }, { opacity: 1, y: 0, scaleY: 1, duration: 0.6, ease: 'back.out(1.6)', clearProps: 'transform' });
    P.cert.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    const go = () => {
      sfx('thud'); buzz([50, 40, 90]);
      if (G) G.fromTo(P.certUsed, { opacity: 0, scale: 2.4, rotation: -36 }, { opacity: 0.9, scale: 1, rotation: -16, duration: 0.3, ease: 'power4.in', onComplete: () => { P.certUsed.style.opacity = ''; P.certUsed.style.transform = ''; } });
      else { P.cert.classList.add('is-slam'); }
      if (!store.certShown) {
        store.certShown = true; save();
        setTimeout(() => { try { const r = P.cert.getBoundingClientRect(); N().burst(r.left + r.width / 2, r.top + r.height / 3, 90, 1.1); } catch (e) { /* ignore */ } sfx('sparkle'); }, 320);
      }
      caption('Visa used. The officer is quietly proud.');
    };
    setTimeout(go, G ? 650 : 100);
  }
  $$('[data-slot]', pass).forEach((b) => b.addEventListener('click', () => {
    if (stamped(b.dataset.slot)) { caption('Already stamped. One per customer.'); sfx('tick'); return; }
    stamp(b.dataset.slot, 'tap');
  }));

  /* ---------- the clock stamps ---------- */
  function autoStamps() {
    if (!isSunday()) return;
    const a = answers(), t = now();
    const dep = atKST(isTime(a.pickup) ? a.pickup : '10:00');
    if (!stamped('seoul') && t >= dep) stamp('seoul', 'auto', !isOpen(), dep);
    if (!stamped('home') && isTime(a.home) && t >= atKST(a.home)) stamp('home', 'auto', !isOpen(), atKST(a.home));
  }

  /* ======================================================================
     GPS: only after her tap (iOS), ?gps=LAT,LNG fakes it
     ====================================================================== */
  const fake = (() => { const m = (q.get('gps') || '').match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/); return m ? { lat: +m[1], lng: +m[2] } : null; })();
  let watchId = null, lastFix = null;
  const dist = (a, b) => { const R = 6371000, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180, x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
  function chip(state, label, text, near) { P.chip.dataset.gps = state; $('b', P.chip).textContent = label; P.chipText.textContent = text; P.chipNear.hidden = !near; P.chipNear.textContent = near || ''; }
  function onFix(lat, lng, acc) {
    lastFix = { lat, lng };
    let nearest = null;
    SLOTS.filter((s) => s.lat).forEach((s) => {
      const d = dist(lastFix, s);
      if (!nearest || d < nearest.d) nearest = { s, d };
      if (d <= s.radius + Math.min(acc || 0, 60) && !stamped(s.id)) stamp(s.id, 'gps');
    });
    const near = nearest ? 'nearest: ' + nearest.s.name.toLowerCase() + ', ' + (nearest.d < 1000 ? Math.round(nearest.d) + ' m' : (nearest.d / 1000).toFixed(1) + ' km') : '';
    chip('lock', 'gps lock', lat.toFixed(4) + ' N, ' + lng.toFixed(4) + ' E' + (acc ? ' ±' + Math.round(acc) + ' m' : ''), near);
    P.gpsBtn.hidden = true;
  }
  function onErr(err) {
    const denied = err && err.code === 1;
    chip('error', denied ? 'gps denied' : 'gps lost', denied ? 'no problem, tap the stamps instead' : 'no signal here, tap the stamps instead');
    P.gpsBtn.hidden = false;
    P.gpsBtn.textContent = denied ? 'Try GPS again' : 'Retry GPS';
    if (denied) { store.gpsOn = false; save(); }
  }
  function startGPS(fromTap) {
    if (fake) { onFix(fake.lat, fake.lng, 12); return; }
    if (!navigator.geolocation) { chip('error', 'no gps', 'this browser has no GPS, tap the stamps instead'); P.gpsBtn.hidden = true; return; }
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    chip('search', 'gps searching', 'looking for satellites over the river');
    if (fromTap) { store.gpsOn = true; save(); }
    try {
      watchId = navigator.geolocation.watchPosition((p) => onFix(p.coords.latitude, p.coords.longitude, p.coords.accuracy), onErr, { enableHighAccuracy: true, maximumAge: 10000, timeout: 25000 });
    } catch (e) { onErr(null); }
  }
  P.gpsBtn.addEventListener('click', () => { sfx('pop'); startGPS(true); });

  /* ======================================================================
     Open and close the passport (dialog, focus, inert)
     ====================================================================== */
  let lastFocus = null;
  const main = $('main');
  const isOpen = () => !pass.hidden;
  const flapBack = (L) => { const p = L.flap.parentNode; if (L.flap.previousElementSibling !== p.firstElementChild) p.insertBefore(L.flap, p.firstElementChild.nextSibling); };
  function openPass() {
    if (isOpen()) return;
    lastFocus = document.activeElement;
    pass.hidden = false;
    main.inert = true;
    pass.scrollTop = 0;
    renderSlots();
    if (!P.caption.textContent) caption(count() ? 'Welcome back. Where were we?' : 'Passport control. Six stamps, one Sunday.');
    P.title.focus({ preventScroll: true });
    if (G) {
      G.fromTo(P.book, { y: 60, rotation: -3, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.5)', clearProps: 'transform,opacity' });
      G.fromTo($$('.slot', pass), { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2)', stagger: 0.06, delay: 0.25, clearProps: 'transform,opacity' });
    }
    sfx('paper');
    setTimeout(() => {
      autoStamps();
      if (store.gpsOn || fake) startGPS(false);
      if (count() === 6 && P.cert.hidden) showCert(!store.certShown);
    }, G ? 700 : 0);
  }
  function closePass() {
    if (!isOpen()) return;
    const done = () => {
      pass.hidden = true; main.inert = false;
      if (answers().issued) { try { N().go('visa'); } catch (e) { /* ignore */ } }
      const f = lastFocus && document.contains(lastFocus) ? lastFocus : $('.scene.is-active h1, .scene.is-active h2');
      if (f) f.focus({ preventScroll: true });
    };
    if (G) G.to(P.book, { y: 40, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => { G.set(P.book, { clearProps: 'all' }); done(); } });
    else done();
    sfx('paper');
  }
  P.close.addEventListener('click', closePass);
  pass.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closePass(); return; }
    if (e.key !== 'Tab') return;
    const f = $$('button, [href], input, [tabindex]:not([tabindex="-1"])', pass).filter((el) => !el.hidden && !el.closest('[hidden]'));
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === P.title)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ======================================================================
     The letter: sealed until 17:27 on Sunday
     ====================================================================== */
  const letters = [];
  function buildLetter(host) {
    const root = document.createElement('div');
    root.className = 'letter';
    root.innerHTML = '<button class="letter-env" type="button" data-letter-btn aria-expanded="false">' + ENV_SVG +
      '<span class="letter-title" data-letter-title>Opens Sunday at 17:27</span><span class="letter-count" data-letter-count></span></button>' +
      '<p class="letter-note" data-letter-note aria-live="polite"></p>' +
      '<div class="letter-page" data-letter-page hidden><p class="letter-text" data-letter-text></p></div>';
    host.replaceChildren(root);
    const L = { root, btn: $('[data-letter-btn]', root), title: $('[data-letter-title]', root), count: $('[data-letter-count]', root), note: $('[data-letter-note]', root), page: $('[data-letter-page]', root), text: $('[data-letter-text]', root), seal: $('.ltr-seal', root), crack: $('.ltr-crack', root), flap: $('.ltr-flap', root), paper: $('.ltr-paper', root), opening: false };
    if (G) G.set(L.crack, { opacity: 0 }); else L.crack.style.opacity = '0';
    L.btn.addEventListener('click', () => tapLetter(L));
    letters.push(L);
    if (store.letterOpen) showOpen(L, false);
    tickLetters();
    return L;
  }
  function wiggle(L) {
    sfx('tick'); buzz(15);
    if (G) G.fromTo(L.seal, { rotation: 0 }, { rotation: 12, svgOrigin: '150 120', duration: 0.5, ease: G.parseEase('wiggle6') ? 'wiggle6' : 'elastic.out(1, .3)' });
    else { L.root.classList.remove('is-wiggle'); void L.root.offsetWidth; L.root.classList.add('is-wiggle'); }
    L.note.textContent = 'Not yet. It opens at sunset.';
  }
  function tapLetter(L) {
    if (store.letterOpen || L.opening) return;
    if (now() < LETTER_AT) { wiggle(L); return; }
    L.opening = true;
    store.letterOpen = true; save();
    letters.filter((o) => o !== L).forEach((o) => showOpen(o, false));
    sfx('sparkle'); buzz([20, 40, 20]);
    L.root.dataset.state = 'open';
    L.btn.setAttribute('aria-expanded', 'true');
    L.note.textContent = 'The seal cracks.';
    if (!G) {
      L.crack.style.opacity = '1';
      setTimeout(() => { L.page.hidden = false; typeLetter(L); }, reduce ? 50 : 900);
      return;
    }
    const tl = G.timeline({ onComplete: () => { L.opening = false; } });
    tl.to(L.seal, { scale: 1.12, svgOrigin: '150 120', duration: 0.2, ease: 'power2.out' })
      .set(L.crack, { opacity: 1 });
    if (window.DrawSVGPlugin) tl.fromTo(L.crack, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.3, ease: 'power1.in' }); else tl.to(L.crack, { opacity: 1, duration: 0.3 });
    tl.add(() => { sfx('pop'); buzz(30); })
      .to(L.seal, { y: 70, rotation: 40, opacity: 0, svgOrigin: '150 120', duration: 0.45, ease: 'power2.in' })
      .to(L.flap, { scaleY: -1, svgOrigin: '150 6', duration: 0.5, ease: 'power2.inOut', onStart: () => sfx('paper'), onUpdate() { if (this.progress() > 0.5) flapBack(L); } }, '-=0.15')
      .to(L.paper, { y: -78, duration: 0.55, ease: 'back.out(1.3)' }, '-=0.1')
      .add(() => { L.note.textContent = 'From the consulate.'; L.page.hidden = false; G.fromTo(L.page, { scaleY: 0.04, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.2)', clearProps: 'transform' }); }, '-=0.2')
      .add(() => typeLetter(L), '+=0.3');
  }
  function showOpen(L, animate) {
    L.root.dataset.state = 'open';
    L.btn.setAttribute('aria-expanded', 'true');
    L.title.textContent = 'Opened at sunset';
    L.count.textContent = 'Sunday, 17:27';
    L.note.textContent = 'From the consulate.';
    L.page.hidden = false;
    if (G) { G.set(L.seal, { opacity: 0 }); G.set(L.flap, { scaleY: -1, svgOrigin: '150 6' }); G.set(L.paper, { y: -78 }); }
    flapBack(L);
    L.text.textContent = letterText();
    if (animate) typeLetter(L);
  }
  function typeLetter(L) {
    const text = letterText();
    L.title.textContent = 'Opened at sunset';
    L.count.textContent = 'Sunday, 17:27';
    if (reduce) { L.text.textContent = text; L.opening = false; sfx('chime'); return; }
    L.text.textContent = '';
    const caret = document.createElement('span'); caret.className = 'caret'; caret.setAttribute('aria-hidden', 'true');
    const node = document.createTextNode('');
    L.text.append(node, caret);
    let i = 0;
    const t = setInterval(() => {
      i += 1; node.textContent = text.slice(0, i);
      if (i % 4 === 0 && text[i - 1] !== ' ') sfx('click');
      if (i >= text.length) { clearInterval(t); setTimeout(() => { caret.remove(); sfx('chime'); L.opening = false; }, 700); }
    }, 34);
  }
  function tickLetters() {
    if (!letters.length) return;
    const left = LETTER_AT - now();
    letters.forEach((L) => {
      if (store.letterOpen) return;
      if (left <= 0) { L.root.dataset.state = 'ready'; L.title.textContent = 'The seal is ready.'; L.count.textContent = 'tap to open'; return; }
      L.root.dataset.state = 'locked';
      const d = Math.floor(left / 864e5), h = Math.floor((left % 864e5) / 36e5), m = Math.floor((left % 36e5) / 6e4), s = Math.floor((left % 6e4) / 1e3);
      L.count.textContent = (d ? d + 'd ' : '') + pad(h) + ':' + pad(m) + ':' + pad(s);
    });
  }

  /* ======================================================================
     The visa page: teaser before Sunday, passport button on the day, the letter
     ====================================================================== */
  const visaHost = $('[data-sunday-visa]');
  let visaBuilt = false;
  function renderVisa() {
    if (!visaHost || visaBuilt) return;
    visaBuilt = true;
    const top = document.createElement('div');
    if (isSunday()) {
      top.innerHTML = '<button class="btn btn-wide" type="button" data-open-pass>Open my passport</button>';
      $('[data-open-pass]', top).addEventListener('click', openPass);
    } else {
      top.innerHTML = '<div class="teaser"><span class="teaser-art">' + LOCK_SVG + '</span><div><p class="teaser-title">Your passport activates on Sunday.</p><p class="teaser-note">Six stamps, one grumpy officer. GPS optional.</p></div></div>';
    }
    const letterHost = document.createElement('div');
    visaHost.replaceChildren(top, letterHost);
    buildLetter(letterHost);
  }

  /* ======================================================================
     Start
     ====================================================================== */
  buildLetter($('[data-letter-host]', pass));
  N().onScene = (name) => { if (name === 'visa') renderVisa(); };
  if ($('.scene[data-scene="visa"].is-active')) renderVisa();
  setInterval(tickLetters, 1000);
  setInterval(autoStamps, 15000);
  if (isSunday()) setTimeout(openPass, G ? 350 : 0);
})();
