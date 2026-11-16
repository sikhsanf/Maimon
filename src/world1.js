
/* =====================================================================
   KOTA: layout Depok (diorama kecil, data-driven — tiap kota punya layout sendiri)
   Margonda Raya bertrotoar tengah, kampus UI berhutan + danau + perpustakaan kaca,
   rel KRL + stasiun, mal, Kali Ciliwung berjembatan, Depok Lama, kebun belimbing.
   ===================================================================== */
const HX = 18, HZ = 14, TPU = 18;
const lerp = (a, b, t) => a + (b - a) * t;
function seg(px_, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz; let t = L2 ? ((px_ - ax) * dx + (pz - az) * dz) / L2 : 0; t = clamp(t, 0, 1); return [Math.hypot(px_ - (ax + dx * t), pz - (az + dz * t)), t, Math.sqrt(L2)]; }
function poly(pts, x, z) { let best = 1e9, s = 0, acc = 0; for (let i = 0; i < pts.length - 1; i++) { const [d, t, L] = seg(x, z, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]); if (d < best) { best = d; s = acc + t * L; } acc += L; } return { d: best, s }; }
function polyLen(pts) { let a = 0; for (let i = 0; i < pts.length - 1; i++) a += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); return a; }
function polyAt(pts, s) { let acc = 0; for (let i = 0; i < pts.length - 1; i++) { const dx = pts[i + 1][0] - pts[i][0], dz = pts[i + 1][1] - pts[i][1], L = Math.hypot(dx, dz); if (s <= acc + L || i === pts.length - 2) { const t = clamp((s - acc) / L, 0, 1); return [pts[i][0] + dx * t, pts[i][1] + dz * t, dx / L, dz / L]; } acc += L; } }
const inEll = (e, x, z, m = 0) => { const dx = (x - e[0]) / (e[2] + m), dz = (z - e[1]) / (e[3] + m); return dx * dx + dz * dz < 1; };
const inRect = (r, x, z, m = 0) => x > r[0] - m && x < r[1] + m && z > r[2] - m && z < r[3] + m;

const C = {
  margonda: { pts: [[-1, 14], [-0.6, 7], [0, 0], [-0.3, -7], [-0.8, -14]], w: 3.4 },
  raya: { pts: [[-18, 5], [18, 5]], w: 2.0 },
  rail: { pts: [[8.6, -14], [8.6, 14]], w: 1.2 },
  river: { pts: [[14.5, -14], [15.5, -7], [14.8, 0], [16, 6], [15, 14]], w: 2.4 },
  lakes: [[-9, -6, 2.7, 1.9], [-14, -10.5, 1.9, 1.3]],
  paths: [{ pts: [[-2.8, -2.5], [-6, -3], [-10.5, -3.0]], w: 0.9 }, { pts: [[-10.5, -3.0], [-13, -5], [-12.5, -8.5], [-9, -9.6], [-5.8, -8], [-6, -4.5], [-8, -3.5]], w: 0.8 }],
  forest: [-17.5, -3.6, -13.5, 0.6], plaza: [-10.5, -3.0, 3.6, 2.0],
  mall: [2.2, 6.8, -9.5, -1.6], station: [9.3, 13.8, -9.8, -4.4], platform: [9.3, 10.7, -9, -4.8],
  lama: [-17.5, -7.5, 7.2, 13.5], orchard: [2.2, 7.4, 7.4, 13.5], kamW: [-17.5, -3.6, 0.8, 3.9], kamE: [10, 13.6, 7.4, 13.5],
  dais: [-5, 10.4, 1.9, 1.9], garden: [3.2, 7.8, -0.8, 3.4],
};

/* tile(): jenis permukaan + warna piksel (tekstur tanah dilukis per-piksel seperti Arena Piksel) */
const PAL = {
  grass: ['#4f8f31', '#5a9a38', '#66a63f', '#72b146', '#7ebb4d', '#8ac456'].map(hex),
  forest: ['#2f5f26', '#386a2a', '#43782f', '#4e8535'].map(hex),
  lawn: ['#6aa93f', '#76b546', '#84c24e', '#92cd58'].map(hex),
  orch: ['#6fae3c', '#7cba44', '#8bc64d'].map(hex),
};
function kindAt(x, z) {
  const rv = poly(C.river.pts, x, z), ry = poly(C.raya.pts, x, z);
  const onRaya = ry.d < C.raya.w / 2 + 0.15;
  if (rv.d < C.river.w / 2 + 0.5 && onRaya) return 'bridge';
  if (rv.d < C.river.w / 2) return 'water';
  for (const l of C.lakes) if (inEll(l, x, z)) return 'water';
  if (rv.d < C.river.w / 2 + 0.45 && !onRaya) return 'bank';
  for (const l of C.lakes) if (inEll(l, x, z, 0.4)) return 'bank';
  const mg = poly(C.margonda.pts, x, z), mw = C.margonda.w / 2;
  if (mg.d < mw + 0.16) return mg.d < 0.26 ? 'median' : mg.d < mw ? 'road' : 'curb';
  if (ry.d < C.raya.w / 2 + 0.14) return ry.d < C.raya.w / 2 ? 'road' : 'curb';
  if (poly(C.rail.pts, x, z).d < C.rail.w / 2) return 'rail';
  if (inRect(C.platform, x, z)) return 'platform';
  for (const p of C.paths) if (poly(p.pts, x, z).d < p.w / 2) return 'path';
  if (inEll(C.plaza, x, z)) return 'plaza';
  if (inRect(C.mall, x, z)) return z > -4.4 ? 'park' : 'mallfloor';
  if (inRect(C.station, x, z)) return 'stationfloor';
  if (inRect(C.garden, x, z)) return 'garden';
  if (inEll(C.dais, x, z)) return 'dais';
  if (inRect(C.lama, x, z)) return (Math.abs(z - 10.2) < 0.4 || Math.abs(x + 12.5) < 0.4) ? 'brick' : 'lawn';
  if (inRect(C.orchard, x, z)) return 'orchard';
  if (inRect(C.kamE, x, z) && Math.abs(x - 11.9) < 0.3) return 'lane';
  if (inRect(C.forest, x, z)) return 'forest';
  return 'grass';
}
function tileColor(k, x, z, pxi, pzi) {
  const n = fbm(x * 1.4, z * 1.4), hh = hash2(pxi, pzi), v = fbm(x * 0.55, z * 0.55) * 0.7 + vnoise(x * 6, z * 6) * 0.18 + hh * 0.12;
  switch (k) {
    case 'water': return shade(hex('#3d7f8a'), 0.8 + n * 0.3);
    case 'bank': return shade(mixc(hex('#cdb98e'), hex('#b8a27a'), n), 0.92 + hh * 0.14);
    case 'bridge': return hex('#3d7f8a');
    case 'curb': return shade(hex('#cfc9bb'), 0.92 + hh * 0.12);
    case 'median': { const mg = poly(C.margonda.pts, x, z); return mg.d > 0.17 ? shade(hex('#cfc9bb'), 0.95) : shade(PAL.lawn[clamp(Math.floor(v * 5), 0, 3)], 0.95); }
    case 'road': {
      const mg = poly(C.margonda.pts, x, z), ry = poly(C.raya.pts, x, z);
      let c = shade(hex('#585b64'), 0.88 + n * 0.22 + (hh - 0.5) * 0.08);
      if (hh < 0.012) c = shade(c, 0.78);
      if (mg.d < C.margonda.w / 2) { const lane = Math.abs(mg.d - (0.26 + C.margonda.w / 2) / 2) < 0.045 && Math.floor(mg.s * 1.4) % 2 === 0; if (lane) return hex('#f2e6a0'); if (mg.d > C.margonda.w / 2 - 0.13) return hex('#e9e4d6'); }
      else if (ry.d < C.raya.w / 2) { if (ry.d < 0.045 && Math.floor(ry.s * 1.4) % 2 === 0) return hex('#f2e6a0'); if (ry.d > C.raya.w / 2 - 0.12) return hex('#e9e4d6'); }
      return c;
    }
    case 'rail': { const dx = Math.abs(x - C.rail.pts[0][0]); const rl = poly(C.rail.pts, x, z); if (Math.abs(dx - 0.34) < 0.05) return hex('#c8ccd4'); if (Math.floor(rl.s * 2.6) % 2 === 0 && dx < 0.52) return shade(hex('#6b4a30'), 0.9 + hh * 0.2); return shade(hex('#8d877c'), 0.85 + hh * 0.3); }
    case 'platform': return x < C.platform[0] + 0.2 ? hex('#ffd23a') : shade(hex('#cfcabd'), 0.93 + hh * 0.1);
    case 'path': return shade(mixc(hex('#c8b38a'), hex('#b49e76'), n), 0.9 + hh * 0.16);
    case 'plaza': { const g = (Math.floor(x * 2.2) + Math.floor(z * 2.2)) % 2; const edge = (x * 2.2 % 1 < 0.08 || z * 2.2 % 1 < 0.08); return edge ? hex('#bfb59a') : shade(hex(g ? '#e4dcc2' : '#d8cfb2'), 0.95 + hh * 0.08); }
    case 'park': { const sx = (x - C.mall[0]) * 1.2; const line = (sx % 1 < 0.09) && z > -4.0 && z < -1.9; return line ? hex('#f4f4f4') : shade(hex('#868991'), 0.9 + n * 0.2 + (hh - 0.5) * 0.06); }
    case 'mallfloor': case 'stationfloor': return shade(hex('#aaa396'), 0.9 + hh * 0.15);
    case 'dais': { const ring = Math.hypot((x - C.dais[0]) / C.dais[2], (z - C.dais[1]) / C.dais[3]); return ring > 0.88 ? hex('#a89b83') : shade(hex((Math.floor(x * 2.4) + Math.floor(z * 2.4)) % 2 ? '#d9cfb6' : '#cdc3a8'), 0.95 + hh * 0.08); }
    case 'brick': { const row = Math.floor(z * 4), off = (row % 2) * 0.5; const bx = (x * 4 + off) % 1, by = (z * 4) % 1; if (bx < 0.1 || by < 0.12) return hex('#8a5a44'); return shade(hex('#c4795a'), 0.88 + hash2(Math.floor(x * 4 + off), row) * 0.25); }
    case 'lane': return shade(mixc(hex('#b98b5e'), hex('#a47a52'), n), 0.9 + hh * 0.16);
    case 'forest': { const c = PAL.forest[clamp(Math.floor((v - 0.1) * 6), 0, 3)]; if (hh < 0.01) return hex('#6f5a3a'); return c; }
    case 'lawn': { const c = PAL.lawn[clamp(Math.floor((v - 0.1) * 6), 0, 3)]; const f = hash2(pxi * 5 + 1, pzi * 3 + 2); if (f < 0.003) return hex('#fff6dc'); return c; }
    case 'garden': { const f = Math.sin(z * Math.PI * 2.0 + 0.6); return shade(mixc(hex('#6a4a2c'), hex('#7d5a36'), f > 0.35 ? 1 : 0), 0.9 + hh * 0.16 - (f < -0.6 ? 0.12 : 0)); }
    case 'orchard': return PAL.orch[clamp(Math.floor((v - 0.1) * 5), 0, 2)];
    default: {
      const f = hash2(pxi * 5 + 1, pzi * 3 + 2);
      if (f < 0.0025) return hex('#efe7c8'); if (f < 0.004) return hex('#e9c64c'); if (f < 0.0045) return hex('#d97ba0');
      if (vnoise(x * 2.2 + 50, z * 2.2) > 0.78 && hh < 0.5) return shade(PAL.grass[1], 0.9);
      return PAL.grass[clamp(Math.floor((v - 0.12) * 8), 0, 5)];
    }
  }
}

/* tinggi tanah: sungai/danau melesak, rumput sedikit bergelombang */
const HGX = HX * 4 + 1, HGZ = HZ * 4 + 1; let HGRID = new Float32Array(HGX * HGZ);
{
  const raw = new Float32Array(HGX * HGZ);
  for (let j = 0; j < HGZ; j++) for (let i = 0; i < HGX; i++) {
    const x = -HX + i * 0.5, z = -HZ + j * 0.5, k = kindAt(x, z);
    let h = 0;
    if (k === 'water' || k === 'bridge') h = -0.45; else if (k === 'bank') h = -0.05;
    else if (k === 'grass' || k === 'forest' || k === 'lawn' || k === 'orchard') h = (fbm(x * 0.35 + 9, z * 0.35) - 0.5) * 0.28;
    else if (k === 'dais') h = 0.16;
    raw[j * HGX + i] = h;
  }
  for (let pass = 0; pass < 2; pass++) { const src = pass ? HGRID : raw, dst = pass ? new Float32Array(HGX * HGZ) : HGRID;
    for (let j = 0; j < HGZ; j++) for (let i = 0; i < HGX; i++) { let s = 0, n = 0; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= HGX || jj >= HGZ) continue; s += src[jj * HGX + ii]; n++; } dst[j * HGX + i] = s / n; }
    if (pass) HGRID = dst; }
}
function groundY(x, z) {
  const fx = clamp((x + HX) * 2, 0, HGX - 1.001), fz = clamp((z + HZ) * 2, 0, HGZ - 1.001), i = Math.floor(fx), j = Math.floor(fz), tx = fx - i, tz = fz - j;
  const a = HGRID[j * HGX + i], b = HGRID[j * HGX + i + 1], c = HGRID[(j + 1) * HGX + i], d = HGRID[(j + 1) * HGX + i + 1];
  const h = lerp(lerp(a, b, tx), lerp(c, d, tx), tz);
  const k = kindAt(x, z); return k === 'bridge' ? 0.08 : h;
}

/* tumbukan */
const circles = [], rects = [], vehicles = [];
function waterAt(x, z) { const k = kindAt(x, z); return k === 'water'; }
function blockedAt(x, z, r) {
  if (x < -HX + 0.8 || x > HX - 0.8 || z < -HZ + 0.8 || z > HZ - 0.8) return true;
  if (waterAt(x, z)) return true;
  for (const c of circles) { const dx = x - c.x, dz = z - c.z, rr = c.r + r; if (dx * dx + dz * dz < rr * rr) return true; }
  for (const b of rects) if (x > b[0] - r && x < b[1] + r && z > b[2] - r && z < b[3] + r) return true;
  for (const v of vehicles) { if (!v.m.visible) continue; const ry = v.m.rotation.y, sx = Math.sin(ry), sz = Math.cos(ry), hl = v.ang ? 0.5 : 0.38, rr = (v.ang ? 0.46 : 0.42) + r; for (const o of [-hl, hl]) { const dx = x - (v.m.position.x + sx * o), dz = z - (v.m.position.z + sz * o); if (dx * dx + dz * dz < rr * rr) return true; } }
  return false;
}
function freeSpot(x, z, r) { for (let i = 0; i < 50; i++) { const nx = x + (R0() - 0.5) * i * 0.25, nz = z + (R0() - 0.5) * i * 0.25; if (!blockedAt(nx, nz, r)) return [nx, nz]; } return [x, z]; }
function zoneName(x, z) {
  const rv = poly(C.river.pts, x, z);
  if (rv.d < C.river.w / 2 + 1.0) return 'Kali Ciliwung';
  for (const l of C.lakes) if (inEll(l, x, z, 1.0)) return 'Danau UI';
  if (inEll(C.plaza, x, z, 0.5)) return 'Perpustakaan UI';
  if (inRect(C.forest, x, z)) return 'Kampus UI';
  if (inRect(C.station, x, z, 0.4) || poly(C.rail.pts, x, z).d < 1.1) return 'Stasiun Depok Baru';
  if (inRect(C.mall, x, z, 0.4)) return 'Margo City';
  if (inRect(C.lama, x, z)) return 'Depok Lama';
  if (inRect(C.orchard, x, z)) return 'Kebun Belimbing';
  if (inEll(C.dais, x, z, 1.0)) return 'Taman Maimon';
  if (poly(C.margonda.pts, x, z).d < C.margonda.w / 2 + 0.5) return 'Jl. Margonda Raya';
  if (inRect(C.kamW, x, z) || inRect(C.kamE, x, z)) return 'Kampung';
  return 'Depok';
}

/* =====================================================================
   TANAH, AIR, TEPI DIORAMA
   ===================================================================== */
const world = new THREE.Group(); scene.add(world);
const terrainMat = { m: null };
{
  const W = HX * 2 * TPU, H = HZ * 2 * TPU;
  const tex = toTex(pixCanvas(W, H, (pxi, pzi) => tileColor(kindAt(-HX + (pxi + 0.5) / TPU, -HZ + (pzi + 0.5) / TPU), -HX + (pxi + 0.5) / TPU, -HZ + (pzi + 0.5) / TPU, pxi, pzi)));
  const g = new THREE.PlaneGeometry(HX * 2, HZ * 2, HX * 4, HZ * 4); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const gi = Math.round((p.getX(i) + HX) * 2), gj = Math.round((p.getZ(i) + HZ) * 2); p.setY(i, HGRID[gj * HGX + gi]); }
  g.computeVertexNormals();
  const t = new THREE.Mesh(g, toon('#ffffff', { map: tex })); t.receiveShadow = true; world.add(t);
  // air: bidang dengan sparkle bergulir
  const wc = pixCanvas(32, 32, (x, y) => { const n = vnoise(x * 0.35, y * 0.35); const h = hash2(x, y); let c = mixc(hex('#3f94c6'), hex('#58b0dc'), n); if (h > 0.965) c = hex('#c9ecff'); if (vnoise(x * 0.6 + 5, y * 0.25) > 0.78) c = shade(c, 1.12); return c; });
  const wt = toTex(wc); wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(HX * 2 / 4, HZ * 2 / 4); terrainMat.water = wt;
  const wm = new THREE.Mesh(new THREE.PlaneGeometry(HX * 2, HZ * 2).rotateX(-Math.PI / 2), toon('#ffffff', { map: wt })); wm.position.y = -0.13; wm.receiveShadow = true; world.add(wm);
  // sisi tanah
  const dc = pixCanvas(64, 40, (x, y) => { const n = fbm(x * 0.12, y * 0.2); if (y < 3) return shade(hex('#5aa23a'), 0.9 + hash2(x, y) * 0.2); if (y < 5) return shade(hex('#4a3a24'), 0.9); let c = mixc(hex('#7b583c'), hex('#5e412d'), clamp(y / 40 + n * 0.3, 0, 1)); if (hash2(x * 3, y * 5) < 0.06) c = shade(c, 0.78); if (vnoise(x * 0.5, y * 0.5) > 0.82) c = shade(hex('#8b8f93'), 0.8 + hash2(x, y) * 0.2); return c; });
  const dt = toTex(dc); dt.wrapS = dt.wrapT = THREE.RepeatWrapping;
  const dm = toon('#ffffff', { map: dt }); const DEPTH = 2.6;
  [[0, -HZ, Math.PI, HX * 2], [0, HZ, 0, HX * 2], [-HX, 0, -Math.PI / 2, HZ * 2], [HX, 0, Math.PI / 2, HZ * 2]].forEach(([x, z, ry, w]) => {
    const pg = new THREE.PlaneGeometry(w, DEPTH); const uv = pg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 4, uv.getY(i));
    const m = new THREE.Mesh(pg, dm); m.position.set(x, -DEPTH / 2 + 0.02, z); m.rotation.y = ry; m.receiveShadow = true; world.add(m);
  });
  const bot = new THREE.Mesh(new THREE.PlaneGeometry(HX * 2, HZ * 2).rotateX(Math.PI / 2), toon('#4a3a24')); bot.position.y = -DEPTH; world.add(bot);
}
function updateWater(T) { terrainMat.water.offset.set(T * 0.03, T * 0.02); }
