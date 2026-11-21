/* =====================================================================
   PELATIH (trainer) di sepanjang field — BUKAN di kota.
   - Berdiri di pinggir jalan, menghadap jalan. Kalau pemain lewat di depan matanya
     (jarak <= sight dan masih di kerucut pandang) ia menyapa lalu battle.
   - Bisa juga diajak bicara (tombol Bicara) untuk menantang.
   - Menang: XP x1.3 per Maimon lawan + hadiah makanan. Kalah: pulang ke Klinik, boleh coba lagi.
   - Tidak bisa kabur, tidak bisa menangkap Maimon pelatih.
   ===================================================================== */
const TRAINER_STAGE = 4;   // aktif setelah lapor ke Prof (stage 4+)
const TLOOK = {
  pramuka: { skin: '#d9a47a', shirt: '#b5772f', pants: '#7a4a24', cap: '#b5772f', hair: '#1a1210', belt: '#ffffff', shoe: '#3a2a1a', band: '#d8452e' },
  ibu: { skin: '#e8b890', shirt: '#e8708f', pants: '#5a3a6a', style: 'bun', hair: '#2a1a14', belt: '#ffd23a', shoe: '#6a4a3a', band: '#ffd23a' },
  sopir: { skin: '#c98f66', shirt: '#3a86d6', pants: '#2a3350', cap: '#d8452e', hair: '#1a1210', belt: '#222222', shoe: '#1a1a1a', band: '#ffffff' },
};
const TRAINERS = [
  { id: 'tr_dodi', name: 'Dodi si Pramuka', look: 'pramuka', pos: [-4.6, 23.0], ang: Math.PI / 2, sight: 6,
    team: [['kucingko', 1, 5]], reward: ['jagung', 2],
    pre: ['Hei, kamu! Pramuka Siaga harus selalu siap sedia. Ayo battle Maimon denganku!'], win: ['Wah, kamu hebat! Aku harus latihan lagi. Ini bekal buatmu.'], lose: ['Hore, aku menang! Latihan lagi ya, nanti kita battle ulang.'], again: ['Kamu kuat banget! Semangat terus jalan ke Bogor ya!'] },
  { id: 'tr_ratna', name: 'Bu Ratna', look: 'ibu', pos: [2.6, 40.0], ang: -Math.PI / 2, sight: 6,
    team: [['tikusil', 1, 6], ['dombanyo', 1, 6]], reward: ['wortel', 2],
    pre: ['Ibu baru pulang dari pasar Bogor. Tapi Maimon Ibu masih semangat. Ayo main sebentar!'], win: ['Aduh, anak muda zaman sekarang kuat-kuat. Ini wortel buat Maimon-mu ya.'], lose: ['Hehe, Ibu menang. Istirahat dulu di klinik ya, Nak.'], again: ['Maimon-mu pintar. Hati-hati di jalan ya, Nak!'] },
  { id: 'tr_jalu', name: 'Bang Jalu Sopir', look: 'sopir', pos: [-3.6, 44.0], ang: Math.PI / 2, sight: 6,
    team: [['kancik', 1, 7], ['cebongi', 1, 8]], reward: ['ikan', 2],
    pre: ['Macet di Jalan Raya Bogor, jadi aku latihan Maimon sambil nunggu. Lawan aku, yuk!'], win: ['Mantap! Kamu pantas jadi pelatih Bogor. Ini ikan bekalku.'], lose: ['Kalah ya? Santai, latihan lagi aja. Aku nunggu di sini.'], again: ['Bogor sudah dekat. Semangat, Bro!'] },
];
const trainerOf = (n) => n && n.tr;
function setupTrainers() {
  TRAINERS.forEach((d) => {
    const n = addNPC(d.id, d.name, TLOOK[d.look], d.pos, d.ang); n.tr = { def: d, n, idx: 0, cool: 0 };
  });
}
const trDone = (d) => !!(S.tr && S.tr[d.id]);
function trainerSpawn(t, x, z) {
  const d = t.def, [sp, st, lv] = d.team[t.idx], [fx, fz] = freeSpot(x, z, 0.4), w = mkMon(sp, st, fx, fz, lv);
  w.tr = t; w.rad = 0; w.state = 'battle'; w.spark = 0; wilds.push(w); return w;
}
function trainerStart(t) {
  if (!mates.some((m) => m.hp > 0)) { toast('Maimon-mu butuh istirahat dulu, ke Klinik ya 🩷', 2.2); return; }
  t.idx = 0; const n = t.n, dx = player.x - n.x, dz = player.z - n.z, d = Math.hypot(dx, dz) || 1, k = Math.min(2.6, d * 0.5);
  const w = trainerSpawn(t, n.x + dx / d * k, n.z + dz / d * k); w.pop = 0; startBattle(w);
}
function talkTrainer(n) {
  const t = n.tr, d = t.def; pendingFocus = n;
  if (S.stage < TRAINER_STAGE) { dialog([[d.name, 'Kamu pelatih baru ya? Selesaikan tugas dari Prof. Catherine dulu, baru kita battle!']]); return; }
  if (trDone(d)) { dialog([[d.name, d.again[0]]]); return; }
  dialog([[d.name, d.pre[0]]], () => trainerStart(t));
}
function updateTrainers() {
  if (mode !== 'play' || inside || S.stage < TRAINER_STAGE || T < cooldown || camBack || camFocus || actZ || !mates[0] || player.z < HZ) return;
  for (const n of npcs) {
    const t = n.tr; if (!t || trDone(t.def) || T < t.cool) continue;
    const dx = player.x - n.x, dz = player.z - n.z, d = Math.hypot(dx, dz); if (d > t.def.sight) continue;
    let da = Math.atan2(dx, dz) - t.def.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
    if (Math.abs(da) > 0.62) continue;
    t.cool = T + 30; Music.blip(988); toast(`❗ ${t.def.name} melihatmu!`, 1.4); pendingFocus = n;
    dialog([[t.def.name, t.def.pre[0]]], () => trainerStart(t)); return;
  }
}
/* dipanggil dari endBattle kalau lawan adalah Maimon pelatih */
async function trainerEnd(res) {
  closeSwapUI(); const { w, me } = battle, t = w.tr, d = t.def; me.status = w.status = null; $('battle').style.display = 'none'; logEl.style.opacity = 0;
  const drop = () => { const i = wilds.indexOf(w); if (i >= 0) wilds.splice(i, 1); world.remove(w.rig.root); };
  if (res === 'win') {
    battle = null; w.hp = 0; me.state = 'follow'; mode = 'feed'; Music.jingle('win'); camGoal.set(w.x, 0.3, w.z); zoomGoal = 0.45;
    const xp = Math.round(xpFor(w) * 1.3), msgs = [`${me.name} dapat ${xpShare(me, w, xp)} XP!`], evoQ = [];
    mates.forEach((m, i) => { const r = gainXp(m, xpShare(m, w, i === 0 ? xp : Math.floor(xp / 2))); r.ups.forEach((l) => msgs.push({ m, l })); r.learned.forEach((n) => msgs.push(`📘 ${m.name} belajar jurus ${n}!`)); if (r.evo) evoQ.push(m); });
    for (const x of msgs) { if (typeof x === 'string') { toast(x, 1.7); await sleep(1500); } else { await levelUpFx(x.m, x.l, w); } if (mode !== 'feed') return; }
    for (const m of evoQ) { if (mode !== 'feed') return; await evolveOffer(m); }
    const px = w.x, pz = w.z; drop(); t.idx++;
    if (t.idx < d.team.length) {
      toast(`${d.name} mengirim Maimon berikutnya!`, 1.6); await sleep(1500); if (mode !== 'feed') return;
      const w2 = trainerSpawn(t, px, pz); w2.pop = 0; startBattle(w2); return;
    }
    S.tr = S.tr || {}; S.tr[d.id] = 1; const [fid, fn] = d.reward; addBag(fid, fn); Music.play(CITY); saveGame();
    leaveEncounter(2.5); pendingFocus = t.n;
    dialog([[d.name, d.win[0]], ['_', `Kamu dapat ${fn}× ${FOOD[fid][2]} ${FOODS.find((f) => f[0] === fid)[1]}!`]], () => { Music.jingle('catch'); saveGame(); });
  } else {
    Music.play(CITY); Music.jingle('lose'); toast(`${me.name} kecapekan… bawa ke Klinik Maimon 🩷`, 2.8); me.hp = Math.max(1, Math.round(me.hpMax * 0.3));
    drop(); battle = null; me.state = 'follow'; t.idx = 0; t.cool = T + 60; leaveEncounter(6); pendingFocus = t.n; dialog([[d.name, d.lose[0]]]);
  }
}
setupTrainers();
