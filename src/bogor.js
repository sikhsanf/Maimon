/* =====================================================================
   KOTA BOGOR (Sedang 36x28) — menyambung langsung dari ujung selatan J1 (z=54).
   Jl. Pajajaran (lanjutan jalan field, lebar sama) N-S, bundaran Tugu Kujang, Jl. Suryakencana E-W
   (ke Bandung/J4 di timur, ke Ujung Kulon/J16 di barat: sama-sama semak Tebas),
   Hotel + Klinik di utara jalan, Toko Pia + Pasar di selatan, Kebun Raya (kolam + jembatan kecil)
   dan Gym Kebun Raya (Pak Botani) di ujung jalan.
   ===================================================================== */
var gateOpen = false, bogorOn = false;
const BG = { x0: -18, x1: 18, z0: 54, z1: 82 }, ZR = 68, BTPU = 14;
const BRD = [{ pts: [[-1, 54], [-1, 78.4]], w: 3.4 }, { pts: [[-18, ZR], [18, ZR]], w: 2.4 }];
const KOL = { x: 7.6, z: 77.4, rx: 3.9, rz: 2.2 };
const ROUND = { x: -1, z: ZR, ring: 3.6, isl: 1.75 };
const BPATHS = [[[0.9, 74.6], [3.0, 75.8], [3.6, 77.4]], [[11.6, 77.4], [13.4, 75.6], [15.2, 73.8]], [[-2.8, 75.2], [-7, 75.6], [-12.5, 76.8]], [[-1, 74], [-1, 76.6]]];
const inBogor = (x, z) => x > BG.x0 && x < BG.x1 && z >= BG.z0 && z < BG.z1;
const BEX = { hw: 1.5, len: 4.4 };

function bkind(x, z) {
  const kr = Math.hypot((x - KOL.x) / KOL.rx, (z - KOL.z) / KOL.rz);
  if (Math.abs(z - KOL.z) < 0.6 && x > KOL.x - KOL.rx - 0.6 && x < KOL.x + KOL.rx + 0.6) return 'bridge';
  if (kr < 1) return 'water'; if (kr < 1.2) return 'bank';
  const rd = Math.hypot(x - ROUND.x, z - ROUND.z);
  if (rd < ROUND.isl) return 'lawn'; if (rd < ROUND.isl + 0.25) return 'curb'; if (rd < ROUND.ring) return 'road';
  const pj = poly(BRD[0].pts, x, z).d, pw = BRD[0].w / 2;
  if (pj < pw + 0.16 && z < 78.6) return pj < 0.26 ? 'median' : pj < pw ? 'road' : 'curb';
  const sk = Math.abs(z - ZR), sw = BRD[1].w / 2;
  if (sk < sw + 0.14) return sk < sw ? 'road' : 'curb';
  if (x > -4.3 && x < 2.3 && z > 76.4 && z < 79.4) return 'plaza';
  for (const p of BPATHS) if (poly(p, x, z).d < 0.45) return 'path';
  if (z > 73.2) return 'lawn';
  if (inRect([-17.6, -12.5, 55.4, 57.5], x, z) || inRect([13.5, 17.6, 55.4, 58.5], x, z)) return 'forest';
  return 'grass';
}
const BGX = (BG.x1 - BG.x0) * 2 + 1, BGZ = (BG.z1 - BG.z0) * 2 + 1; let BGRID = new Float32Array(BGX * BGZ);
function bogorRaw(x, z) {
  const k = bkind(x, z); let h = (fbm(x * 0.35 + 9, z * 0.35) - 0.5) * 0.28;
  const kr = Math.hypot((x - KOL.x) / KOL.rx, (z - KOL.z) / KOL.rz);
  if (kr < 1.5) { const t = clamp((1.5 - kr) / 0.6, 0, 1); h = lerp(h, -0.45, t * t * (3 - 2 * t)); }
  if (k === 'road' || k === 'median' || k === 'curb' || k === 'plaza') h = lerp(h, 0, 0.92);
  if (k === 'bridge') h = 0.08;
  if (x > FD.x0 && x < FD.x1 && z < BG.z0 + 2) { const t = clamp((z - BG.z0) / 2, 0, 1), s = t * t * (3 - 2 * t); h = lerp(fieldY(x, FD.z1), h, s); }
  return h;
}
{
  for (let j = 0; j < BGZ; j++) for (let i = 0; i < BGX; i++) BGRID[j * BGX + i] = bogorRaw(BG.x0 + i * 0.5, BG.z0 + j * 0.5);
  smoothBorder(BGRID, BGX, BGZ, { w: 1, e: 1, s: 1 });
}
function bogorY(x, z) {
  const fx = clamp((x - BG.x0) * 2, 0, BGX - 1.001), fz = clamp((z - BG.z0) * 2, 0, BGZ - 1.001), i = Math.floor(fx), j = Math.floor(fz), tx = fx - i, tz = fz - j;
  const a = BGRID[j * BGX + i], b = BGRID[j * BGX + i + 1], c = BGRID[(j + 1) * BGX + i], d = BGRID[(j + 1) * BGX + i + 1];
  return bkind(x, z) === 'bridge' ? 0.08 : lerp(lerp(a, b, tx), lerp(c, d, tx), tz);
}
/* jalan keluar timur/barat di Jl. Suryakencana (terhalang semak: Tebas) */
function bogorCorr(x, z, r) {
  if (Math.abs(z - ZR) >= BEX.hw - r) return false;
  return (x > BG.x1 - 0.8 && x < BG.x1 + BEX.len) || (x < BG.x0 + 0.8 && x > BG.x0 - BEX.len);
}

/* tanah khas Bogor: paving batu hangat, trotoar bata merah, rumput hijau-lumut yang lebih pekat */
function bogorTile(k, x, z, pxi, pzi) {
  const hh = hash2(pxi, pzi), n = fbm(x * 1.4, z * 1.4), v = fbm(x * 0.55, z * 0.55) * 0.7 + vnoise(x * 6, z * 6) * 0.18 + hh * 0.12;
  switch (k) {
    case 'road': { const fx = (x * 3.4) % 1, fz = (z * 3.4 + (Math.floor(x * 3.4) % 2) * 0.5) % 1, cell = hash2(Math.floor(x * 3.4) + 7, Math.floor(z * 3.4 + (Math.floor(x * 3.4) % 2) * 0.5));
      if (fx < 0.13 || fz < 0.13) return shade(hex('#5a544b'), 0.9 + hh * 0.12); return shade(mixc(hex('#9d9686'), hex('#bbb29e'), cell), 0.92 + n * 0.16); }
    case 'curb': { const row = Math.floor(z * 4), off = (row % 2) * 0.5, bx = (x * 4 + off) % 1, by = (z * 4) % 1; if (bx < 0.1 || by < 0.12) return hex('#7c4a3a'); return shade(hex('#b8654a'), 0.9 + hash2(Math.floor(x * 4 + off), row) * 0.22); }
    case 'median': return shade(hex('#3f8a50'), 0.92 + hh * 0.1);
    case 'plaza': { const g = (Math.floor(x * 2.2) + Math.floor(z * 2.2)) % 2, edge = (x * 2.2 % 1 < 0.08 || z * 2.2 % 1 < 0.08); return edge ? hex('#a8896a') : shade(hex(g ? '#dcb99a' : '#cfa888'), 0.95 + hh * 0.08); }
    case 'lawn': { const c = mixc(PAL.lawn[clamp(Math.floor((v - 0.1) * 6), 0, 3)], hex('#2f9a68'), 0.42); const f = hash2(pxi * 5 + 1, pzi * 3 + 2); if (f < 0.004) return hex('#f6e9ff'); if (f < 0.006) return hex('#f08ab8'); return c; }
    case 'forest': return mixc(tileColor('forest', x, z, pxi, pzi), hex('#1f5f45'), 0.35);
    case 'grass': { const c = tileColor('grass', x, z, pxi, pzi); return mixc(c, hex('#3b8f5c'), 0.4); }
    default: return tileColor(k === 'bridge' ? 'lane' : k, x, z, pxi, pzi);
  }
}
/* suasana khas Bogor: Kota Hujan — langit kelabu kebiruan, kabut tipis, cahaya lebih sejuk, gerimis */
const ATMO0 = { top: new THREE.Color('#8cc6ea'), bot: new THREE.Color('#eef4ee'), lit: new THREE.Color('#ffffff'), shade: new THREE.Color('#dce8ee'), haze: new THREE.Color('#eef4f4'), hemi: new THREE.Color(0xc4dcff), sun: new THREE.Color(0xfff0d4), cloud: 0.3, hz: 0, hI: 1.05, sI: 2.6 };
const ATMO1 = { top: new THREE.Color('#6f93a8'), bot: new THREE.Color('#c4d3d0'), lit: new THREE.Color('#e4ecee'), shade: new THREE.Color('#8fa2ab'), haze: new THREE.Color('#cfdcd9'), hemi: new THREE.Color(0xa8cfd0), sun: new THREE.Color(0xe6f0e6), cloud: 0.8, hz: 0.2, hI: 1.12, sI: 2.15 };
var atmoK = 0, atmoT = 0, rainEl = null;
function bogorAtmo() {
  const dt = Math.min(0.1, Math.max(0, T - atmoT)); atmoT = T;
  const tgt = bogorOn && !inside && (mode === 'play' || mode === 'dialog' || mode === 'battle' || mode === 'feed') ? clamp((player.z - 42) / 16, 0, 1) : 0;
  atmoK += (tgt - atmoK) * Math.min(1, dt * 1.5); const k = atmoK * atmoK * (3 - 2 * atmoK);
  if (!rainEl) rainEl = document.getElementById('rain');
  if (rainEl) rainEl.style.opacity = perfLv >= 2 ? 0 : (Math.max(0, k - 0.55) / 0.45 * 0.55).toFixed(2);
  if (Math.abs(k - (bogorAtmo.last ?? -1)) < 0.004) return; bogorAtmo.last = k;
  const u = skyU, A = ATMO0, B = ATMO1;
  u.skyTop.value.lerpColors(A.top, B.top, k); u.skyBot.value.lerpColors(A.bot, B.bot, k); u.cloudLit.value.lerpColors(A.lit, B.lit, k); u.cloudShade.value.lerpColors(A.shade, B.shade, k);
  u.uHazeCol.value.lerpColors(A.haze, B.haze, k); u.uCloud.value = lerp(A.cloud, B.cloud, k); u.uHaze.value = lerp(A.hz, B.hz, k);
  hemi.color.lerpColors(A.hemi, B.hemi, k); hemi.intensity = lerp(A.hI, B.hI, k); sun.color.lerpColors(A.sun, B.sun, k); sun.intensity = lerp(A.sI, B.sI, k);
}

let bogorGate = { bar: null, rect: null, label: null };
function openGate(on) {
  gateOpen = on;
  if (bogorGate.bar) bogorGate.bar.visible = !on;
  if (bogorGate.rect) { const i = rects.indexOf(bogorGate.rect); if (on && i >= 0) rects.splice(i, 1); else if (!on && i < 0) rects.push(bogorGate.rect); }
  if (bogorGate.label) { bogorGate.label.material.map = on ? labelTex('KOTA BOGOR', '#1d6f6a', '#ffffff') : labelTex('BOGOR: TUTUP', '#a8442e', '#ffffff'); bogorGate.label.material.needsUpdate = true; }
}

function buildBogor() {
  bogorOn = true;
  const W = BG.x1 - BG.x0, H = BG.z1 - BG.z0, PW = W * BTPU, PH = H * BTPU;
  const tex = toTex(pixCanvas(PW, PH, (pxi, pzi) => { const x = BG.x0 + (pxi + 0.5) / BTPU, z = BG.z0 + (pzi + 0.5) / BTPU, k = bkind(x, z); return bogorTile(k, x, z, pxi, pzi + 12000); }));
  const g = new THREE.PlaneGeometry(W, H, W * 2, H * 2); g.rotateX(-Math.PI / 2); g.translate((BG.x0 + BG.x1) / 2, 0, (BG.z0 + BG.z1) / 2);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const gi = Math.round((p.getX(i) - BG.x0) * 2), gj = Math.round((p.getZ(i) - BG.z0) * 2); p.setY(i, BGRID[gj * BGX + gi]); }
  g.computeVertexNormals();
  const t = new THREE.Mesh(g, toon('#ffffff', { map: tex })); t.receiveShadow = true; world.add(t);
  const wt = terrainMat.water.clone(); wt.needsUpdate = true; wt.repeat.set(W / 4, H / 4); terrainMat.bogor = wt;
  const wm = new THREE.Mesh(new THREE.PlaneGeometry(W, H).rotateX(-Math.PI / 2), toon('#ffffff', { map: wt })); wm.position.set((BG.x0 + BG.x1) / 2, -0.13, (BG.z0 + BG.z1) / 2); wm.receiveShadow = true; world.add(wm);

  /* ---------- bangunan ---------- */
  // utara Jl. Suryakencana (pintu menghadap selatan = jalan)
  { const hg = house(-8.0, 65.5, 0, 2); addRoofSign(hg, ['HOTEL MAIMON', '#8a5a2a', 'heart'], 1.15 * 1.3, 0.7); }
  colonial(7.0, 63.9, 0, 0, { sign: ['KLINIK MAIMON', '#e0507a', 'heart'], b: { roof: '#e0507a', door: '#e0507a', shutter: '#f08aa8' } });
  // selatan Jl. Suryakencana (pintu menghadap utara = jalan)
  { const hg = house(-7.5, 70.5, Math.PI, 5); addRoofSign(hg, ['TOKO PIA', '#c06a2a', 'heart'], 1.15 * 1.3, 0.7); }
  { const pg = bldg(7.0, 70.9, 4.6, 2.4, 0.9, { flat: true, ry: Math.PI, wall: '#f4e3b8', frame: '#ffffff', awning: '#3a9a5a', door: '#7a4a2a', doorX: 2.3, wins: [[0.6, 0.35, 8, 8], [1.6, 0.35, 8, 8], [3.0, 0.35, 8, 8], [4.0, 0.35, 8, 8]], seed: 8 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.16, 2.6), toon('#3a9a5a')); top.position.set(0, 1.25, 0); top.castShadow = true; pg.add(top);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), new THREE.MeshBasicMaterial({ map: labelTex('PASAR BOGOR', '#3a9a5a', '#ffffff') })); sg.position.set(0, 1.45, -1.3); sg.rotation.y = Math.PI; pg.add(sg); }
  // Gym Kebun Raya di ujung jalan
  colonial(-1, 80.4, Math.PI, 2, { sign: ['GYM KEBUN RAYA', '#2f8a4a', 'heart'], b: { wall: '#e9f5dc', roof: '#2f7a4a', door: '#2f6a3a', shutter: '#3f8a52' } });
  // loket Kebun Raya
  bldg(3.4, 73.2, 1.1, 0.9, 0.8, { ry: -Math.PI / 2, wall: '#d9c898', roof: '#2f7a4a', door: '#6a4a2a', doorX: 0.55, rh: 0.4, wins: [[0.25, 0.3, 5, 6]], seed: 13 });

  /* ---------- bundaran + Tugu Kujang (tinggi ±7,5 petak: ikon kota) ---------- */
  { const st = toon('#d6d1c0'), st2 = toon('#bdb8a6'), gold = toon('#e8b830'), goldD = toon('#b8861c'), dk = toon('#8a8576'), cx = ROUND.x, cz = ROUND.z, y = groundY(cx, cz);
    const cyl = (r0, r1, h, mat, yy, seg = 8) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, h, seg), mat); m.position.set(cx, y + yy, cz); m.castShadow = m.receiveShadow = true; world.add(m); return m; };
    cyl(1.55, 1.5, 0.28, dk, 0.14, 10); cyl(1.25, 1.2, 0.28, st2, 0.42, 10); cyl(0.95, 0.9, 0.28, st, 0.7, 10);
    cyl(0.62, 0.3, 4.6, st, 0.84 + 2.3, 8);                 // tiang meruncing
    cyl(0.5, 0.5, 0.14, gold, 2.4, 8); cyl(0.4, 0.4, 0.14, gold, 3.7, 8); cyl(0.34, 0.34, 0.14, gold, 4.7, 8);   // cincin emas
    cyl(0.42, 0.42, 0.3, dk, 5.55, 8);                       // kepala tiang
    // Kujang raksasa: bilah melengkung dari potongan kotak
    const blade = [[0.0, 0.0, 0.0, 0.3, 0.42], [0.04, 0.38, -0.06, 0.4, 0.4], [0.12, 0.76, -0.14, 0.52, 0.4], [0.26, 1.12, -0.26, 0.58, 0.38], [0.46, 1.44, -0.4, 0.54, 0.36], [0.7, 1.7, -0.58, 0.44, 0.32], [0.96, 1.9, -0.78, 0.32, 0.3], [1.2, 2.04, -1.0, 0.2, 0.26]];
    blade.forEach(([dx, dy, rz, w, h], i) => { box(world, w, h, 0.12, i % 3 === 1 ? gold : goldD, cx + dx, y + 5.75 + dy, cz, { rz }); });
    [[0.1, 0.6], [0.24, 1.0], [0.42, 1.34]].forEach(([dx, dy]) => box(world, 0.12, 0.12, 0.14, dk, cx + dx - 0.1, y + 5.75 + dy, cz, { rz: -0.4 }));
    box(world, 0.34, 0.34, 0.34, gold, cx, y + 5.78, cz, { ry: 0.78 });
    circles.push({ x: cx, z: cz, r: 1.75 }); }

  /* ---------- lampu jalan heritage, pagar Kebun Raya, angkot hijau, gerobak ---------- */
  { const dk = toon('#26302a'), warm = glow('#ffe7a0'), cap = toon('#3a4a3a');
    const lamp = (x, z) => { const y = groundY(x, z); box(world, 0.24, 0.16, 0.24, dk, x, y + 0.08, z); box(world, 0.08, 1.6, 0.08, dk, x, y + 0.95, z); box(world, 0.3, 0.34, 0.3, warm, x, y + 1.9, z, { no: true }); box(world, 0.38, 0.08, 0.38, cap, x, y + 2.14, z); box(world, 0.14, 0.12, 0.14, cap, x, y + 2.24, z); circles.push({ x, z, r: 0.16 }); };
    [[-3.45, 58.2], [1.45, 61.4], [-3.45, 64.6], [1.45, 56.4], [-1 + 3.0, 75.0], [-1 - 3.0, 75.0]].forEach(([x, z]) => lamp(x, z));
    const rr = ROUND.ring + 0.5; [0.8, 2.4, 3.9, 5.5].forEach((a) => lamp(ROUND.x + Math.cos(a) * rr, ROUND.z + Math.sin(a) * rr)); }
  { // pagar putih ala Istana di sisi Kebun Raya (hanya terbuka di gerbang)
    const zf = 73.4, geos = [], mkb = (w, h, d, x, y, z) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); geos.push(g); };
    [[-17.6, -3.5], [1.5, 17.6]].forEach(([xa, xb]) => { const len = xb - xa, xm = (xa + xb) / 2; mkb(len, 0.07, 0.07, xm, 0.34, zf); mkb(len, 0.07, 0.07, xm, 0.72, zf);
      for (let q = xa; q <= xb + 0.01; q += 0.46) { mkb(0.07, 0.78, 0.07, q, 0.39, zf); mkb(0.1, 0.1, 0.1, q, 0.82, zf); } });
    const fm = new THREE.Mesh(mergeGeometries(geos), toon('#f4f2ea')); fm.castShadow = true; world.add(fm);
    rects.push([-17.9, -3.5, zf - 0.12, zf + 0.12], [1.5, 17.9, zf - 0.12, zf + 0.12]); }
  { [[-12.8, 68.62, Math.PI / 2], [11.6, 67.38, -Math.PI / 2]].forEach(([x, z, ry]) => { const a = buildCar('#2fa04a', true); a.scale.setScalar(1.3); a.position.set(x, groundY(x, z), z); a.rotation.y = ry; world.add(a); rects.push([x - 1.3, x + 1.3, z - 0.55, z + 0.55]); }); }
  { const wood = toon('#9a6a3a'), pole = toon('#e9e4d6');
    const cart = (x, z, ry, txt, c1, c2) => { const g = new THREE.Group(); g.position.set(x, groundY(x, z), z); g.rotation.y = ry; world.add(g);
      box(g, 1.0, 0.42, 0.55, wood, 0, 0.3, 0); box(g, 1.05, 0.05, 0.6, toon('#d9c8a0'), 0, 0.53, 0); [-0.48, 0.48].forEach((px) => box(g, 0.05, 0.95, 0.05, pole, px, 0.78, -0.2));
      for (let i = 0; i < 4; i++) box(g, 0.28, 0.05, 0.8, toon(i % 2 ? c1 : c2), -0.42 + i * 0.28, 1.28, -0.05, { rx: 0.18 });
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.24), new THREE.MeshBasicMaterial({ map: labelTex(txt, c1, '#ffffff') })); sg.position.set(0, 0.74, 0.29); g.add(sg);
      [[-0.9, 0.45], [0.9, 0.45]].forEach(([sx, sz]) => box(g, 0.28, 0.26, 0.28, toon('#c0392b'), sx, 0.13, sz)); circles.push({ x, z, r: 0.55 }); };
    cart(-4.8, 70.75, Math.PI, 'SOTO MIE', '#d9482e', '#ffffff'); cart(3.2, 65.55, 0, 'ASINAN', '#2f9a4a', '#f4f2ea'); }

  /* ---------- Kebun Raya: gerbang, kolam + jembatan kecil ---------- */
  { const wood = toon('#c9b88a'), roof = toon('#2f7a4a'), cream = toon('#f3ead2'), cx = -1, zc = 73.4;
    [-2.4, 2.4].forEach((dx) => { box(world, 0.4, 2.1, 0.4, wood, cx + dx, groundY(cx + dx, zc) + 1.05, zc); circles.push({ x: cx + dx, z: zc, r: 0.3 }); });
    box(world, 5.8, 0.28, 0.5, roof, cx, 2.2, zc); box(world, 5.0, 0.5, 0.3, cream, cx, 1.85, zc);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.52), new THREE.MeshBasicMaterial({ map: labelTex('KEBUN RAYA', '#2f8a4a', '#ffffff'), side: THREE.DoubleSide })); m.position.set(cx, 1.85, zc); world.add(m); }
  { const plank = toon('#a07848'), rail = toon('#e9e4d6'), L = KOL.rx * 2 + 1.0;
    box(world, L, 0.12, 1.05, plank, KOL.x, 0.04, KOL.z);
    [-0.52, 0.52].forEach((dz) => { box(world, L, 0.08, 0.06, rail, KOL.x, 0.38, KOL.z + dz); for (let s = -L / 2 + 0.2; s <= L / 2; s += 1.4) box(world, 0.09, 0.4, 0.09, rail, KOL.x + s, 0.2, KOL.z + dz); }); }

  /* ---------- pohon & semak ---------- */
  { const R = rng(515), t0 = treeSpots.length;
    const ok = (x, z, m) => { if (!inBogor(x, z) || x < BG.x0 + 1 || x > BG.x1 - 1 || z < BG.z0 + 1.2 || z > BG.z1 - 0.8) return false; const k = bkind(x, z); if (k !== 'grass' && k !== 'forest' && k !== 'lawn') return false;
      if (rects.some((b) => x > b[0] - m && x < b[1] + m && z > b[2] - m && z < b[3] + m)) return false; if (Math.abs(z - ZR) < 2.4 && Math.abs(x - ROUND.x) < 5) return false; if (Math.abs(z - ZR) < 2.2) return false;
      if (Math.hypot(x - KOL.x, z - KOL.z) < 6.2 && Math.abs(z - KOL.z) < 1.8) return false;
      if (poly(BRD[0].pts, x, z).d < 2.3) return false; if (inRect(WILDA[0], x, z, 0.5) || inRect(WILDA[1], x, z, 0.5) || inRect(WILDA[2], x, z, 0.5)) return false;
      return !treeSpots.some((q) => q.kind !== 'bush' && Math.hypot(q.x - x, q.z - z) < 1.9); };
    let n = 0, tr = 0;
    while (n < 46 && tr++ < 3000) { const kr = R() < 0.55, x = BG.x0 + 1 + R() * (W - 2), z = kr ? 73.4 + R() * 8 : BG.z0 + 1.5 + R() * 18; if (!ok(x, z, 0.9)) continue; addTree(x, z, R() < 0.5 ? 'pine' : 'round', 0.85 + R() * 0.4); n++; }
    n = 0; tr = 0;
    while (n < 30 && tr++ < 3000) { const x = BG.x0 + 1 + R() * (W - 2), z = BG.z0 + 1.5 + R() * (H - 2.5); if (!ok(x, z, 0.5)) continue; addBush(x, z, 0.8 + R() * 0.6, (R() * 100) | 0); n++; }
    buildTrees(t0); }
  buildGrass(BG.x0, BG.x1, BG.z0, BG.z1, (x, z) => bkind(x, z), 34000, 88);
  { // tepi utara di luar jalur J1 tidak boleh berbatasan dengan tebing: tanah luar menyambung (lihat outer.js)
  }

  /* ---------- palang J1 + polisi (dipindah dari field) ---------- */
  openGate(false);

  /* ---------- jalan keluar timur/barat: gapura + semak lebat (Tebas) ---------- */
  const wood = toon('#c9b88a'), roof = toon('#8a3b2e'), cream = toon('#f3ead2');
  [[1, 'KE BANDUNG', BG.x1], [-1, 'KE UJUNG KULON', BG.x0]].forEach(([sd, txt, xe]) => {
    const xc = xe + sd * 1.2, sp = BEX.hw + 0.35;
    [-sp, sp].forEach((dz) => { box(world, 0.4, 2.1, 0.4, wood, xc, groundY(xc, ZR + dz) + 1.05, ZR + dz); circles.push({ x: xc, z: ZR + dz, r: 0.3 }); });
    box(world, 0.5, 0.28, sp * 2 + 0.8, roof, xc, 2.2, ZR); box(world, 0.3, 0.5, sp * 2 - 0.2, cream, xc, 1.85, ZR);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.5), new THREE.MeshBasicMaterial({ map: labelTex(txt, '#1d6f6a', '#ffffff'), side: THREE.DoubleSide })); m.position.set(xc, 1.85, ZR); m.rotation.y = Math.PI / 2; world.add(m);
    const R = rng(70 + sd), xs = xe + sd * 3.2, a = treeGeoms.length;
    for (let i = 0; i < 26; i++) bushGeoms(xs + (R() - 0.5) * 1.6, ZR + (R() - 0.5) * 3.2, 1.5 + R() * 0.9, (R() * 100) | 0);
    const mm = new THREE.Mesh(mergeGeometries(treeGeoms.slice(a)), toon('#ffffff', { vertexColors: true })); mm.castShadow = mm.receiveShadow = true; mm.userData = { x: xs, z: ZR }; world.add(mm); treeMeshes.push(mm);
    rects.push([xs - 1.0, xs + 1.0, ZR - 1.7, ZR + 1.7]);
  });
}
/* pagar di perbatasan Kota Bogor (dipanggil dari buildOuter agar ikut digabung) */
function bogorFences(fenceLine, wet) {
  const x0 = BG.x0 + FEN, x1 = BG.x1 - FEN, zN = BG.z0 + FEN, zS = BG.z1 - FEN, gap = (z) => Math.abs(z - ZR) < BEX.hw + 0.35;
  fenceLine(x0, zN, FD.x0 + FEN, zN, wet); fenceLine(FD.x1 - FEN, zN, x1, zN, wet);
  fenceLine(x0, zN, x0, zS, (x, z) => wet(x, z) || gap(z)); fenceLine(x1, zN, x1, zS, (x, z) => wet(x, z) || gap(z));
  fenceLine(x0, zS, x1, zS, (x, z) => wet(x, z));
  [[1, x1], [-1, x0]].forEach(([sd, xe]) => { [-1, 1].forEach((s) => fenceLine(xe, ZR + s * (BEX.hw + 0.35), xe + sd * (BEX.len + 0.1), ZR + s * (BEX.hw + 0.35))); });
}

/* ---------- Maimon liar & NPC ---------- */
const WILDA = [[-16.4, -7.6, 55.8, 63.0], [5.0, 16.6, 55.8, 62.2], [-16.4, -6.0, 74.6, 81.0]];
const BSPAWNS = [['dombanyo', 1, -13, 58.5], ['kancik', 1, -10, 61], ['kucingko', 1, -15, 60], ['tikusil', 1, 9, 58.5], ['dombanyo', 1, 13, 60.5], ['kancik', 1, 7.5, 61], ['kancik', 1, -11, 78], ['dombanyo', 1, -14, 76.5], ['cebongi', 2, 6.0, 74.8], ['kucingko', 1, 15, 78]];
const bogorLooks = () => Object.assign(LOOK, {
  asep: { skin: '#d9a47a', shirt: '#c9822a', pants: '#4a3a2a', cap: '#8a5a2a', hair: '#1a1210', belt: '#8a5a2a', shoe: '#3a2a1a' },
  rani: { skin: '#f0c19a', shirt: '#ffffff', pants: '#3a8a6a', coat: '#d8f0e6', style: 'bun', hair: '#2a1a14', hat: true, belt: '#ffffff', shoe: '#ffffff' },
  pia: { skin: '#e8b890', shirt: '#d9482e', pants: '#6a4a3a', style: 'longbun', hair: '#2a1a14', belt: '#f2c230', shoe: '#6a4a3a' },
  ujang: { skin: '#c98f66', shirt: '#3a8a5a', pants: '#4a4a5a', cap: '#f2c230', hair: '#1a1210', belt: '#5a3a2a', shoe: '#3a2a1a' },
  dewi: { skin: '#e8b890', shirt: '#7a5ac8', pants: '#3a3f58', style: 'pig', hair: '#2a1a14', belt: '#ffffff', shoe: '#ffffff', glasses: true },
  karcis: { skin: '#d9a47a', shirt: '#2f7a4a', pants: '#2a3a2a', cap: '#2f7a4a', hair: '#1a1210', belt: '#222222', shoe: '#1a1a1a' },
  botani: { skin: '#d9a47a', shirt: '#e9f5dc', pants: '#5a4a2a', coat: '#4a9a58', cap: '#e0c060', hair: '#2a2a2a', belt: '#8a5a2a', shoe: '#4a3a2a', glasses: true },
});
function buildBogorNPCs() {
  bogorLooks();
  addNPC('home2', 'Pak Asep', LOOK.asep, [-8.0, 66.55], 0);
  addNPC('nurse2', 'Dokter Rani', LOOK.rani, [7.0, 65.75], 0);
  addNPC('warga', 'Bu Dewi', LOOK.dewi, [-5.7, 66.55], 0);
  addNPC('pia', 'Bu Pia', LOOK.pia, [-7.5, 69.42], Math.PI);
  addNPC('pasar', 'Mang Ujang', LOOK.ujang, [6.0, 69.45], Math.PI);
  addNPC('karcis', 'Petugas Kebun Raya', LOOK.karcis, [2.1, 73.2], -Math.PI / 2);
  addNPC('botani', 'Pak Botani', LOOK.botani, [-1, 78.65], Math.PI);
}
function bogorNpcRule() {
  return npcs.filter((n) => n.z > FD.z1).map((n) => {
    const rd = Math.min(...BRD.map((r) => poly(r.pts, n.x, n.z).d - r.w / 2));
    const bd = Math.min(...rects.map((b) => Math.hypot(Math.max(b[0] - n.x, 0, n.x - b[1]), Math.max(b[2] - n.z, 0, n.z - b[3]))));
    return { id: n.id, road: +rd.toFixed(2), bld: +bd.toFixed(2), ok: rd <= RULE.road && bd <= RULE.bld };
  });
}
const nearestNPC = (prefix) => npcs.filter((n) => n.id.startsWith(prefix)).sort((a, b) => Math.hypot(player.x - a.x, player.z - a.z) - Math.hypot(player.x - b.x, player.z - b.z))[0];

/* ---------- dialog NPC Bogor ---------- */
function talkBogor(id) {
  const n = npcs.find((q) => q.id === id); pendingFocus = n;
  if (id === 'home2') { const K = 'Pak Asep'; dialog([[K, 'Selamat datang di Hotel Maimon Bogor, {n}! Bapak jaga Maimon titipanmu juga di sini.'], [K, 'Ingat, kamu hanya boleh membawa 3 Maimon sekaligus.']], () => openHome()); return; }
  if (id === 'nurse2') return talkNurse('nurse2');
  if (id === 'warga') return dialog([['Bu Dewi', 'Di Bogor ini hujannya hampir tiap sore, {n}. Rumputnya subur, jadi banyak Maimon Daun yang betah!'], ['Bu Dewi', 'Kalau mau cari mereka, coba rumput di dekat gerbang kota dan di dalam Kebun Raya.']]);
  if (id === 'pia') return dialog([['Bu Pia', 'Pia! Pia! Pia Bogor yang enak, {n}! Isinya kacang hijau dan keju.'], ['Bu Pia', 'Sayang tokonya belum bisa jual ke pelatih baru. Tunggu sebentar lagi ya!']]);
  if (id === 'pasar') return dialog([['Mang Ujang', 'Pasar Bogor buka sejak subuh, {n}. Talas, tauge, dan sayur segar semua ada!'], ['Mang Ujang', 'Talas itu makanan favorit Maimon Daun lho. Siapa tahu berguna nanti.']]);
  if (id === 'karcis') return dialog([['Petugas', 'Selamat datang di Kebun Raya Bogor, {n}! Tiket gratis untuk pelatih Maimon.'], ['Petugas', 'Di dalam ada kolam teratai dengan jembatan kecil. Hati-hati, jangan sampai jatuh ke air ya!']]);
  if (id === 'botani') return talkBotani();
}
function talkBotani() {
  const P = 'Pak Botani';
  if (S.stage === 7) {
    dialog([[P, 'Selamat datang di Kebun Raya Bogor! Kamu pasti {n}, pelatih baru dari Depok ya?'], ['{n}', 'Betul, Pak. Ini ada surat dari Prof. Catherine.'], [P, 'Oh, dari Catherine! Sudah lama sekali aku tidak berkabar dengannya… Sebentar, kubaca dulu.'],
      [P, 'Hmm, hmm. Rupanya dia ingin kamu mencatat Maimon Daun di Kebun Raya ini. Itu juga latihan yang bagus buat pelatih.'], [P, 'Gym Kebun Raya masih kusiapkan. Sementara itu, jelajahi Bogor dan tangkap Maimon Daun ya. Segera hadir!']], () => {
      S.stage = 8; saveGame(); Music.jingle('catch'); toast('Surat sudah diantar 💌', 2.8); });
    return;
  }
  if (S.stage >= 8) {
    if (!gymReady(1)) { dialog([[P, `Mau menantang gym-ku, {n}? Maimon terkuatmu harus minimal Lv ${GYM_MINLV[0]} dulu. Sekarang baru Lv ${gymTopLv()}.`], [P, 'Latihan dulu di sekitar Bogor ya, dan tangkap Maimon Daun!']]); return; }
    dialog([[P, 'Tim-mu sudah cukup kuat! Tapi Gym Kebun Raya masih kusiapkan. Segera hadir, {n}!']]); return;
  }
  dialog([[P, 'Halo! Ada perlu apa, Nak? Kalau dari Depok, biasanya Prof. Catherine mengirim surat dulu.']]);
}
function applyGateFromStory() { const want = S.stage >= 7; if (want !== gateOpen) openGate(want); }
let bogorToastT = 0;
function updateBogor() {
  bogorAtmo();
  if (mode !== 'play' || inside || T < bogorToastT || player.z < BG.z0) return;
  if (player.x > BG.x1 + 1.4 && Math.abs(player.z - ZR) < 2.0) { bogorToastT = T + 7; toast('Semak lebat menutup jalan ke Bandung. Butuh skill Tebas 🌿', 3.2); }
  else if (player.x < BG.x0 - 1.4 && Math.abs(player.z - ZR) < 2.0) { bogorToastT = T + 7; toast('Semak lebat menutup jalan ke Ujung Kulon. Butuh skill Tebas 🌿', 3.2); }
}
