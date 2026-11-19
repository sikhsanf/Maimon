/* =====================================================================
   FIELD J1 — jalur Depok–Bogor. Menyambung LANGSUNG dari ujung selatan Jl. Margonda
   (tanpa portal): jalan yang sama, lebar yang sama, hanya ada gapura di sambungan.
   Field Sedang 14 x 40 petak. Koordinat dunia (bukan lokal): x -8..6, z 14..54.
   ===================================================================== */
const FD = { id: 'J1', name: 'Jalur Depok–Bogor', x0: -8, x1: 6, z0: HZ, z1: HZ + 40 };
const FC = {
  road: { pts: [[-1, HZ], [-1.4, 20], [-0.6, 28], [-1.2, 36], [-0.8, 46], [-1, FD.z1]], w: 3.4 },
  river: { pts: [[-8, 33.0], [-3, 34.0], [1, 33.5], [6, 34.4]], w: 2.2 },
  pond: [3.4, 23.2, 2.0, 1.4],
  forest: [[-8, -4.4, 40.5, 53.2], [3.2, 6, 43, 53.2], [-8, -5.2, 15.6, 20.5], [3.6, 6, 16, 19.5]],
  hut: [3.6, 29.6],
};
const inFieldX = (x) => x > FD.x0 + 0.8 && x < FD.x1 - 0.8;
const zMaxAt = (x) => (x > FD.x0 + 0.6 && x < FD.x1 - 0.6 ? FD.z1 - 0.6 : HZ - 0.6);
function fkind(x, z) {
  const mg = poly(FC.road.pts, x, z), mw = FC.road.w / 2;
  if (mg.d < mw + 0.16) return mg.d < 0.26 ? 'median' : mg.d < mw ? 'road' : 'curb';
  const rv = poly(FC.river.pts, x, z).d;
  if (rv < FC.river.w / 2 || inEll(FC.pond, x, z)) return 'water';
  if (rv < FC.river.w / 2 + 0.45 || inEll(FC.pond, x, z, 0.4)) return 'bank';
  for (const f of FC.forest) if (inRect(f, x, z)) return 'forest';
  return 'grass';
}
const FGX = (FD.x1 - FD.x0) * 2 + 1, FGZ = (FD.z1 - FD.z0) * 2 + 1; let FGRID = new Float32Array(FGX * FGZ);
{
  const raw = new Float32Array(FGX * FGZ);
  for (let j = 0; j < FGZ; j++) for (let i = 0; i < FGX; i++) {
    const x = FD.x0 + i * 0.5, z = FD.z0 + j * 0.5, k = fkind(x, z); let h = 0;
    if (k === 'water') h = -0.45; else if (k === 'bank') h = -0.05;
    else if (k === 'grass' || k === 'forest') h = (fbm(x * 0.35 + 9, z * 0.35) - 0.5) * 0.28;
    raw[j * FGX + i] = h;
  }
  for (let pass = 0; pass < 2; pass++) { const src = pass ? FGRID : raw, dst = pass ? new Float32Array(FGX * FGZ) : FGRID;
    for (let j = 0; j < FGZ; j++) for (let i = 0; i < FGX; i++) { let s = 0, n = 0; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= FGX || jj >= FGZ) continue; s += src[jj * FGX + ii]; n++; } dst[j * FGX + i] = s / n; }
    if (pass) FGRID = dst; }
  // jalan di atas sungai dibuat rata (jembatan)
  for (let j = 0; j < FGZ; j++) for (let i = 0; i < FGX; i++) { const x = FD.x0 + i * 0.5, z = FD.z0 + j * 0.5, k = fkind(x, z); if ((k === 'road' || k === 'median' || k === 'curb') && poly(FC.river.pts, x, z).d < FC.river.w / 2 + 0.9) FGRID[j * FGX + i] = 0.06; }
}
smoothBorder(FGRID, FGX, FGZ, { w: 1, e: 1, s: 1 });
function fieldY(x, z) {
  if (x < FD.x0 || x > FD.x1) return 0;
  const fx = clamp((x - FD.x0) * 2, 0, FGX - 1.001), fz = clamp((z - FD.z0) * 2, 0, FGZ - 1.001), i = Math.floor(fx), j = Math.floor(fz), tx = fx - i, tz = fz - j;
  const a = FGRID[j * FGX + i], b = FGRID[j * FGX + i + 1], c = FGRID[(j + 1) * FGX + i], d = FGRID[(j + 1) * FGX + i + 1];
  return lerp(lerp(a, b, tx), lerp(c, d, tx), tz);
}
function fieldName(x, z) {
  const rv = poly(FC.river.pts, x, z).d;
  if (rv < FC.river.w / 2 + 1.2) return 'Sungai Cipakancilan';
  if (inEll(FC.pond, x, z, 1.0)) return 'Situ Kecil';
  if (Math.hypot(x - FC.hut[0], z - FC.hut[1]) < 2.2) return 'Warung Pinggir Jalan';
  return 'Jl. Raya Depok–Bogor';
}

/* tanah, air, dan sisi diorama field */
const FWATER = { tex: null };
{
  const W = (FD.x1 - FD.x0), H = (FD.z1 - FD.z0), PW = W * TPU, PH = H * TPU;
  const tex = toTex(pixCanvas(PW, PH, (pxi, pzi) => { const x = FD.x0 + (pxi + 0.5) / TPU, z = FD.z0 + (pzi + 0.5) / TPU; return tileColor(fkind(x, z), x, z, pxi, pzi + 7000); }));
  const g = new THREE.PlaneGeometry(W, H, W * 2, H * 2); g.rotateX(-Math.PI / 2); g.translate((FD.x0 + FD.x1) / 2, 0, (FD.z0 + FD.z1) / 2);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const gi = Math.round((p.getX(i) - FD.x0) * 2), gj = Math.round((p.getZ(i) - FD.z0) * 2); p.setY(i, FGRID[gj * FGX + gi]); }
  g.computeVertexNormals();
  const t = new THREE.Mesh(g, toon('#ffffff', { map: tex })); t.receiveShadow = true; world.add(t);
  const wt = terrainMat.water.clone(); wt.needsUpdate = true; wt.repeat.set(W / 4, H / 4); FWATER.tex = wt;
  const wm = new THREE.Mesh(new THREE.PlaneGeometry(W, H).rotateX(-Math.PI / 2), toon('#ffffff', { map: wt })); wm.position.set((FD.x0 + FD.x1) / 2, -0.13, (FD.z0 + FD.z1) / 2); wm.receiveShadow = true; world.add(wm);
}

/* isi field: pohon, semak, jembatan, gapura, warung, palang gerbang Bogor */
function populateField() {
  const R = rng(311), t0 = treeSpots.length;
  const free = (x, z, m) => !rects.some((b) => x > b[0] - m && x < b[1] + m && z > b[2] - m && z < b[3] + m) && !treeSpots.some((p) => p.kind !== 'bush' && Math.hypot(p.x - x, p.z - z) < 1.9);
  for (const f of FC.forest) { let n = 0, tr = 0; const want = Math.round((f[1] - f[0]) * (f[3] - f[2]) * 0.5); while (n < want && tr++ < 600) { const x = f[0] + 0.6 + R() * (f[1] - f[0] - 1.2), z = f[2] + 0.6 + R() * (f[3] - f[2] - 1.2); if (fkind(x, z) !== 'forest' || !free(x, z, 0.9)) continue; addTree(x, z, R() < 0.6 ? 'pine' : 'round', 0.85 + R() * 0.4); n++; } }
  let n = 0, tr = 0; while (n < 16 && tr++ < 800) { const x = FD.x0 + 1 + R() * (FD.x1 - FD.x0 - 2), z = FD.z0 + 2 + R() * (FD.z1 - FD.z0 - 3); if (fkind(x, z) !== 'grass' || !free(x, z, 1.0) || poly(FC.road.pts, x, z).d < 3.2) continue; addTree(x, z, R() < 0.5 ? 'pine' : 'round', 0.8 + R() * 0.35); n++; }
  n = 0; tr = 0; while (n < 36 && tr++ < 1200) { const x = FD.x0 + 0.8 + R() * (FD.x1 - FD.x0 - 1.6), z = FD.z0 + 1 + R() * (FD.z1 - FD.z0 - 2), k = fkind(x, z); if ((k !== 'grass' && k !== 'forest') || !free(x, z, 0.2)) continue; addBush(x, z, 0.8 + R() * 0.6, (R() * 100) | 0); n++; }
  // semak di trotoar tengah
  for (let s = 1.5; s < polyLen(FC.road.pts) - 0.5; s += 2.7) { const [x, z] = polyAt(FC.road.pts, s); if (poly(FC.river.pts, x, z).d > FC.river.w / 2 + 1.4) addBush(x, z, 1.0, (s * 10) | 0); }
  buildTrees(t0);
  // jembatan: pagar di dua sisi jalan sepanjang sungai
  { const rail = toon('#e9e4d6'), post = toon('#b9b1a0'); const rc = poly(FC.river.pts, -1, 34), zc = 33.6;
    [-1, 1].forEach((sd) => { const x = -1 + sd * 1.95; box(world, 0.14, 0.34, 3.6, rail, x, 0.36, zc); [-1.7, -0.6, 0.6, 1.7].forEach((dz) => box(world, 0.2, 0.5, 0.2, post, x, 0.25, zc + dz)); }); }
  // gapura "KE BOGOR" tepat di sambungan Depok - field
  const arch = (zc, txt, bg) => {
    const wood = toon('#c9b88a'), roof = toon('#8a3b2e'); const cx = -1.2;
    [-2.5, 2.5].forEach((dx) => { box(world, 0.42, 2.1, 0.42, wood, cx + dx, 1.05, zc); circles.push({ x: cx + dx, z: zc, r: 0.3 }); });
    box(world, 5.9, 0.28, 0.5, roof, cx, 2.2, zc); box(world, 5.2, 0.5, 0.3, toon('#f3ead2'), cx, 1.85, zc);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.52), new THREE.MeshBasicMaterial({ map: labelTex(txt, bg, '#ffffff'), side: THREE.DoubleSide })); m.position.set(cx, 1.85, zc); world.add(m);
  };
  arch(HZ + 1.4, 'KE BOGOR', '#1d6f6a');
  // palang tutup di ujung field (Kota Bogor belum dibuka)
  arch(FD.z1 - 2.2, 'BOGOR: TUTUP', '#a8442e');
  { const bar = toon('#f1f1f1'), red = toon('#d8452e'); const zc = FD.z1 - 1.6; for (let k = 0; k < 6; k++) box(world, 0.65, 0.18, 0.12, k % 2 ? red : bar, -3.0 + k * 0.65 + 0.33 - 0.0, 0.6, zc); rects.push([-3.4, 0.9, zc - 0.3, zc + 0.3]); }
  // warung pinggir jalan
  { const h = house(FC.hut[0], FC.hut[1], -Math.PI / 2, 3); }
}
const FSPAWNS = [['kucingko', 1, -5.5, 24], ['tikusil', 1, 3.8, 20.4], ['dombanyo', 1, 3.5, 26.2], ['kucingko', 1, 2.8, 38.5], ['tikusil', 1, -4.5, 29.5], ['dombanyo', 1, -6, 37.5], ['kancik', 1, -6.2, 46.5], ['cebongi', 1, 3.4, 22.6], ['pioyo', 1, 4.4, 47.5], ['kancik', 2, 4.9, 41.2]];
let fToastT = 0;
function updateField(dt) {
  FWATER.tex.offset.set(T * 0.03, T * 0.02);
  if (player.z > FD.z1 - 5 && T > fToastT) { fToastT = T + 6; toast('Ada Pak Polisi menjaga gerbang Bogor 👮', 2.6); }
}
