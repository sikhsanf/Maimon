
/* =====================================================================
   TAS + CARI MAKANAN: kebun warga (jagung/timun/wortel/kacang), kangkung di tepi danau, mancing ikan
   ===================================================================== */
const FOODWHERE = { timun: 'Petik di Kebun Warga (dekat Stasiun)', kangkung: 'Petik di tepi Danau UI', jagung: 'Petik di Kebun Warga (dekat Stasiun)', ikan: 'Mancing di Danau UI 🎣', kacang: 'Cabut di Kebun Warga (dekat Stasiun)', wortel: 'Cabut di Kebun Warga (dekat Stasiun)' };
const BAGMAX = 99;
const bagN = (id) => (S.bag && S.bag[id]) || 0;
function addBag(id, n) { if (S.stage === 1) S.tf[id === 'ikan' ? 'fish' : 'crop'] = 1; S.bag = S.bag || {}; S.bag[id] = Math.min(BAGMAX, bagN(id) + n); }
function useBag(id) { if (bagN(id) > 0) { S.bag[id]--; return true; } return false; }

const spots = [], toonM = {};
const TM = (c) => toonM[c] || (toonM[c] = toon(c));
const REGROW = 45;
function buildCrop(food, x, z) {
  const g = new THREE.Group(); g.position.set(x, groundY(x, z), z); world.add(g);
  const P = grp(g);
  if (food === 'jagung') [[-0.2, 0.05], [0.16, -0.1]].forEach(([dx, dz], i) => { const h = 0.95 + i * 0.18; box(P, 0.07, h, 0.07, TM('#5fa63c'), dx, h / 2, dz); [0.35, 0.62].forEach((y, k) => box(P, 0.36, 0.03, 0.1, TM('#78bd48'), dx + (k ? 0.14 : -0.14), y * h, dz, { rz: k ? 0.55 : -0.55 })); box(P, 0.13, 0.28, 0.13, TM('#f4cf3a'), dx + 0.09, h * 0.55, dz + 0.08); box(P, 0.15, 0.1, 0.15, TM('#7fb445'), dx + 0.09, h * 0.55 + 0.18, dz + 0.08); box(P, 0.05, 0.16, 0.05, TM('#b98a3a'), dx, h + 0.06, dz); });
  if (food === 'timun') { [-0.32, 0.32].forEach((dx) => box(P, 0.05, 0.85, 0.05, TM('#8a6a3a'), dx, 0.42, 0)); [0.8, 0.45].forEach((y) => box(P, 0.7, 0.04, 0.05, TM('#8a6a3a'), 0, y, 0)); box(P, 0.62, 0.55, 0.07, TM('#4fa83e'), 0, 0.55, 0.02); [[-0.18, 0.3], [0.05, 0.22], [0.22, 0.34]].forEach(([dx, y]) => box(P, 0.08, 0.22, 0.08, TM('#2f8a38'), dx, y, 0.08)); }
  if (food === 'wortel') [[-0.22, 0.05], [0.02, -0.06], [0.24, 0.07]].forEach(([dx, dz]) => { [-0.35, 0, 0.35].forEach((r) => box(P, 0.035, 0.34, 0.035, TM('#5cb040'), dx + r * 0.2, 0.2, dz, { rz: r })); box(P, 0.11, 0.07, 0.11, TM('#f08a24'), dx, 0.02, dz); });
  if (food === 'kacang') { [[-0.18, 0, 0.3], [0.14, 0.05, 0.36], [0, -0.12, 0.26]].forEach(([dx, dz, s]) => box(P, s, s * 0.6, s, TM('#4a9c38'), dx, s * 0.3, dz)); [[-0.2, 0.15], [0.05, 0.2], [0.22, 0.1], [-0.05, -0.1]].forEach(([dx, dz]) => box(P, 0.06, 0.12, 0.06, TM('#c8a064'), dx, 0.1, dz)); }
  if (food === 'kangkung') [[-0.16, 0.0], [0.0, 0.1], [0.15, -0.05], [-0.05, -0.14], [0.2, 0.14], [-0.2, 0.14]].forEach(([dx, dz], i) => { const h = 0.4 + (i % 3) * 0.1; box(P, 0.04, h, 0.04, TM('#8fd05a'), dx, h / 2, dz, { rz: (i % 2 ? 0.15 : -0.15) }); box(P, 0.2, 0.04, 0.14, TM('#58b43c'), dx, h + 0.02, dz); });
  castAll(g); return { g, P };
}
const markGeo = new THREE.ConeGeometry(0.09, 0.2, 4).rotateX(Math.PI);
function addSpot(o) {
  const s = Object.assign({ ripe: true, t: 0, r: 1.3 }, o);
  s.mark = new THREE.Mesh(markGeo, glow(o.kind === 'fish' ? '#7fd0ff' : '#ffd84a')); world.add(s.mark);
  spots.push(s); return s;
}
function buildSigns() {
  const sign = (txt, bg, x, z, ry) => { const g = new THREE.Group(); g.position.set(x, groundY(x, z), z); g.rotation.y = ry; const m = new THREE.MeshBasicMaterial({ map: labelTex(txt, bg, '#ffffff'), side: THREE.DoubleSide }); const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.35), m); pl.position.y = 0.95; g.add(pl); [-0.6, 0.6].forEach((px) => box(g, 0.06, 0.95, 0.06, TM('#7a5a34'), px, 0.47, 0)); world.add(g); circles.push({ x, z, r: 0.3 }); };
  sign('KEBUN WARGA', '#5d8a3a', 3.0, 1.5, -Math.PI / 2);
  return sign;
}
function buildGatherWorld() {
  const sign = buildSigns();
  // kebun warga
  const rows = [['jagung', 0.0], ['timun', 1.0], ['wortel', 2.0], ['kacang', 3.0]], nm = { jagung: 'Jagung', timun: 'Timun', wortel: 'Wortel', kacang: 'Kacang' }, ic = { jagung: '🌽', timun: '🥒', wortel: '🥕', kacang: '🥜' }, vb = { jagung: 'Petik', timun: 'Petik', wortel: 'Cabut', kacang: 'Cabut' };
  rows.forEach(([f, z]) => [4.4, 5.7, 7.0].forEach((x) => { const c = buildCrop(f, x, z); addSpot({ kind: 'crop', food: f, x, z, g: c.P, label: `${ic[f]} ${vb[f]} ${nm[f]}`, h: f === 'jagung' ? 1.5 : 1.0 }); }));
  // tepi danau: kangkung + titik mancing
  const ring = (L, deg, add) => { const a = deg * Math.PI / 180; return [L[0] + (L[2] + add) * Math.cos(a), L[1] + (L[3] + add * 0.75) * Math.sin(a)]; };
  const ok = (x, z) => kindAt(x, z) === 'bank' && !blockedAt(x, z, 0.3);
  const found = [];
  C.lakes.forEach((L, li) => { for (let d = 0; d < 360; d += 15) { const [x, z] = ring(L, d, 0.3); if (ok(x, z)) found.push({ x, z, li, d, L }); } });
  const l1 = found.filter((p) => p.li === 0), l2 = found.filter((p) => p.li === 1);
  const fp = l1.length ? l1.reduce((a, b) => (Math.abs(b.d - 90) < Math.abs(a.d - 90) ? b : a)) : found[0];
  if (fp) {
    const tx = fp.x + (fp.L[0] - fp.x) * 0.55, tz = fp.z + (fp.L[1] - fp.z) * 0.55;
    addSpot({ kind: 'fish', food: 'ikan', x: fp.x, z: fp.z, tx, tz, label: '🎣 Mancing', r: 1.7, h: 0.8 });
    { const dx = fp.x - fp.L[0], dz = fp.z - fp.L[1], dl = Math.hypot(dx, dz) || 1; sign('MANCING', '#3b8fd6', fp.x + dx / dl * 0.9 - dz / dl * 0.9, fp.z + dz / dl * 0.9 + dx / dl * 0.9, Math.atan2(-dx, -dz)); }
    GATHERDBG.fish = [fp.x, fp.z];
  }
  const kk = []; [...l1, ...l2].forEach((p) => { if (fp && Math.hypot(p.x - fp.x, p.z - fp.z) < 2.2) return; if (kk.every((q) => Math.hypot(q.x - p.x, q.z - p.z) > 2.2)) kk.push(p); });
  kk.slice(0, 5).forEach((p) => { const c = buildCrop('kangkung', p.x, p.z); addSpot({ kind: 'crop', food: 'kangkung', x: p.x, z: p.z, g: c.P, label: '🥬 Petik Kangkung', h: 0.75 }); });
  GATHERDBG.kangkung = kk.slice(0, 5).map((p) => [p.x, p.z]);
}
const GATHERDBG = {};
buildGatherWorld();

const FCOL = { jagung: '#f4cf3a', timun: '#2f8a38', wortel: '#f08a24', kacang: '#c8a064', kangkung: '#58b43c' };
async function gatherAt(s) {
  if (s.kind === 'fish') return startFish(s);
  if (!s.ripe || mode !== 'play') return;
  mode = 'gather'; $('joy').style.display = 'none'; $('talk').style.display = 'none'; player.walk = false; player.ang = Math.atan2(s.x - player.x, s.z - player.z);
  const root = player.rig.root, P = s.g, n = s.food === 'jagung' ? 2 : 1 + (R0() < 0.35 ? 1 : 0), items = []; for (let i = 0; i < n; i++) items.push(fxCube(FCOL[s.food] || '#fff', 0.16));
  const base = [s.x, groundY(s.x, s.z), s.z]; let popped = false;
  await tween(1150, (k) => {
    const lean = k < 0.15 ? k / 0.15 : k < 0.62 ? 1 : 1 - (k - 0.62) / 0.2; root.rotation.x = Math.max(0, lean) * 0.55;
    if (k < 0.5) { P.rotation.z = Math.sin(k * 70) * 0.16 * (k / 0.5); P.position.y = 0; if (k > 0.2 && ((k * 100) | 0) % 9 === 0) burst(s.x, 0.15, s.z, '#8a6a3a', 2); }
    else { if (!popped) { popped = true; s.ripe = false; s.t = 0; burst(s.x, 0.3, s.z, '#9be85a', 12); P.rotation.z = 0; } }
    items.forEach((m, i) => { const kk = Math.min(1, Math.max(0, (k - 0.5 - i * 0.08) / 0.4)); m.visible = kk > 0 && kk < 1; const tx = player.x, tz = player.z; m.position.set(mix(base[0], tx, kk), base[1] + 0.3 + Math.sin(kk * Math.PI) * 1.1, mix(base[2], tz, kk)); m.rotation.y = kk * 8; });
  });
  fxClear(); root.rotation.x = 0; P.rotation.z = 0; addBag(s.food, n); const f = FOOD[s.food]; toast(`+${n} ${f[2]} ${f[1]}`, 1.6); floatText(`+${n} ${f[2]}`, player.x, 1.8, player.z, '#33241b'); Music.blip(660); setTimeout(() => Music.blip(880), 90); saveGame();
  mode = 'play'; $('joy').style.display = '';
}
function updateGather(dt) {
  spots.forEach((s) => {
    if (s.kind === 'crop') { if (!s.ripe) { s.t += dt; if (s.t > REGROW) s.ripe = true; } const k = s.ripe ? 1 : 0.22 + 0.78 * (s.t / REGROW); s.g.scale.setScalar(k); }
    s.mark.visible = s.ripe && (mode === 'play' || mode === 'gather') && s.kind !== 'zz' && Math.hypot(player.x - s.x, player.z - s.z) < 9;
    s.mark.position.set(s.x, groundY(s.x, s.z) + (s.h || 1) + 0.25 + Math.sin(T * 3 + s.x) * 0.05, s.z); s.mark.rotation.y = T * 2;
  });
  updateFish(dt);
}

/* ---------- mancing ---------- */
let fishSt = null;
const bobGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14), lineGeo = new THREE.BoxGeometry(0.025, 0.025, 1);
function startFish(s) {
  if (mode !== 'play') return;
  mode = 'fish'; $('joy').style.display = 'none'; $('talk').style.display = 'none'; player.walk = false; player.ang = Math.atan2(s.tx - player.x, s.tz - player.z);
  const bob = new THREE.Mesh(bobGeo, new THREE.MeshBasicMaterial({ color: '#ff4a3a' })), line = new THREE.Mesh(lineGeo, new THREE.MeshBasicMaterial({ color: '#ffffff' })); world.add(bob); world.add(line);
  fishSt = { s, t: 0, phase: 'wait', wait: 1.6 + R0() * 2.4, bite: 0, bob, line };
  $('fishui').style.display = 'flex'; $('pullb').classList.remove('on'); $('fishmsg').textContent = 'Menunggu ikan menggigit… 🎣';
}
function endFish(ok) {
  const f = fishSt; fishSt = null; world.remove(f.bob); world.remove(f.line); $('fishui').style.display = 'none'; mode = 'play'; $('joy').style.display = '';
  if (ok) { const n = 1 + (R0() < 0.3 ? 1 : 0); addBag('ikan', n); toast(`Dapat ${n} 🐟 Ikan!`, 2); burst(f.s.tx, 0.4, f.s.tz, '#bfe8ff', 18); Music.jingle('catch'); saveGame(); }
}
function updateFish(dt) {
  const f = fishSt; if (!f) return; f.t += dt;
  const s = f.s, hx = player.x + Math.sin(player.ang) * 0.3, hy = groundY(player.x, player.z) + 0.75, hz = player.z + Math.cos(player.ang) * 0.3;
  const k = Math.min(1, f.t / 0.6), wy = -0.45 + 0.05;
  let bx = mix(hx, s.tx, k), bz = mix(hz, s.tz, k), by = mix(hy, wy, k) + Math.sin(k * Math.PI) * 1.2;
  if (f.phase === 'wait') { by += Math.sin(T * 4) * 0.015; if (f.t > f.wait + 0.6) { f.phase = 'bite'; f.bite = 0; $('pullb').classList.add('on'); $('fishmsg').textContent = '❗ Ikan menggigit! TARIK!'; Music.blip(880); setTimeout(() => Music.blip(1175), 100); } }
  else if (f.phase === 'bite') { f.bite += dt; by += -0.1 + Math.sin(T * 30) * 0.05; if (((f.bite * 10) | 0) % 4 === 0 && R0() < 0.3) burst(s.tx, -0.3, s.tz, '#bfe8ff', 2); if (f.bite > 2.6) { toast('Yah, ikannya kabur… coba lagi!', 1.8); endFish(false); return; } }
  f.bob.position.set(bx, by, bz);
  f.line.position.set((hx + bx) / 2, (hy + by) / 2, (hz + bz) / 2); f.line.lookAt(bx, by, bz); f.line.scale.z = Math.hypot(bx - hx, by - hy, bz - hz);
}
$('pullb').onclick = () => {
  const f = fishSt; if (!f) return;
  if (f.phase === 'bite') endFish(true);
  else if (f.t > 0.6) { toast('Sabar… tunggu ikannya menggigit 😄', 1.4); f.t = 0.6; f.wait = 1.4 + R0() * 2; }
};
$('fishx').onclick = () => { if (fishSt) endFish(false); };
