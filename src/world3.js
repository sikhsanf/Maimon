
/* =====================================================================
   BANGUNAN: dinding bertekstur piksel (jendela, pintu), atap pelana bergenteng
   ===================================================================== */
const FT = 14; // texel per unit fasad
function drawWin(set, x0, y0, ww, wh, frame, shutter) {
  // set(x,y,color) menggambar jendela: bingkai, kaca gradasi, sekat, kilau
  for (let y = 0; y < wh; y++) for (let x = 0; x < ww; x++) {
    const edge = x === 0 || y === 0 || x === ww - 1 || y === wh - 1, mull = (x === Math.floor(ww / 2)) || (y === Math.floor(wh / 2) && wh > 6);
    let c; if (edge || mull) c = frame; else { const t = y / wh; c = mixc(hex('#c4ecf8'), hex('#5f9cc2'), t); if ((x + y) % 7 === 0 && x < ww / 2) c = mixc(c, [255, 255, 255], 0.55); }
    set(x0 + x, y0 + y, c);
  }
  if (shutter) for (let y = 0; y < wh; y++) for (const sx of [-3, ww + 1]) for (let k = 0; k < 2; k++) set(x0 + sx + k, y0 + y, y % 3 === 0 ? shade(shutter, 0.82) : shutter);
}
function facadeTex(wu, hu, o) {
  const W = Math.round(wu * FT), H = Math.round(hu * FT), wall = hex(o.wall), frame = hex(o.frame || '#ffffff'), door = hex(o.door || '#7a4a2a');
  const px_ = new Uint8ClampedArray(W * H * 4);
  const set = (x, y, c) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const i = (y * W + x) * 4; px_[i] = c[0]; px_[i + 1] = c[1]; px_[i + 2] = c[2]; px_[i + 3] = 255; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const n = hash2(x + (o.seed || 0), y); let c;
    if (!o.nf && y >= H - 4) c = shade(hex('#8f877a'), 0.88 + n * 0.18);
    else { c = shade(wall, 0.96 + n * 0.06 + (o.siding && y % 5 === 0 ? -0.07 : 0) + (y < 3 ? -0.05 : 0)); if (o.band && y > H * 0.46 && y < H * 0.49) c = shade(c, 0.88); }
    set(x, y, c);
  }
  (o.wins || []).forEach(([cx, cy, ww, wh]) => drawWin(set, Math.round(cx * FT - ww / 2), Math.round(cy * FT), ww, wh, frame, o.shutter ? hex(o.shutter) : null));
  if (o.door) { const dw = 7, dh = Math.round(Math.min(H - 5, 1.0 * FT)), dx = Math.round(o.doorX * FT - dw / 2); for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) { const e = x === 0 || x === dw - 1 || y === 0; let c = e ? shade(door, 0.72) : shade(door, 0.95 + ((x + y) % 4 === 0 ? -0.08 : 0)); if (x === dw - 2 && y === Math.floor(dh * 0.55)) c = hex('#f0d060'); set(dx + x, H - 5 - dh + y + 1, c); } }
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); const id = g.createImageData(W, H); id.data.set(px_); g.putImageData(id, 0, 0); return toTex(cv);
}
function roofTex(col) {
  const base = hex(col); return toTex(pixCanvas(16, 16, (x, y) => { const row = Math.floor(y / 4), off = (row % 2) * 4, bx = (x + off) % 8; let k = 0.92 + hash2(Math.floor((x + off) / 8), row) * 0.18; if (y % 4 === 3) k *= 0.72; if (bx === 0) k *= 0.85; if (y % 4 === 0) k *= 1.1; return shade(base, k); }));
}
function gabled(w, d, rh, over) {
  const a = w / 2 + over, b = d / 2 + over;
  const sp = []; [[[-a, 0, b], [a, 0, b], [a, rh, 0], [-a, rh, 0]], [[a, 0, -b], [-a, 0, -b], [-a, rh, 0], [a, rh, 0]]].forEach((q) => { sp.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]); });
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const uvs = []; for (let i = 0; i < 2; i++) uvs.push(0, 0, a * 4, 0, a * 4, rh * 2.4, 0, 0, a * 4, rh * 2.4, 0, rh * 2.4);
  sg.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); sg.computeVertexNormals();
  const gp = []; [w / 2, -w / 2].forEach((x) => gp.push(x, 0, d / 2, x, 0, -d / 2, x, rh, 0));
  const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3)); gg.computeVertexNormals();
  return [sg, gg];
}
const ROOFCOL = ['#c8523a', '#b4442f', '#8f5a3c', '#6f7f96', '#a8573a'];
const PASTEL = ['#ffd9a8', '#f7b6c2', '#bfe3f5', '#d8f0b0', '#fff0a8', '#e9cdf4', '#f5ead0'];
function bldg(x, z, w, d, h, o = {}) {
  h *= 1.3;
  const g = new THREE.Group(); g.position.set(x, groundY(x, z) - 0.02, z); g.rotation.y = o.ry || 0; world.add(g);
  const front = facadeTex(w, h, { wall: o.wall, wins: o.wins || [[w * 0.26, h * 0.26, 6, 7], [w * 0.76, h * 0.26, 6, 7]], door: o.door, doorX: o.doorX ?? w * 0.52, shutter: o.shutter, frame: o.frame, siding: o.siding, seed: o.seed || 0, nf: o.nf });
  const side = facadeTex(d, h, { wall: o.wall, wins: o.nf ? [] : [[d * 0.5, h * 0.26, 6, 7]], frame: o.frame, siding: o.siding, seed: 9, nf: o.nf });
  const back = facadeTex(w, h, { wall: o.wall, wins: o.nf ? [] : [[w * 0.5, h * 0.26, 6, 7]], frame: o.frame, siding: o.siding, seed: 4, nf: o.nf });
  const M = (t) => toon('#ffffff', { map: t });
  const bx = new THREE.Mesh(new THREE.BoxGeometry(w, h + 0.1, d), [M(side), M(side), toon(o.wall), toon('#6b6458'), M(front), M(back)]);
  bx.position.y = (h - 0.1) / 2; bx.castShadow = bx.receiveShadow = true; g.add(bx);
  if (!o.flat) {
    const rh = o.rh ?? Math.min(w, d) * 0.4, over = 0.18;
    const [sg, gg] = gabled(w, d, rh, over);
    const rf = new THREE.Mesh(sg, toon('#ffffff', { map: roofTex(o.roof || ROOFCOL[0]), side: THREE.DoubleSide })); rf.position.y = h; rf.castShadow = rf.receiveShadow = true; g.add(rf);
    const gb = new THREE.Mesh(gg, toon(o.wall, { side: THREE.DoubleSide })); gb.position.y = h; gb.castShadow = true; g.add(gb);
    if (o.chimney) { const ch = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.6, 0.26), toon('#8a5a48')); ch.position.set(w * 0.25, h + rh * 0.75, -d * 0.12); ch.castShadow = true; g.add(ch); }
  }
  if (o.porch) {
    const pw = w * 0.86, pd = 0.8; const roof = new THREE.Mesh(new THREE.BoxGeometry(pw, 0.1, pd), toon(o.roof || '#c8523a')); roof.position.set(0, h * 0.82, d / 2 + pd / 2); roof.castShadow = true; g.add(roof);
    for (const s of [-1, 1]) for (const k of [0.0, 1.0]) { const col = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, h * 0.8, 6), toon('#ffffff')); col.position.set(s * (pw / 2 - 0.1 - k * pw * 0.28), h * 0.4, d / 2 + pd - 0.08); col.castShadow = true; g.add(col); }
    const step = new THREE.Mesh(new THREE.BoxGeometry(pw, 0.1, pd), toon('#d8d0c0')); step.position.set(0, 0.05, d / 2 + pd / 2); g.add(step);
  }
  if (o.awning) { const aw = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.08, 0.5), toon(o.awning)); aw.position.set(0, h * 0.62, d / 2 + 0.22); aw.rotation.x = 0.35; aw.castShadow = true; g.add(aw); }
  const c = Math.cos(o.ry || 0), s = Math.sin(o.ry || 0), hw = (Math.abs(c) * w + Math.abs(s) * d) / 2 + (o.porch ? 0.4 : 0.05), hd = (Math.abs(s) * w + Math.abs(c) * d) / 2 + (o.porch ? 0.4 : 0.05);
  rects.push([x - hw, x + hw, z - hd, z + hd]); return g;
}
function house(x, z, ry, i) { return bldg(x, z, 2.1, 1.6, 1.15, { ry, wall: PASTEL[i % 7], roof: ROOFCOL[i % 5], door: ['#7a4a2a', '#4a6a8a', '#8a3a3a'][i % 3], doorX: 0.62 + (i % 2 ? 0.25 : 0), rh: 0.7, chimney: i % 3 === 0, awning: i % 4 === 1 ? '#d8523a' : null, siding: true, seed: i * 17 }); }
function labelTex(txt, bg, fg, icon) {
  const c = document.createElement('canvas'); c.width = 192; c.height = 44; const g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 192, 44); g.fillStyle = bg; g.fillRect(3, 3, 186, 38);
  const px = (rows, x0, y0, s, col) => { g.fillStyle = col; rows.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === '#') g.fillRect(x0 + i * s, y0 + j * s, s, s); })); };
  if (icon === 'heart') px(['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'], 8, 9, 4, '#ffffff');
  if (icon === 'flask') px(['..###..', '..#.#..', '..#.#..', '.#...#.', '#.....#', '#######'], 8, 9, 4, '#ffffff');
  g.fillStyle = fg; g.font = 'bold 19px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 112, 23); return toTex(c);
}
function addRoofSign(g, sign, h, rh) {
  const tex = labelTex(sign[0], sign[1], '#ffffff', sign[2]), mat = new THREE.MeshBasicMaterial({ map: tex }), sg = new THREE.Group(); sg.position.set(0, h + rh + 0.5, 0);
  const mk2 = (ry2) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 0.62), mat); m.rotation.y = ry2; m.position.z = ry2 ? -0.05 : 0.05; sg.add(m); };
  mk2(0); mk2(Math.PI); [-1.1, 1.1].forEach((px2) => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.5, 0.07), toon('#4a4f58')); p.position.set(px2, -0.3, 0); sg.add(p); }); g.add(sg);
}
function colonial(x, z, ry, i, o = {}) {
  const g = bldg(x, z, 3.2, 2.1, 1.4, Object.assign({ ry, wall: '#fbf7ee', roof: '#c04a36', door: '#3d6a4a', doorX: 1.6, wins: [[0.55, 0.33, 6, 9], [1.05, 0.33, 6, 9], [2.15, 0.33, 6, 9], [2.65, 0.33, 6, 9]], shutter: '#4a7a54', porch: true, rh: 0.8, chimney: true, frame: '#ffffff', seed: i * 11 }, o.b || {}));
  if (o.sign) {
    const tex = labelTex(o.sign[0], o.sign[1], '#ffffff', o.sign[2]), mat = new THREE.MeshBasicMaterial({ map: tex }), h = 1.4 * 1.3, sg = new THREE.Group(); sg.position.set(0, h + 0.8 + 0.5, 0);
    const mk = (ry2) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 0.62), mat); m.rotation.y = ry2; m.position.z = ry2 ? -0.05 : 0.05; sg.add(m); };
    mk(0); mk(Math.PI); [-1.1, 1.1].forEach((px2) => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.5, 0.07), toon('#4a4f58')); p.position.set(px2, -0.3, 0); sg.add(p); }); g.add(sg);
    if (o.board) { const bg = new THREE.Group(); bg.position.set(o.board[0], 0, o.board[1]); const pl = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.5), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })); pl.position.y = 1.2; bg.add(pl); [-0.95, 0.95].forEach((px2) => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.2, 0.07), toon('#4a4f58')); p.position.set(px2, 0.6, 0); bg.add(p); }); g.add(bg); }
  }
  return g;
}

const POI = { lab: [-8.2, 9.75], clinic: [-13.0, 10.2], prof: [LAB_PROF[0], LAB_PROF[1]], nurse: [-13.0, 10.15], home: [-11.9, 3.3] };
function buildBuildings() {
  // MARGO CITY (mal): fasad kaca + dinding merah muda, menghadap Margonda
  { const g = bldg(4.5, -6.95, 5.1, 4.6, 2.0, { flat: true, ry: -Math.PI / 2, wall: '#f2d6dc', frame: '#ffffff', wins: [0.5, 1.15, 1.8, 3.3, 4.0, 4.6].map((cx) => [cx, 0.62, 9, 9]), door: '#7fd3e8', doorX: 2.55, seed: 3 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.22, 4.8), toon('#e0587a')); top.position.set(0, 2.1, 0); top.castShadow = true; g.add(top);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.5), new THREE.MeshBasicMaterial({ map: textTex('MARGO CITY', 128, 22, '#e0587a', '#ffffff', 14) })); sg.position.set(0, 1.62, 2.31); g.add(sg);
    for (const px2 of [-1.2, 0.8]) { const ac = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.6), toon('#b8bcc4')); ac.position.set(px2, 2.37, -0.6); ac.castShadow = true; g.add(ac); }
    const can = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.8), toon('#e0587a')); can.position.set(0.0, 1.0, 2.7); can.castShadow = true; g.add(can);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.1), toon('#ffffff')); p.position.set(s * 0.8, 0.5, 3.05); g.add(p); }
    ['#e84a4a', '#4a8ae8', '#f2c230', '#52b857', '#ffffff', '#9a6ad8'].forEach((c, i) => { const car = buildCar(c, false); car.position.set(2.7 + (i % 3) * 1.75, groundY(3, -3), -2.9 + Math.floor(i / 3) * 1.0); car.rotation.y = Math.PI / 2 * (i % 2 ? 1 : -1); castAll(car); world.add(car); [-0.5, 0.5].forEach((o) => circles.push({ x: car.position.x + o, z: car.position.z, r: 0.4 })); });
  }
  // STASIUN DEPOK BARU
  { const g = bldg(12.4, -7.0, 2.8, 2.4, 1.3, { ry: -Math.PI / 2, wall: '#f5f0e0', roof: '#e0587a', rh: 0.6, wins: [[0.7, 0.45, 6, 6], [2.1, 0.45, 6, 6]], door: '#4a6a8a', doorX: 1.4, seed: 5 });
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.36), new THREE.MeshBasicMaterial({ map: textTex('DEPOK BARU', 112, 20, '#2f6fb8', '#ffffff', 13) })); sg.position.set(0, 1.05, 1.22); g.add(sg);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.1, 4.6), toon('#e0587a')); roof.position.set(10.0, 1.4, -6.9); roof.castShadow = true; world.add(roof);
    [-2.0, 2.0].forEach((dz) => [9.45, 10.55].forEach((px2) => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.35, 0.08), toon('#ffffff')); p.position.set(px2, 0.68, -6.9 + dz); p.castShadow = true; world.add(p); }));
    const bn = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 1.2), toon('#9a6a3a')); bn.position.set(10.0, 0.3, -6.9); world.add(bn);
  }
  // PERPUSTAKAAN UI: kaca bertingkat, menghadap plaza
  { const tiers = [[4.0, 2.6, 1.0], [3.2, 2.1, 0.9], [2.4, 1.6, 0.8]]; let y = 0;
    tiers.forEach(([w, d, h], i) => { const wins = []; for (let k = 0; k < Math.floor(w * 1.4); k++) wins.push([0.35 + k * 0.7, 0.14, 8, 10]); const gg = bldg(-10.5, -0.5, w, d, h, { flat: true, ry: Math.PI, wall: ['#78dcc8', '#6fd0bc', '#68c8b4'][i], frame: '#eafff8', wins, seed: i * 3, door: i === 0 ? '#e8fff8' : null, doorX: w / 2, nf: true }); gg.position.y = y + groundY(-10.5, -0.5) - 0.02 + 0; y += h; const ledge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, 0.08, d + 0.12), toon('#eafff8')); ledge.position.set(0, h + 0.0, 0); gg.add(ledge); });
    rects.pop(); rects.pop();
  }
  // DEPOK LAMA: rumah kolonial putih berpilar
  colonial(-13.0, 8.4, 0, 0, { board: [-1.5, 1.95], sign: ['KLINIK MAIMON', '#e0507a', 'heart'], b: { roof: '#e0507a', door: '#e0507a', shutter: '#f08aa8' } }); colonial(-8.2, 8.4, 0, 1, { sign: ['LAB MAIMON UI', '#1d8f8a', 'flask'], b: { roof: '#2a8f8a', door: '#1d6f8a', shutter: '#2a8f8a' } }); colonial(-10.6, 12.9, Math.PI, 3);
  // KAMPUNG barat (menghadap Jl. Raya)
  [-16.2, -13.4, -7.8, -5.0].forEach((x, i) => { const hg = house(x, 2.7, 0, i + 1); if (i === 1) addRoofSign(hg, ['HOTEL MAIMON', '#8a5a2a', 'heart'], 1.15 * 1.3, 0.7); });
  // KAMPUNG timur (menghadap gang)
  [[10.9, 8.7, Math.PI / 2], [10.9, 11.7, Math.PI / 2], [13.0, 8.7, -Math.PI / 2], [13.0, 11.7, -Math.PI / 2]].forEach(([x, z, ry], i) => house(x, z, ry, i + 3));
}
function castAll(o) { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); }
function textTex(txt, w, h, bg, fg, pxs) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = `bold ${pxs}px monospace`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 1); return toTex(c); }

/* =====================================================================
   PROPS: lampu, jembatan, bangku, pagar, halte, tugu, papan nama
   ===================================================================== */
function buildProps() {
  // lampu jalan Margonda
  const L2 = polyLen(C.margonda.pts); for (let s = 2.5; s < L2 - 1.5; s += 4.6) { const [x, z] = polyAt(C.margonda.pts, s); [-1, 1].forEach((sd) => { const lx = x + sd * (C.margonda.w / 2 + 0.42), g = new THREE.Group(); g.position.set(lx, 0, z);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.5, 6), toon('#4a4f58')); pole.position.y = 0.75; pole.castShadow = true; g.add(pole);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.05), toon('#4a4f58')); arm.position.set(-sd * 0.15, 1.5, 0); g.add(arm);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.12), glow('#fff3a0')); lamp.position.set(-sd * 0.3, 1.47, 0); g.add(lamp); world.add(g); circles.push({ x: lx, z, r: 0.1 }); }); }
  // jembatan Raya di atas Ciliwung
  { const g = new THREE.Group(); g.position.set(15.8, 0, 5); world.add(g);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.16, 2.2), toon('#ffffff', { map: toTex(pixCanvas(16, 16, (x, y) => { const k = 0.9 + hash2(x >> 2, y) * 0.18; return shade(hex(x % 4 === 0 ? '#8a5e3c' : '#a77a4e'), k); })) })); deck.position.y = 0.0; deck.castShadow = deck.receiveShadow = true; g.add(deck);
    [-1, 1].forEach((sd) => { const rail = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.07, 0.07), toon('#c9a070')); rail.position.set(0, 0.46, sd * 1.05); rail.castShadow = true; g.add(rail); for (let i = -3; i <= 3; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.4, 0.07), toon('#c9a070')); p.position.set(i * 0.55, 0.28, sd * 1.05); g.add(p); } });
    for (const sd of [-1, 1]) { const pier = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 2.0), toon('#8b8f93')); pier.position.set(sd * 1.5, -0.3, 0); g.add(pier); } }
  // bangku kampus & halte
  [[-12.2, -1.2, 0], [-8.7, -2.2, Math.PI / 2]].forEach(([x, z, ry]) => { const g = new THREE.Group(); g.position.set(x, groundY(x, z), z); g.rotation.y = ry; const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.28), toon('#9a6a3a')); seat.position.y = 0.26; const back = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.26, 0.05), toon('#9a6a3a')); back.position.set(0, 0.42, -0.12); [-0.3, 0.3].forEach((lx) => { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, 0.24), toon('#4a4f58')); l.position.set(lx, 0.13, 0); g.add(l); }); g.add(seat, back); castAll(g); world.add(g); circles.push({ x, z, r: 0.35 }); });
  { const g = new THREE.Group(); g.position.set(-3.1, 0, 3.0); const roof = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 1.7), toon('#3a86d6')); roof.position.y = 1.2; const back = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.2, 1.7), toon('#8fd8ee')); back.position.set(-0.4, 0.6, 0); [-0.8, 0.8].forEach((pz) => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.2, 0.06), toon('#ffffff')); p.position.set(0.4, 0.6, pz); g.add(p); }); g.add(roof, back); castAll(g); world.add(g); rects.push([-3.6, -2.7, 2.1, 3.9]); }
  // pagar bambu kecil di sekeliling Depok Lama & kampung barat (instanced)
  { const posts = []; for (let x = -17.2; x <= -7.8; x += 0.6) { posts.push([x, 7.4]); posts.push([x, 13.3]); } for (let z = 7.4; z <= 13.3; z += 0.6) posts.push([-17.3, z]);
    const m = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.42, 0.06), toon('#e8dcc0'), posts.length); const d = new THREE.Object3D(); posts.forEach((p, i) => { d.position.set(p[0], groundY(p[0], p[1]) + 0.21, p[1]); d.updateMatrix(); m.setMatrixAt(i, d.matrix); }); m.castShadow = true; world.add(m); }
  // papan nama jalan
  { const g = new THREE.Group(); g.position.set(-2.9, 0, -10.5); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 6), toon('#4a4f58')); pole.position.y = 0.65; const sg = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 0.05), new THREE.MeshBasicMaterial({ map: textTex('JL. MARGONDA RAYA', 128, 22, '#1d7a4a', '#ffffff', 11) })); sg.position.set(0, 1.25, 0); g.add(pole, sg); castAll(g); world.add(g); circles.push({ x: -2.9, z: -10.5, r: 0.12 }); }
  // dais Taman Maimon: batu melingkar
  { const ring = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.1, 0.22, 16), toon('#a89b83')); ring.position.set(C.dais[0], 0.0, C.dais[1]); ring.receiveShadow = true; ring.castShadow = true; world.add(ring); }
}

/* =====================================================================
   KENDARAAN & KRL
   ===================================================================== */
function buildCar(color, angkot) {
  const g = new THREE.Group(), body = toon(color), glass = toon('#9fd8ee'), dark = toon('#2a2a30'), M = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m; };
  if (angkot) { M(new THREE.BoxGeometry(0.8, 0.5, 1.8), body, 0, 0.45, 0); M(new THREE.BoxGeometry(0.82, 0.1, 1.82), toon('#ffffff'), 0, 0.42, 0); M(new THREE.BoxGeometry(0.78, 0.3, 1.7), glass, 0, 0.85, 0); M(new THREE.BoxGeometry(0.84, 0.07, 1.84), toon('#ffffff'), 0, 1.03, 0); }
  else { M(new THREE.BoxGeometry(0.76, 0.3, 1.5), body, 0, 0.34, 0); M(new THREE.BoxGeometry(0.68, 0.28, 0.85), glass, 0, 0.63, -0.08); M(new THREE.BoxGeometry(0.7, 0.06, 0.87), body, 0, 0.79, -0.08); }
  [[-0.4, 0.55], [0.4, 0.55], [-0.4, -0.55], [0.4, -0.55]].forEach(([x, z]) => M(new THREE.BoxGeometry(0.1, 0.22, 0.26), dark, x, 0.11, z * (angkot ? 1.25 : 1)));
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; } }); return g;
}
function buildTraffic() {
  const len = polyLen(C.margonda.pts);
  [['#3a86d6', true, 1], ['#e84a4a', false, 1], ['#3a86d6', true, -1], ['#f2c230', false, -1], ['#52b857', false, 1], ['#9a6ad8', false, -1]].forEach(([c, ang, dir], i) => { const m = buildCar(c, ang); world.add(m); vehicles.push({ m, dir, ang, s: (i * 9.1) % len, v: ang ? 2.0 : 2.7, len }); });
}
function updateTraffic(dt, px_, pz_) {
  vehicles.forEach((v) => {
    const [x, z, tx, tz] = polyAt(C.margonda.pts, v.s), rx = -tz, rz = tx, off = (C.margonda.w / 2 + 0.26) / 2 * 0.98, sgn = v.dir > 0 ? -1 : 1;
    const cx = x + rx * off * sgn, cz = z + rz * off * sgn, near = (mode === 'play' || mode === 'gather') && Math.hypot(cx - px_, cz - pz_) < 1.9;
    let sp = v.v; if (near) sp = 0;
    else vehicles.forEach((u) => { if (u === v || u.dir !== v.dir) return; let g = ((u.s - v.s) * v.dir) % v.len; if (g < 0) g += v.len; if (g < 2.3) sp = 0; else if (g < 3.4) sp = Math.min(sp, u.v * 0.8); });
    v.s += v.dir * sp * dt; if (v.s > v.len) v.s -= v.len; if (v.s < 0) v.s += v.len;
    v.m.position.set(cx, 0, cz); v.m.rotation.y = Math.atan2(v.dir * tx, v.dir * tz); v.m.visible = !(battle && Math.hypot(cx - battle.cx, cz - battle.cz) < 3.6);
  });
}
const train = new THREE.Group(); world.add(train);
function buildTrain() {
  for (let i = 0; i < 4; i++) { const z = i * 2.5, M = (geo, mat, y) => { const m = new THREE.Mesh(geo, mat); m.position.set(0, y, z); m.castShadow = true; train.add(m); };
    M(new THREE.BoxGeometry(0.9, 0.7, 2.35), toon('#dfe4ec'), 0.55); M(new THREE.BoxGeometry(0.92, 0.12, 2.37), toon('#e0442a'), 0.36); M(new THREE.BoxGeometry(0.93, 0.26, 2.0), toon('#35587a'), 0.72); M(new THREE.BoxGeometry(0.8, 0.07, 2.25), toon('#b9c0ca'), 0.94); }
  train.position.x = C.rail.pts[0][0];
}
let trainT = 0; function updateTrain(dt) { trainT += dt; train.position.z = Math.sin(trainT * 0.28) * 14 - 5.2; train.position.y = 0.04; }
