/* =====================================================================
   LOOP UTAMA
   ===================================================================== */
/* ---------- auto-hemat: kalau HP-nya berat, turunkan kualitas bertahap (sekali jalan, tidak balik naik) ---------- */
let perfAvg = 0.016, perfLv = 0, perfNext = 6, shadowFlip = 0;
const PERF_FORCE = +(new URLSearchParams(location.search).get('perf') || -1);
function setPerf(l) {
  perfLv = l;
  if (l >= 1) { Music.lite = Math.min(2, l); sun.shadow.mapSize.set(1024, 1024); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } renderer.shadowMap.autoUpdate = false; }
  if (l >= 2 && detail !== 'retro') { detail = 'retro'; resize(); }
}
function perfTick(raw) {
  if (renderer.shadowMap.autoUpdate === false) { shadowFlip ^= 1; if (shadowFlip) renderer.shadowMap.needsUpdate = true; }
  if (PERF_FORCE >= 0) { if (perfLv !== PERF_FORCE) setPerf(PERF_FORCE); return; }
  if (mode === 'title' || document.hidden) return;
  perfAvg += (Math.min(raw, 0.25) - perfAvg) * 0.04;
  if (T > perfNext && perfAvg > 0.034 && perfLv < 2) { setPerf(perfLv + 1); perfNext = T + 6; perfAvg = 0.02; }
}
let actZ = false; const clk = new THREE.Clock(); let objT = 0;
function frame() {
  const rawDt = clk.getDelta(), dt = Math.min(rawDt, 0.05); T += dt; perfTick(rawDt);
  if (mode === 'play' && T > (window.__saveT || 0)) { window.__saveT = T + 5; if (S.stage >= 1) saveGame(); }
  { const tz = Math.max(0, Math.round((player.z - 8) * 4) / 4); if (tz !== sun.target.position.z) { sun.target.position.z = tz; sun.position.z = 14 + tz; } }
  // pemain
  if (mode === 'play') {
    let ix = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0) + joy.x;
    let iy = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0) + joy.y;
    const mag = Math.hypot(ix, iy);
    if (mag > 0.12) {
      if (mag > 1) { ix /= mag; iy /= mag; }
      const sp = 3.6 * dt, rx = Math.cos(yaw), rz = -Math.sin(yaw), fx = -Math.sin(yaw), fz = -Math.cos(yaw);
      const vx = (rx * ix - fx * iy) * sp, vz = (rz * ix - fz * iy) * sp;
      const px0 = player.x, pz0 = player.z;
      if (!blockedAt(player.x + vx, player.z, 0.28)) player.x += vx;
      if (!blockedAt(player.x, player.z + vz, 0.28)) player.z += vz;
      if (!inside) { player.x = clamp(player.x, -BG.x1 - 4.6, ECOR.xEnd + 0.1); player.z = clamp(player.z, NCOR.zEnd, BG.z1 - 0.6); }
      if (!inside) { if (Math.hypot(player.x - px0, player.z - pz0) < sp * 0.15) { stuckT += dt; if (stuckT > 1.3) { stuckT = 0; unstick(); } } else stuckT = 0; } else stuckT = 0;
      player.ang = lerpAng(player.ang, Math.atan2(vx, vz), Math.min(1, dt * 12)); player.walk = true;
      const l = trail[trail.length - 1]; if (!l || Math.hypot(l[0] - player.x, l[1] - player.z) > 0.09) { trail.push([player.x, player.z]); if (trail.length > 300) trail.shift(); }
    } else player.walk = false;
  }
  if (player.rig) { player.rig.root.position.set(player.x, groundY(player.x, player.z), player.z); player.rig.root.rotation.y = player.ang; player.rig.root.scale.setScalar(0.68); animRig(player.rig, T, player.walk && mode === 'play'); }

  // liar
  wilds.forEach((w) => updateWild(w, dt));
  starters.forEach((s) => { s.pop += dt; s.jump = Math.max(0, s.jump - dt); placeEnt(s, dt); animRig(s.rig, T + s.rig.off, false); });
  updateMates(dt);
  // respawn
  for (let i = respawns.length - 1; i >= 0; i--) if (T > respawns[i].t) { const r = respawns.splice(i, 1)[0]; trySpawn(r.sp, r.st, r.hx, r.hz, r.la || 0); }

  if (mode === 'play' && T > doorCool) { if (!inside && Math.hypot(player.x - LABDOOR.x, player.z - LABDOOR.z) < 0.55) goLab(true); else if (inside && Math.hypot(player.x - LABEXIT.x, player.z - LABEXIT.z) < 0.6) goLab(false); }
  if (yawGoal !== null) { yaw += (yawGoal - yaw) * Math.min(1, dt * 2.2); if (Math.abs(yawGoal - yaw) < 0.01) yawGoal = null; }
  introTick(dt); updateGather(dt); updateNPCs(dt); dlgTick(dt); updateInteract(); updateMarker(dt); updatePath(dt); updateLabels(); updatePick(dt); autoMeetProf(); autoMeetPolisi(); updateOuter(); updateBogor(); applyGateFromStory(); objT -= dt; if (objT < 0) { objT = 0.3; updateObjective(); }
  if (mode === 'title') { yaw += dt * 0.1; camGoal.set(-3 + Math.sin(T * 0.15) * 3, 0, 1); }
  humans.forEach((h) => { h.jump = Math.max(0, h.jump - dt); h.rig.root.position.set(h.x, groundY(h.x, h.z) + (h.jump > 0 ? Math.abs(Math.sin(h.jump * 9)) * 0.3 : 0), h.z); h.rig.root.rotation.y = h.ang; animRig(h.rig, T + h.off, false); });
  // pemicu battle + gelembung makanan
  let near = null, nd = 1e9;
  if (mode === 'play') {
    wilds.forEach((w) => { const d = Math.hypot(w.x - player.x, w.z - player.z); if (d < nd) { nd = d; near = w; } });
    if (near && nd < 2.2 && T > cooldown && !camBack && !camFocus && !actZ && mates[0] && S.stage !== 1) startBattle(near);
  }
  const bub = $('bubble');
  if (mode === 'play' && near && nd < 6.5) { const [sx, sy] = toScreen(near.x, 1.1, near.z); bub.style.display = 'block'; bub.style.left = sx + 'px'; bub.style.top = sy + 'px'; bub.textContent = (near.rare ? '✨' : '') + FOOD[near.fav][2]; } else bub.style.display = 'none';
  if (battle) { const sm = toScreen(battle.me.x, 0.95, battle.me.z), sw = toScreen(battle.w.x, 0.95, battle.w.z), mid = (sm[0] + sw[0]) / 2, bw = 150, lo = sm[0] <= sw[0];
    [['hpL', sm, battle.me, lo], ['hpR', sw, battle.w, !lo]].forEach(([id, p, e, left]) => { const el = $(id); let x = left ? Math.min(p[0] + 22, mid - 4) - bw : Math.max(p[0] - 22, mid + 4); x = Math.min(Math.max(x, 6), innerWidth - bw - 6); el.style.left = x + 'px'; el.style.top = Math.max(p[1], 100) + 'px'; el.style.transform = 'translate(0,-100%)'; }); }
  if (battle && battle.yawG !== undefined) yaw = lerpAng(yaw, battle.yawG, Math.min(1, dt * 3));
  if (document.body.dataset.mode !== mode) document.body.dataset.mode = mode;
  if (mode === 'play') $('zone').firstChild.textContent = inside ? 'Lab Maimon UI' : zoneName(player.x, player.z);
  if (mode === 'play' && !inside) { const ak = player.z > FD.z1 + 1.2 ? 'bogor' : player.z > HZ ? (player.z < 34 ? 'f1a' : 'f1b') : 'depok'; if (areaKey === null) { areaKey = ak; if (ak === 'bogor') Music.play('bogor'); else if (ak !== 'depok') Music.play('lintas'); } else if (ak !== areaKey) { const prev = areaKey; areaKey = ak; if (ak === 'bogor') Music.play('bogor'); else if (ak === 'depok') Music.play(CITY); else if (prev === 'depok' || prev === 'bogor') Music.play('lintas'); showArea(ak === 'depok' ? ['Kota', 'Depok'] : ak === 'bogor' ? ['Kota', 'Bogor'] : ['Lintas Raya Bogor', zoneName(player.x, player.z)]); } }

  // rumput terdorong
  const pu = grassUniforms.uPush.value; let n = 0;
  const addPush = (x, z, r, s) => { if (n < PUSH_N) pu[n++].set(x, z, r, s); };
  if (player.rig && player.rig.root.visible) addPush(player.x, player.z, 1.0, 1);
  mates.forEach((m) => addPush(m.x, m.z, 0.8, 0.8)); wilds.forEach((w) => { if (n < PUSH_N - 2 && Math.hypot(w.x - player.x, w.z - player.z) < 9) addPush(w.x, w.z, 0.7, 0.7); });
  while (n < PUSH_N) pu[n++].set(0, 0, 0, 0);

  // kamera
  if (mode === 'play' || mode === 'dialog' || mode === 'fish') camGoal.set(player.x, 0.4, player.z);
  if (mode === 'pick') { const s = starters[pickSel == null ? 1 : pickSel]; }
  if (mode === 'feed' && talk) camGoal.set((talk.x + player.x) / 2, 0.5, (talk.z + player.z) / 2);
  { const af = mode === 'fish' && fishSt ? [fishSt.s.tx, fishSt.s.tz] : mode === 'gather' && gatherSpot ? [gatherSpot.x, gatherSpot.z] : null;
    if (af) { actZ = true; zoomGoal = 0.5; camGoal.set(player.x * 0.55 + af[0] * 0.45, 0.45, player.z * 0.55 + af[1] * 0.45); } else if (actZ && !camFocus) { actZ = false; zoomGoal = 1; } }
  if (camFocus) { const n = camFocus.n; yaw = lerpAng(yaw, camFocus.yawT, Math.min(1, dt * 3)); zoomGoal = 0.36; camGoal.set(n.x * 0.7 + player.x * 0.3, 0.75, n.z * 0.7 + player.z * 0.3); }
  else if (camBack) { if (camBack.t === undefined) camBack.t = T + 1.4; yaw = lerpAng(yaw, camBack.yaw, Math.min(1, dt * 3)); zoomGoal = camBack.zoom; if (T > camBack.t || Math.abs(Math.atan2(Math.sin(yaw - camBack.yaw), Math.cos(yaw - camBack.yaw))) < 0.03) camBack = null; }

  toastT -= dt; if (toastT < 0) toastEl.style.opacity = 0;
  logT -= dt; if (logT < 0 && mode !== 'battle') logEl.style.opacity = 0;
  grassUniforms.uTime.value = T; updateWater(T); updateField(dt); updateTraffic(dt, player.x, player.z); updateTrain(dt); updateParts(dt);
  updateCamera(dt); render(T); requestAnimationFrame(frame);
}

/* =====================================================================
   MULAI
   ===================================================================== */
['pointerdown', 'keydown'].forEach((ev) => addEventListener(ev, () => Music.unlock()));
{ const sb = $('snd'); sb.onclick = () => { Music.unlock(); sb.textContent = Music.toggle() ? '🔊' : '🔇'; }; }
populateWorld();
addNPC('tani', 'Pak Tani', LOOK.tani, POI.tani, 0);
addNPC('polisi', 'Pak Polisi', LOOK.polisi, [1.35, FD.z1 - 2.6], -Math.PI / 2);
addNPC('prof', 'Prof. Catherine', LOOK.prof, POI.prof, Math.PI / 2); addNPC('home', 'Bu Wati', LOOK.kos, POI.home, Math.PI); addNPC('nurse', 'Dokter Sari', LOOK.nurse, POI.nurse, 0);
SPAWNS.forEach(([sp, st, x, z]) => trySpawn(sp, st, x, z));
FSPAWNS.forEach(([sp, st, x, z]) => trySpawn(sp, st, x, z, 2));
buildBogorNPCs();
BSPAWNS.forEach(([sp, st, x, z]) => trySpawn(sp, st, x, z, 3));
resize(); addEventListener('resize', resize);
enterTitle();
// ATURAN LAYOUT: NPC luar-ruang wajib di pinggir jalan raya (<= RULE.road) dan dekat gedungnya (<= RULE.bld)
const RULE = { road: 1.5, bld: 1.5 };
function npcRule() {
  return npcs.filter((n) => !(n.z > HZ + 0.1)).concat([]).map((n) => {
    const rd = Math.min(poly(C.margonda.pts, n.x, n.z).d - C.margonda.w / 2, poly(C.raya.pts, n.x, n.z).d - C.raya.w / 2);
    const bd = Math.min(...rects.map((b) => Math.hypot(Math.max(b[0] - n.x, 0, n.x - b[1]), Math.max(b[2] - n.z, 0, n.z - b[3]))));
    return { id: n.id, road: +rd.toFixed(2), bld: +bd.toFixed(2), ok: rd <= RULE.road && bd <= RULE.bld };
  }).concat(bogorNpcRule());
}
let stuckT = 0, areaKey = null, areaTm = 0;
function showArea(a) { $('areaS').textContent = a[0]; $('areaT').textContent = a[1]; const el = $('areaB'); el.classList.add('go'); Music.blip(784); clearTimeout(areaTm); areaTm = setTimeout(() => el.classList.remove('go'), 3000); }
// penyelamat kalau pemain nyangkut: pindah ke titik bebas terdekat (ruang gerak cukup lega)
function safeSpot(x, z) {
  for (let r = 0.8; r <= 9; r += 0.6) for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, nx = x + Math.cos(a) * r, nz = z + Math.sin(a) * r; if (nz > -HZ + 0.8 && nz < HZ - 0.8 && Math.abs(nx) < HX - 0.8 && !blockedAt(nx, nz, 0.7) && Math.hypot(nx - LABDOOR.x, nz - LABDOOR.z) > 1.6) return [nx, nz]; }
  return [-6.6, 10.4];
}
function unstick() { const [x, z] = safeSpot(player.x, player.z); player.x = x; player.z = z; mates.forEach((m, i) => { m.x = x - 0.6 * (i + 1); m.z = z; }); trail.length = 0; toast('Ayo lanjut jalan! 🐾', 1.6); }
window.__g = { evolveScene, evolveOffer, canEvolve, findPath, smoothPath, evoBuild, portraitRig, unstick, safeSpot, talkProf, openHome, askNick, Music, blockedAt, get battle() { return battle; }, catchP, rarityOf, feed, npcRule, rects, get dbg() { const ri = renderer.info.render; return { yaw, joy: [joy.x, joy.y], pl: [player.x, player.z], calls: ri.calls, tris: ri.triangles, geoms: renderer.info.memory.geometries, perfLv, perfAvg, lite: Music.lite, camBack: !!camBack, camFocus: !!camFocus, actZ, cd: cooldown, T, zoomGoal, stage: S.stage }; }, typeMult, tyOf, BEATS, STAT, vehicles, blockedAt, portrait, openScr, closeScr, addBag, bagN, spots, GATHERDBG, startFish, runFx, fxClear, curMoves, gainXp, xpNeed, xpFor, xpShare, gymReady, GYM_MINLV, MAI, hpBar, stash, mkMon, markDex, renderChips, S, npcs, talkProf, talkNurse, dialog, enterCreate, beginStory, Music, setPitch: (p, y) => { pitch = p; if (y !== undefined) yaw = y; }, player, wilds, mates, get mode() { return mode; }, selectStarter, confirm: () => $('go').click(), startBattle, round, feed, endBattle, setCam: (x, z, zm, y) => { camGoal.set(x, 0, z); camTarget.set(x, 0, z); zoomGoal = zoom = zm; if (y !== undefined) yaw = y; } };
frame();
if (__boot.tapped) Music.unlock();
__boot.done();
['visibilitychange', 'pagehide'].forEach((ev) => addEventListener(ev, () => { if (mode !== 'title' && mode !== 'create' && player.rig) saveGame(); }));
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
</script></body></html>
