/* =====================================================================
   INTERIOR LAB MAIMON UI — ruangan di luar peta, dimasuki lewat pintu Lab di Depok Lama
   ===================================================================== */
const LAB = { x0: 28, z0: 28, W: 8, D: 6 };
const LABDOOR = { x: -8.2, z: 9.75 }, LABEXIT = { x: LAB.x0 + 4, z: LAB.z0 + 0.8 }, LABSPAWN = { x: LAB.x0 + 4, z: LAB.z0 + 1.7 };
function labCanvasTex(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return toTex(c); }
function buildLabInterior() {
  const g = new THREE.Group(); world.add(g); const X = LAB.x0, Z = LAB.z0, W = LAB.W, D = LAB.D, T = (c) => toon(c);
  INB.x0 = X; INB.x1 = X + W; INB.z0 = Z; INB.z1 = Z + D;
  // lantai papan keramik
  box(g, W + 0.5, 0.5, D + 0.5, T('#9fb4b8'), X + W / 2, -0.25, Z + D / 2);
  const ft = pixTex(2, 2, (x, y) => ((x + y) % 2 ? '#cfe6e8' : '#f6fbfb')); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(W, D);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), toon('#ffffff', { map: ft })); fl.rotation.x = -Math.PI / 2; fl.position.set(X + W / 2, 0.01, Z + D / 2); fl.receiveShadow = true; g.add(fl);
  // dinding belakang (barat & utara), kamera melihat dari tenggara
  box(g, 0.24, 2.7, D + 0.24, T('#e6f3f2'), X - 0.12, 1.35, Z + D / 2 - 0.0); box(g, W + 0.48, 2.7, 0.24, T('#e6f3f2'), X + W / 2 - 0.0, 1.35, Z - 0.12);
  box(g, 0.28, 0.85, D + 0.28, T('#2f9c95'), X - 0.12, 0.43, Z + D / 2); box(g, W + 0.52, 0.85, 0.28, T('#2f9c95'), X + W / 2, 0.43, Z - 0.12);
  box(g, 0.3, 0.1, D + 0.3, T('#f4ecd8'), X - 0.12, 0.88, Z + D / 2); box(g, W + 0.54, 0.1, 0.3, T('#f4ecd8'), X + W / 2, 0.88, Z - 0.12);
  box(g, 0.3, 0.12, D + 0.3, T('#1d6f6a'), X - 0.12, 2.7, Z + D / 2); box(g, W + 0.54, 0.12, 0.3, T('#1d6f6a'), X + W / 2, 2.7, Z - 0.12);
  // pintu keluar (dinding utara)
  box(g, 1.2, 2.1, 0.1, T('#f4ecd8'), X + 4, 1.05, Z + 0.04); box(g, 0.98, 1.95, 0.1, T('#2a8f8a'), X + 4, 0.98, Z + 0.1); box(g, 0.12, 0.12, 0.08, glow('#ffd84a'), X + 4.35, 0.95, Z + 0.17);
  box(g, 1.3, 0.04, 0.9, T('#c0392b'), X + 4, 0.03, Z + 0.55);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.28), new THREE.MeshBasicMaterial({ map: labelTex('KELUAR', '#2a8f8a', '#ffffff') })); sg.position.set(X + 4, 2.3, Z + 0.17); g.add(sg);
  // papan tulis
  box(g, 2.7, 1.4, 0.08, T('#8a8f96'), X + 1.7, 1.75, Z + 0.06);
  const wb = labCanvasTex(180, 90, (c, w, h) => { c.fillStyle = '#fbfbf6'; c.fillRect(0, 0, w, h); c.fillStyle = '#1d6f6a'; c.font = 'bold 13px monospace'; c.fillText('PENELITIAN MAIMON', 8, 16);
    c.strokeStyle = '#3a86d6'; c.lineWidth = 3; c.beginPath(); c.ellipse(34, 52, 14, 18, 0, 0, 7); c.stroke(); c.fillStyle = '#e0507a'; [[70, 46], [80, 38], [92, 38], [102, 46]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); }); c.beginPath(); c.arc(86, 58, 10, 0, 7); c.fill();
    c.strokeStyle = '#d8452e'; c.beginPath(); c.moveTo(52, 52); c.lineTo(64, 52); c.stroke(); c.fillStyle = '#5cae3c'; [[130, 80, 12], [144, 68, 24], [158, 56, 36]].forEach(([x, y, hh]) => c.fillRect(x, 82 - hh, 10, hh)); c.fillStyle = '#33241b'; c.font = '9px monospace'; c.fillText('Dex 6/∞', 120, 30); });
  const wp = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.25), new THREE.MeshBasicMaterial({ map: wb })); wp.position.set(X + 1.7, 1.75, Z + 0.12); g.add(wp);
  // layar data (kanan pintu)
  box(g, 2.3, 1.3, 0.1, T('#2a3340'), X + 6.2, 1.7, Z + 0.07);
  const sc = labCanvasTex(160, 90, (c, w, h) => { c.fillStyle = '#0e2a30'; c.fillRect(0, 0, w, h); c.strokeStyle = '#3df0c0'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 160; i += 4) c.lineTo(i, 50 + Math.sin(i * 0.12) * 18); c.stroke(); c.fillStyle = '#3df0c0'; c.font = 'bold 12px monospace'; c.fillText('DATA MAIMON · DEPOK', 8, 16); c.fillStyle = '#ffd84a'; [[16, 70], [40, 62], [64, 76], [88, 58]].forEach(([x, y]) => c.fillRect(x, y, 14, 84 - y)); });
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.15), new THREE.MeshBasicMaterial({ map: sc })); sp.position.set(X + 6.2, 1.7, Z + 0.13); g.add(sp);
  // rak + toples spesimen (dinding barat)
  box(g, 0.55, 2.2, 2.7, T('#8a5a2a'), X + 0.3, 1.1, Z + 2.2); [0.5, 1.0, 1.5, 2.0].forEach((y) => box(g, 0.6, 0.06, 2.7, T('#6a4220'), X + 0.32, y, Z + 2.2));
  const cols = ['#e8582a', '#3b8fd6', '#4fae4f', '#e0b020', '#b07ad8', '#6cc4e0'];
  [0.55, 1.05, 1.55].forEach((y, r) => { for (let k = 0; k < 5; k++) { const c = cols[(k + r * 2) % cols.length]; box(g, 0.2, 0.3, 0.2, T('#dff1f0'), X + 0.55, y + 0.17, Z + 1.1 + k * 0.5); box(g, 0.14, 0.18, 0.14, glow(c), X + 0.55, y + 0.15, Z + 1.1 + k * 0.5); } });
  // tabung inkubator
  [[X + 0.8, Z + 4.45, '#ffd84a'], [X + 0.8, Z + 5.3, '#e0507a']].forEach(([x, z, c]) => { box(g, 0.7, 0.14, 0.7, T('#4a4f58'), x, 0.07, z); const gl = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.3, 10), new THREE.MeshBasicMaterial({ color: '#bfe8ff', transparent: true, opacity: 0.38 })); gl.position.set(x, 0.8, z); g.add(gl); box(g, 0.7, 0.14, 0.7, T('#4a4f58'), x, 1.5, z); box(g, 0.28, 0.36, 0.28, glow(c), x, 0.35, z); box(g, 0.2, 0.2, 0.2, glow('#ffffff'), x, 0.62, z); rects.push([x - 0.4, x + 0.4, z - 0.4, z + 0.4]); });
  // poster cakar
  box(g, 0.05, 1.3, 1.0, T('#f4ecd8'), X + 0.03, 1.8, Z + 4.85); const pp = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.15), new THREE.MeshBasicMaterial({ map: labCanvasTex(40, 56, (c, w, h) => { c.fillStyle = '#2f9c95'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; [[10, 14], [20, 10], [30, 14]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y + 6, 3.5, 0, 7); c.fill(); }); c.beginPath(); c.arc(20, 30, 9, 0, 7); c.fill(); c.font = 'bold 7px monospace'; c.fillText('MAIMON', 6, 50); }) })); pp.rotation.y = Math.PI / 2; pp.position.set(X + 0.07, 1.8, Z + 4.85); g.add(pp);
  // meja kerja tengah
  const tb = (cx, cz, w, d) => { box(g, w, 0.1, d, T('#f4f6f6'), cx, 0.85, cz); box(g, w, 0.08, d, T('#2f9c95'), cx, 0.78, cz); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => box(g, 0.08, 0.78, 0.08, T('#8c96a0'), cx + sx * (w / 2 - 0.1), 0.39, cz + sz * (d / 2 - 0.1))); rects.push([cx - w / 2, cx + w / 2, cz - d / 2, cz + d / 2]); };
  tb(X + 4.6, Z + 4.4, 2.2, 0.95);
  [['#e8582a', -0.7], ['#3b8fd6', -0.4], ['#4fae4f', -0.1]].forEach(([c, dx]) => { box(g, 0.14, 0.26, 0.14, glow(c), X + 4.6 + dx, 1.03, Z + 4.3); box(g, 0.1, 0.06, 0.1, T('#dff1f0'), X + 4.6 + dx, 1.19, Z + 4.3); });
  box(g, 0.4, 0.06, 0.3, T('#4a4f58'), X + 5.2, 0.93, Z + 4.45); box(g, 0.1, 0.4, 0.1, T('#4a4f58'), X + 5.2, 1.13, Z + 4.4); box(g, 0.32, 0.1, 0.1, T('#8c96a0'), X + 5.2, 1.34, Z + 4.34);
  box(g, 0.5, 0.03, 0.34, T('#c9ced4'), X + 5.7, 0.92, Z + 4.4); box(g, 0.5, 0.3, 0.03, glow('#3df0c0'), X + 5.7, 1.1, Z + 4.25);
  tb(X + 2.3, Z + 4.9, 1.4, 0.8); box(g, 0.4, 0.04, 0.3, T('#1a2430'), X + 2.3, 0.93, Z + 4.9); box(g, 0.34, 0.02, 0.24, glow('#7fe0ff'), X + 2.3, 0.96, Z + 4.9);
  // karpet + tanaman
  box(g, 2.6, 0.03, 1.7, T('#e0507a'), X + 5.7, 0.03, Z + 2.5); box(g, 2.2, 0.035, 1.3, T('#f6d5df'), X + 5.7, 0.04, Z + 2.5);
  { const px = X + 7.4, pz = Z + 0.7; box(g, 0.4, 0.4, 0.4, T('#c0653a'), px, 0.2, pz); [[0, 0.7, 0.5], [-0.15, 0.6, 0.3], [0.15, 0.62, 0.3]].forEach(([dx, y, s]) => box(g, s, s, s, T('#4fae4f'), px + dx, y + 0.1, pz)); circles.push({ x: px, z: pz, r: 0.35 }); }
  castAll(g); return g;
}
buildLabInterior();

const fadeEl = document.getElementById('fade'); let doorCool = 0;
function fadeTo(v) { fadeEl.style.opacity = v; }
function goLab(into, after) {
  if (mode === 'cut') return; mode = 'cut'; $('joy').style.display = 'none'; $('talk').style.display = 'none'; fadeTo(1);
  setTimeout(() => {
    inside = into;
    if (into) { player.x = LABSPAWN.x; player.z = LABSPAWN.z; player.ang = 0; zoomGoal = 0.78; yaw = 0.62; }
    else { player.x = LABDOOR.x; player.z = LABDOOR.z + 1.5; player.ang = Math.PI; zoomGoal = 1; }
    trail.length = 0; mates.forEach((m, i) => { m.x = player.x + 0.6 * (i + 1); m.z = player.z - 0.2; });
    camGoal.set(player.x, 0.4, player.z); camTarget.copy(camGoal); zoom = zoomGoal; doorCool = T + 1.6; fadeTo(0); mode = 'play'; $('joy').style.display = '';
    if (after) after();
  }, 450);
}

let yawGoal = null; const forceYaw = (y) => { yawGoal = y; };

function clearYaw(x, z, base) {
  let best = base, bs = 1e9;
  for (const off of [0, 0.45, -0.45, 0.9, -0.9, 1.4, -1.4, 2.0, -2.0, 3.14]) {
    const y = base + off; let sc = Math.abs(off) * 0.15;
    for (let d = 0.9; d <= 3.4; d += 0.35) { const px = x + Math.sin(y) * d, pz = z + Math.cos(y) * d; for (const b of rects) if (px > b[0] && px < b[1] && pz > b[2] && pz < b[3]) sc += 3; if (d < 2.6) for (const c of circles) if (c.r >= 0.3 && Math.hypot(px - c.x, pz - c.z) < c.r + 0.1) sc += 2; }
    if (sc < bs) { bs = sc; best = y; }
  }
  return best;
}
