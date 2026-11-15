/* ---------- bahan: toon 3 tingkat + garis tepi ---------- */

function pixTex(w, h, fn) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const col = fn(x, y); if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); } }
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ---------- pembantu bentuk ---------- */
function box(p, w, h, d, mat, x = 0, y = 0, z = 0, o = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz;
  p.add(m); return m;
}
const grp = (p, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; };
const newRig = () => ({ root: new THREE.Group(), legs: [], blink: [], flames: [], ears: [], waves: [], extra: [], size: 1, h: 1, baseY: 0 });

function faceTex(o) {
  const { base, blink = false, blush = '#f59a9a', mouth = false, wide = false, noEyes = false, eyeC = '#26192a' } = o;
  return pixTex(10, 8, (x, y) => {
    const ex = (x === 2 || x === 3 || x === 6 || x === 7);
    if (!noEyes) {
      if (!blink) { if (ex && y >= 2 && y <= 4) return (y === 2 && (x === 2 || x === 6)) ? '#ffffff' : eyeC; }
      else if (ex && y === 4) return eyeC;
    }
    if (blush && y === 5 && (x === 1 || x === 8)) return blush;
    if (mouth && y === 6 && (x === 4 || x === 5)) return '#7a3a30';
    if (wide && y === 6 && x >= 1 && x <= 8) return '#2d6b3a';
    return base;
  });
}
function faceBox(r, p, w, h, d, base, fo = {}, x = 0, y = 0, z = 0) {
  const side = toon(base);
  const open = faceTex(Object.assign({ base }, fo)), shut = faceTex(Object.assign({ base }, fo, { blink: true }));
  const fm = toon('#ffffff', { map: open });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [side, side, side, side, fm, side]);
  m.position.set(x, y, z);
  p.add(m); r.blink.push({ mat: fm, open, shut }); return m;
}
function eyeBall(r, p, s, x, y, z, skin) {
  const side = toon(skin);
  const mk = (blink) => pixTex(4, 4, (px, py) => {
    if (blink) return py === 2 ? '#26192a' : skin;
    if (px >= 1 && px <= 2 && py >= 1 && py <= 3) return (px === 1 && py === 1) ? '#ffffff' : '#26192a';
    return '#fdfdf2';
  });
  const open = mk(false), shut = mk(true), fm = toon('#ffffff', { map: open });
  const m = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), [side, side, side, side, fm, side]);
  m.position.set(x, y, z);
  p.add(m); r.blink.push({ mat: fm, open, shut }); return m;
}
function flame(r, p, x, y, z, s = 1) {
  const g = grp(p, x, y, z); g.scale.setScalar(s);
  box(g, 0.16, 0.14, 0.16, glow('#ff4a1a'), 0, 0.07, 0, { no: true });
  box(g, 0.11, 0.16, 0.11, glow('#ff9a2a'), 0, 0.18, 0, { no: true });
  box(g, 0.06, 0.14, 0.06, glow('#ffe45a'), 0, 0.3, 0, { no: true });
  r.flames.push({ g, s, ph: Math.random() * 6 }); return g;
}
function leaf(p, x, y, z, s, rz = 0, ry = 0, c = '#59c24f') { return box(p, 0.14 * s, 0.035 * s, 0.08 * s, toon(c), x, y, z, { rz, ry }); }
function sprout(p, x, y, z, s = 1) {
  const g = grp(p, x, y, z);
  box(g, 0.04 * s, 0.1 * s, 0.04 * s, toon('#3f9a3a'), 0, 0.05 * s, 0, { no: true });
  leaf(g, -0.07 * s, 0.12 * s, 0, s, -0.5); leaf(g, 0.07 * s, 0.12 * s, 0, s, 0.5); return g;
}
function drop(p, x, y, z, s = 1, c = '#7fd0ff') {
  const g = grp(p, x, y, z);
  box(g, 0.12 * s, 0.1 * s, 0.12 * s, glow(c), 0, 0, 0, { no: true });
  box(g, 0.07 * s, 0.09 * s, 0.07 * s, glow(c), 0, 0.09 * s, 0, { no: true }); return g;
}

/* =====================================================================
   KANCIK -> Kancilon -> Kancilaksa  (kancil, tipe Daun)
   ===================================================================== */
function buildKancik(st) {
  const r = newRig(), g = r.root; r.size = [1, 1.3, 1.5][st - 1]; r.h = [0.95, 1.0, 1.35][st - 1];
  const fur = ['#c9965a', '#bd8548', '#ab733a'][st - 1], dark = ['#a8763e', '#9a6732', '#8a5a2a'][st - 1], belly = '#f3e2bb';
  const F = toon(fur), D = toon(dark), B = toon(belly), legH = 0.3;
  const body = grp(g, 0, legH + 0.19, 0); r.body = body; r.baseY = legH + 0.19;
  box(body, 0.46, 0.38, 0.66, F);
  box(body, 0.36, 0.05, 0.52, B, 0, -0.18, 0.02);
  [[-0.1, 0.2, -0.18], [0.1, 0.2, 0.0], [-0.08, 0.2, 0.16], [0.12, 0.2, -0.2], [-0.14, 0.2, -0.02]].slice(0, 2 + st)
    .forEach(([x, y, z]) => box(body, 0.09, 0.02, 0.09, toon('#fff4dc'), x, y, z, { no: true }));
  [[-0.15, 0.22, 0], [0.15, 0.22, Math.PI], [-0.15, -0.22, Math.PI], [0.15, -0.22, 0]].forEach(([x, z, ph]) => {
    const p = grp(g, x, legH, z); box(p, 0.1, legH, 0.1, D, 0, -legH / 2, 0); box(p, 0.115, 0.06, 0.115, toon('#3b2b22'), 0, -legH + 0.03, 0); r.legs.push({ p, ph });
  });
  const head = grp(body, 0, 0.22, 0.36); r.head = head;
  faceBox(r, head, 0.42, 0.38, 0.38, fur, {});
  box(head, 0.22, 0.15, 0.12, B, 0, -0.1, 0.24);
  box(head, 0.07, 0.05, 0.04, toon('#3a2a22'), 0, -0.05, 0.31, { no: true });
  [-1, 1].forEach((sx) => {
    const e = grp(head, sx * 0.16, 0.18, -0.02); box(e, 0.1, 0.24, 0.05, F, 0, 0.12, 0); box(e, 0.06, 0.15, 0.02, toon('#f2b3a9'), 0, 0.12, 0.03, { no: true });
    e.rotation.z = -sx * 0.4; r.ears.push({ e, sx });
  });
  const tail = grp(body, 0, 0.1, -0.34); r.tail = tail;
  box(tail, 0.11, 0.11, 0.11, toon(st === 3 ? '#59c24f' : '#fff4dc'), 0, 0.03, -0.03);
  if (st === 3) { box(tail, 0.07, 0.14, 0.07, toon('#7ad66a'), 0, 0.12, -0.05, { rx: -0.4 }); }
  if (st === 1) sprout(head, 0, 0.19, 0, 1);
  if (st >= 2) {
    sprout(head, -0.1, 0.19, 0, 1.1); sprout(head, 0.1, 0.19, 0.02, 1.1);
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; leaf(head, Math.sin(a) * 0.27, -0.14, Math.cos(a) * 0.23, 1.3, 0, a, i % 2 ? '#59c24f' : '#7ad66a'); }
  }
  if (st === 2) {
    sprout(head, 0, 0.2, -0.08, 1.3);
    [-1, 1].forEach((sx) => { box(head, 0.04, 0.18, 0.04, toon('#7a5230'), sx * 0.1, 0.3, -0.05, { rz: -sx * 0.25 }); leaf(head, sx * 0.14, 0.4, -0.05, 0.9, sx * 0.5); });
  }
  if (st === 3) {
    const wood = toon('#7a5230');
    [-1, 1].forEach((sx) => {
      box(head, 0.05, 0.34, 0.05, wood, sx * 0.1, 0.36, -0.04, { rz: -sx * 0.18 });
      box(head, 0.04, 0.2, 0.04, wood, sx * 0.19, 0.44, -0.04, { rz: -sx * 0.9 });
      box(head, 0.04, 0.16, 0.04, wood, sx * 0.13, 0.55, -0.04, { rz: sx * 0.5 });
      leaf(head, sx * 0.25, 0.54, -0.04, 1.1, sx * 0.4); leaf(head, sx * 0.16, 0.66, -0.04, 1.1, sx * 0.2); leaf(head, sx * 0.07, 0.52, -0.04, 1, -sx * 0.4);
    });
    for (let i = 0; i < 5; i++) leaf(body, 0, 0.22, -0.26 + i * 0.13, 1.5, 0, Math.PI / 2, i % 2 ? '#59c24f' : '#7ad66a');
    [-1, 1].forEach((sx) => box(body, 0.2, 0.04, 0.22, toon('#6fbf5a'), sx * 0.1, 0.2, -0.04, { no: true }));
  }
  r.update = (t, walk) => {
    const sp = walk ? 7 : 0;
    r.legs.forEach((l) => { l.p.rotation.x = walk ? Math.sin(t * sp + l.ph) * 0.65 : 0; });
    body.position.y = r.baseY + (walk ? Math.abs(Math.sin(t * sp)) * 0.035 : Math.sin(t * 2) * 0.008);
    head.rotation.x = Math.sin(t * 1.3) * 0.06 + (walk ? Math.sin(t * sp * 2) * 0.03 : 0);
    tail.rotation.z = Math.sin(t * (walk ? 9 : 3)) * 0.4;
    r.ears.forEach((e, i) => { e.e.rotation.z = -e.sx * (0.4 + (Math.sin(t * 0.9 + i * 2) > 0.92 ? 0.35 : 0) + Math.sin(t * 2 + i) * 0.04); });
  };
  return r;
}

/* =====================================================================
   CEBONGI -> Kodi -> Kodiraja  (kecebong -> kodok, tipe Air)
   ===================================================================== */
function buildCebongi(st) {
  const r = newRig(), g = r.root; r.size = [1, 1.3, 1.6][st - 1];
  if (st === 1) {
    r.h = 0.75; const blue = '#4aa3d9';
    const body = grp(g, 0, 0.23, 0); r.body = body; r.baseY = 0.23;
    faceBox(r, body, 0.52, 0.46, 0.5, blue, { mouth: true });
    box(body, 0.4, 0.05, 0.4, toon('#d6f0fb'), 0, -0.2, 0.03);
    [[-0.12, 0.24, -0.1], [0.1, 0.24, -0.05], [0.0, 0.24, 0.1]].forEach(([x, y, z]) => box(body, 0.1, 0.02, 0.1, toon('#2f7fb8'), x, y, z, { no: true }));
    const tp = grp(body, 0, -0.04, -0.25); let prev = tp, depth = 0.22;
    [[0.08, 0.2, 0.22, 0.2], [0.07, 0.16, 0.2, 0.2], [0.06, 0.12, 0.18, 0.2]].forEach(([w, h, d, adv], i) => {
      const pv = i === 0 ? tp : grp(prev, 0, 0, -adv); box(pv, w, h, d, toon(i === 2 ? '#8fd0f0' : blue), 0, 0, -d / 2); r.waves.push(pv); prev = pv;
    });
    [-1, 1].forEach((sx) => box(body, 0.09, 0.09, 0.1, toon('#3b8cc4'), sx * 0.27, -0.14, 0.12));
    r.drop = drop(body, 0, 0.42, 0.0, 1);
    r.update = (t, walk) => {
      body.position.y = r.baseY + (walk ? Math.abs(Math.sin(t * 6)) * 0.07 : Math.sin(t * 2.2) * 0.012);
      r.waves.forEach((w, i) => { w.rotation.y = Math.sin(t * (walk ? 9 : 4.5) - i * 0.9) * (0.25 + i * 0.12); });
      r.drop.position.y = 0.42 + Math.sin(t * 3) * 0.03; r.drop.rotation.y = t;
    };
    return r;
  }
  r.h = st === 2 ? 0.7 : 0.78;
  const skin = st === 2 ? '#5fbf6a' : '#2f9fb0', skin2 = st === 2 ? '#4aa859' : '#238a9a', bel = st === 2 ? '#e8f3b8' : '#ffe08a';
  const S = toon(skin), S2 = toon(skin2), BL = toon(bel);
  const sc = st === 2 ? 1 : 1.12;
  const body = grp(g, 0, 0.27 * sc, 0); r.body = body; r.baseY = 0.27 * sc;
  box(body, 0.52 * sc, 0.34 * sc, 0.52 * sc, S);
  box(body, 0.4 * sc, 0.05, 0.42 * sc, BL, 0, -0.17 * sc, 0.03);
  [[-0.1, 0.18, -0.1], [0.12, 0.18, 0.02]].forEach(([x, y, z]) => box(body, 0.1, 0.02, 0.1, toon('#4aa3d9'), x * sc, y * sc + 0.0, z, { no: true }));
  const head = grp(body, 0, 0.1 * sc, 0.32 * sc); r.head = head;
  faceBox(r, head, 0.5 * sc, 0.26 * sc, 0.4 * sc, skin, { noEyes: true, wide: true, blush: '#f59a9a' });
  eyeBall(r, head, 0.18 * sc, -0.16 * sc, 0.2 * sc, 0.1 * sc, skin); eyeBall(r, head, 0.18 * sc, 0.16 * sc, 0.2 * sc, 0.1 * sc, skin);
  r.sac = box(head, 0.3 * sc, 0.1, 0.2 * sc, BL, 0, -0.14 * sc, 0.12);
  [-1, 1].forEach((sx) => {
    const th = grp(body, sx * 0.32 * sc, -0.12 * sc, -0.12 * sc); box(th, 0.14 * sc, 0.3 * sc, 0.34 * sc, S2, 0, 0.1 * sc, 0);
    const ft = grp(g, sx * 0.34 * sc, 0.03, 0.08 * sc); box(ft, 0.18 * sc, 0.06, 0.28 * sc, S2, 0, 0, 0); r.legs.push({ p: ft, th, ph: 0, sx });
    box(body, 0.07, 0.2, 0.08, S2, sx * 0.2 * sc, -0.08 * sc, 0.28 * sc);
  });
  drop(head, 0, 0.2 * sc, -0.02, 1.0 * sc);
  if (st === 3) {
    const gold = toon('#f2c230');
    box(head, 0.34, 0.06, 0.28, gold, 0, 0.16, -0.04);
    for (let i = -2; i <= 2; i++) box(head, 0.05, 0.1 + (i === 0 ? 0.07 : 0), 0.05, gold, i * 0.07, 0.25 + (i === 0 ? 0.035 : 0), -0.04);
    box(head, 0.07, 0.07, 0.07, glow('#7ff0ff'), 0, 0.2, 0.1, { no: true });
    const fin = new THREE.MeshToonMaterial({ color: '#7fd0ff', gradientMap: gradMap, transparent: true, opacity: 0.85 });
    for (let i = 0; i < 3; i++) box(body, 0.04, 0.22 - i * 0.04, 0.16, fin, 0, 0.27 * sc, -0.12 + i * 0.12, { no: true });
    for (let i = 0; i < 3; i++) { const b = box(g, 0.08, 0.08, 0.08, glow('#bdeeff'), 0, 0.5, 0, { no: true }); r.extra.push({ b, i }); }
  }
  r.update = (t, walk) => {
    const hop = walk ? Math.abs(Math.sin(t * 5)) * 0.22 : 0;
    g.position.y = hop;
    body.position.y = r.baseY + (walk ? 0 : Math.sin(t * 2) * 0.006);
    r.sac.scale.set(1 + (Math.sin(t * 3) * 0.5 + 0.5) * 0.18, 1 + (Math.sin(t * 3) * 0.5 + 0.5) * 0.35, 1 + (Math.sin(t * 3) * 0.5 + 0.5) * 0.18);
    r.legs.forEach((l) => { l.th.rotation.x = walk ? -Math.sin(t * 5) * 0.4 : 0; });
    head.rotation.x = Math.sin(t * 1.4) * 0.04;
    r.extra.forEach((e) => { const a = t * 1.6 + e.i * 2.1; e.b.position.set(Math.cos(a) * 0.5, 0.5 + Math.sin(a * 1.5) * 0.08, Math.sin(a) * 0.5); });
  };
  return r;
}

/* =====================================================================
   PIOYO -> Petokar -> Jagobara  (anak ayam -> ayam -> jago, tipe Api)
   ===================================================================== */
function buildPioyo(st) {
  const r = newRig(), g = r.root; r.size = [1, 1.3, 1.6][st - 1];
  if (st === 1) {
    r.h = 0.9; const Y = '#ffd84a', legH = 0.17;
    const body = grp(g, 0, legH + 0.19, 0); r.body = body; r.baseY = legH + 0.19;
    box(body, 0.5, 0.38, 0.46, toon(Y));
    box(body, 0.34, 0.2, 0.06, toon('#fff0a0'), 0, -0.04, 0.24, { no: true });
    box(body, 0.1, 0.12, 0.08, toon(Y), 0, 0.05, -0.27);
    const head = grp(body, 0, 0.3, 0.06); r.head = head;
    faceBox(r, head, 0.44, 0.38, 0.4, Y, {});
    box(head, 0.12, 0.07, 0.1, toon('#ff9a2a'), 0, -0.06, 0.24);
    flame(r, head, 0, 0.19, -0.02, 0.5);
    r.wings = [-1, 1].map((sx) => { const w = grp(body, sx * 0.28, 0.06, -0.02); box(w, 0.06, 0.22, 0.26, toon('#ffc93c'), 0, -0.08, 0); return { w, sx }; });
    [-1, 1].forEach((sx) => { const p = grp(g, sx * 0.1, legH, 0.0); box(p, 0.04, legH, 0.04, toon('#ff9a2a'), 0, -legH / 2, 0, { no: true }); box(p, 0.11, 0.035, 0.13, toon('#ff9a2a'), 0, -legH + 0.018, 0.03); r.legs.push({ p, ph: sx > 0 ? Math.PI : 0 }); });
    r.update = (t, walk) => {
      r.legs.forEach((l) => { l.p.rotation.x = walk ? Math.sin(t * 10 + l.ph) * 0.7 : 0; });
      body.position.y = r.baseY + (walk ? Math.abs(Math.sin(t * 10)) * 0.04 : Math.sin(t * 3) * 0.01);
      head.rotation.x = (Math.sin(t * 0.9) > 0.9 ? 0.45 : 0) + Math.sin(t * 1.7) * 0.04 + (walk ? Math.sin(t * 10) * 0.08 : 0);
      r.wings.forEach((w) => { w.w.rotation.z = w.sx * (0.18 + (walk ? Math.abs(Math.sin(t * 10)) * 0.45 : Math.sin(t * 2) * 0.05)); });
    };
    return r;
  }
  const legH = st === 2 ? 0.26 : 0.3;
  const feather = st === 2 ? '#ffa63d' : '#e0512b', chest = st === 2 ? '#ffd27a' : '#ffb347', wing = st === 2 ? '#e8892a' : '#c93f22', leg = '#ffcf3a';
  r.h = st === 2 ? 1.05 : 1.55;
  const bw = st === 2 ? 0.5 : 0.58, bh = st === 2 ? 0.46 : 0.52, bd = st === 2 ? 0.74 : 0.86;
  const body = grp(g, 0, legH + bh / 2, 0); r.body = body; r.baseY = legH + bh / 2;
  box(body, bw, bh, bd, toon(feather));
  box(body, bw * 0.7, bh * 0.55, 0.06, toon(chest), 0, -0.05, bd / 2 + 0.01, { no: true });
  [-1, 1].forEach((sx) => { const p = grp(g, sx * 0.13, legH, 0.02); box(p, 0.06, legH, 0.06, toon(leg), 0, -legH / 2, 0, { no: true }); box(p, 0.15, 0.04, 0.2, toon(leg), 0, -legH + 0.02, 0.05); if (st === 3) box(p, 0.03, 0.03, 0.1, toon('#c58a1b'), sx * 0.04, -legH * 0.55, -0.06, { no: true }); r.legs.push({ p, ph: sx > 0 ? Math.PI : 0 }); });
  r.wings = [-1, 1].map((sx) => { const w = grp(body, sx * (bw / 2 + 0.03), 0.08, 0); box(w, 0.07, bh * 0.6, bd * 0.5, toon(wing), 0, -0.08, 0); if (st === 3) box(w, 0.075, 0.05, bd * 0.52, glow('#ff9a2a'), 0, -bh * 0.35, 0, { no: true }); return { w, sx }; });
  const neck = grp(body, 0, bh / 2, bd / 2 - 0.1);
  box(neck, 0.26, 0.28, 0.26, toon(feather), 0, 0.1, 0.04);
  const head = grp(neck, 0, 0.32, 0.1); r.head = head;
  const hs = st === 2 ? 0.36 : 0.42;
  faceBox(r, head, hs, hs * 0.92, hs * 0.95, feather, { blush: st === 2 ? '#f59a9a' : '#ffb090' });
  box(head, 0.11, 0.07, 0.13, toon('#ffcf3a'), 0, -0.06, hs * 0.95 / 2 + 0.05);
  box(head, 0.06, 0.1, 0.05, toon('#e23a2e'), 0, -0.14, hs * 0.95 / 2 + 0.02);
  const comb = toon('#e23a2e');
  if (st === 2) { [-0.07, 0, 0.07].forEach((z, i) => box(head, 0.05, 0.1 + (i === 1 ? 0.04 : 0), 0.08, comb, 0, 0.2 + (i === 1 ? 0.02 : 0), z - 0.02)); flame(r, head, 0, 0.26, 0.0, 0.45); }
  else {
    [-0.12, -0.06, 0, 0.06, 0.12].forEach((z, i) => box(head, 0.06, 0.14 + (i === 2 ? 0.08 : i % 2 ? 0 : 0.03), 0.07, comb, 0, 0.24, z - 0.02));
    flame(r, head, 0, 0.42, -0.02, 0.8);
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; box(neck, 0.14, 0.2, 0.05, toon(i % 2 ? '#ff9a2a' : '#ffb347'), Math.sin(a) * 0.22, 0.02, 0.04 + Math.cos(a) * 0.2, { ry: a, rx: 0.3 }); }
  }
  const tail = grp(body, 0, 0.12, -bd / 2 - 0.02); r.tail = tail;
  const nF = st === 2 ? 3 : 5; r.feathers = [];
  for (let i = 0; i < nF; i++) {
    const k = i - (nF - 1) / 2, fp = grp(tail, 0, 0, 0); fp.rotation.set(-0.35, 0, k * 0.34);
    const len = st === 2 ? 0.34 : 0.55, col = st === 2 ? '#e8892a' : ['#c93f22', '#e0512b', '#ff7a2a', '#e0512b', '#c93f22'][i];
    box(fp, 0.08, len, 0.05, toon(col), 0, len / 2, -0.04);
    flame(r, fp, 0, len - 0.02, -0.04, st === 2 ? 0.28 : 0.4); r.feathers.push({ fp, k });
  }
  r.update = (t, walk) => {
    r.legs.forEach((l) => { l.p.rotation.x = walk ? Math.sin(t * 8 + l.ph) * 0.6 : 0; });
    body.position.y = r.baseY + (walk ? Math.abs(Math.sin(t * 8)) * 0.04 : Math.sin(t * 2.4) * 0.008);
    head.rotation.x = (Math.sin(t * 0.8) > 0.92 ? 0.4 : 0) + (walk ? Math.sin(t * 8) * 0.1 : Math.sin(t * 1.5) * 0.03);
    r.wings.forEach((w) => { w.w.rotation.z = w.sx * (0.12 + (walk ? Math.abs(Math.sin(t * 8)) * 0.35 : Math.sin(t * 2) * 0.04)); });
    r.feathers.forEach((f) => { f.fp.rotation.z = f.k * 0.34 + Math.sin(t * 2.5 + f.k) * 0.05; });
  };
  return r;
}

