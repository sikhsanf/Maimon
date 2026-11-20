/* =====================================================================
   TANAH LUAR — peta tidak lagi "melayang". Tanah menyambung keluar dari tepi Depok & field J1,
   jalan/sungai/rel meneruskan, pagar rendah di perbatasan, dan dua pintu keluar yang TERHALANG:
   utara (Jakarta: sungai + jembatan putus -> skill Seberang + 8 Medali)
   timur (Cirebon: semak lebat            -> skill Tebas)
   Pola ini dipakai ulang untuk kota-kota berikutnya.
   ===================================================================== */
var outerOn = false;
const OUT = { x0: -40, x1: 40, z0: -38, z1: 100 }, OTPU = 6;
const NRIV = { pts: [[-40, -20.6], [-20, -21.1], [-1, -20.9], [20, -21.4], [40, -20.8]], w: 3.4 };
const FRW = { pts: [[-8, 33.0], [-20, 32.6], [-40, 33.6]], w: 2.2 }, FRE = { pts: [[6, 34.4], [20, 35.0], [40, 34.2]], w: 2.2 };
const FROAD_EXT = { pts: [[-1, FD.z1], [-1.2, 62], [-1, 80]], w: 3.4 };
const NCOR = { x: -0.8, hw: 2.0, zEnd: -HZ - 4.0 }, ECOR = { z: 5, hw: 1.5, xEnd: HX + 4.4 };
const FEN = 0.35;

const inDepok = (x, z) => x > -HX && x < HX && z > -HZ && z < HZ;
const inFieldR = (x, z) => x > FD.x0 && x < FD.x1 && z >= HZ && z < FD.z1;
const inHole = (x, z) => inDepok(x, z) || inFieldR(x, z) || inBogor(x, z);
function rectNear(x0, x1, z0, z1, x, z) { const bx = clamp(x, x0, x1), bz = clamp(z, z0, z1); return [Math.hypot(x - bx, z - bz), bx, bz]; }
function holeNear(x, z) { const a = rectNear(-HX, HX, -HZ, HZ, x, z), b = rectNear(FD.x0, FD.x1, HZ, FD.z1, x, z), c = rectNear(BG.x0, BG.x1, BG.z0, BG.z1, x, z); let m = a; if (b[0] < m[0]) m = b; if (c[0] < m[0]) m = c; return m; }
/* koridor jalan keluar yang boleh dilewati pemain (sampai penghalang) */
function outerCorridor(x, z, r) {
  if (z < -HZ + 0.8 && z > NCOR.zEnd && Math.abs(x - NCOR.x) < NCOR.hw - r) return true;
  if (x > HX - 0.8 && x < ECOR.xEnd && Math.abs(z - ECOR.z) < ECOR.hw - r) return true;
  return false;
}
function extendWorld() {
  C.margonda.pts.push([-0.8, -24], [-0.8, -60]);
  C.raya.pts.push([40, 5]);
  C.rail.pts.unshift([8.6, -60]); C.rail.pts.push([8.6, 60]);
  C.river.pts.unshift([13.5, -60], [14.2, -30]); C.river.pts.push([15.4, 30], [14.6, 50], [15, 80]);
}
const RIVERS = () => [C.river, NRIV, FRW, FRE];
function okind(x, z) {
  const rs = RIVERS(); let rd = 99;
  for (const r of rs) rd = Math.min(rd, poly(r.pts, x, z).d - r.w / 2);
  if (rd < 0) return 'water';
  if (rd < 0.45) return 'bank';
  const mg = poly(C.margonda.pts, x, z).d, mw = C.margonda.w / 2;
  if (mg < mw + 0.16) return mg < 0.26 ? 'median' : mg < mw ? 'road' : 'curb';
  if (x > -HX) { const ry = Math.abs(z - 5), rw = C.raya.w / 2; if (ry < rw + 0.14) return ry < rw ? 'road' : 'curb'; }
  if (z > BG.z0 && (x > BG.x1 || x < BG.x0)) { const sk = Math.abs(z - ZR), sw = BRD[1].w / 2; if (sk < sw + 0.14) return sk < sw ? 'road' : 'curb'; }
  if (poly(C.rail.pts, x, z).d < C.rail.w / 2) return 'rail';
  const f = fbm(x * 0.11 + 3, z * 0.11 - 5); if (f > 0.6 && mg > 3 && Math.abs(z - 5) > 3) return 'forest';
  return 'grass';
}
function outerH(x, z) {
  const [d, bx, bz] = holeNear(x, z);
  const k = okind(x, z);
  let h = (fbm(x * 0.35 + 9, z * 0.35) - 0.5) * 0.28;
  let rv = 9; for (const r of RIVERS()) rv = Math.min(rv, poly(r.pts, x, z).d - r.w / 2);
  if (rv < 1.0) { const t = clamp((1.0 - rv) / 1.1, 0, 1); h = lerp(h, -0.45, t * t * (3 - 2 * t)); }
  if (k === 'road' || k === 'median' || k === 'curb' || k === 'rail') h = lerp(h, 0, 0.9);
  if (d < 3.5) { const e = baseGroundY(bx, bz); const t = clamp(d / 3.5, 0, 1), s = t * t * (3 - 2 * t); h = lerp(e, h, s); }
  return h;
}
function buildOuter() {
  extendWorld(); outerOn = true;
  const W = OUT.x1 - OUT.x0, H = OUT.z1 - OUT.z0, PW = W * OTPU, PH = H * OTPU;
  const tex = toTex(pixCanvas(PW, PH, (pxi, pzi) => {
    const x = OUT.x0 + (pxi + 0.5) / OTPU, z = OUT.z0 + (pzi + 0.5) / OTPU;
    if (inHole(x, z)) return hex('#4f8f31');
    return tileColor(okind(x, z), x, z, pxi + 3000, pzi + 9000);
  }));
  const NX = W + 1, NZ = H + 1, pos = new Float32Array(NX * NZ * 3), uv = new Float32Array(NX * NZ * 2), idx = [];
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    const x = OUT.x0 + i, z = OUT.z0 + j, o = j * NX + i;
    pos[o * 3] = x; pos[o * 3 + 1] = outerH(x, z); pos[o * 3 + 2] = z; uv[o * 2] = i / W; uv[o * 2 + 1] = 1 - j / H;
  }
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const cx = OUT.x0 + i + 0.5, cz = OUT.z0 + j + 0.5; if (inHole(cx, cz)) continue;
    const a = j * NX + i, b = a + 1, c = a + NX, d = c + 1; idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const t = new THREE.Mesh(g, toon('#ffffff', { map: tex })); t.receiveShadow = true; world.add(t);
  // air di bawah sungai luar
  const wt = terrainMat.water.clone(); wt.needsUpdate = true; wt.repeat.set(W / 4, H / 4); terrainMat.outer = wt;
  const wm = new THREE.Mesh(new THREE.PlaneGeometry(W, H).rotateX(-Math.PI / 2), toon('#ffffff', { map: wt })); wm.position.set((OUT.x0 + OUT.x1) / 2, -0.14, (OUT.z0 + OUT.z1) / 2); world.add(wm);

  /* ---------- pagar rendah di perbatasan ---------- */
  const fg = [], BX = (w, h, d, x, y, z, ry = 0) => { const b = new THREE.BoxGeometry(w, h, d); if (ry) b.rotateY(ry); b.translate(x, y, z); fg.push(b); };
  const fenceLine = (x1, z1, x2, z2, skip) => {
    const L = Math.hypot(x2 - x1, z2 - z1), n = Math.max(1, Math.round(L / 1.1)), ang = Math.atan2(x2 - x1, z2 - z1) - Math.PI / 2, ry = ang;
    for (let s = 0; s <= n; s++) {
      const x = lerp(x1, x2, s / n), z = lerp(z1, z2, s / n); if (skip && skip(x, z)) continue;
      const y = groundY(x, z); BX(0.1, 0.55, 0.1, x, y + 0.27, z);
      if (s < n) { const mx = lerp(x1, x2, (s + 0.5) / n), mz = lerp(z1, z2, (s + 0.5) / n); if (skip && skip(mx, mz)) continue; const my = groundY(mx, mz); const sl = L / n; BX(sl, 0.06, 0.05, mx, my + 0.46, mz, ry); BX(sl, 0.06, 0.05, mx, my + 0.24, mz, ry); }
    }
  };
  const wet = (x, z) => { const k = z >= BG.z0 ? bkind(x, z) : z > HZ - 0.01 && inFieldR(x, z) ? fkind(x, z) : kindAt(x, z); return k === 'water' || k === 'bank' || k === 'bridge'; };
  const northGap = (x) => Math.abs(x - NCOR.x) < NCOR.hw + 0.35, eastGap = (z) => Math.abs(z - ECOR.z) < ECOR.hw + 0.35;
  // Depok
  fenceLine(-HX + FEN, -HZ + FEN, HX - FEN, -HZ + FEN, (x, z) => wet(x, z) || northGap(x));
  fenceLine(HX - FEN, -HZ + FEN, HX - FEN, HZ - FEN, (x, z) => wet(x, z) || eastGap(z));
  fenceLine(-HX + FEN, -HZ + FEN, -HX + FEN, HZ - FEN, (x, z) => Math.abs(z - 5) < 1.25);
  fenceLine(-HX + FEN, HZ - FEN, FD.x0 + FEN, HZ - FEN, wet); fenceLine(FD.x1 - FEN, HZ - FEN, HX - FEN, HZ - FEN, wet);
  // koridor utara & timur
  fenceLine(NCOR.x - NCOR.hw - 0.35, -HZ + FEN, NCOR.x - NCOR.hw - 0.35, NCOR.zEnd);
  fenceLine(NCOR.x + NCOR.hw + 0.35, -HZ + FEN, NCOR.x + NCOR.hw + 0.35, NCOR.zEnd);
  fenceLine(HX - FEN, ECOR.z - ECOR.hw - 0.35, ECOR.xEnd, ECOR.z - ECOR.hw - 0.35);
  fenceLine(HX - FEN, ECOR.z + ECOR.hw + 0.35, ECOR.xEnd, ECOR.z + ECOR.hw + 0.35);
  // field J1
  fenceLine(FD.x0 + FEN, HZ - FEN, FD.x0 + FEN, FD.z1 + FEN, wet); fenceLine(FD.x1 - FEN, HZ - FEN, FD.x1 - FEN, FD.z1 + FEN, wet);
  bogorFences(fenceLine, wet);
  const fm = new THREE.Mesh(mergeGeometries(fg), toon('#a98a5a')); fm.castShadow = true; fm.receiveShadow = true; world.add(fm);

  /* ---------- pohon di tanah luar (digabung per kuadran, murah) ---------- */
  { const R = rng(907), spots = [];
    const ok = (x, z, m) => { if (inHole(x, z)) return false; const k = okind(x, z); if (k !== 'grass' && k !== 'forest') return false; if (holeNear(x, z)[0] < m) return false;
      if (poly(C.margonda.pts, x, z).d < 3.2 && z < -HZ) return false; if (Math.abs(z - 5) < 2.8 && x > HX) return false; if (Math.abs(z - 5) < 2.4 && x < -HX) return false;
      if (Math.abs(z - ZR) < 3.4 && (x > BG.x1 || x < BG.x0)) return false; if (z < -HZ && Math.abs(x - NCOR.x) < 3.4 && z > NCOR.zEnd - 4) return false; if (x > HX && Math.abs(z - ECOR.z) < 3.4 && x < ECOR.xEnd + 3) return false;
      return !spots.some((p) => Math.hypot(p.x - x, p.z - z) < (p.kind === 'bush' ? 0.9 : 1.7)); };
    let n = 0, tr = 0;
    while (n < 190 && tr++ < 9000) { const x = OUT.x0 + 2 + R() * (W - 4), z = OUT.z0 + 2 + R() * (H - 4); const k = okind(x, z), dh = holeNear(x, z)[0];
      const pr = k === 'forest' ? 0.9 : 0.18 + (dh < 7 ? 0.25 : 0); if (R() > pr) continue; if (!ok(x, z, 1.2)) continue;
      spots.push({ x, z, kind: R() < 0.5 ? 'pine' : 'round', s: 0.85 + R() * 0.45, seed: (R() * 1000) | 0 }); n++; }
    n = 0; tr = 0;
    while (n < 80 && tr++ < 4000) { const x = OUT.x0 + 2 + R() * (W - 4), z = OUT.z0 + 2 + R() * (H - 4); if (holeNear(x, z)[0] > 12 || !ok(x, z, 0.8)) continue; spots.push({ x, z, kind: 'bush', s: 0.8 + R() * 0.6, seed: (R() * 100) | 0 }); n++; }
    const mat = toon('#ffffff', { vertexColors: true }), groups = {};
    spots.forEach((t) => { const key = (t.x > 0 ? 1 : 0) + (t.z > 18 ? 2 : 0); (groups[key] = groups[key] || []).push(t); });
    Object.values(groups).forEach((arr) => { const a = treeGeoms.length;
      arr.forEach((t) => { if (t.kind === 'pine') pineGeoms(t.x, t.z, t.s, t.seed); else if (t.kind === 'round') roundGeoms(t.x, t.z, t.s, t.seed, false); else bushGeoms(t.x, t.z, t.s, t.seed); });
      const gs = treeGeoms.slice(a); if (!gs.length) return; const m = new THREE.Mesh(mergeGeometries(gs), mat); m.castShadow = m.receiveShadow = true; m.userData = { x: arr[0].x, z: arr[0].z }; world.add(m); treeMeshes.push(m); });
  }

  /* ---------- rumput di tanah luar (pita sekitar perbatasan) ---------- */
  { const kf = (x, z) => (inHole(x, z) ? 'none' : okind(x, z));
    [[-28, 28, -26, -14, 12000, 61], [-28, -18, -14, 14, 5200, 62], [18, 28, -14, 14, 5200, 63], [-28, -8, 14, 24, 3800, 64], [6, 28, 14, 24, 4200, 65], [-16, -8, 24, 54, 5200, 66], [6, 16, 24, 54, 5200, 67], [-28, -18, 54, 82, 5200, 68], [18, 28, 54, 82, 5200, 69], [-28, 28, 82, 92, 9000, 70]]
      .forEach(([x0, x1, z0, z1, N, sd]) => buildGrass(x0, x1, z0, z1, kf, N, sd)); }

  /* ---------- penghalang: gapura + sungai/jembatan putus (utara), semak lebat (timur) ---------- */
  const sign = (parent, txt, bg, w, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.5), new THREE.MeshBasicMaterial({ map: labelTex(txt, bg, '#ffffff'), side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.y = ry; parent.add(m); };
  const wood = toon('#c9b88a'), roof = toon('#8a3b2e'), cream = toon('#f3ead2');
  // utara: gapura KE JAKARTA
  { const zc = -HZ - 1.3, cx = NCOR.x, sp = NCOR.hw + 0.35;
    [-sp, sp].forEach((dx) => { box(world, 0.4, 2.1, 0.4, wood, cx + dx, groundY(cx + dx, zc) + 1.05, zc); circles.push({ x: cx + dx, z: zc, r: 0.3 }); });
    box(world, sp * 2 + 0.8, 0.28, 0.5, roof, cx, 2.2, zc); box(world, sp * 2 - 0.2, 0.5, 0.3, cream, cx, 1.85, zc); sign(world, 'KE JAKARTA', '#1d6f6a', 3.4, cx, 1.85, zc, 0); }
  // utara: palang pembatas + jembatan putus
  { const zb = -HZ - 3.6, cx = NCOR.x, bar = toon('#f1f1f1'), red = toon('#d8452e'), plank = toon('#8a6a42');
    for (let k = 0; k < 6; k++) box(world, 0.68, 0.18, 0.12, k % 2 ? red : bar, cx - 1.7 + k * 0.68 + 0.34, 0.62, zb);
    [-1.9, 1.9].forEach((dx) => box(world, 0.14, 0.7, 0.14, toon('#6b5a42'), cx + dx, 0.35, zb));
    rects.push([cx - 2.1, cx + 2.1, zb - 0.25, zb + 0.25]);
    sign(world, 'JEMBATAN PUTUS', '#a8442e', 2.6, cx, 1.15, zb - 0.02, 0);
    // sisa jembatan di sisi dekat & sisi seberang
    box(world, 3.6, 0.14, 1.6, plank, cx, 0.02, -HZ - 5.2); box(world, 3.6, 0.14, 1.6, plank, cx + 0.1, 0.0, -HZ - 11.7);
    [-1.7, 1.7].forEach((dx) => { box(world, 0.14, 0.5, 0.14, toon('#6b5a42'), cx + dx, 0.3, -HZ - 5.9); box(world, 0.14, 0.5, 0.14, toon('#6b5a42'), cx + 0.1 + dx, 0.3, -HZ - 11.1); });
  }
  // timur: gapura KE CIREBON + semak lebat menutup jalan
  { const xc = HX + 1.2, cz = ECOR.z, sp = ECOR.hw + 0.35;
    [-sp, sp].forEach((dz) => { box(world, 0.4, 2.1, 0.4, wood, xc, groundY(xc, cz + dz) + 1.05, cz + dz); circles.push({ x: xc, z: cz + dz, r: 0.3 }); });
    box(world, 0.5, 0.28, sp * 2 + 0.8, roof, xc, 2.2, cz); box(world, 0.3, 0.5, sp * 2 - 0.2, cream, xc, 1.85, cz); sign(world, 'KE CIREBON', '#1d6f6a', 2.6, xc, 1.85, cz, Math.PI / 2);
    // semak lebat (digabung)
    const R = rng(33), bg = [], xs = HX + 3.2;
    for (let i = 0; i < 26; i++) { const x = xs + (R() - 0.5) * 1.6, z = cz + (R() - 0.5) * 3.2, a = treeGeoms.length; bushGeoms(x, z, 1.5 + R() * 0.9, (R() * 100) | 0); }
    const gs = treeGeoms.slice(treeGeoms.length - 26); const m = new THREE.Mesh(mergeGeometries(gs), toon('#ffffff', { vertexColors: true })); m.castShadow = m.receiveShadow = true; m.userData = { x: xs, z: cz }; world.add(m); treeMeshes.push(m);
    rects.push([xs - 1.0, xs + 1.0, cz - 1.7, cz + 1.7]);
  }
  // barat: gerbang kayu tertutup di ujung Jl. Raya
  { const xg = -HX + FEN + 0.02, cz = 5, g = toon('#8a6a42');
    box(world, 0.14, 0.9, 1.1, g, xg, 0.5, cz - 0.55); box(world, 0.14, 0.9, 1.1, g, xg, 0.5, cz + 0.55);
    [-1.2, 1.2].forEach((dz) => box(world, 0.3, 1.25, 0.3, toon('#6b5a42'), xg, 0.62, cz + dz)); }
}
let outerToastT = 0;
function updateOuter() {
  if (mode !== 'play' || inside) return;
  if (T < outerToastT) return;
  if (player.z < -HZ - 1.6 && Math.abs(player.x - NCOR.x) < 2.4) { outerToastT = T + 7; toast('Jembatan ke Jakarta putus. Butuh skill Seberang + 8 Medali 🌊', 3.2); }
  else if (player.x > HX + 1.6 && Math.abs(player.z - ECOR.z) < 2.0) { outerToastT = T + 7; toast('Semak lebat menutup jalan ke Cirebon. Butuh skill Tebas 🌿', 3.2); }
}
