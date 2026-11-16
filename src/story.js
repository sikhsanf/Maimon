
/* =====================================================================
   CERITA: title, buat karakter, dialog, NPC (Prof. Catherine, Dokter Sari), tujuan, Maimondex, klinik, simpan
   ===================================================================== */
const SAVE_KEY = 'maimon_save_v1';
const S = { name: 'Pelatih', gender: 'boy', stage: 0, dex: {}, bag: {} };   // stage: 0 cari Prof, 2 tangkap 3 Maimon, 3 lapor, 4 bebas
const DEXLIST = ['kancik', 'cebongi', 'pioyo', 'kucingko', 'tikusil', 'dombanyo'], COMMONS = ['kucingko', 'tikusil', 'dombanyo'];
const npcs = [];
const store = { get() { try { return localStorage.getItem(SAVE_KEY); } catch (e) { return null; } }, set(v) { try { localStorage.setItem(SAVE_KEY, v); } catch (e) {} } };
function saveGame() { store.set(JSON.stringify({ S, mates: mates.map((m) => ({ sp: m.sp, st: m.st, hp: m.hp, lv: m.lv, xp: m.xp })), box: stash })); }
const nm = (s) => s.replace(/\{n\}/g, S.name);

/* ---------- NPC ---------- */
function addNPC(id, name, look, p, ang) {
  const rig = buildHuman(look); castAll(rig.root); world.add(rig.root);
  const n = { id, name, rig, x: p[0], z: p[1], ang, off: R0() * 3 }; rig.root.scale.setScalar(0.68); npcs.push(n); circles.push({ x: n.x, z: n.z, r: 0.3 }); return n;
}
function updateNPCs(dt) {
  npcs.forEach((n) => {
    const d = Math.hypot(player.x - n.x, player.z - n.z); if (d < 3.6 && player.rig && player.rig.root.visible) n.ang = lerpAng(n.ang, Math.atan2(player.x - n.x, player.z - n.z), Math.min(1, dt * 6));
    n.rig.root.position.set(n.x, groundY(n.x, n.z), n.z); n.rig.root.rotation.y = n.ang; animRig(n.rig, T + n.off, false);
  });
}

/* ---------- dialog ---------- */
const dlgEl = $('dlg'); let dq = null;
function dialog(lines, done) {
  mode = 'dialog'; dq = { lines, i: -1, done, txt: '', pos: 0 }; $('joy').style.display = 'none'; $('talk').style.display = 'none'; dlgEl.style.display = 'block'; nextLine();
}
function nextLine() {
  dq.i++; if (dq.i >= dq.lines.length) { const d = dq.done; dq = null; dlgEl.style.display = 'none'; mode = 'play'; $('joy').style.display = ''; if (d) d(); return; }
  const [who, txt] = dq.lines[dq.i]; dq.who = who; $('dwho').textContent = who === '_' ? 'Narator' : nm(who); $('dwho').style.background = who === 'Prof. Catherine' ? '#1d8f8a' : who === 'Dokter Sari' ? '#d0406a' : who === 'Bu Wati' ? '#8a5a2a' : who === '_' ? '#241912' : '#3a5a9e';
  dq.txt = nm(txt); dq.pos = 0; $('dtxt').textContent = '';
}
const VOICEF = { 'Prof. Catherine': 560, 'Dokter Sari': 620, 'Bu Wati': 430, '_': 330 };
function dlgTick(dt) { if (!dq) return; if (dq.pos < dq.txt.length) { const p0 = dq.pos | 0; dq.pos = Math.min(dq.txt.length, dq.pos + dt * 40); const p1 = dq.pos | 0; if (p1 > p0 && dq.txt[p1 - 1] !== ' ' && p1 % 2 === 0) Music.blip((VOICEF[dq.who] || 400) * (0.92 + R0() * 0.2)); $('dtxt').textContent = dq.txt.slice(0, dq.pos | 0); $('dnext').style.visibility = dq.pos >= dq.txt.length ? 'visible' : 'hidden'; } }
function dlgAdvance() { if (!dq) return; if (dq.pos < dq.txt.length) { dq.pos = dq.txt.length; $('dtxt').textContent = dq.txt; $('dnext').style.visibility = 'visible'; } else nextLine(); }
dlgEl.addEventListener('pointerdown', (e) => { e.stopPropagation(); dlgAdvance(); });
addEventListener('keydown', (e) => { if (!dq && mode === 'play' && (e.key === 'e' || e.key === 'Enter' || e.key === ' ')) interact(); else if (dq && (e.key === 'Enter' || e.key === ' ' || e.key === 'e')) dlgAdvance(); });

/* ---------- kartu bab ---------- */
function chapter(t, p, btn, cb) { $('chapT').textContent = t; $('chapP').textContent = p; $('chapB').textContent = btn || 'Lanjut'; $('chap').style.display = 'flex'; $('chapB').onclick = () => { $('chap').style.display = 'none'; if (cb) cb(); }; }
function flashScreen() { const f = $('flash'); f.style.opacity = 1; setTimeout(() => { f.style.opacity = 0; }, 260); }

/* ---------- Maimondex (ala pokedex) ---------- */
function markDex(sp, lv) { if ((S.dex[sp] || 0) < lv) { S.dex[sp] = lv; saveGame(); } }
const countOf = (sp) => mates.filter((m) => m.sp === sp).length + stash.filter((r) => r.sp === sp).length;
const commonsCaught = () => COMMONS.filter((s) => S.dex[s] > 1).length;

/* ---------- tujuan + penunjuk ---------- */
const mk = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 4).rotateX(Math.PI), glow('#ffd84a')); mk.visible = false; scene.add(mk);
let objTarget = null;
function leadLow() { const m = mates[0]; return m && m.hp < m.hpMax * 0.4; }
function updateObjective() {
  let txt = '', tgt = null;
  if (S.stage === 0) { txt = 'Temui Prof. Catherine di Lab Maimon UI (Depok Lama)'; tgt = npcs.find((n) => n.id === 'prof'); }
  else if (S.stage === 2) { txt = `Tangkap Kucingko, Tikusil & Dombanyo (${commonsCaught()}/3)`; if (leadLow()) { txt = 'Maimon-mu lelah — bawa ke Klinik Maimon 🩷'; tgt = npcs.find((n) => n.id === 'nurse'); } }
  else if (S.stage === 3) { txt = 'Lapor hasil penelitian ke Prof. Catherine'; tgt = npcs.find((n) => n.id === 'prof'); }
  else if (S.stage === 4) { txt = 'Jelajahi Depok · cari Maimon berkilau ✨'; if (leadLow()) { txt = 'Maimon-mu lelah — ke Klinik Maimon 🩷'; tgt = npcs.find((n) => n.id === 'nurse'); } }
  $('dexb').style.display = (mode === 'play' || mode === 'menu') && S.stage >= 2 ? 'block' : 'none';
  const o = $('obj'); o.style.display = mode === 'play' && txt ? 'block' : 'none'; o.innerHTML = `<small>TUJUAN</small>${txt}`; objTarget = mode === 'play' ? tgt : null;
}
function updateMarker(dt) {
  const ar = $('arrow');
  if (!objTarget) { mk.visible = false; ar.style.display = 'none'; return; }
  mk.visible = true; mk.position.set(objTarget.x, groundY(objTarget.x, objTarget.z) + 1.5 + Math.sin(T * 4) * 0.12, objTarget.z); mk.rotation.y = T * 2;
  const [sx, sy] = toScreen(objTarget.x, 1.5, objTarget.z), W = innerWidth, H = innerHeight, m = 40;
  if (sx < m || sx > W - m || sy < m || sy > H - m) { ar.style.display = 'block'; const cx = W / 2, cy = H / 2, dx = sx - cx, dy = sy - cy, k = Math.min((W / 2 - m) / Math.abs(dx || 1e-6), (H / 2 - m) / Math.abs(dy || 1e-6)); ar.style.left = cx + dx * k + 'px'; ar.style.top = cy + dy * k + 'px'; ar.textContent = '📍'; } else ar.style.display = 'none';
}

/* ---------- interaksi ---------- */
let nearNPC = null, nearSpot = null;
function updateInteract() {
  nearNPC = null; nearSpot = null; let bd = 1.9;
  if (mode === 'play') {
    npcs.forEach((n) => { const d = Math.hypot(player.x - n.x, player.z - n.z); if (d < bd) { bd = d; nearNPC = n; } });
    spots.forEach((p) => { if (!p.ripe) return; const d = Math.hypot(player.x - p.x, player.z - p.z); if (d < p.r && d < bd) { bd = d; nearSpot = p; nearNPC = null; } });
  }
  const b = $('talk'), on = (nearNPC || nearSpot) && mode === 'play'; b.style.display = on ? 'block' : 'none';
  if (on) { b.textContent = nearSpot ? nearSpot.label : '💬 Bicara: ' + nearNPC.name.split(' ').slice(-1)[0]; const t = nearSpot || nearNPC, [sx, sy] = toScreen(t.x, groundY(t.x, t.z) + (nearSpot ? (nearSpot.h || 1) + 0.35 : 2.0), t.z); b.style.left = Math.min(Math.max(sx, 90), innerWidth - 90) + 'px'; b.style.top = Math.min(Math.max(sy, 80), innerHeight - 130) + 'px'; }
}
$('talk').onclick = () => interact();
function interact() { if (mode !== 'play') return; if (nearSpot) return gatherAt(nearSpot); if (!nearNPC) return; (nearNPC.id === 'prof' ? talkProf : nearNPC.id === 'home' ? talkHome : talkNurse)(); }
function autoMeetProf() { if (S.stage === 0 && mode === 'play') { const n = npcs.find((q) => q.id === 'prof'); if (Math.hypot(player.x - n.x, player.z - n.z) < 2.6) talkProf(); } }

/* ---------- Prof. Catherine ---------- */
function talkProf() {
  const P = 'Prof. Catherine';
  if (S.stage === 0) {
    dialog([[P, 'Ah, kamu pasti {n}! Selamat datang di Depok.'], [P, 'Aku Prof. Catherine. Aku meneliti SEMUA Maimon di Pulau Jawa. Tapi Maimon liar itu lincah sekali, aku tidak bisa mengejarnya sendirian.'], [P, 'Maukah kamu membantuku? Latih Maimon, tangkap sebanyak mungkin, dan isi Maimondex ini!'], ['{n}', 'Siap, Prof! Aku mau jadi Pelatih Maimon terbaik di dunia!'], [P, 'Semangat yang bagus! Pertama, pilih teman pertamamu. Mereka sudah menunggu di taman.']], () => { enterPick(); });
  } else if (S.stage === 2) {
    const n = commonsCaught();
    dialog([[P, n === 0 ? 'Aku butuh data Kucingko, Tikusil, dan Dombanyo. Mereka penghuni asli Depok.' : `Bagus sekali! Sudah ${n} dari 3 Maimon yang kuminta.`], [P, 'Ingat: menangkan battle dulu, lalu beri makanan favoritnya dari Tas. Belum punya? Cari di Kebun Warga, tepi Danau UI, atau mancing ikan. Kalau Maimon-mu lelah, bawa ke Klinik Maimon.'], [P, 'Oh ya, kalau kamu lihat Maimon berkilau ✨, itu SANGAT langka. Jangan sampai lepas!']]);
  } else if (S.stage === 3) {
    dialog([[P, 'Kucingko, Tikusil, Dombanyo… datanya lengkap! Kamu hebat, {n}!'], [P, 'Penelitianku di Depok berjalan lancar berkat kamu. Tapi Pulau Jawa itu luas. Ada Jakarta, Bogor, Bandung, Yogyakarta, Surabaya…'], ['{n}', 'Masih banyak Maimon yang belum kutemui! Aku siap, Prof!'], [P, 'Kuliahmu di UI juga akan segera mulai, jadi jaga keseimbangan ya. Tapi gelar Pelatih Maimon terbaik di dunia menunggumu!']], () => {
      S.stage = 4; saveGame(); Music.jingle('catch'); chapter('BAB 1 SELESAI', `Selamat, ${S.name}! Petualanganmu di Depok baru permulaan. Kota berikutnya menanti…`, 'Lanjut jelajah Depok');
    });
  } else {
    dialog([[P, 'Penelitianku butuh banyak data. Cari Maimon berkilau ✨ ya, {n}! Kalau ketemu, kabari aku.']]);
  }
}

/* ---------- Rumah Kos: titipan Maimon (tim maks. 3) ---------- */
function renderHome() {
  const P = $('homeP'), B = $('homeB'); P.innerHTML = ''; B.innerHTML = '';
  $('homeH1').textContent = `Ikut denganmu (${mates.length}/${MAXP})`; $('homeH2').textContent = `Dititip di rumah (${stash.length})`;
  const card = (sp, name, hp, hpMax, btns, star) => { const d = MAI[sp], c = document.createElement('div'); c.className = 'hc'; c.innerHTML = `<div class="em">${d.info.emo}</div><b>${star ? '⭐ ' : ''}${name}</b><span class="chip" style="background:${TCOL[d.type]}">${d.type}</span><small>HP ${Math.ceil(hp)}/${hpMax}</small>`; btns.forEach(([t, f]) => { const b = document.createElement('button'); b.textContent = t; b.onclick = f; c.appendChild(b); }); return c; };
  mates.forEach((m, i) => { const bt = []; if (i > 0) bt.push(['⭐ Pimpin', () => { mates.unshift(mates.splice(i, 1)[0]); renderChips(); renderHome(); saveGame(); }]); bt.push(['🏠 Titip', () => { if (mates.length <= 1) { toast('Minimal 1 Maimon ikut denganmu!', 1.6); return; } stash.push({ sp: m.sp, st: m.st, hp: m.hp, lv: m.lv, xp: m.xp }); world.remove(m.rig.root); mates.splice(i, 1); renderChips(); renderHome(); saveGame(); }]); P.appendChild(card(m.sp, `${m.name} Lv${m.lv}`, m.hp, m.hpMax, bt, i === 0)); });
  if (!stash.length) B.innerHTML = '<div class="hint">Belum ada Maimon yang dititip. Kalau timmu penuh, Maimon baru otomatis dititip di sini.</div>';
  stash.forEach((r, j) => { const hm = hpMaxOf(r.sp, r.st, r.lv || 5); B.appendChild(card(r.sp, MAI[r.sp].n[Math.min(r.st, MAI[r.sp].n.length) - 1] + ' Lv' + (r.lv || 5), r.hp, hm, [['🎒 Ajak', () => { if (mates.length >= MAXP) { toast(`Tim sudah penuh (maks. ${MAXP}). Titip satu dulu!`, 1.8); return; } const q = stash.splice(j, 1)[0], m = mkMon(q.sp, q.st, player.x, player.z, q.lv || 5, q.xp || 0); m.hp = Math.min(q.hp, m.hpMax); m.state = 'follow'; m.pop = 0; m.sc = m.rig.size * m.d.s * 0.8; mates.push(m); renderChips(); renderHome(); saveGame(); }]], false)); });
}
function openHome() { mode = 'home'; $('joy').style.display = 'none'; $('talk').style.display = 'none'; renderHome(); $('home').style.display = 'block'; }
$('homeX').onclick = () => { $('home').style.display = 'none'; mode = 'play'; $('joy').style.display = ''; };
function talkHome() {
  const K = 'Bu Wati';
  dialog([[K, 'Selamat datang di Rumah Kos, {n}! Ibu jaga Maimon titipanmu ya. Kamu hanya boleh membawa 3 Maimon sekaligus.']], () => openHome());
}
/* ---------- Dokter Sari (Klinik Maimon) ---------- */
function talkNurse() {
  const D = 'Dokter Sari', hurt = mates.some((m) => m.hp < m.hpMax) || stash.some((r) => r.hp < hpMaxOf(r.sp, r.st, r.lv || 5));
  if (!mates.length) { dialog([[D, 'Selamat datang di Klinik Maimon! Kalau punya Maimon yang lelah, bawa ke sini ya.']]); return; }
  if (!hurt) { dialog([[D, 'Selamat datang di Klinik Maimon! Maimon-mu sehat semua. Mantap!']]); return; }
  dialog([[D, 'Selamat datang di Klinik Maimon! Wah, Maimon-mu kelihatan lelah. Sini, kuperiksa dulu.']], () => { flashScreen(); Music.jingle('heal'); mates.forEach((m) => { m.hp = m.hpMax; burst(m.x, 0.5, m.z, '#ff9ac0', 14); }); stash.forEach((r) => { r.hp = hpMaxOf(r.sp, r.st, r.lv || 5); }); saveGame(); setTimeout(() => dialog([[D, 'Nah, sudah sehat lagi! Semangat ya, {n}!']]), 700); });
}

/* ---------- title + buat karakter ---------- */
const humans = []; let gender = null;
function enterTitle() {
  mode = 'title'; Music.play('pick'); $('title').style.display = 'flex'; $('bCont').style.display = store.get() ? '' : 'none'; $('joy').style.display = 'none'; $('zone').style.display = 'none'; $('mates').style.display = 'none'; $('snd').style.display = '';
  yaw = 0.3; pitch = 0.78; camGoal.set(-3, 0, 1); camTarget.copy(camGoal); zoomGoal = zoom = 1.55;
}
$('bNew').onclick = () => { Music.unlock(); $('title').style.display = 'none'; startIntro(() => enterCreate()); };
$('bCont').onclick = () => { Music.unlock(); $('title').style.display = 'none'; loadGame(); };

/* ---------- intro sinematik ---------- */
const INTRO_KEYS = [[0, 0, 0, 0.5, 0.95, 1.9], [6, 3, -3, 1.0, 0.8, 1.2], [10.5, 11, -6.5, 0.9, 0.55, 0.62], [16, -8, 8.5, 0.55, 0.6, 0.58], [21.5, -5, 10.4, 0.62, 0.62, 0.45]];
const INTRO_CAPS = [[0.6, 5.6, 'Pulau Jawa… tempat manusia dan Maimon hidup berdampingan.'], [6.6, 10.6, 'Pagi ini, kereta tiba di Stasiun Depok Baru membawa harapan baru…'], [11.4, 15.8, 'Seorang calon mahasiswa UI datang untuk bersiap kuliah, dengan satu mimpi besar.'], [16.6, 21, 'Menjadi Pelatih Maimon terbaik di dunia!']];
const INTRO_END = 25; let intro = null;
function startIntro(done) {
  mode = 'intro'; intro = { t: 0, done }; trainT = -4.5; $('intro').style.display = 'block'; $('ititle').style.opacity = 0; $('icap').style.opacity = 0; $('joy').style.display = 'none'; $('zone').style.display = 'none'; $('mates').style.display = 'none';
  Music.play('pick'); requestAnimationFrame(() => $('intro').classList.add('go'));
}
function endIntro() { if (!intro) return; const d = intro.done; intro = null; $('intro').style.display = 'none'; $('intro').classList.remove('go'); $('icap').style.opacity = 0; if (d) d(); }
$('iskip').onclick = () => endIntro();
function introTick(dt) {
  if (!intro) return; intro.t += dt; const t = intro.t, K = INTRO_KEYS; let a = K[0], b = K[K.length - 1];
  for (let i = 0; i < K.length - 1; i++) if (t >= K[i][0] && t <= K[i + 1][0]) { a = K[i]; b = K[i + 1]; break; }
  let k = t >= K[K.length - 1][0] ? 1 : Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0]))); k = k * k * (3 - 2 * k); if (t >= K[K.length - 1][0]) a = b;
  const L = (i) => a[i] + (b[i] - a[i]) * k; camGoal.set(L(1), 0.3, L(2)); camTarget.copy(camGoal); yaw = L(3); pitch = L(4); zoom = zoomGoal = L(5);
  const cap = INTRO_CAPS.find((c) => t >= c[0] && t <= c[1]); if (cap) { if ($('icap').textContent !== cap[2]) $('icap').textContent = cap[2]; $('icap').style.opacity = t < cap[0] + 0.5 || t > cap[1] - 0.5 ? 0.3 : 1; } else $('icap').style.opacity = 0;
  $('ititle').style.opacity = t > 21.8 && t < 24.4 ? 1 : 0;
  if (t > INTRO_END) endIntro();
}

/* ---------- pilih karakter (layar sendiri, bukan di peta) ---------- */
function enterCreate() {
  mode = 'create'; Music.play('pick'); $('cbg').style.display = 'block'; $('joy').style.display = 'none';
  const c = $('gcards'); c.innerHTML = '';
  [['boy', 'Cowok'], ['girl', 'Cewek']].forEach(([g, label]) => { const b = document.createElement('div'); b.className = 'card panel'; b.innerHTML = `<img src="${portraitHuman(g)}" alt=""><span>${label}</span>`; b.onclick = () => { gender = g; [...c.children].forEach((x, i) => x.classList.toggle('sel', i === (g === 'boy' ? 0 : 1))); $('gGo').disabled = false; $('gGo').textContent = 'Mulai Petualangan!'; Music.blip(g === 'boy' ? 440 : 600); }; c.appendChild(b); });
  $('gGo').disabled = true; $('gGo').textContent = 'Pilih dulu ya'; $('create').style.display = 'flex';
}
$('gGo').onclick = () => {
  if (!gender) return; Music.unlock(); S.gender = gender; S.name = ($('nameIn').value || '').trim() || 'Pelatih'; S.stage = 0; S.dex = {}; S.bag = {};
  $('create').style.display = 'none'; $('cbg').style.display = 'none'; $('nameIn').blur();
  setupPlayer(); beginStory();
};
function setupPlayer() { if (player.rig) world.remove(player.rig.root); player.rig = buildPlayer2(S.gender); castAll(player.rig.root); world.add(player.rig.root); player.rig.root.visible = true; player.rig.root.rotation.order = 'YXZ'; }
function beginStory() {
  let sx = 11.6, sz = -3.0, best = -1;
  for (let a = 9.6; a <= 14; a += 0.4) for (let b = -3.6; b <= 4; b += 0.4) { if (blockedAt(a, b, 0.5)) continue; let md = 9; treeMeshes.forEach((t) => { md = Math.min(md, Math.hypot(t.userData.x - a, t.userData.z - b)); }); const sc = md - 0.05 * Math.hypot(a - 11.6, b + 3); if (sc > best) { best = sc; sx = a; sz = b; } } player.x = sx; player.z = sz; player.ang = -Math.PI / 2; trail.length = 0;
  yaw = 0.62; pitch = 0.66; zoomGoal = zoom = 1; camGoal.set(player.x, 0.4, player.z); camTarget.copy(camGoal);
  $('zone').style.display = ''; $('mates').style.display = ''; Music.play(CITY);
  mode = 'dialog'; setTimeout(() => dialog([['_', 'Selamat datang di dunia Maimon! Makhluk-makhluk lucu hidup berdampingan dengan manusia di seluruh Pulau Jawa.'], ['_', '{n} baru saja pindah ke Kota Depok. Beberapa bulan lagi, {n} akan mulai kuliah di Universitas Indonesia (UI), dan sekarang waktunya bersiap.'], ['{n}', 'Jadi ini Depok! Ramai sekali… dan ada Maimon di mana-mana!'], ['{n}', 'Sebelum kuliah dimulai, aku punya mimpi: menjadi Pelatih Maimon terbaik di dunia!'], ['_', '📱 Pesan masuk dari Prof. Catherine: "Halo, {n}! Aku peneliti Maimon di UI. Mampir ke Lab Maimon di Depok Lama ya, aku tunggu di dekat Taman Maimon!"']], () => { saveGame(); }), 600);
}
function loadGame() {
  let d; try { d = JSON.parse(store.get()); } catch (e) { d = null; } if (!d) { enterCreate(); return; }
  Object.assign(S, d.S); S.bag = d.S.bag || {}; stash.length = 0; (d.box || []).forEach((r) => stash.push(r)); setupPlayer(); mates.forEach((m) => world.remove(m.rig.root)); mates.length = 0; $('mchips').innerHTML = '';
  (d.mates || []).forEach((q) => { const m = mkMon(q.sp, q.st, -6.6, 10.4, q.lv || 5, q.xp || 0); m.state = 'follow'; m.hp = Math.min(q.hp, m.hpMax); m.pop = 0; m.sc = m.rig.size * m.d.s * 0.8; mates.push(m); });
  renderChips(); player.x = -6.6; player.z = 10.4; player.ang = Math.PI / 2; trail.length = 0; yaw = 0.62; pitch = 0.66; zoomGoal = zoom = 1; camGoal.set(player.x, 0.4, player.z); camTarget.copy(camGoal);
  $('zone').style.display = ''; $('mates').style.display = ''; $('joy').style.display = ''; Music.play(CITY); mode = 'play';
  if (!mates.length && S.stage >= 2) S.stage = 0;
}
