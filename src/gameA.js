
const CITY = 'depok';
/* =====================================================================
   DATA: tipe, jurus, spesies, makanan
   ===================================================================== */
const TCOL = { Api: '#e8582a', Air: '#3b8fd6', Daun: '#4fae4f', Suara: '#b07ad8', Batu: '#9a8a70', Bayangan: '#5a4f7c', Biasa: '#9a9a9a', Cahaya: '#e0b830', Es: '#6cc4e0' };
/* 6 tipe: dua segitiga. Air>Api>Daun>Air · Suara>Batu>Bayangan>Suara · lintas segitiga netral */
const BEATS = { Air: ['Api'], Api: ['Daun'], Daun: ['Air'], Suara: ['Batu'], Batu: ['Bayangan'], Bayangan: ['Suara'] };
const tyOf = (e) => (e.type2 ? [e.type, e.type2] : [e.type]);
const typeMult1 = (a, d) => a === 'Biasa' || d === 'Biasa' ? 1 : (BEATS[a] || []).includes(d) ? 1.6 : (BEATS[d] || []).includes(a) ? 0.7 : 1;
/* def = Maimon (bisa tipe ganda): kalikan tiap tipe, batasi 0,5-2,0 */
const typeMult = (att, def) => clamp(tyOf(def).reduce((m, t) => m * typeMult1(att, t), 1), 0.5, 2);
const chips = (e) => tyOf(e).map((t) => `<span class="chip" style="background:${TCOL[t]}">${t}</span>`).join('');
const FOODS = [['timun', 'Timun', '🥒'], ['kangkung', 'Kangkung', '🥬'], ['jagung', 'Jagung', '🌽'], ['ikan', 'Ikan', '🐟'], ['kacang', 'Kacang', '🥜'], ['wortel', 'Wortel', '🥕']];
const FOOD = Object.fromEntries(FOODS.map((f) => [f[0], f]));
const MAI = {
  kancik: { info: { cat: 'Maimon Kancil', desc: 'Kancil kecil yang cerdik. Suka petak umpet di semak taman. Kalau ada timun segar, matanya langsung berbinar!', hab: 'Hutan UI & sekitar Margonda', ht: '0,5 m', wt: '4 kg', emo: '🦌' }, n: ['Kancik', 'Kancilon'], spd: 60, type: 'Daun', fav: 'timun', hp: [46, 74], animal: 'kancil', build: (st) => buildKancik(st), s: 0.66,
    ls: [[1,'Seruduk','Biasa',40],[4,'Daun Tajam','Daun',55],[8,'Lempar Batu','Batu',55],[13,'Daun Badai','Daun',80]] },
  cebongi: { info: { cat: 'Maimon Kecebong', desc: 'Kecebong ceria yang tinggal dekat Kali Ciliwung. Ia suka menyemprotkan air untuk menyapa teman.', hab: 'Tepi kali & danau UI', ht: '0,3 m', wt: '2 kg', emo: '🐸' }, n: ['Cebongi', 'Kodi'], spd: 50, type: 'Air', fav: 'kangkung', hp: [46, 74], animal: 'kecebong', build: (st) => buildCebongi(st), s: 0.66,
    ls: [[1,'Sundul','Biasa',40],[4,'Semprot Air','Air',55],[8,'Kuak Keras','Suara',55],[13,'Ombak Besar','Air',80]] },
  pioyo: { info: { cat: 'Maimon Anak Ayam', desc: 'Anak ayam pemberani. Kokoknya yang nyaring membangunkan seisi kampung di pagi hari.', hab: 'Kampung & Depok Lama', ht: '0,3 m', wt: '1 kg', emo: '🐥' }, n: ['Pioyo', 'Petokar'], spd: 70, type: 'Api', fav: 'jagung', hp: [46, 74], animal: 'anak ayam', build: (st) => buildPioyo(st), s: 0.66,
    ls: [[1,'Patuk','Biasa',40],[4,'Kokok Api','Api',55],[8,'Cakar Jago','Biasa',55],[13,'Api Jago','Api',80]] },
  kucingko: { info: { cat: 'Maimon Kucing', desc: 'Kucing santai yang suka berjemur di pinggir jalan. Meongnya keras sekali kalau sedang lapar.', hab: 'Pinggir Margonda', ht: '0,4 m', wt: '3 kg', emo: '🐱' }, n: ['Kucingko'], spd: 80, type: 'Suara', fav: 'ikan', hp: [34], animal: 'kucing', build: () => buildQuad(SPEC.kucingko), s: 0.66, ls: [[1,'Cakar','Biasa',40],[3,'Meong Keras','Suara',50],[8,'Loncat Lincah','Biasa',55],[13,'Mata Bersinar','Cahaya',60]] },
  tikusil: { info: { cat: 'Maimon Tikus', desc: 'Tikus mungil yang pandai menyembunyikan kacang. Giginya kuat mengerat batu kecil.', hab: 'Dekat Stasiun Depok Baru', ht: '0,2 m', wt: '1 kg', emo: '🐭' }, n: ['Tikusil'], spd: 75, type: 'Batu', fav: 'kacang', hp: [30], animal: 'tikus', build: () => buildQuad(SPEC.tikusil), s: 0.66, ls: [[1,'Gigit','Biasa',40],[3,'Lempar Kerikil','Batu',50],[9,'Cicit Nyaring','Suara',55],[14,'Longsor Mini','Batu',75]] },
  dombanyo: { info: { cat: 'Maimon Domba', desc: 'Domba berbulu tebal yang suka mengunyah rumput di kebun belimbing. Bulunya hangat dipeluk.', hab: 'Kebun belimbing', ht: '0,6 m', wt: '12 kg', emo: '🐑' }, n: ['Dombanyo'], spd: 40, type: 'Daun', fav: 'wortel', hp: [38], animal: 'domba', build: () => buildQuad(SPEC.dombanyo), s: 0.66, ls: [[1,'Seruduk','Biasa',40],[3,'Rumput Tajam','Daun',50],[9,'Wol Beku','Es',55],[14,'Hujan Daun','Daun',75]] },
};

/* ---------- EVOLUSI: data (level 16 & 33), sprite dari evo.js ---------- */
(function evoData() {
  const E = {
    kancik: { n: ['Kancik', 'Kancilon', 'Kancilraja'], hp: [46, 74, 120], evo: [16, 33], t2: { 3: 'Batu' }, ls: [[20, 'Badai Rimba', 'Daun', 95], [34, 'Raja Hutan', 'Daun', 125]], b: (st) => evoBuild('kancik', st) || buildKancik(st) },
    cebongi: { n: ['Cebongi', 'Kodi', 'Katakraya'], hp: [46, 74, 120], evo: [16, 33], t2: { 3: 'Cahaya' }, ls: [[20, 'Tombak Air', 'Air', 95], [34, 'Tsunami Raja', 'Air', 125]], b: (st) => evoBuild('cebongi', st) || buildCebongi(st) },
    pioyo: { n: ['Pioyo', 'Petokar', 'Jagoapi'], hp: [46, 74, 120], evo: [16, 33], t2: { 3: 'Cahaya' }, ls: [[20, 'Cakar Api', 'Api', 95], [34, 'Ledakan Feniks', 'Api', 125]], b: (st) => evoBuild('pioyo', st) || buildPioyo(st) },
    kucingko: { n: ['Kucingko', 'Macanko'], hp: [34, 62], evo: [16], ls: [[18, 'Terkam Macan', 'Biasa', 85], [26, 'Raungan', 'Suara', 95]], b: (st) => st >= 2 ? evoBuild('kucingko', 2) : buildQuad(SPEC.kucingko) },
    tikusil: { n: ['Tikusil', 'Tikusgar'], hp: [30, 58], evo: [16], ls: [[18, 'Bor Batu', 'Batu', 85], [26, 'Gempa Mini', 'Batu', 95]], b: (st) => st >= 2 ? evoBuild('tikusil', 2) : buildQuad(SPEC.tikusil) },
    dombanyo: { n: ['Dombanyo', 'Gembulon'], hp: [38, 70], evo: [16], t2: { 2: 'Cahaya' }, ls: [[18, 'Tanduk Emas', 'Biasa', 85], [26, 'Taman Ajaib', 'Daun', 95]], b: (st) => st >= 2 ? evoBuild('dombanyo', 2) : buildQuad(SPEC.dombanyo) },
  };
  Object.keys(E).forEach((k) => { const e = E[k], d = MAI[k]; d.n = e.n; d.hp = e.hp; d.evo = e.evo; d.t2 = e.t2 || null; d.build = e.b; d.ls = d.ls.concat(e.ls); });
})();
const canEvolve = (m) => { const d = MAI[m.sp]; return !!(d.evo && m.st <= d.evo.length && m.st < d.n.length && m.lv >= d.evo[m.st - 1]); };

/* =====================================================================
   ENTITAS: pemain, Maimon liar, teman
   ===================================================================== */
const player = { rig: null, x: 1.6, z: 11.6, ang: Math.PI, walk: false, ox: 0, oz: 0 };
const wilds = [], mates = [], respawns = [], stash = [], MAXP = 3;
const LVCAP = 99, xpNeed = (lv) => Math.round((2 + 0.00454 * (lv - 1) * (lv - 1)) * (10 + 4 * lv)); /* ±jumlah battle per level × XP per battle */
/* level minimal untuk menantang kepala gym (Maimon terkuat di tim) — gym 1..9 */
const GYM_MINLV = [20, 30, 40, 50, 60, 70, 80, 90, 99];
const gymTopLv = () => mates.reduce((a, m) => Math.max(a, m.lv), 0);
const gymReady = (n) => gymTopLv() >= GYM_MINLV[n - 1];
const speedOf = (e) => Math.round(MAI[e.sp].spd * (0.7 + 0.06 * e.lv));
const hpMaxOf = (sp, st, lv = 5) => Math.round(MAI[sp].hp[Math.min(st, MAI[sp].hp.length) - 1] * (0.6 + 0.08 * lv));
const movesAt = (sp, lv) => MAI[sp].ls.filter((m) => m[0] <= lv).slice(-4);
const FXK = { 'Seruduk': 'tackle', 'Sundul': 'tackle', 'Patuk': 'peck', 'Cakar': 'claw', 'Gigit': 'bite', 'Daun Tajam': 'leaf', 'Rumput Tajam': 'leaf', 'Daun Badai': 'leafstorm', 'Hujan Daun': 'leafstorm', 'Lempar Batu': 'rock', 'Lempar Kerikil': 'rock', 'Longsor Mini': 'rockfall', 'Semprot Air': 'water', 'Ombak Besar': 'wave', 'Kuak Keras': 'sound', 'Meong Keras': 'sound', 'Cicit Nyaring': 'sound', 'Kokok Api': 'fire', 'Api Jago': 'fireblast', 'Cakar Jago': 'fight', 'Loncat Lincah': 'pounce', 'Mata Bersinar': 'beam', 'Wol Beku': 'ice' };
Object.assign(FXK, { 'Badai Rimba': 'leafstorm', 'Raja Hutan': 'leafstorm', 'Tombak Air': 'water', 'Tsunami Raja': 'wave', 'Cakar Api': 'fight', 'Ledakan Feniks': 'fireblast', 'Terkam Macan': 'pounce', 'Raungan': 'sound', 'Bor Batu': 'rock', 'Gempa Mini': 'rockfall', 'Tanduk Emas': 'tackle', 'Taman Ajaib': 'leaf' });
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
  return { sp, st, lv, xp, rig, d, name: d.n[Math.min(st, d.n.length) - 1], type: d.type, type2: (d.t2 && d.t2[st]) || d.type2, fav: d.fav, x, z, ang: R0() * 6.28, ox: 0, oz: 0, hp: hpMax, hpMax, tgt: null, wait: R0() * 2, walk: false, state: 'wander', shake: 0, pop: 0.4, rad: 3.2, hx: x, hz: z, jump: 0, fade: 1, sc: rig.size * d.s * 0.8 };
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
/* ATURAN: Maimon liar tidak boleh mendekati NPC luar-ruang dalam radius NPC_SAFE petak */
const NPC_SAFE = 5;
const npcDist = (x, z) => { let d = 1e9, n0 = null; for (const n of npcs) { if (n.x > 20 && n.z > 20) continue; const q = Math.hypot(n.x - x, n.z - z); if (q < d) { d = q; n0 = n; } } return [d, n0]; };
function pushFromNPC(x, z) { const [d, n] = npcDist(x, z); if (!n || d >= NPC_SAFE) return [x, z]; const k = d < 1e-3 ? 0 : 1 / d, ux = d < 1e-3 ? 1 : (x - n.x) * k, uz = d < 1e-3 ? 0 : (z - n.z) * k; return [n.x + ux * (NPC_SAFE + 0.4), n.z + uz * (NPC_SAFE + 0.4)]; }
function trySpawn(sp, st, x, z, la = 0) { if (isRare(sp, st) && R0() > RARE_CHANCE * (st === 2 ? 0.4 : 1)) { respawns.push({ t: T + 120 + R0() * 60, sp, st, hx: x, hz: z, la }); return null; } return spawnWild(sp, st, x, z, la); }
function spawnWild(sp, st, hx, hz, la = 0) {
  [hx, hz] = pushFromNPC(hx, hz); const [x, z] = freeSpot(hx, hz, 0.4), rare = isRare(sp, st), lv = (st === 2 ? 10 + ((R0() * 3) | 0) : rare ? 6 + ((R0() * 3) | 0) : 3 + ((R0() * 4) | 0)) + la, w = mkMon(sp, st, x, z, lv); w.hx = hx; w.hz = hz; w.la = la; w.rad = sp === 'kancik' ? 3.5 : 2.6; w.rare = isRare(sp, st); w.spark = 0; wilds.push(w); return w;
}
function updateWild(w, dt) {
  if (w.rare && (w.spark -= dt) < 0) { w.spark = 0.7; burst(w.x, 0.5 + R0() * 0.5, w.z, '#fff3a0', 3); }
  w.pop += dt; w.shake = Math.max(0, w.shake - dt); w.jump = Math.max(0, w.jump - dt);
  if (w.state === 'wander') {
    if (w.wait > 0) { w.wait -= dt; w.walk = false; }
    else if (!w.tgt) { const a = R0() * 6.28, rr = R0() * w.rad; w.tgt = pushFromNPC(w.hx + Math.cos(a) * rr, w.hz + Math.sin(a) * rr); }
    else {
      const dx = w.tgt[0] - w.x, dz = w.tgt[1] - w.z, d = Math.hypot(dx, dz);
      if (d < 0.2) { w.tgt = null; w.wait = 1 + R0() * 3; w.walk = false; }
      else { const sp = (w.sp === 'cebongi' ? 1.0 : 1.3) * dt, nx = w.x + dx / d * sp, nz = w.z + dz / d * sp;
        if (blockedAt(nx, nz, 0.35) || (npcDist(nx, nz)[0] < NPC_SAFE && npcDist(nx, nz)[0] <= npcDist(w.x, w.z)[0] + 0.001)) { w.tgt = null; w.wait = 0.4; w.walk = false; } else { w.x = nx; w.z = nz; w.ang = lerpAng(w.ang, Math.atan2(dx, dz), Math.min(1, dt * 8)); w.walk = true; } }
    }
  } else if (w.state === 'face') { w.walk = false; w.ang = lerpAng(w.ang, Math.atan2(player.x - w.x, player.z - w.z), Math.min(1, dt * 8)); }
  placeEnt(w, dt); animRig(w.rig, T + w.rig.off, w.walk);
}

/* =====================================================================
   PIL IH STARTER (di awal) — 1 dari 3
   ===================================================================== */
const starters = [], peds = []; let pickSel = null, sparkT = 0;
const STARTS = [['kancik', 11.7], ['cebongi', 10.4], ['pioyo', 9.1]];
/* ---------- beri nama Maimon (tiap kali dapat Maimon baru) ---------- */
function askNick(m, rec, done) {
  const sp = m.d ? m.d.n[Math.min(m.st, m.d.n.length) - 1] : m.name, back = mode;
  mode = 'cut'; $('joy').style.display = 'none'; $('talk').style.display = 'none';
  $('nickEm').textContent = m.d && m.d.info ? m.d.info.emo : '🐾'; $('nickT').textContent = `Mau kasih nama untuk ${sp}?`;
  const inp = $('nickIn'); inp.value = ''; inp.placeholder = sp; $('nickBox').style.display = 'flex';
  const fin = (ok) => {
    const v = ok ? inp.value.trim().slice(0, 10) : '';
    $('nickBox').style.display = 'none'; inp.blur();
    if (v) { m.nick = v; m.name = v; if (rec) rec.nick = v; Music.blip(988); toast(`Halo, ${v}! 💖`, 1.8); renderChips(); }
    mode = back === 'cut' ? 'play' : back; $('joy').style.display = ''; cooldown = Math.max(cooldown, T + 1.5); saveGame();
    if (done) done();
  };
  $('nickGo').onclick = () => fin(true); $('nickNo').onclick = () => fin(false);
  inp.onkeydown = (e) => { if (e.key === 'Enter') fin(true); };
}
function enterPick() {
  mode = 'pick'; player.rig.root.visible = false;
  STARTS.forEach(([sp, z]) => { const m = mkMon(sp, 1, -5.3, z, 5); m.state = 'display'; m.ang = Math.PI / 2; m.pop = 0; m.sc = m.rig.size * m.d.s * 0.8 * 1.35; m.baseZ = z; starters.push(m); const pd = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.7, 0.08, 16), glow(TCOL[m.type] || '#ffd84a')); pd.position.set(-5.3, groundY(-5.3, z) + 0.04, z); world.add(pd); peds.push(pd); });
  $('pvig').style.display = 'block'; pickSel = null;
  yaw = 0.62; pitch = 0.6; camGoal.set(-5.2 + 1.0, 0.5, 10.4 + 1.5); camTarget.copy(camGoal); zoomGoal = zoom = 0.48;
  const cards = $('cards'); cards.innerHTML = '';
  starters.forEach((m, i) => { const b = document.createElement('div'); b.className = 'card panel'; b.innerHTML = `<b>${m.name}</b>${chips(m)}<div class="fav">suka ${FOOD[m.fav][2]} ${FOOD[m.fav][1]}</div>`; b.onclick = () => selectStarter(i); cards.appendChild(b); });
  $('go').textContent = 'Pilih satu dulu'; $('go').disabled = true; $('pick').style.display = 'flex'; $('joy').style.display = 'none'; $('zone').style.display = 'none'; $('mates').style.display = 'none';
}
function updatePick(dt) {
  if (mode !== 'pick') return;
  if (pickSel == null) { camGoal.set(-4.9, 0.55, 10.4); zoomGoal = innerWidth > innerHeight ? 0.5 : 0.7; yaw = 0.62 + Math.sin(T * 0.5) * 0.3; }
  else { const s = starters[pickSel]; camGoal.set(s.x - 0.1, 0.55, s.z); zoomGoal = 0.3; yaw = lerpAng(yaw, 1.2, Math.min(1, dt * 2.5)); if (T > sparkT) { sparkT = T + 0.28; burst(s.x + (R0() - 0.5) * 0.8, 0.2 + R0() * 0.8, s.z + (R0() - 0.5) * 0.8, TCOL[s.type] || '#ffd84a', 2); } s.jump = Math.max(s.jump, T % 1.4 < 0.05 ? 0.4 : 0); }
  peds.forEach((q, i) => { q.rotation.y += dt * 1.2; q.scale.setScalar(i === pickSel ? 1.15 + Math.sin(T * 5) * 0.06 : 1); });
}
function selectStarter(i) {
  pickSel = i; [...$('cards').children].forEach((c, k) => c.classList.toggle('sel', k === i));
  starters[i].jump = 0.6; starters[i].shake = 0; Music.blip(880); setTimeout(() => Music.blip(1320), 90); burst(starters[i].x, 0.7, starters[i].z, null, 22); $('go').textContent = `Ajak ${starters[i].name}!`; $('go').disabled = false;
}
$('go').onclick = () => {
  if (pickSel == null) return; Music.unlock(); Music.play(CITY); Music.jingle('catch'); const m = starters[pickSel];
  starters.forEach((s, i) => { if (i !== pickSel) { burst(s.x, 0.6, s.z, '#fff3a0'); world.remove(s.rig.root); } });
  starters.length = 0; $('pick').style.display = 'none'; $('pvig').style.display = 'none'; peds.forEach((q) => world.remove(q)); peds.length = 0; camBack = { yaw: 0.62, zoom: 1 };
  m.state = 'follow'; m.sc = m.rig.size * m.d.s * 0.8; m.pop = 0; mates.push(m); m.x = -4.4; m.z = 10.4; m.ang = Math.PI / 2; trail.length = 0;
  player.x = -3.0; player.z = 10.4; player.ang = -Math.PI / 2; player.rig.root.visible = true;
  addChip(m); mode = 'play'; Music.jingle('catch'); pitch = 0.66; yaw = 0.62; zoomGoal = 1; $('joy').style.display = ''; $('zone').style.display = ''; $('mates').style.display = '';
  S.stage = 1; S.tut = 0; S.tf = {}; markDex(m.sp, 2); saveGame();
  askNick(m, null, () => dialog([['Prof. Catherine', `Pilihan bagus! ${m.name} pasti jadi partner yang hebat.`], ['Prof. Catherine', 'Tapi sebelum menangkap Maimon liar, kamu harus belajar dasarnya dulu: melihat Maimon-mu, memancing, memetik hasil kebun, dan membuka Tas.'], ['Prof. Catherine', 'Ikuti titik-titik merah muda di jalan dan lihat bagian TUJUAN di layar. Semangat, Pelatih!']]));
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
const STAT = { burn: { tag: '🔥 Terbakar', em: '🔥', col: '#ff7a2a', dot: 0.08, msg: 'terbakar' }, poison: { tag: '☠️ Keracunan', em: '☠️', col: '#a35bd6', dot: 0.07, msg: 'keracunan' }, dizzy: { tag: '💫 Pusing', em: '💫', col: '#e0b020', dot: 0, msg: 'pusing', fail: 0.4, fm: 'pusing' }, fear: { tag: '😨 Takut', em: '😨', col: '#7a6aa8', dot: 0, msg: 'takut', fail: 0.3, fm: 'ketakutan' } }, STCHANCE = { Api: ['burn', 0.3, 4], Daun: ['poison', 0.3, 4], Suara: ['dizzy', 0.3, 2], Bayangan: ['fear', 0.3, 3] };
function statusFx(e) { if (!e.status || e.hp <= 0) return; const y = 0.45 + R0() * 0.5, ox = (R0() - 0.5) * 0.4; if (e.status === 'burn') { burst(e.x + ox, y, e.z, R0() < 0.5 ? '#ff7a2a' : '#ffd24a', 2); } else if (e.status === 'poison') { burst(e.x + ox, y, e.z, R0() < 0.5 ? '#a35bd6' : '#6bd36b', 2); } else { const a = T * 6; burst(e.x + Math.cos(a) * 0.35, 0.95, e.z + Math.sin(a) * 0.35, '#ffe14a', 1); } }
setInterval(() => { if (typeof battle !== 'undefined' && battle) [battle.me, battle.w].forEach(statusFx); }, 260);
function hpBar(box, e) { const p = Math.max(0, e.hp) / e.hpMax; box.innerHTML = `<div class="n"><span>${e.name} <small class="l2">Lv${e.lv}</small>${e.status ? ` <small class="stt ${e.status}">${STAT[e.status].tag}</small>` : ''}</span><span>${chips(e)}</span></div><div class="bar"><i class="${p < 0.25 ? 'low' : p < 0.55 ? 'mid' : ''}" style="width:${Math.round(p * 100)}%"></i></div><span class="lv">${Math.max(0, Math.ceil(e.hp))} / ${e.hpMax}</span>`; }
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
// kamera battle: pilih sudut yang tidak tertutup bangunan untuk KEDUA Maimon (cek sampai 7 petak ke arah kamera)
function battleCamYaw(pts, base) {
  let best = base, bs = 1e9;
  for (let k = 0; k < 24; k++) {
    const y = k * Math.PI / 12, dx = Math.sin(y), dz = Math.cos(y); let blocked = 0;
    for (const [cx, cz] of pts) for (let d = 0.6; d <= 7; d += 0.4) { const px = cx + dx * d, pz = cz + dz * d; if (rects.some((b) => px > b[0] - 0.3 && px < b[1] + 0.3 && pz > b[2] - 0.3 && pz < b[3] + 0.3)) blocked += (7.4 - d); }
    const dyaw = Math.abs(((y - base + Math.PI * 3) % (Math.PI * 2)) - Math.PI), sc = blocked * 3 + dyaw * 0.3; if (sc < bs) { bs = sc; best = y; }
  }
  return { yaw: best, score: bs };
}
function startBattle(w) {
  const me = mates[0]; if (!me) return;
  if (me.hp <= 0) me.hp = 1;
  markDex(w.sp, 1); camBack = null; camFocus = null; actZ = false; mode = 'battle'; Music.play(w.rare ? 'battleRare' : 'battle'); battle = { w, me, busy: false }; w.state = 'battle'; me.state = 'battle'; $('joy').style.display = 'none'; $('bubble').style.display = 'none';
  const by = bestBattleYaw(w.x, w.z); battle.yawG = by;
  const rx = Math.cos(by), rz = -Math.sin(by);
  let sgn = 1; const okSide = (s) => !blockedAt(w.x - rx * s * 2.0, w.z - rz * s * 2.0, 0.4);
  if (!okSide(1) && okSide(-1)) sgn = -1;
  battle.me.bx = w.x - rx * sgn * 2.0; battle.me.bz = w.z - rz * sgn * 2.0; battle.px = w.x - rx * sgn * 3.0; battle.pz = w.z - rz * sgn * 3.0;
  battle.cx = (w.x + me.bx) / 2; battle.cz = (w.z + me.bz) / 2;
  me.ang = Math.atan2(w.x - me.bx, w.z - me.bz); w.ang = Math.atan2(me.bx - w.x, me.bz - w.z); w.walk = false;
  clearArena(battle.cx, battle.cz, 3.2); camGoal.set(battle.cx, 0.3, battle.cz); zoomGoal = 0.42; pitch = 0.9; battle.camYaw = battleCamYaw([[battle.me.bx, battle.me.bz], [w.x, w.z], [battle.cx, battle.cz]], by).yaw; battle.yawG = battle.camYaw; $('hpL').classList.add('fl'); $('hpR').classList.add('fl');
  hpBar($('hpL'), me); hpBar($('hpR'), w); $('battle').style.display = 'block';
  buildMoveButtons(); say(w.tr ? `${w.tr.def.name} mengirim ${w.name}!` : w.rare ? `✨ ${w.name} LANGKA muncul!` : `${w.name} liar muncul!`, 1500);
}
function effHint(mv, foe) { const m = typeMult(mv[2], foe); return m > 1 ? '⭐ ampuh' : m < 1 ? '💤 kurang' : ''; }
function curMoves(e) { return movesAt(e.sp, e.lv); }
function buildMoveButtons() {
  const row = $('mvRow'); row.innerHTML = ''; const me = battle.me, kn = curMoves(me);
  kn.forEach((mv, i) => { const b = document.createElement('button'); b.className = 'mv'; b.innerHTML = `${mv[1]}<small><span class="chip" style="background:${TCOL[mv[2]]}">${mv[2]}</span> ${effHint(mv, battle.w)}</small>`; b.onclick = () => round(i); row.appendChild(b); });
  me.d.ls.filter((m) => m[0] > me.lv).slice(0, 4 - kn.length).forEach((m) => { const b = document.createElement('button'); b.className = 'mv lock'; b.innerHTML = `🔒<small>Lv ${m[0]}</small>`; row.appendChild(b); });
  $('flee').onclick = flee; $('swapB').onclick = () => openSwap(false); setMovesEnabled(true);
}
function setMovesEnabled(on) { [...$('mvRow').children].filter((b) => !b.classList.contains('lock')).forEach((b) => b.classList.toggle('wait', !on)); [$('flee'), $('swapB')].forEach((b) => { b.style.pointerEvents = on ? 'auto' : 'none'; b.style.opacity = on ? 1 : 0.5; }); }
function calcDmg(att, mv, def) { const mult = typeMult(mv[2], def), stab = tyOf(att).includes(mv[2]) ? 1.5 : 1, lvF = 0.55 + 0.09 * att.lv, wildF = battle && att === battle.w ? (att.tr ? 0.9 : 0.7) : 1; return { dmg: Math.max(1, Math.round(mv[3] * mult * stab * lvF * wildF / 7 * (0.9 + R0() * 0.2))), mult }; }
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
      const wv = fxCube(col, 1.8, 0.6, 0.4), fo = []; for (let n = 0; n < 8; n++) fo.push(fxCube('#e8f8ff', 0.22));
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
      const big = kind === 'fireblast', F = []; for (let n = 0; n < (big ? 5 : 11); n++) F.push(fxCube(['#ff5a1a', '#ffb02a', '#fff1a0'][n % 3], big ? 0.3 - n * 0.035 : 0.14));
      await tween(big ? 1150 : 900, (k) => { const A = fxPos(att, 0.55), B = fxPos(tgt, 0.45); F.forEach((m, n) => { const kk = Math.min(1, Math.max(0, (big ? k * 1.35 : k * 1.6) - n * (big ? 0.07 : 0.05))), P = lerp3(A, B, kk); setAt(m, [P[0] + (R0() - 0.5) * 0.12, P[1] + Math.sin(kk * Math.PI) * 0.2 + (R0() - 0.5) * 0.1, P[2] + (R0() - 0.5) * 0.12]); m.rotation.set(R0() * 3, R0() * 3, R0() * 3); m.visible = kk > 0 && kk < 1; });
        if (k > (big ? 0.72 : 0.68)) { doHit(); jig(0.06, k); } if (k > 0.68 && k < 0.72) { burst(tgt.x, 0.5, tgt.z, '#ff7a2a', big ? 12 : 7); if (big) shakeCam(400, 0.12); } });
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
const xpFor = (w) => Math.round((10 + w.lv * 4) * (w.rare ? 2 : 1));
/* Maimon yang jauh lebih tinggi dari lawan dapat XP lebih kecil (min 25%) */
const xpShare = (m, w, xp) => Math.max(1, Math.round(xp * Math.max(0.25, 1 - 0.12 * Math.max(0, m.lv - w.lv))));
function gainXp(m, amt) {
  const ups = [], learned = []; if (m.lv >= LVCAP) return { ups, learned, evo: false };
  const wasReady = canEvolve(m);
  m.xp += amt;
  while (m.lv < LVCAP && m.xp >= xpNeed(m.lv)) { m.xp -= xpNeed(m.lv); m.lv++; const old = m.hpMax; m.hpMax = hpMaxOf(m.sp, m.st, m.lv); m.hp = Math.min(m.hpMax, m.hp + m.hpMax - old); ups.push(m.lv); MAI[m.sp].ls.filter((x) => x[0] === m.lv).forEach((x) => learned.push(x[1])); }
  return { ups, learned, evo: !wasReady && canEvolve(m) };
}

/* ---------- GANTI MAIMON saat battle (makan 1 giliran; kalau pingsan wajib ganti) ---------- */
const swapCands = () => mates.filter((m) => m !== battle.me && m.hp > 0);
function openSwap(forced) {
  if (!battle || battle.busy && !forced) return; const c = swapCands(); const L = $('swapL'); L.innerHTML = '';
  if (!c.length) { toast('Tidak ada teman lain yang masih kuat.', 1.6); return; }
  $('swapT').textContent = forced ? `${battle.me.name} pingsan! Pilih penggantinya:` : 'Ganti pakai siapa? (habis 1 giliran)';
  $('swapX').style.display = forced ? 'none' : '';
  c.forEach((m) => { const b = document.createElement('button'); b.innerHTML = `<span>${m.name} <small>Lv${m.lv}</small> ${chips(m)}</span><small>${Math.ceil(m.hp)}/${m.hpMax}</small>`; b.onclick = () => { $('swapP').style.display = 'none'; doSwap(m, forced); }; L.appendChild(b); });
  $('swapX').onclick = closeSwapUI;
  $('swapP').style.display = 'block'; $('moves').style.display = 'none';
}
function closeSwapUI() { $('swapP').style.display = 'none'; $('moves').style.display = ''; }
async function doSwap(nm, forced) {
  if (!battle) return; const old = battle.me, w = battle.w; battle.busy = true; setMovesEnabled(false); closeSwapUI();
  old.status = null; old.ox = old.oz = 0; old.state = 'follow';
  nm.x = old.x; nm.z = old.z; nm.bx = old.bx; nm.bz = old.bz; nm.ang = old.ang; nm.state = 'battle'; nm.pop = 0; nm.ox = nm.oz = 0; nm.hidden = false;
  mates.unshift(mates.splice(mates.indexOf(nm), 1)[0]); battle.me = nm; renderChips();
  burst(nm.x, 0.5, nm.z, '#ffffff', 16); hpBar($('hpL'), nm);
  say(forced ? `Ayo, ${nm.name}!` : `Kembali ${old.name}! Ayo, ${nm.name}!`, 1300); await sleep(1250);
  if (!forced) { // musuh menyerang saat kita ganti
    const wk = curMoves(w), mvB = wk[(R0() * wk.length) | 0];
    if (w.status && STAT[w.status].fail && R0() < STAT[w.status].fail) { say(`${STAT[w.status].em} ${w.name} ${STAT[w.status].fm}, gagal menyerang!`, 1200); await sleep(1100); }
    else {
      const b = calcDmg(w, mvB, nm); say(`${w.name} pakai ${mvB[1]}!`, 1300); await sleep(220);
      await runFx(w, nm, mvB, () => { burst(nm.x, 0.45, nm.z, TCOL[mvB[2]], 14); nm.hp -= b.dmg; nm.shake = 0.4; flash(nm, 0.7); floatText(`-${b.dmg}`, nm.x, 1.1, nm.z, '#d8452e'); hpBar($('hpL'), nm); setTimeout(() => flash(nm, 0), 260); });
      await sleep(500);
    }
    if (nm.hp <= 0) return faintFlow();
  }
  battle.busy = false; setMovesEnabled(true); buildMoveButtons(); say('Pilih jurus!', 900);
}
async function faintFlow() {
  const me = battle.me; me.hp = 0; hpBar($('hpL'), me);
  if (!swapCands().length) return endBattle('lose');
  say(`${me.name} pingsan!`, 1300); await sleep(1300); battle.busy = true; setMovesEnabled(false); openSwap(true);
}
async function round(i) {
  if (!battle || battle.busy) return; battle.busy = true; setMovesEnabled(false);
  const { w, me } = battle, mvA = curMoves(me)[i], wk = curMoves(w), mvB = wk[(R0() * wk.length) | 0];
  const a = calcDmg(me, mvA, w), b = calcDmg(w, mvB, me);
  const mkHit = (def, mv, r) => () => { burst(def.x, 0.45, def.z, TCOL[mv[2]], 14); def.hp -= r.dmg; def.shake = 0.4; flash(def, 0.7); floatText(`-${r.dmg}`, def.x, 1.1, def.z, '#d8452e'); hpBar($('hpL'), me); hpBar($('hpR'), w); setTimeout(() => flash(def, 0), 260); if (r.mult > 1) floatText('⭐', def.x, 1.6, def.z); const sc = STCHANCE[mv[2]]; if (sc && def.hp > 0 && !def.status && R0() < sc[1]) { def.status = sc[0]; def.stT = sc[2]; floatText(STAT[sc[0]].tag + '!', def.x, 1.9, def.z, STAT[sc[0]].col); burst(def.x, 0.6, def.z, STAT[sc[0]].col, 16); hpBar($('hpL'), me); hpBar($('hpR'), w); } };
  const sA = speedOf(me), sB = speedOf(w), meFirst = sA === sB ? R0() < 0.5 : sA > sB;
  const doMe = async () => { if (me.status && STAT[me.status].fail && R0() < STAT[me.status].fail) { say(`${STAT[me.status].em} ${me.name} ${STAT[me.status].fm}, gagal menyerang!`, 1200); await sleep(1100); return; } say(`${me.name} pakai ${mvA[1]}!`, 1300); await sleep(220); await runFx(me, w, mvA, mkHit(w, mvA, a)); fxClear(); if (a.mult > 1) say('Ampuh banget! ⭐', 700); else if (a.mult < 1) say('Kurang ampuh… 💤', 700); };
  const doFoe = async () => { if (w.status && STAT[w.status].fail && R0() < STAT[w.status].fail) { say(`${STAT[w.status].em} ${w.name} ${STAT[w.status].fm}, gagal menyerang!`, 1200); await sleep(1100); return; } say(`${w.name} pakai ${mvB[1]}!`, 1300); await sleep(220); await runFx(w, me, mvB, mkHit(me, mvB, b)); fxClear(); if (b.mult > 1) say('Aduh, ampuh! ⭐', 700); else if (b.mult < 1) say('Tidak terlalu sakit 💤', 700); };
  say(`⚡ ${meFirst ? me.name : w.name} lebih cepat!`, 900); await sleep(650);
  if (meFirst) { await doMe(); await sleep(250); await doFoe(); } else { await doFoe(); await sleep(250); await doMe(); }
  for (const e of [me, w]) { if (!e.status || e.hp <= 0) continue; const st = STAT[e.status]; if (st.dot) { const d = Math.max(1, Math.round(e.hpMax * st.dot)); e.hp = e === me ? Math.max(1, e.hp - d) : e.hp - d; say(`${st.em} ${e.name} ${st.msg}! -${d}`, 1100); burst(e.x, 0.6, e.z, st.col, 14); floatText(`-${d}`, e.x, 1.3, e.z, st.col); flash(e, 0.5); setTimeout(() => flash(e, 0), 240); hpBar($('hpL'), me); hpBar($('hpR'), w); await sleep(900); } if (--e.stT <= 0) { e.status = null; say(`${e.name} sudah pulih ✨`, 900); hpBar($('hpL'), me); hpBar($('hpR'), w); await sleep(700); } }
  await sleep(750);
  if (w.hp <= 0) return endBattle('win'); if (me.hp <= 0) return faintFlow();
  battle.busy = false; setMovesEnabled(true); say('Pilih jurus!', 900);
}

/* ---------- efek NAIK LEVEL: kilat emas, banner besar, bintang, Maimon melompat ---------- */
async function levelUpFx(m, lv, w) {
  const b = $('lvup'), f = $('lvflash'); b.querySelector('.n').textContent = `${m.name}  Lv ${lv - 1} ➜ Lv ${lv}`;
  toastEl.style.opacity = 0; camGoal.set(m.x, 0.4, m.z); zoomGoal = 0.34; Music.jingle('level'); m.jump = 1.1; m.pop = 0; m.state = 'face';
  [b, f].forEach((e) => { e.classList.remove('go'); void e.offsetWidth; e.classList.add('go'); });
  const cols = ['#ffe066', '#ff7aa8', '#7fe0ff', '#9be85a', '#ffffff'];
  for (let k = 0; k < 5; k++) { setTimeout(() => { burst(m.x + (R0() - 0.5) * 0.6, 0.5 + k * 0.28, m.z + (R0() - 0.5) * 0.6, cols[k % 5], 26); }, k * 170); }
  await sleep(2300); b.classList.remove('go'); f.classList.remove('go'); m.state = 'follow'; if (w) { camGoal.set(w.x, 0.3, w.z); zoomGoal = 0.45; }
}
async function endBattle(res) {
  if (battle && battle.w.tr) return trainerEnd(res);
  closeSwapUI(); const { w, me } = battle; me.status = w.status = null; $('battle').style.display = 'none'; logEl.style.opacity = 0;
  if (res === 'win') {
    battle = null; w.hp = 0; me.state = 'follow'; mode = 'feed'; Music.play(CITY); Music.jingle('win'); talk = w; w.state = 'face'; camGoal.set(w.x, 0.3, w.z); zoomGoal = 0.45;
    const xp = xpFor(w), msgs = [`${me.name} dapat ${xpShare(me, w, xp)} XP!`];
    const evoQ = []; mates.forEach((m, i) => { const r = gainXp(m, xpShare(m, w, i === 0 ? xp : Math.floor(xp / 2))); r.ups.forEach((l) => msgs.push({ m, l })); r.learned.forEach((n) => msgs.push(`📘 ${m.name} belajar jurus ${n}!`)); if (r.evo) evoQ.push(m); });
    for (const t of msgs) { if (typeof t === 'string') { toast(t, 1.7); await sleep(1500); } else { await levelUpFx(t.m, t.l, w); } if (mode !== 'feed') return; }
    for (const m of evoQ) { if (mode !== 'feed') return; await evolveOffer(m); }
    toast(w.rare ? `✨ ${w.name} langka ini! Jangan sampai lepas!` : `${w.name} kecapekan dan lapar!`, 2); showFeed(w); saveGame();
  } else {
    Music.play(CITY); Music.jingle('lose'); toast(`${me.name} kecapekan… bawa ke Klinik Maimon 🩷`, 2.8); me.hp = Math.max(1, Math.round(me.hpMax * 0.3)); w.hp = w.hpMax; battle = null; me.state = 'follow'; w.state = 'wander'; w.tgt = null; w.wait = 2; leaveEncounter(6);
  }
}
function flee() { if (!battle || battle.busy) return; if (battle.w.tr) { toast('Tidak bisa kabur dari battle pelatih!', 1.6); return; } closeSwapUI(); const { w, me } = battle; me.status = w.status = null; Music.play(CITY); $('battle').style.display = 'none'; logEl.style.opacity = 0; me.state = 'follow'; w.state = 'wander'; w.hp = w.hpMax; w.tgt = [w.x + (w.x - player.x) * 2, w.z + (w.z - player.z) * 2]; battle = null; toast('Kabur dulu!', 1.2); leaveEncounter(4); }
let feedTimer = null; const stopFeedClock = () => { clearInterval(feedTimer); feedTimer = null; };
function feedClock(w) { stopFeedClock(); let left = 20; const upd = () => { $('ptitle').textContent = `Kasih ${w.name} makan apa? ⏳ ${left}`; }; upd(); feedTimer = setInterval(() => { left--; if (mode !== 'feed' || talk !== w) { stopFeedClock(); return; } if (left <= 0) { stopFeedClock(); toast(`${w.name} sudah tidak sabar dan pergi… 💨`, 2); leaveEncounter(4); runAway(w); } else upd(); }, 1000); }
function leaveEncounter(cd) { stopFeedClock(); saveGame(); restoreArena(); pitch = 0.66; mode = 'play'; talk = null; cooldown = T + cd; zoomGoal = 1; $('joy').style.display = ''; $('panel').style.display = 'none'; if (mates[0]) mates[0].state = 'follow'; }

/* ---------- kasih makan setelah menang ---------- */
const foodsEl = $('foods'), foodBtn = {};
FOODS.forEach(([id, name, em]) => { const b = document.createElement('button'); b.onclick = () => feed(id); foodBtn[id] = b; foodsEl.appendChild(b); });
function refreshFoods() { FOODS.forEach(([id, name, em]) => { const b = foodBtn[id], n = bagN(id); b.innerHTML = `<span class="e">${em}</span>${name}<small>x${n}</small>`; b.classList.toggle('none', n === 0); }); }
function showFeed(w) { feedClock(w); refreshFoods(); const rr = rarityOf(w); $('phint').textContent = bagN(w.fav) === 0 ? `Tasmu belum ada makanan favorit ${w.name} (${FOOD[w.fav][2]}). ${FOODWHERE[w.fav]}, lalu ajak ${w.name} battle lagi.` : `${rr.star} ${rr.n} · peluang ikut ±${Math.round(catchP(w) * 100)}%`; $('panel').style.display = 'block'; }
/* ---------- KELANGKAAN + peluang tangkap (makanan favorit tidak lagi 100%) ---------- */
const TIERS = ['umum', 'jarang', 'langka', 'epik'];
const RARITY = { umum: { n: 'Umum', p: 0.8, star: '★' }, jarang: { n: 'Jarang', p: 0.6, star: '★★' }, langka: { n: 'Langka', p: 0.4, star: '★★★' }, epik: { n: 'Epik', p: 0.25, star: '★★★★' } };
const RARITY_OF = { kucingko: 'umum', tikusil: 'umum', dombanyo: 'umum', kancik: 'langka', cebongi: 'langka', pioyo: 'langka' };
function rarityOf(w) { let i = TIERS.indexOf(RARITY_OF[w.sp] || 'umum'); if (w.st === 2) i = Math.min(TIERS.length - 1, i + 1); return RARITY[TIERS[i]]; }
const firstCatch = () => !Object.values(S.dex || {}).some((v) => v >= 2);
const catchP = (w) => (firstCatch() ? 1 : rarityOf(w).p);
function feed(id) {
  if (!talk || mode !== 'feed') return; const w = talk;
  if (bagN(id) === 0) { toast(`Belum punya ${FOOD[id][1]}. ${FOODWHERE[id]}`, 2.4); return; }
  if (id === w.fav && R0() >= catchP(w)) { useBag(id); w.shake = 0.8; refreshFoods(); toast(`${w.name} makan ${FOOD[id][2]} tapi belum mau ikut 😋 coba lagi!`, 2); $('phint').textContent = bagN(w.fav) === 0 ? `Makanan favorit habis. ${FOODWHERE[w.fav]}.` : ''; return; }
  if (id === w.fav) {
    useBag(id); $('panel').style.display = 'none'; wilds.splice(wilds.indexOf(w), 1); const full = mates.length >= MAXP; let rec = null;
    if (!full) { w.state = 'follow'; w.pop = 0; w.hp = w.hpMax; mates.push(w); addChip(w); } else { rec = { sp: w.sp, st: w.st, hp: w.hpMax, lv: w.lv, xp: w.xp }; stash.push(rec); world.remove(w.rig.root); }
    markDex(w.sp, 2); markForm(w.sp, w.st); if (S.stage === 2 && commonsCaught() >= 3) { S.stage = 3; setTimeout(() => toast('Data lengkap! Lapor ke Prof. Catherine 🎓', 3), 2800); } saveGame(); burst(w.x, 0.6, w.z); Music.jingle('catch');
    toast(full ? `Yeay! ${w.name} tertangkap! Tim penuh, dititip di Hotel Maimon 🏠` : `Yeay! ${w.name} ikut kamu! 🎉`, 3); respawns.push({ t: T + (w.rare ? 150 : 25), sp: w.sp, st: w.st, hx: w.hx, hz: w.hz, la: w.la || 0 }); leaveEncounter(2); setTimeout(() => askNick(w, rec), 1200);
  } else { w.shake = 0.6; toast('Hmm… bukan itu 🤔 coba yang lain!', 1.4); }
}
$('skip').onclick = () => { if (!talk) return; const w = talk; leaveEncounter(5); runAway(w); };
async function runAway(w) {
  const i = wilds.indexOf(w); if (i >= 0) wilds.splice(i, 1); w.hp = w.hpMax; w.state = 'gone'; w.walk = true; w.pop = 1;
  const dx = w.x - player.x, dz = w.z - player.z, d = Math.hypot(dx, dz) || 1, x0 = w.x, z0 = w.z; w.ang = Math.atan2(dx, dz);
  await tween(1000, (k) => { w.x = x0 + dx / d * 4 * k; w.z = z0 + dz / d * 4 * k; w.fade = Math.max(0.01, 1 - k * k); placeEnt(w, 0.016); });
  world.remove(w.rig.root); respawns.push({ t: T + (w.rare ? 150 : 25), sp: w.sp, st: w.st, hx: w.hx, hz: w.hz, la: w.la || 0 });
}

/* =====================================================================
   INPUT: joystick, keyboard, geser untuk putar kamera
   ===================================================================== */
const joy = { x: 0, y: 0 }, keys = {};
{
  const base = $('joy'), knob = $('knob'); let pid = null;
  const set = (e) => { const r = base.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = e.clientX - cx, dy = e.clientY - cy; const m = 46, d = Math.hypot(dx, dy); if (d > m) { dx = dx / d * m; dy = dy / d * m; } knob.style.transform = `translate(${dx}px,${dy}px)`; joy.x = dx / m; joy.y = dy / m; };
  /* Joystick melayang: sentuh di mana saja di separuh KIRI layar -> joystick muncul di situ.
     Geser di separuh KANAN -> putar kamera (baru aktif setelah geser > 12 px, supaya ketukan kecil tidak memutar). */
  const homeJoy = () => { base.style.left = ''; base.style.top = ''; base.style.bottom = ''; base.classList.remove('on'); };
  let jc = { x: 0, y: 0 }, cam = null;
  const setJoy = (e) => { let dx = e.clientX - jc.x, dy = e.clientY - jc.y; const m = 46, d = Math.hypot(dx, dy); if (d > m) { dx = dx / d * m; dy = dy / d * m; } knob.style.transform = `translate(${dx}px,${dy}px)`; joy.x = dx / m; joy.y = dy / m; };
  const startTouch = (e) => {
    if (mode !== 'play') return;
    if (e.clientX < innerWidth * 0.5) {
      if (pid !== null) return; pid = e.pointerId; const w = base.offsetWidth;
      jc = { x: Math.min(innerWidth * 0.5 - w / 2, Math.max(w / 2 + 6, e.clientX)), y: Math.min(innerHeight - w / 2 - 6, Math.max(w / 2 + 6, e.clientY)) };
      base.style.left = (jc.x - w / 2) + 'px'; base.style.top = (jc.y - w / 2) + 'px'; base.style.bottom = 'auto'; base.classList.add('on'); setJoy(e);
    } else if (!cam) cam = { id: e.pointerId, x: e.clientX, on: false, x0: e.clientX };
  };
  canvas.addEventListener('pointerdown', startTouch); base.addEventListener('pointerdown', startTouch);
  addEventListener('pointermove', (e) => {
    if (e.pointerId === pid) setJoy(e);
    if (cam && e.pointerId === cam.id && mode === 'play') { if (!cam.on && Math.abs(e.clientX - cam.x0) > 12) { cam.on = true; cam.x = e.clientX; } if (cam.on) { yawGoal = null; yaw -= (e.clientX - cam.x) * 0.008; cam.x = e.clientX; } }
  });
  const endTouch = (e) => { if (e.pointerId === pid) { pid = null; joy.x = joy.y = 0; knob.style.transform = ''; homeJoy(); } if (cam && e.pointerId === cam.id) cam = null; };
  addEventListener('pointerup', endTouch); addEventListener('pointercancel', endTouch);
  addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; }); addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
  $('rotL').onclick = () => { yawGoal = (yawGoal === null ? yaw : yawGoal) + Math.PI / 4; };
  $('rotR').onclick = () => { yawGoal = (yawGoal === null ? yaw : yawGoal) - Math.PI / 4; };
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

