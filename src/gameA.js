
const CITY = 'depok';
/* =====================================================================
   DATA: tipe, jurus, spesies, makanan
   ===================================================================== */
const TCOL = { Air: '#3b8fd6', Api: '#e8582a', Daun: '#4fae4f', Batu: '#9a8a70', Es: '#6cc4e0', Suara: '#b07ad8', Petarung: '#c85a3a', Cahaya: '#e0b020', Besi: '#8a95a6', Biasa: '#9a9a9a' };
const BEATS = { Air: ['Api', 'Cahaya'], Api: ['Daun', 'Besi'], Daun: ['Batu', 'Air'], Batu: ['Es', 'Api'], Es: ['Suara', 'Daun'], Suara: ['Petarung', 'Batu'], Petarung: ['Cahaya', 'Es'], Cahaya: ['Besi', 'Suara'], Besi: ['Air', 'Petarung'] };
const typeMult = (att, def) => att === 'Biasa' || def === 'Biasa' ? 1 : BEATS[att].includes(def) ? 2 : BEATS[def].includes(att) ? 0.5 : 1;
const FOODS = [['timun', 'Timun', '🥒'], ['kangkung', 'Kangkung', '🥬'], ['jagung', 'Jagung', '🌽'], ['ikan', 'Ikan', '🐟'], ['kacang', 'Kacang', '🥜'], ['wortel', 'Wortel', '🥕']];
const FOOD = Object.fromEntries(FOODS.map((f) => [f[0], f]));
const MAI = {
  kancik: { info: { cat: 'Maimon Kancil', desc: 'Kancil kecil yang cerdik. Suka petak umpet di semak taman. Kalau ada timun segar, matanya langsung berbinar!', hab: 'Hutan UI & sekitar Margonda', ht: '0,5 m', wt: '4 kg', emo: '🦌' }, n: ['Kancik', 'Kancilon'], spd: 60, type: 'Daun', fav: 'timun', hp: [46, 74], animal: 'kancil', build: (st) => buildKancik(st), s: 0.66,
    ls: [[1,'Seruduk','Biasa',40],[4,'Daun Tajam','Daun',55],[8,'Lempar Batu','Batu',55],[13,'Daun Badai','Daun',80]] },
  cebongi: { info: { cat: 'Maimon Kecebong', desc: 'Kecebong ceria yang tinggal dekat Kali Ciliwung. Ia suka menyemprotkan air untuk menyapa teman.', hab: 'Tepi kali & danau UI', ht: '0,3 m', wt: '2 kg', emo: '🐸' }, n: ['Cebongi', 'Kodi'], spd: 50, type: 'Air', fav: 'kangkung', hp: [46, 74], animal: 'kecebong', build: (st) => buildCebongi(st), s: 0.66,
    ls: [[1,'Sundul','Biasa',40],[4,'Semprot Air','Air',55],[8,'Kuak Keras','Suara',55],[13,'Ombak Besar','Air',80]] },
  pioyo: { info: { cat: 'Maimon Anak Ayam', desc: 'Anak ayam pemberani. Kokoknya yang nyaring membangunkan seisi kampung di pagi hari.', hab: 'Kampung & Depok Lama', ht: '0,3 m', wt: '1 kg', emo: '🐥' }, n: ['Pioyo', 'Petokar'], spd: 70, type: 'Api', fav: 'jagung', hp: [46, 74], animal: 'anak ayam', build: (st) => buildPioyo(st), s: 0.66,
    ls: [[1,'Patuk','Biasa',40],[4,'Kokok Api','Api',55],[8,'Cakar Jago','Petarung',55],[13,'Api Jago','Api',80]] },
  kucingko: { info: { cat: 'Maimon Kucing', desc: 'Kucing santai yang suka berjemur di pinggir jalan. Meongnya keras sekali kalau sedang lapar.', hab: 'Pinggir Margonda', ht: '0,4 m', wt: '3 kg', emo: '🐱' }, n: ['Kucingko'], spd: 80, type: 'Suara', fav: 'ikan', hp: [34], animal: 'kucing', build: () => buildQuad(SPEC.kucingko), s: 0.66, ls: [[1,'Cakar','Biasa',40],[3,'Meong Keras','Suara',50],[8,'Loncat Lincah','Biasa',55],[13,'Mata Bersinar','Cahaya',60]] },
  tikusil: { info: { cat: 'Maimon Tikus', desc: 'Tikus mungil yang pandai menyembunyikan kacang. Giginya kuat mengerat batu kecil.', hab: 'Dekat Stasiun Depok Baru', ht: '0,2 m', wt: '1 kg', emo: '🐭' }, n: ['Tikusil'], spd: 75, type: 'Batu', fav: 'kacang', hp: [30], animal: 'tikus', build: () => buildQuad(SPEC.tikusil), s: 0.66, ls: [[1,'Gigit','Biasa',40],[3,'Lempar Kerikil','Batu',50],[9,'Cicit Nyaring','Suara',55],[14,'Longsor Mini','Batu',75]] },
  dombanyo: { info: { cat: 'Maimon Domba', desc: 'Domba berbulu tebal yang suka mengunyah rumput di kebun belimbing. Bulunya hangat dipeluk.', hab: 'Kebun belimbing', ht: '0,6 m', wt: '12 kg', emo: '🐑' }, n: ['Dombanyo'], spd: 40, type: 'Daun', fav: 'wortel', hp: [38], animal: 'domba', build: () => buildQuad(SPEC.dombanyo), s: 0.66, ls: [[1,'Seruduk','Biasa',40],[3,'Rumput Tajam','Daun',50],[9,'Wol Beku','Es',55],[14,'Hujan Daun','Daun',75]] },
};

/* =====================================================================
   ENTITAS: pemain, Maimon liar, teman
   ===================================================================== */
const player = { rig: null, x: 1.6, z: 11.6, ang: Math.PI, walk: false, ox: 0, oz: 0 };
const wilds = [], mates = [], respawns = [], stash = [], MAXP = 3;
const LVCAP = 20, xpNeed = (lv) => 10 + lv * 12;
const speedOf = (e) => Math.round(MAI[e.sp].spd * (0.7 + 0.06 * e.lv));
const hpMaxOf = (sp, st, lv = 5) => Math.round(MAI[sp].hp[Math.min(st, MAI[sp].hp.length) - 1] * (0.6 + 0.08 * lv));
const movesAt = (sp, lv) => MAI[sp].ls.filter((m) => m[0] <= lv).slice(-4);
const FXK = { 'Seruduk': 'tackle', 'Sundul': 'tackle', 'Patuk': 'peck', 'Cakar': 'claw', 'Gigit': 'bite', 'Daun Tajam': 'leaf', 'Rumput Tajam': 'leaf', 'Daun Badai': 'leafstorm', 'Hujan Daun': 'leafstorm', 'Lempar Batu': 'rock', 'Lempar Kerikil': 'rock', 'Longsor Mini': 'rockfall', 'Semprot Air': 'water', 'Ombak Besar': 'wave', 'Kuak Keras': 'sound', 'Meong Keras': 'sound', 'Cicit Nyaring': 'sound', 'Kokok Api': 'fire', 'Api Jago': 'fireblast', 'Cakar Jago': 'fight', 'Loncat Lincah': 'pounce', 'Mata Bersinar': 'beam', 'Wol Beku': 'ice' };
let mode = 'loading', T = 0, cooldown = 0, talk = null, battle = null;
const $ = (id) => document.getElementById(id);
const easeOutBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
function lerpAng(a, b, t) { const d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; }
function animRig(rig, t, walk) {
  rig.update(t, walk);
  rig.flames.forEach((f) => { const s = f.s; f.g.scale.set(s * (1 + Math.sin(t * 7 + f.ph) * 0.08), s * (1 + Math.sin(t * 11 + f.ph) * 0.22), s * (1 + Math.sin(t * 7 + f.ph) * 0.08)); });
  const closed = (t + (rig.off || 0)) % 3.3 < 0.13;
  rig.blink.forEach((b) => { const m = closed ? b.shut : b.open; if (b.mat.map !== m) { b.mat.map = m; b.mat.needsUpdate = true; } });
}
function flash(ent, k) { ent.rig.root.traverse((m) => { if (m.isMesh && m.material && m.material.emissive) m.material.emissive.setRGB(k, k, k); }); }
function mkMon(sp, st, x, z, lv = st === 2 ? 11 : 4, xp = 0) {
  const d = MAI[sp], rig = d.build(st); rig.off = R0() * 3; castAll(rig.root); world.add(rig.root);
  const hpMax = hpMaxOf(sp, st, lv);
  return { sp, st, lv, xp, rig, d, name: d.n[Math.min(st, d.n.length) - 1], type: d.type, fav: d.fav, x, z, ang: R0() * 6.28, ox: 0, oz: 0, hp: hpMax, hpMax, tgt: null, wait: R0() * 2, walk: false, state: 'wander', shake: 0, pop: 0.4, rad: 3.2, hx: x, hz: z, jump: 0, fade: 1, sc: rig.size * d.s * 0.8 };
}
function placeEnt(e, dt) {
  const k = e.pop < 0.5 ? 0.35 + 0.65 * easeOutBack(e.pop / 0.5) : 1;
  e.rig.root.scale.setScalar(e.sc * k * e.fade);
  e.rig.root.position.set(e.x + e.ox, groundY(e.x, e.z) + (e.oy || 0) + (e.jump > 0 ? Math.abs(Math.sin(e.jump * 9)) * 0.3 : 0) + (e.sp === 'cebongi' ? 0 : 0), e.z + e.oz);
  e.rig.root.rotation.y = e.ang; e.rig.root.rotation.z = e.shake > 0 ? Math.sin(e.shake * 40) * 0.25 : 0;
}
const RARE_SP = ['kancik', 'cebongi', 'pioyo'], RARE_CHANCE = /[?&]rare/.test(location.search) ? 1 : 0.04;
const SPAWNS = [
  ['kancik', 1, -13, -4.5], ['kancik', 1, -6, -11], ['kancik', 2, -15.5, -11.5],
  ['cebongi', 1, -5.7, -5.4], ['cebongi', 1, -12, -8.6], ['cebongi', 2, 13.2, 2],
  ['pioyo', 1, -9, 3.2], ['pioyo', 1, 11.4, 10.2], ['pioyo', 2, 12.2, 12.4],
  ['kucingko', 1, 4.5, -0.6], ['kucingko', 1, -12, 11.0], ['kucingko', 1, 12, -1.5], ['kucingko', 1, -6.5, -6.8], ['kucingko', 1, 8.5, 3.6],
  ['tikusil', 1, 10, -10.8], ['tikusil', 1, 5, 6.4], ['tikusil', 1, -14, -1.5], ['tikusil', 1, 14.2, -4.5],
  ['dombanyo', 1, 4.8, 9.2], ['dombanyo', 1, 6.4, 12.6], ['dombanyo', 1, -3.5, -9.5], ['dombanyo', 1, 11.8, 5.8],
];
const isRare = (sp, st) => RARE_SP.includes(sp);
function trySpawn(sp, st, x, z) { if (isRare(sp, st) && R0() > RARE_CHANCE * (st === 2 ? 0.4 : 1)) { respawns.push({ t: T + 120 + R0() * 60, sp, st, hx: x, hz: z }); return null; } return spawnWild(sp, st, x, z); }
function spawnWild(sp, st, hx, hz) {
  const [x, z] = freeSpot(hx, hz, 0.4), rare = isRare(sp, st), lv = st === 2 ? 10 + ((R0() * 3) | 0) : rare ? 6 + ((R0() * 3) | 0) : 3 + ((R0() * 4) | 0), w = mkMon(sp, st, x, z, lv); w.hx = hx; w.hz = hz; w.rad = sp === 'kancik' ? 3.5 : 2.6; w.rare = isRare(sp, st); w.spark = 0; wilds.push(w); return w;
}
function updateWild(w, dt) {
  if (w.rare && (w.spark -= dt) < 0) { w.spark = 0.7; burst(w.x, 0.5 + R0() * 0.5, w.z, '#fff3a0', 3); }
  w.pop += dt; w.shake = Math.max(0, w.shake - dt); w.jump = Math.max(0, w.jump - dt);
  if (w.state === 'wander') {
    if (w.wait > 0) { w.wait -= dt; w.walk = false; }
    else if (!w.tgt) { const a = R0() * 6.28, rr = R0() * w.rad; w.tgt = [w.hx + Math.cos(a) * rr, w.hz + Math.sin(a) * rr]; }
    else {
      const dx = w.tgt[0] - w.x, dz = w.tgt[1] - w.z, d = Math.hypot(dx, dz);
      if (d < 0.2) { w.tgt = null; w.wait = 1 + R0() * 3; w.walk = false; }
      else { const sp = (w.sp === 'cebongi' ? 1.0 : 1.3) * dt, nx = w.x + dx / d * sp, nz = w.z + dz / d * sp;
        if (blockedAt(nx, nz, 0.35)) { w.tgt = null; w.wait = 0.4; w.walk = false; } else { w.x = nx; w.z = nz; w.ang = lerpAng(w.ang, Math.atan2(dx, dz), Math.min(1, dt * 8)); w.walk = true; } }
    }
  } else if (w.state === 'face') { w.walk = false; w.ang = lerpAng(w.ang, Math.atan2(player.x - w.x, player.z - w.z), Math.min(1, dt * 8)); }
  placeEnt(w, dt); animRig(w.rig, T + w.rig.off, w.walk);
}

/* =====================================================================
   PIL IH STARTER (di awal) — 1 dari 3
   ===================================================================== */
const starters = []; let pickSel = null;
const STARTS = [['kancik', 11.7], ['cebongi', 10.4], ['pioyo', 9.1]];
function enterPick() {
  mode = 'pick'; player.rig.root.visible = false;
  STARTS.forEach(([sp, z]) => { const m = mkMon(sp, 1, -5.3, z, 5); m.state = 'display'; m.ang = Math.PI / 2; m.pop = 0; m.sc = m.rig.size * m.d.s * 0.8 * 1.35; m.baseZ = z; starters.push(m); });
  yaw = 0.62; pitch = 0.6; camGoal.set(-5.2 + 1.0, 0.5, 10.4 + 1.5); camTarget.copy(camGoal); zoomGoal = zoom = 0.48;
  const cards = $('cards'); cards.innerHTML = '';
  starters.forEach((m, i) => { const b = document.createElement('div'); b.className = 'card panel'; b.innerHTML = `<b>${m.name}</b><span class="chip" style="background:${TCOL[m.type]}">${m.type}</span><div class="fav">suka ${FOOD[m.fav][2]} ${FOOD[m.fav][1]}</div>`; b.onclick = () => selectStarter(i); cards.appendChild(b); });
  $('go').textContent = 'Pilih satu dulu'; $('go').disabled = true; $('pick').style.display = 'flex'; $('joy').style.display = 'none'; $('zone').style.display = 'none'; $('mates').style.display = 'none';
}
function selectStarter(i) {
  pickSel = i; [...$('cards').children].forEach((c, k) => c.classList.toggle('sel', k === i));
  starters[i].jump = 0.6; starters[i].shake = 0; $('go').textContent = `Ajak ${starters[i].name}!`; $('go').disabled = false;
}
$('go').onclick = () => {
  if (pickSel == null) return; Music.unlock(); Music.play(CITY); Music.jingle('catch'); const m = starters[pickSel];
  starters.forEach((s, i) => { if (i !== pickSel) { burst(s.x, 0.6, s.z, '#fff3a0'); world.remove(s.rig.root); } });
  starters.length = 0; $('pick').style.display = 'none';
  m.state = 'follow'; m.sc = m.rig.size * m.d.s * 0.8; m.pop = 0; mates.push(m); m.x = -4.4; m.z = 10.4; m.ang = Math.PI / 2; trail.length = 0;
  player.x = -3.0; player.z = 10.4; player.ang = -Math.PI / 2; player.rig.root.visible = true;
  addChip(m); mode = 'play'; Music.jingle('catch'); pitch = 0.66; yaw = 0.62; zoomGoal = 1; $('joy').style.display = ''; $('zone').style.display = ''; $('mates').style.display = '';
  S.stage = 2; markDex(m.sp, 2); saveGame();
  dialog([['Prof. Catherine', `Pilihan bagus! ${m.name} pasti jadi partner yang hebat.`], ['Prof. Catherine', 'Dekati Maimon liar untuk battle. Kalau menang, beri makanan favoritnya supaya mau ikut denganmu.'], ['Prof. Catherine', 'Makanan favorit tidak jatuh dari langit, lho! Petik jagung, timun, wortel, dan kacang di Kebun Warga dekat Stasiun. Kangkung tumbuh di tepi Danau UI, dan ikan harus dipancing di danau.'], ['Prof. Catherine', 'Semua hasilnya masuk Tas. Buka lewat tombol ☰ — di sana ada juga Maimondex dan daftar Tim Saya.'],['Prof. Catherine', 'Kalau Maimon-mu lelah, bawa ke Klinik Maimon di seberangku. Dokter Sari akan merawatnya.'], ['Prof. Catherine', 'Satu lagi: kamu hanya boleh membawa 3 Maimon. Yang lebih dari itu dititip di Rumah Kos Bu Wati, di dekat jalan raya. Semangat, Pelatih!']]);
};
function renderChips() { const c = $('mchips'); c.innerHTML = ''; mates.forEach((m, i) => { const s = document.createElement('span'); s.textContent = (i === 0 ? '⭐ ' : '') + m.name + ' Lv' + m.lv; c.appendChild(s); }); $('mates').firstChild.textContent = `TEMAN ${mates.length}/${MAXP}`; }
const addChip = () => renderChips();

/* =====================================================================
   UI umum, partikel, teks melayang
   ===================================================================== */
const parts = [], toastEl = $('toast'); let toastT = 0;
function toast(msg, sec = 1.8) { toastEl.textContent = msg; toastEl.style.opacity = 1; toastT = sec; }
const partGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
function burst(x, y, z, color = null, n = 16) { const cols = color ? [color] : ['#ffd84a', '#ff7aa8', '#7fe0ff', '#9be85a']; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(partGeo, new THREE.MeshBasicMaterial({ color: cols[i % cols.length] })); m.position.set(x, y + groundY(x, z), z); world.add(m); const a = R0() * 6.28, v = 1.5 + R0() * 2; parts.push({ m, vx: Math.cos(a) * v, vy: 2.5 + R0() * 2.5, vz: Math.sin(a) * v, life: 0.9 }); } }
function updateParts(dt) { for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life -= dt; p.vy -= 9 * dt; p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt; p.m.rotation.x += dt * 6; p.m.scale.setScalar(Math.max(0.01, p.life)); if (p.life <= 0) { world.remove(p.m); p.m.material.dispose(); parts.splice(i, 1); } } }
const _v = new THREE.Vector3();
function toScreen(x, y, z) { _v.set(x, y, z).project(cam); return [(_v.x * 0.5 + 0.5) * innerWidth, (-_v.y * 0.5 + 0.5) * innerHeight]; }
function floatText(txt, x, y, z, color = '#33241b') { const [sx, sy] = toScreen(x, y, z), d = document.createElement('div'); d.textContent = txt; d.style.cssText = `position:fixed;left:${sx}px;top:${sy}px;transform:translate(-50%,-50%);font:700 26px var(--font-display);color:${color};text-shadow:-2px 0 #fff,2px 0 #fff,0 -2px #fff,0 2px #fff;pointer-events:none;transition:top .9s ease-out,opacity .9s;z-index:5`; document.body.appendChild(d); requestAnimationFrame(() => { d.style.top = (sy - 60) + 'px'; d.style.opacity = 0; }); setTimeout(() => d.remove(), 1000); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* =====================================================================
   BATTLE (ronde serempak: kedua pihak memilih jurus, lalu diadu bersamaan)
   ===================================================================== */
const logEl = $('log'); let logT = 0;
function say(msg, ms = 1100) { logEl.textContent = msg; logEl.style.opacity = 1; logT = ms / 1000; }
function hpBar(box, e) { const p = Math.max(0, e.hp) / e.hpMax; box.innerHTML = `<div class="n"><span>${e.name} <small class="l2">Lv${e.lv}</small></span><span class="chip" style="background:${TCOL[e.type]}">${e.type}</span></div><div class="bar"><i class="${p < 0.25 ? 'low' : p < 0.55 ? 'mid' : ''}" style="width:${Math.round(p * 100)}%"></i></div><span class="lv">${Math.max(0, Math.ceil(e.hp))} / ${e.hpMax}</span>`; }
let hidden = [];
function clearArena(cx, cz, R) {
  treeMeshes.forEach((m) => { if (m.visible && Math.hypot(m.userData.x - cx, m.userData.z - cz) < R) { m.visible = false; hidden.push(m); burst(m.userData.x, 0.4, m.userData.z, '#8cc656', 4); } });
}
function restoreArena() { hidden.forEach((m) => { m.visible = true; }); hidden = []; }
function bestBattleYaw(cx, cz) {
  let best = yaw, bs = 1e9;
  for (let k = 0; k < 24; k++) {
    const y = k * Math.PI / 12, dx = Math.sin(y), dz = Math.cos(y); let blocked = 0;
    for (let d = 0.6; d <= 4.2; d += 0.4) { const px = cx + dx * d, pz = cz + dz * d; if (rects.some((b) => px > b[0] - 0.25 && px < b[1] + 0.25 && pz > b[2] - 0.25 && pz < b[3] + 0.25)) blocked += (4.4 - d); if (px < -HX + 1 || px > HX - 1 || pz < -HZ + 1 || pz > HZ - 1) blocked += 0.5; }
    const dyaw = Math.abs(((y - yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI), sc = blocked * 3 + dyaw * 0.35; if (sc < bs) { bs = sc; best = y; }
  }
  return best;
}
function startBattle(w) {
  const me = mates[0]; if (!me) return;
  if (me.hp <= 0) me.hp = 1;
  markDex(w.sp, 1); mode = 'battle'; Music.play(w.rare ? 'battleRare' : 'battle'); battle = { w, me, busy: false }; w.state = 'battle'; me.state = 'battle'; $('joy').style.display = 'none'; $('bubble').style.display = 'none';
  const by = bestBattleYaw(w.x, w.z); battle.yawG = by;
  const rx = Math.cos(by), rz = -Math.sin(by);
  let sgn = 1; const okSide = (s) => !blockedAt(w.x - rx * s * 2.0, w.z - rz * s * 2.0, 0.4);
  if (!okSide(1) && okSide(-1)) sgn = -1;
  battle.me.bx = w.x - rx * sgn * 2.0; battle.me.bz = w.z - rz * sgn * 2.0; battle.px = w.x - rx * sgn * 3.0; battle.pz = w.z - rz * sgn * 3.0;
  battle.cx = (w.x + me.bx) / 2; battle.cz = (w.z + me.bz) / 2;
  me.ang = Math.atan2(w.x - me.bx, w.z - me.bz); w.ang = Math.atan2(me.bx - w.x, me.bz - w.z); w.walk = false;
  clearArena(battle.cx, battle.cz, 3.2); camGoal.set(battle.cx, 0.3, battle.cz); zoomGoal = 0.42; pitch = 0.9; $('hpL').classList.add('fl'); $('hpR').classList.add('fl');
  hpBar($('hpL'), me); hpBar($('hpR'), w); $('battle').style.display = 'block';
  buildMoveButtons(); say(w.rare ? `✨ ${w.name} LANGKA muncul!` : `${w.name} liar muncul!`, 1500);
}
function effHint(mv, foe) { const m = typeMult(mv[2], foe.type); return m > 1 ? '⭐ ampuh' : m < 1 ? '💤 kurang' : ''; }
function curMoves(e) { return movesAt(e.sp, e.lv); }
function buildMoveButtons() {
  const row = $('mvRow'); row.innerHTML = ''; const me = battle.me, kn = curMoves(me);
  kn.forEach((mv, i) => { const b = document.createElement('button'); b.className = 'mv'; b.innerHTML = `${mv[1]}<small><span class="chip" style="background:${TCOL[mv[2]]}">${mv[2]}</span> ${effHint(mv, battle.w)}</small>`; b.onclick = () => round(i); row.appendChild(b); });
  me.d.ls.filter((m) => m[0] > me.lv).slice(0, 4 - kn.length).forEach((m) => { const b = document.createElement('button'); b.className = 'mv lock'; b.innerHTML = `🔒<small>Lv ${m[0]}</small>`; row.appendChild(b); });
  $('flee').onclick = flee; setMovesEnabled(true);
}
function setMovesEnabled(on) { [...$('mvRow').children].filter((b) => !b.classList.contains('lock')).forEach((b) => b.classList.toggle('wait', !on)); $('flee').style.pointerEvents = on ? 'auto' : 'none'; $('flee').style.opacity = on ? 1 : 0.5; }
function calcDmg(att, mv, def) { const mult = typeMult(mv[2], def.type), stab = mv[2] === att.type ? 1.5 : 1, lvF = 0.55 + 0.09 * att.lv; return { dmg: Math.max(1, Math.round(mv[3] * mult * stab * lvF / 7 * (0.9 + R0() * 0.2))), mult }; }
/* ---------- animasi jurus (tiap jurus punya gerakan sendiri) ---------- */
const fxList = [], fxMats = {}, cubeGeo = new THREE.BoxGeometry(1, 1, 1);
const fxMat = (c) => fxMats[c] || (fxMats[c] = new THREE.MeshBasicMaterial({ color: c }));
const tween = (ms, fn) => new Promise((res) => { const t0 = performance.now(); (function s() { const k = Math.min(1, (performance.now() - t0) / ms); fn(k); k < 1 ? requestAnimationFrame(s) : res(); })(); });
function fxCube(c, sx, sy = sx, sz = sx) { const m = new THREE.Mesh(cubeGeo, fxMat(c)); m.scale.set(sx, sy, sz); m.rotation.order = 'YXZ'; world.add(m); fxList.push(m); return m; }
function fxClear() { fxList.forEach((m) => world.remove(m)); fxList.length = 0; }
const fxPos = (e, h = 0.45) => [e.x + e.ox, groundY(e.x, e.z) + h, e.z + e.oz];
const mix = (a, b, k) => a + (b - a) * k;
async function shakeCam(ms, amp) { const base = camGoal.clone(); await tween(ms, (k) => { camGoal.set(base.x + (R0() - 0.5) * amp * (1 - k), base.y, base.z + (R0() - 0.5) * amp * (1 - k)); }); camGoal.copy(base); }
function setAt(m, p) { m.position.set(p[0], p[1], p[2]); }
async function runFx(att, tgt, mv, hit) {
  const kind = FXK[mv[1]] || 'tackle', col = TCOL[mv[2]];
  const dx0 = tgt.x - att.x, dz0 = tgt.z - att.z, dist = Math.hypot(dx0, dz0) || 1, ux = dx0 / dist, uz = dz0 / dist;
  let hitDone = false; const doHit = () => { if (!hitDone) { hitDone = true; hit(); } };
  const lunge = (k, reach) => { att.ox = ux * reach * k; att.oz = uz * reach * k; };
  const jig = (amp, k) => { tgt.ox = Math.sin(k * 60) * amp; tgt.oz = Math.cos(k * 53) * amp * 0.6; };
  const reset = () => { att.ox = att.oz = tgt.ox = tgt.oz = 0; att.jump = 0; };
  const reach = Math.max(0.4, dist - 0.9);
  const lerp3 = (A, B, k) => [mix(A[0], B[0], k), mix(A[1], B[1], k), mix(A[2], B[2], k)];
  switch (kind) {
    case 'tackle': {
      await tween(780, (k) => { const q = k < 0.28 ? -0.3 * (k / 0.28) : k < 0.52 ? -0.3 + 1.3 * ((k - 0.28) / 0.24) : 1 - ((k - 0.52) / 0.48); lunge(q, reach); if (k > 0.52) doHit(); });
      break; }
    case 'peck': {
      await tween(780, (k) => { const q = Math.max(0, Math.sin(k * Math.PI * 3)); lunge(q, reach); att.rig.root.rotation.x = q * 0.5; if (k > 0.16) doHit(); if (k > 0.5 && k < 0.52) burst(tgt.x, 0.3, tgt.z, '#fff', 4); });
      att.rig.root.rotation.x = 0; break; }
    case 'claw': {
      const sl = [fxCube('#ffffff', 0.12, 1.1, 0.12), fxCube(col, 0.1, 0.9, 0.1)]; sl.forEach((m, n) => { m.rotation.y = yaw; m.rotation.z = n ? -0.9 : 0.9; m.visible = false; });
      await tween(800, (k) => { lunge(k < 0.3 ? k / 0.3 * 0.7 : k < 0.8 ? 0.7 : 0.7 * (1 - (k - 0.8) / 0.2), reach); const P = fxPos(tgt, 0.55);
        sl.forEach((m, n) => { const s0 = 0.35 + n * 0.2; m.visible = k > s0 && k < s0 + 0.2; setAt(m, [P[0] + (n ? 0.15 : -0.15), P[1], P[2]]); m.scale.y = (n ? 0.9 : 1.1) * Math.min(1, (k - s0) / 0.1); });
        if (k > 0.38) doHit(); });
      break; }
    case 'bite': {
      const top = fxCube('#ffffff', 0.8, 0.2, 0.35), bot = fxCube('#ffffff', 0.8, 0.2, 0.35);
      await tween(800, (k) => { lunge(k < 0.4 ? k / 0.4 * 0.8 : k < 0.75 ? 0.8 : 0.8 * (1 - (k - 0.75) / 0.25), reach); const P = fxPos(tgt, 0.4), op = k < 0.5 ? 0.6 * (1 - k / 0.5) : 0; setAt(top, [P[0], P[1] + 0.12 + op, P[2]]); setAt(bot, [P[0], P[1] - 0.12 - op, P[2]]); top.rotation.y = bot.rotation.y = yaw; top.visible = bot.visible = k > 0.1 && k < 0.75; if (k > 0.5) { doHit(); jig(0.05, k); } });
      break; }
    case 'pounce': {
      const A = [att.x, att.z];
      await tween(850, (k) => { const q = k < 0.2 ? -0.2 * (k / 0.2) : k < 0.7 ? -0.2 + 1.2 * ((k - 0.2) / 0.5) : 1 - ((k - 0.7) / 0.3); lunge(q, reach); att.jump = 0; att.oy = k > 0.2 && k < 0.75 ? Math.sin((k - 0.2) / 0.55 * Math.PI) * 1.2 : 0; if (k > 0.7) doHit(); if (k > 0.7 && k < 0.72) burst(tgt.x, 0.2, tgt.z, '#d9c9a3', 6); });
      att.oy = 0; break; }
    case 'leaf': case 'leafstorm': {
      const N = kind === 'leaf' ? 9 : 16, L = []; for (let n = 0; n < N; n++) L.push(fxCube(n % 3 ? col : '#b8f070', 0.18, 0.05, 0.28));
      await tween(kind === 'leaf' ? 850 : 1250, (k) => { const A = fxPos(att, 0.6), B = fxPos(tgt, 0.5);
        L.forEach((m, n) => { if (kind === 'leaf') { const kk = Math.min(1, Math.max(0, k * 1.5 - n * 0.06)), P = lerp3(A, B, kk), r = 0.5 * Math.sin(kk * Math.PI); setAt(m, [P[0] + Math.cos(kk * 14 + n) * r * 0.5, P[1] + Math.sin(kk * 14 + n) * r, P[2] + Math.cos(kk * 12 + n) * r * 0.3]); m.visible = kk > 0 && kk < 1; }
          else { const ang = k * 9 + n * 0.8, r = 0.35 + (n % 4) * 0.22 + 0.4 * Math.sin(k * 3), y = 0.1 + ((n * 0.37 + k * 1.5) % 1.6); setAt(m, [B[0] + Math.cos(ang) * r, B[1] - 0.4 + y, B[2] + Math.sin(ang) * r]); m.visible = k > 0.1 && k < 0.92; }
          m.rotation.x = k * 10 + n; m.rotation.y += 0.2; });
        if (kind === 'leaf' ? k > 0.8 : k > 0.35) { doHit(); jig(kind === 'leaf' ? 0.06 : 0.1, k); } if (kind === 'leafstorm' && k > 0.35 && k < 0.4) shakeCam(500, 0.18); });
      break; }
    case 'rock': case 'rockfall': {
      if (kind === 'rock') {
        const r = fxCube('#8a7a60', 0.38); const r2 = fxCube('#6e6048', 0.22);
        await tween(950, (k) => { att.oy = k < 0.3 ? Math.sin(k / 0.3 * Math.PI) * 0.5 : 0; const A = fxPos(att, 0.7), B = fxPos(tgt, 0.4), kk = Math.min(1, Math.max(0, (k - 0.3) / 0.55)), P = lerp3(A, B, kk); setAt(r, [P[0], P[1] + Math.sin(kk * Math.PI) * 1.3, P[2]]); r.rotation.x = k * 12; r.visible = k > 0.25 && k < 0.85; setAt(r2, [P[0] + 0.2, P[1] + Math.sin(kk * Math.PI) * 1.3 + 0.15, P[2]]); r2.visible = r.visible; if (k > 0.85) doHit(); });
        att.oy = 0;
      } else {
        const R = []; for (let n = 0; n < 6; n++) R.push(fxCube(n % 2 ? '#8a7a60' : '#6e6048', 0.3 + (n % 3) * 0.1));
        await tween(1150, (k) => { const B = fxPos(tgt, 0); R.forEach((m, n) => { const s0 = 0.05 + n * 0.1, kk = Math.min(1, Math.max(0, (k - s0) / 0.3)); setAt(m, [B[0] + Math.cos(n * 1.9) * 0.6, B[1] + 2.4 * (1 - kk * kk) + 0.15, B[2] + Math.sin(n * 1.9) * 0.6]); m.rotation.x = kk * 5 + n; m.visible = k > s0 && !(kk >= 1 && k > s0 + 0.5); if (kk >= 1 && kk < 1.01 && !m.userData.b) { m.userData.b = 1; burst(m.position.x, 0.2, m.position.z, '#9a8a70', 5); } }); if (k > 0.42) { doHit(); jig(0.07, k); } if (k > 0.4 && k < 0.45) shakeCam(450, 0.22); });
      }
      break; }
    case 'water': {
      const D = []; for (let n = 0; n < 12; n++) D.push(fxCube(n % 3 ? col : '#bfe8ff', 0.2));
      await tween(900, (k) => { const A = fxPos(att, 0.55), B = fxPos(tgt, 0.4); D.forEach((m, n) => { const kk = Math.min(1, Math.max(0, k * 1.6 - n * 0.05)), P = lerp3(A, B, kk); setAt(m, [P[0], P[1] + Math.sin(kk * Math.PI) * 0.35 + Math.sin(n) * 0.06, P[2] + Math.cos(n * 2) * 0.08]); m.visible = kk > 0 && kk < 1; }); if (k > 0.7) { doHit(); jig(0.05, k); } if (k > 0.7 && k < 0.73) burst(tgt.x, 0.5, tgt.z, '#bfe8ff', 10); });
      break; }
    case 'wave': {
      const wv = fxCube(col, 2.6, 0.9, 0.55), fo = []; for (let n = 0; n < 8; n++) fo.push(fxCube('#e8f8ff', 0.22));
      await tween(1300, (k) => { const A = fxPos(att, 0.1), B = fxPos(tgt, 0.1), kk = Math.min(1, Math.max(0, (k - 0.15) / 0.6)), P = lerp3(A, B, kk), h = 0.3 + 0.9 * Math.sin(Math.min(1, k * 1.2) * Math.PI * 0.8);
        setAt(wv, [P[0], P[1] + h * 0.5, P[2]]); wv.scale.set(2.6, h, 0.55); wv.rotation.y = Math.atan2(ux, uz) + Math.PI / 2; wv.visible = k > 0.1 && k < 0.92;
        fo.forEach((m, n) => { setAt(m, [P[0] + (n - 3.5) * 0.3 * Math.cos(Math.atan2(ux, uz)), P[1] + h + 0.05 + Math.sin(k * 20 + n) * 0.08, P[2] - (n - 3.5) * 0.3 * Math.sin(Math.atan2(ux, uz))]); m.visible = wv.visible; });
        if (k > 0.72) { doHit(); jig(0.1, k); } if (k > 0.72 && k < 0.75) { burst(tgt.x, 0.5, tgt.z, '#bfe8ff', 18); shakeCam(550, 0.26); } });
      break; }
    case 'sound': {
      const rings = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.82, 1, 20), new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide, transparent: true })); m.rotation.y = Math.atan2(ux, uz); world.add(m); fxList.push(m); return m; });
      await tween(1000, (k) => { att.rig.root.rotation.x = -0.35 * Math.sin(Math.min(1, k * 2) * Math.PI / 2); const A = fxPos(att, 0.55), B = fxPos(tgt, 0.5);
        rings.forEach((m, n) => { const kk = Math.min(1, Math.max(0, k * 1.5 - n * 0.14)), P = lerp3(A, B, kk); setAt(m, P); m.scale.setScalar(0.25 + kk * 1.1); m.material.opacity = 1 - kk * 0.6; m.visible = kk > 0 && kk < 1; });
        if (k > 0.55) { doHit(); jig(0.08, k); } });
      att.rig.root.rotation.x = 0; break; }
    case 'fire': case 'fireblast': {
      const big = kind === 'fireblast', F = []; for (let n = 0; n < (big ? 5 : 11); n++) F.push(fxCube(['#ff5a1a', '#ffb02a', '#fff1a0'][n % 3], big ? 0.55 - n * 0.06 : 0.22));
      await tween(big ? 1150 : 900, (k) => { const A = fxPos(att, 0.55), B = fxPos(tgt, 0.45); F.forEach((m, n) => { const kk = Math.min(1, Math.max(0, (big ? k * 1.35 : k * 1.6) - n * (big ? 0.07 : 0.05))), P = lerp3(A, B, kk); setAt(m, [P[0] + (R0() - 0.5) * 0.12, P[1] + Math.sin(kk * Math.PI) * 0.2 + (R0() - 0.5) * 0.1, P[2] + (R0() - 0.5) * 0.12]); m.rotation.set(R0() * 3, R0() * 3, R0() * 3); m.visible = kk > 0 && kk < 1; });
        if (k > (big ? 0.72 : 0.68)) { doHit(); jig(0.06, k); } if (k > 0.68 && k < 0.72) { burst(tgt.x, 0.5, tgt.z, '#ff7a2a', big ? 26 : 12); if (big) shakeCam(550, 0.28); } });
      break; }
    case 'fight': {
      const S = []; for (let n = 0; n < 5; n++) S.push(fxCube(n % 2 ? '#fff3a0' : col, 0.28));
      await tween(1000, (k) => { lunge(k < 0.25 ? k / 0.25 * 0.85 : k < 0.85 ? 0.85 : 0.85 * (1 - (k - 0.85) / 0.15), reach); const B = fxPos(tgt, 0.45), n = Math.floor((k - 0.25) / 0.12);
        S.forEach((m, i) => { m.visible = n === i && k > 0.25 && k < 0.85; setAt(m, [B[0] + Math.cos(i * 2.3) * 0.35, B[1] + Math.sin(i * 1.7) * 0.3, B[2] + Math.sin(i * 2.3) * 0.25]); m.rotation.set(i, i * 2, i * 3); });
        if (k > 0.28) { doHit(); jig(0.08, k * 2); } if (k > 0.28 && k < 0.85 && ((k * 100) | 0) % 12 === 0) burst(tgt.x, 0.5, tgt.z, '#fff3a0', 2); });
      break; }
    case 'beam': {
      const bm = fxCube('#fff6b0', 1, 0.2, 0.2), core = fxCube('#ffffff', 1, 0.09, 0.09);
      await tween(1000, (k) => { const A = fxPos(att, 0.6), B = fxPos(tgt, 0.5), len = Math.hypot(B[0] - A[0], B[2] - A[2]), on = k > 0.25 && k < 0.8, w = 0.2 + 0.12 * Math.sin(k * 40);
        [bm, core].forEach((m, n) => { setAt(m, [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, (A[2] + B[2]) / 2]); m.rotation.y = Math.atan2(ux, uz) + Math.PI / 2; m.scale.set(len, (n ? 0.09 : w), (n ? 0.09 : w)); m.visible = on; });
        if (k > 0.3) { doHit(); jig(0.04, k); } if (k > 0.3 && k < 0.33) shakeCam(450, 0.14); });
      break; }
    case 'ice': {
      const I = []; for (let n = 0; n < 7; n++) I.push(fxCube(n % 2 ? '#d8f6ff' : col, 0.18, 0.55, 0.18));
      await tween(1100, (k) => { const B = fxPos(tgt, 0); I.forEach((m, n) => { const s0 = 0.05 + n * 0.08, kk = Math.min(1, Math.max(0, (k - s0) / 0.25)); setAt(m, [B[0] + Math.cos(n * 2.1) * 0.5, B[1] + 2.2 * (1 - kk) + 0.3, B[2] + Math.sin(n * 2.1) * 0.5]); m.visible = k > s0 && k < 0.9; });
        if (k > 0.4) { doHit(); jig(0.05, k); } if (k > 0.4 && k < 0.44) burst(tgt.x, 0.4, tgt.z, '#d8f6ff', 14); });
      break; }
  }
  doHit(); reset();
}
const xpFor = (w) => Math.round((14 + w.lv * 5) * (w.rare ? 2 : 1));
function gainXp(m, amt) {
  const ups = [], learned = []; if (m.lv >= LVCAP) return { ups, learned };
  m.xp += amt;
  while (m.lv < LVCAP && m.xp >= xpNeed(m.lv)) { m.xp -= xpNeed(m.lv); m.lv++; const old = m.hpMax; m.hpMax = hpMaxOf(m.sp, m.st, m.lv); m.hp = Math.min(m.hpMax, m.hp + m.hpMax - old); ups.push(m.lv); MAI[m.sp].ls.filter((x) => x[0] === m.lv).forEach((x) => learned.push(x[1])); }
  return { ups, learned };
}
async function round(i) {
  if (!battle || battle.busy) return; battle.busy = true; setMovesEnabled(false);
  const { w, me } = battle, mvA = curMoves(me)[i], wk = curMoves(w), mvB = wk[(R0() * wk.length) | 0];
  const a = calcDmg(me, mvA, w), b = calcDmg(w, mvB, me);
  const mkHit = (def, mv, r) => () => { burst(def.x, 0.45, def.z, TCOL[mv[2]], 14); def.hp -= r.dmg; def.shake = 0.4; flash(def, 0.7); floatText(`-${r.dmg}`, def.x, 1.1, def.z, '#d8452e'); hpBar($('hpL'), me); hpBar($('hpR'), w); setTimeout(() => flash(def, 0), 260); if (r.mult > 1) floatText('⭐', def.x, 1.6, def.z); };
  const sA = speedOf(me), sB = speedOf(w), meFirst = sA === sB ? R0() < 0.5 : sA > sB;
  const doMe = async () => { say(`${me.name} pakai ${mvA[1]}!`, 1300); await sleep(220); await runFx(me, w, mvA, mkHit(w, mvA, a)); fxClear(); if (a.mult > 1) say('Ampuh banget! ⭐', 700); else if (a.mult < 1) say('Kurang ampuh… 💤', 700); };
  const doFoe = async () => { say(`${w.name} pakai ${mvB[1]}!`, 1300); await sleep(220); await runFx(w, me, mvB, mkHit(me, mvB, b)); fxClear(); if (b.mult > 1) say('Aduh, ampuh! ⭐', 700); else if (b.mult < 1) say('Tidak terlalu sakit 💤', 700); };
  say(`⚡ ${meFirst ? me.name : w.name} lebih cepat!`, 900); await sleep(650);
  if (meFirst) { await doMe(); await sleep(250); await doFoe(); } else { await doFoe(); await sleep(250); await doMe(); }
  await sleep(750);
  if (w.hp <= 0) return endBattle('win'); if (me.hp <= 0) return endBattle('lose');
  battle.busy = false; setMovesEnabled(true); say('Pilih jurus!', 900);
}
async function endBattle(res) {
  const { w, me } = battle; $('battle').style.display = 'none'; logEl.style.opacity = 0;
  if (res === 'win') {
    battle = null; w.hp = 0; me.state = 'follow'; mode = 'feed'; Music.play(CITY); Music.jingle('win'); talk = w; w.state = 'face'; camGoal.set(w.x, 0.3, w.z); zoomGoal = 0.45;
    const xp = xpFor(w), msgs = [`${me.name} dapat ${xp} XP!`];
    mates.forEach((m, i) => { const r = gainXp(m, i === 0 ? xp : Math.floor(xp / 2)); r.ups.forEach((l) => msgs.push(`⬆️ ${m.name} naik ke Lv ${l}!`)); r.learned.forEach((n) => msgs.push(`📘 ${m.name} belajar jurus ${n}!`)); if (r.ups.length) burst(m.x, 0.6, m.z, '#ffe066', 22); });
    for (const t of msgs) { toast(t, 1.7); await sleep(1500); if (mode !== 'feed') return; }
    toast(w.rare ? `✨ ${w.name} langka ini! Jangan sampai lepas!` : `${w.name} kecapekan dan lapar!`, 2); showFeed(w); saveGame();
  } else {
    Music.play(CITY); Music.jingle('lose'); toast(`${me.name} kecapekan… bawa ke Klinik Maimon 🩷`, 2.8); me.hp = Math.max(1, Math.round(me.hpMax * 0.3)); w.hp = w.hpMax; battle = null; me.state = 'follow'; w.state = 'wander'; w.tgt = null; w.wait = 2; leaveEncounter(6);
  }
}
function flee() { if (!battle || battle.busy) return; const { w, me } = battle; Music.play(CITY); $('battle').style.display = 'none'; logEl.style.opacity = 0; me.state = 'follow'; w.state = 'wander'; w.hp = w.hpMax; w.tgt = [w.x + (w.x - player.x) * 2, w.z + (w.z - player.z) * 2]; battle = null; toast('Kabur dulu!', 1.2); leaveEncounter(4); }
function leaveEncounter(cd) { saveGame(); restoreArena(); pitch = 0.66; mode = 'play'; talk = null; cooldown = T + cd; zoomGoal = 1; $('joy').style.display = ''; $('panel').style.display = 'none'; if (mates[0]) mates[0].state = 'follow'; }

/* ---------- kasih makan setelah menang ---------- */
const foodsEl = $('foods'), foodBtn = {};
FOODS.forEach(([id, name, em]) => { const b = document.createElement('button'); b.onclick = () => feed(id); foodBtn[id] = b; foodsEl.appendChild(b); });
function refreshFoods() { FOODS.forEach(([id, name, em]) => { const b = foodBtn[id], n = bagN(id); b.innerHTML = `<span class="e">${em}</span>${name}<small>x${n}</small>`; b.classList.toggle('none', n === 0); }); }
function showFeed(w) { $('ptitle').textContent = `Kasih ${w.name} makan apa?`; refreshFoods(); $('phint').textContent = bagN(w.fav) === 0 ? `Tasmu belum ada makanan favorit ${w.name} (${FOOD[w.fav][2]}). ${FOODWHERE[w.fav]}, lalu ajak ${w.name} battle lagi.` : ''; $('panel').style.display = 'block'; }
function feed(id) {
  if (!talk || mode !== 'feed') return; const w = talk;
  if (bagN(id) === 0) { toast(`Belum punya ${FOOD[id][1]}. ${FOODWHERE[id]}`, 2.4); return; }
  if (id === w.fav) {
    useBag(id); $('panel').style.display = 'none'; wilds.splice(wilds.indexOf(w), 1); const full = mates.length >= MAXP;
    if (!full) { w.state = 'follow'; w.pop = 0; w.hp = w.hpMax; mates.push(w); addChip(w); } else { stash.push({ sp: w.sp, st: w.st, hp: w.hpMax, lv: w.lv, xp: w.xp }); world.remove(w.rig.root); }
    markDex(w.sp, 2); if (S.stage === 2 && commonsCaught() >= 3) { S.stage = 3; setTimeout(() => toast('Data lengkap! Lapor ke Prof. Catherine 🎓', 3), 2800); } saveGame(); burst(w.x, 0.6, w.z); Music.jingle('catch');
    toast(full ? `Yeay! ${w.name} tertangkap! Tim penuh, dititip di Rumah Kos 🏠` : `Yeay! ${w.name} ikut kamu! 🎉`, 3); respawns.push({ t: T + (w.rare ? 150 : 25), sp: w.sp, st: w.st, hx: w.hx, hz: w.hz }); leaveEncounter(2);
  } else { w.shake = 0.6; toast('Hmm… bukan itu 🤔 coba yang lain!', 1.4); }
}
$('skip').onclick = () => { if (!talk) return; const w = talk; w.hp = w.hpMax; w.state = 'wander'; w.tgt = [w.x + (w.x - player.x) * 2, w.z + (w.z - player.z) * 2]; leaveEncounter(5); };

/* =====================================================================
   INPUT: joystick, keyboard, geser untuk putar kamera
   ===================================================================== */
const joy = { x: 0, y: 0 }, keys = {};
{
  const base = $('joy'), knob = $('knob'); let pid = null;
  const set = (e) => { const r = base.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = e.clientX - cx, dy = e.clientY - cy; const m = 46, d = Math.hypot(dx, dy); if (d > m) { dx = dx / d * m; dy = dy / d * m; } knob.style.transform = `translate(${dx}px,${dy}px)`; joy.x = dx / m; joy.y = dy / m; };
  base.addEventListener('pointerdown', (e) => { pid = e.pointerId; base.setPointerCapture(pid); set(e); });
  base.addEventListener('pointermove', (e) => { if (e.pointerId === pid) set(e); });
  const end = (e) => { if (e.pointerId === pid) { pid = null; joy.x = joy.y = 0; knob.style.transform = ''; } };
  base.addEventListener('pointerup', end); base.addEventListener('pointercancel', end);
  addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; }); addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => { drag = { id: e.pointerId, x: e.clientX }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { if (drag && e.pointerId === drag.id && mode === 'play') { yaw -= (e.clientX - drag.x) * 0.008; drag.x = e.clientX; } });
  const dend = (e) => { if (drag && e.pointerId === drag.id) drag = null; };
  canvas.addEventListener('pointerup', dend); canvas.addEventListener('pointercancel', dend);
}

/* =====================================================================
   PENGIKUT (jejak posisi pemain)
   ===================================================================== */
const trail = [];
function updateMates(dt) {
  mates.forEach((m, i) => {
    m.pop += dt; m.shake = Math.max(0, m.shake - dt); m.jump = Math.max(0, m.jump - dt);
    if (m.state === 'follow') {
      const t = trail.length ? trail[Math.max(0, trail.length - 1 - (i + 1) * 6)] : [player.x, player.z];
      const dx = t[0] - m.x, dz = t[1] - m.z, d = Math.hypot(dx, dz);
      if (d > 0.08) { const s = Math.min(d, 4.2 * dt * (0.6 + d)); m.x += dx / d * s; m.z += dz / d * s; m.ang = lerpAng(m.ang, Math.atan2(dx, dz), Math.min(1, dt * 10)); m.walk = true; }
      else m.walk = false;
    } else if (m.state === 'battle') {
      m.x += (m.bx - m.x) * Math.min(1, dt * 5); m.z += (m.bz - m.z) * Math.min(1, dt * 5); m.walk = false;
    }
    placeEnt(m, dt); animRig(m.rig, T + m.rig.off, m.walk);
  });
}

