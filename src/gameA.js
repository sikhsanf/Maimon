
const CITY = 'depok';
/* =====================================================================
   DATA: tipe, jurus, spesies, makanan
   ===================================================================== */
const TCOL = { Air: '#3b8fd6', Api: '#e8582a', Daun: '#4fae4f', Batu: '#9a8a70', Es: '#6cc4e0', Suara: '#b07ad8', Petarung: '#c85a3a', Cahaya: '#e0b020', Besi: '#8a95a6', Biasa: '#9a9a9a' };
const BEATS = { Air: ['Api', 'Cahaya'], Api: ['Daun', 'Besi'], Daun: ['Batu', 'Air'], Batu: ['Es', 'Api'], Es: ['Suara', 'Daun'], Suara: ['Petarung', 'Batu'], Petarung: ['Cahaya', 'Es'], Cahaya: ['Besi', 'Suara'], Besi: ['Air', 'Petarung'] };
const typeMult = (att, def) => att === 'Biasa' || def === 'Biasa' ? 1 : BEATS[att].includes(def) ? 2 : BEATS[def].includes(att) ? 0.5 : 1;
const FOODS = [['timun', 'Timun', '🥒'], ['kangkung', 'Kangkung', '🥬'], ['jagung', 'Jagung', '🌽'], ['ikan', 'Ikan asin', '🐟'], ['kacang', 'Kacang', '🥜'], ['wortel', 'Wortel', '🥕']];
const FOOD = Object.fromEntries(FOODS.map((f) => [f[0], f]));
const MAI = {
  kancik: { n: ['Kancik', 'Kancilon'], type: 'Daun', fav: 'timun', hp: [46, 74], animal: 'kancil', build: (st) => buildKancik(st), s: 0.66,
    mv: [['Seruduk', 'Biasa', 40], ['Daun Tajam', 'Daun', 55], ['Lempar Batu', 'Batu', 55]] },
  cebongi: { n: ['Cebongi', 'Kodi'], type: 'Air', fav: 'kangkung', hp: [46, 74], animal: 'kecebong', build: (st) => buildCebongi(st), s: 0.66,
    mv: [['Sundul', 'Biasa', 40], ['Semprot Air', 'Air', 55], ['Kuak Keras', 'Suara', 55]] },
  pioyo: { n: ['Pioyo', 'Petokar'], type: 'Api', fav: 'jagung', hp: [46, 74], animal: 'anak ayam', build: (st) => buildPioyo(st), s: 0.66,
    mv: [['Patuk', 'Biasa', 40], ['Kokok Api', 'Api', 55], ['Cakar Jago', 'Petarung', 55]] },
  kucingko: { n: ['Kucingko'], type: 'Suara', fav: 'ikan', hp: [34], animal: 'kucing', build: () => buildQuad(SPEC.kucingko), s: 0.66, mv: [['Cakar', 'Biasa', 40], ['Meong Keras', 'Suara', 50]] },
  tikusil: { n: ['Tikusil'], type: 'Batu', fav: 'kacang', hp: [30], animal: 'tikus', build: () => buildQuad(SPEC.tikusil), s: 0.66, mv: [['Gigit', 'Biasa', 40], ['Lempar Kerikil', 'Batu', 50]] },
  dombanyo: { n: ['Dombanyo'], type: 'Daun', fav: 'wortel', hp: [38], animal: 'domba', build: () => buildQuad(SPEC.dombanyo), s: 0.66, mv: [['Seruduk', 'Biasa', 40], ['Rumput Tajam', 'Daun', 50]] },
};

/* =====================================================================
   ENTITAS: pemain, Maimon liar, teman
   ===================================================================== */
const player = { rig: null, x: 1.6, z: 11.6, ang: Math.PI, walk: false, ox: 0, oz: 0 };
const wilds = [], mates = [], respawns = [];
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
function mkMon(sp, st, x, z) {
  const d = MAI[sp], rig = d.build(st); rig.off = R0() * 3; castAll(rig.root); world.add(rig.root);
  const hpMax = d.hp[Math.min(st, d.hp.length) - 1];
  return { sp, st, rig, d, name: d.n[Math.min(st, d.n.length) - 1], type: d.type, fav: d.fav, x, z, ang: R0() * 6.28, ox: 0, oz: 0, hp: hpMax, hpMax, tgt: null, wait: R0() * 2, walk: false, state: 'wander', shake: 0, pop: 0.4, rad: 3.2, hx: x, hz: z, jump: 0, fade: 1, sc: rig.size * d.s * 0.8 };
}
function placeEnt(e, dt) {
  const k = e.pop < 0.5 ? 0.35 + 0.65 * easeOutBack(e.pop / 0.5) : 1;
  e.rig.root.scale.setScalar(e.sc * k * e.fade);
  e.rig.root.position.set(e.x + e.ox, groundY(e.x, e.z) + (e.jump > 0 ? Math.abs(Math.sin(e.jump * 9)) * 0.3 : 0) + (e.sp === 'cebongi' ? 0 : 0), e.z + e.oz);
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
  const [x, z] = freeSpot(hx, hz, 0.4), w = mkMon(sp, st, x, z); w.hx = hx; w.hz = hz; w.rad = sp === 'kancik' ? 3.5 : 2.6; w.rare = isRare(sp, st); w.spark = 0; wilds.push(w); return w;
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
  STARTS.forEach(([sp, z]) => { const m = mkMon(sp, 1, -5.3, z); m.state = 'display'; m.ang = Math.PI / 2; m.pop = 0; m.sc = m.rig.size * m.d.s * 0.8 * 1.35; m.baseZ = z; starters.push(m); });
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
  dialog([['Prof. Catherine', `Pilihan bagus! ${m.name} pasti jadi partner yang hebat.`], ['Prof. Catherine', 'Dekati Maimon liar untuk battle. Kalau menang, beri makanan favoritnya supaya mau ikut denganmu.'], ['Prof. Catherine', 'Kalau Maimon-mu lelah, bawa ke Klinik Maimon di seberangku. Dokter Sari akan merawatnya. Semangat, Pelatih!']]);
};
function addChip(m) { const c = document.createElement('span'); c.textContent = (mates.length === 1 ? '⭐ ' : '') + m.name; c.dataset.n = m.name; $('mchips').appendChild(c); }

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
function hpBar(box, e) { const p = Math.max(0, e.hp) / e.hpMax; box.innerHTML = `<div class="n"><span>${e.name}</span><span class="chip" style="background:${TCOL[e.type]}">${e.type}</span></div><div class="bar"><i class="${p < 0.25 ? 'low' : p < 0.55 ? 'mid' : ''}" style="width:${Math.round(p * 100)}%"></i></div><span class="lv">${Math.max(0, Math.ceil(e.hp))} / ${e.hpMax}</span>`; }
let hidden = [];
function clearArena(cx, cz, R) {
  treeMeshes.forEach((m) => { if (m.visible && Math.hypot(m.userData.x - cx, m.userData.z - cz) < R) { m.visible = false; hidden.push(m); burst(m.userData.x, 0.4, m.userData.z, '#8cc656', 4); } });
}
function restoreArena() { hidden.forEach((m) => { m.visible = true; }); hidden = []; }
function startBattle(w) {
  const me = mates[0]; if (!me) return;
  if (me.hp <= 0) me.hp = 1;
  markDex(w.sp, 1); mode = 'battle'; Music.play(w.rare ? 'battleRare' : 'battle'); battle = { w, me, busy: false }; w.state = 'battle'; me.state = 'battle'; $('joy').style.display = 'none'; $('bubble').style.display = 'none';
  const rx = Math.cos(yaw), rz = -Math.sin(yaw);
  let sgn = 1; const okSide = (s) => !blockedAt(w.x - rx * s * 2.0, w.z - rz * s * 2.0, 0.4);
  if (!okSide(1) && okSide(-1)) sgn = -1;
  battle.me.bx = w.x - rx * sgn * 2.0; battle.me.bz = w.z - rz * sgn * 2.0; battle.px = w.x - rx * sgn * 3.0; battle.pz = w.z - rz * sgn * 3.0;
  battle.cx = (w.x + me.bx) / 2; battle.cz = (w.z + me.bz) / 2;
  me.ang = Math.atan2(w.x - me.bx, w.z - me.bz); w.ang = Math.atan2(me.bx - w.x, me.bz - w.z); w.walk = false;
  clearArena(battle.cx, battle.cz, 3.2); camGoal.set(battle.cx, 0.3, battle.cz); zoomGoal = 0.42; pitch = 0.9; $('hpL').classList.add('fl'); $('hpR').classList.add('fl');
  hpBar($('hpL'), me); hpBar($('hpR'), w); $('battle').style.display = 'block';
  buildMoveButtons(); say(w.rare ? `✨ ${w.name} LANGKA muncul!` : `${w.name} liar muncul!`, 1500);
}
function effHint(mv, foe) { const m = typeMult(mv[1], foe.type); return m > 1 ? '⭐ ampuh' : m < 1 ? '💤 kurang' : ''; }
function buildMoveButtons() {
  const row = $('mvRow'); row.innerHTML = '';
  battle.me.d.mv.forEach((mv, i) => { const b = document.createElement('button'); b.className = 'mv'; b.innerHTML = `${mv[0]}<small><span class="chip" style="background:${TCOL[mv[1]]}">${mv[1]}</span> ${effHint(mv, battle.w)}</small>`; b.onclick = () => round(i); row.appendChild(b); });
  $('flee').onclick = flee; setMovesEnabled(true);
}
function setMovesEnabled(on) { [...$('mvRow').children].forEach((b) => b.classList.toggle('wait', !on)); $('flee').style.pointerEvents = on ? 'auto' : 'none'; $('flee').style.opacity = on ? 1 : 0.5; }
function calcDmg(att, mv, def) { const mult = typeMult(mv[1], def.type), stab = mv[1] === att.type ? 1.5 : 1; return { dmg: Math.max(1, Math.round(mv[2] * mult * stab / 7 * (0.9 + R0() * 0.2))), mult }; }
async function round(i) {
  if (!battle || battle.busy) return; battle.busy = true; setMovesEnabled(false);
  const { w, me } = battle, mvA = me.d.mv[i], wm = w.d.mv, mvB = wm[(R0() * wm.length) | 0];
  const a = calcDmg(me, mvA, w), b = calcDmg(w, mvB, me);
  say(`${me.name} pakai ${mvA[0]}!  ${w.name} pakai ${mvB[0]}!`, 1500);
  // serbu bersamaan
  const dirX = Math.sin(me.ang), dirZ = Math.cos(me.ang);
  for (let t = 0; t <= 1; t += 0.1) { const k = Math.sin(t * Math.PI) * 0.8; me.ox = dirX * k; me.oz = dirZ * k; w.ox = -dirX * k; w.oz = -dirZ * k; await sleep(30); }
  me.ox = me.oz = w.ox = w.oz = 0;
  burst(w.x, 0.45, w.z, TCOL[mvA[1]], 14); burst(me.x, 0.45, me.z, TCOL[mvB[1]], 14);
  w.hp -= a.dmg; me.hp -= b.dmg; w.shake = 0.4; me.shake = 0.4; flash(w, 0.7); flash(me, 0.7);
  floatText(`-${a.dmg}`, w.x, 1.1, w.z, '#d8452e'); floatText(`-${b.dmg}`, me.x, 1.1, me.z, '#d8452e');
  hpBar($('hpL'), me); hpBar($('hpR'), w); await sleep(260); flash(w, 0); flash(me, 0);
  if (a.mult > 1) { say('Ampuh banget! ⭐', 1000); floatText('⭐', w.x, 1.5, w.z); } else if (a.mult < 1) say('Kurang ampuh… 💤', 1000);
  await sleep(1000);
  if (w.hp <= 0) return endBattle('win'); if (me.hp <= 0) return endBattle('lose');
  battle.busy = false; setMovesEnabled(true); say('Pilih jurus!', 900);
}
async function endBattle(res) {
  const { w, me } = battle; $('battle').style.display = 'none'; logEl.style.opacity = 0;
  if (res === 'win') {
    battle = null; w.hp = 0; me.state = 'follow'; mode = 'feed'; Music.play(CITY); Music.jingle('win'); talk = w; w.state = 'face'; camGoal.set(w.x, 0.3, w.z); zoomGoal = 0.45;
    toast(w.rare ? `✨ ${w.name} langka ini! Jangan sampai lepas!` : `${w.name} kecapekan dan lapar!`, 2); showFeed(w);
  } else {
    Music.play(CITY); Music.jingle('lose'); toast(`${me.name} kecapekan… bawa ke Klinik Maimon 🩷`, 2.8); me.hp = Math.max(1, Math.round(me.hpMax * 0.3)); w.hp = w.hpMax; battle = null; me.state = 'follow'; w.state = 'wander'; w.tgt = null; w.wait = 2; leaveEncounter(6);
  }
}
function flee() { if (!battle || battle.busy) return; const { w, me } = battle; Music.play(CITY); $('battle').style.display = 'none'; logEl.style.opacity = 0; me.state = 'follow'; w.state = 'wander'; w.hp = w.hpMax; w.tgt = [w.x + (w.x - player.x) * 2, w.z + (w.z - player.z) * 2]; battle = null; toast('Kabur dulu!', 1.2); leaveEncounter(4); }
function leaveEncounter(cd) { saveGame(); restoreArena(); pitch = 0.66; mode = 'play'; talk = null; cooldown = T + cd; zoomGoal = 1; $('joy').style.display = ''; $('panel').style.display = 'none'; if (mates[0]) mates[0].state = 'follow'; }

/* ---------- kasih makan setelah menang ---------- */
const foodsEl = $('foods');
FOODS.forEach(([id, name, em]) => { const b = document.createElement('button'); b.innerHTML = `<span class="e">${em}</span>${name}`; b.onclick = () => feed(id); foodsEl.appendChild(b); });
function showFeed(w) { $('ptitle').textContent = `Kasih ${w.name} makan apa?`; $('panel').style.display = 'block'; }
function feed(id) {
  if (!talk || mode !== 'feed') return; const w = talk;
  if (id === w.fav) {
    $('panel').style.display = 'none'; wilds.splice(wilds.indexOf(w), 1); w.state = 'follow'; w.pop = 0; w.hp = w.hpMax; mates.push(w); addChip(w);
    markDex(w.sp, 2); if (S.stage === 2 && commonsCaught() >= 3) { S.stage = 3; setTimeout(() => toast('Data lengkap! Lapor ke Prof. Catherine 🎓', 3), 2600); } saveGame(); burst(w.x, 0.6, w.z); Music.jingle('catch'); toast(`Yeay! ${w.name} ikut kamu! 🎉`, 2.4); respawns.push({ t: T + (w.rare ? 150 : 25), sp: w.sp, st: w.st, hx: w.hx, hz: w.hz }); leaveEncounter(2);
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

