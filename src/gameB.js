/* =====================================================================
   LOOP UTAMA
   ===================================================================== */
const clk = new THREE.Clock(); let objT = 0;
function frame() {
  const dt = Math.min(clk.getDelta(), 0.05); T += dt;
  // pemain
  if (mode === 'play') {
    let ix = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0) + joy.x;
    let iy = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0) + joy.y;
    const mag = Math.hypot(ix, iy);
    if (mag > 0.12) {
      if (mag > 1) { ix /= mag; iy /= mag; }
      const sp = 3.6 * dt, rx = Math.cos(yaw), rz = -Math.sin(yaw), fx = -Math.sin(yaw), fz = -Math.cos(yaw);
      const vx = (rx * ix - fx * iy) * sp, vz = (rz * ix - fz * iy) * sp;
      if (!blockedAt(player.x + vx, player.z, 0.28)) player.x += vx;
      if (!blockedAt(player.x, player.z + vz, 0.28)) player.z += vz;
      player.x = clamp(player.x, -HX + 0.6, HX - 0.6); player.z = clamp(player.z, -HZ + 0.6, HZ - 0.6);
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
  for (let i = respawns.length - 1; i >= 0; i--) if (T > respawns[i].t) { const r = respawns.splice(i, 1)[0]; trySpawn(r.sp, r.st, r.hx, r.hz); }

  updateGather(dt); updateNPCs(dt); dlgTick(dt); updateInteract(); updateMarker(dt); autoMeetProf(); objT -= dt; if (objT < 0) { objT = 0.3; updateObjective(); }
  if (mode === 'title') { yaw += dt * 0.1; camGoal.set(-3 + Math.sin(T * 0.15) * 3, 0, 1); }
  humans.forEach((h) => { h.jump = Math.max(0, h.jump - dt); h.rig.root.position.set(h.x, groundY(h.x, h.z) + (h.jump > 0 ? Math.abs(Math.sin(h.jump * 9)) * 0.3 : 0), h.z); h.rig.root.rotation.y = h.ang; animRig(h.rig, T + h.off, false); });
  // pemicu battle + gelembung makanan
  let near = null, nd = 1e9;
  if (mode === 'play') {
    wilds.forEach((w) => { const d = Math.hypot(w.x - player.x, w.z - player.z); if (d < nd) { nd = d; near = w; } });
    if (near && nd < 2.2 && T > cooldown && mates[0]) startBattle(near);
  }
  const bub = $('bubble');
  if (mode === 'play' && near && nd < 6.5) { const [sx, sy] = toScreen(near.x, 1.1, near.z); bub.style.display = 'block'; bub.style.left = sx + 'px'; bub.style.top = sy + 'px'; bub.textContent = (near.rare ? '✨' : '') + FOOD[near.fav][2]; } else bub.style.display = 'none';
  if (battle) { const sm = toScreen(battle.me.x, 0.95, battle.me.z), sw = toScreen(battle.w.x, 0.95, battle.w.z), mid = (sm[0] + sw[0]) / 2, bw = 150, lo = sm[0] <= sw[0];
    [['hpL', sm, battle.me, lo], ['hpR', sw, battle.w, !lo]].forEach(([id, p, e, left]) => { const el = $(id); let x = left ? Math.min(p[0] + 22, mid - 4) - bw : Math.max(p[0] - 22, mid + 4); x = Math.min(Math.max(x, 6), innerWidth - bw - 6); el.style.left = x + 'px'; el.style.top = Math.max(p[1], 100) + 'px'; el.style.transform = 'translate(0,-100%)'; }); }
  if (document.body.dataset.mode !== mode) document.body.dataset.mode = mode;
  if (mode === 'play') $('zone').firstChild.textContent = zoneName(player.x, player.z);

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

  toastT -= dt; if (toastT < 0) toastEl.style.opacity = 0;
  logT -= dt; if (logT < 0 && mode !== 'battle') logEl.style.opacity = 0;
  grassUniforms.uTime.value = T; updateWater(T); updateTraffic(dt, player.x, player.z); updateTrain(dt); updateParts(dt);
  updateCamera(dt); render(T); requestAnimationFrame(frame);
}

/* =====================================================================
   MULAI
   ===================================================================== */
['pointerdown', 'keydown'].forEach((ev) => addEventListener(ev, () => Music.unlock()));
{ const sb = $('snd'); sb.onclick = () => { Music.unlock(); sb.textContent = Music.toggle() ? '🔊' : '🔇'; }; }
populateWorld();
addNPC('prof', 'Prof. Catherine', LOOK.prof, POI.prof, -Math.PI / 2); addNPC('home', 'Bu Wati', LOOK.kos, POI.home, Math.PI); addNPC('nurse', 'Dokter Sari', LOOK.nurse, POI.nurse, Math.PI / 2);
SPAWNS.forEach(([sp, st, x, z]) => trySpawn(sp, st, x, z));
resize(); addEventListener('resize', resize);
$('loading').style.display = 'none';
enterTitle();
window.__g = { portrait, openScr, closeScr, addBag, bagN, spots, GATHERDBG, startFish, runFx, fxClear, curMoves, gainXp, MAI, hpBar, stash, mkMon, markDex, renderChips, S, npcs, talkProf, talkNurse, dialog, enterCreate, beginStory, Music, setPitch: (p, y) => { pitch = p; if (y !== undefined) yaw = y; }, player, wilds, mates, get mode() { return mode; }, selectStarter, confirm: () => $('go').click(), startBattle, round, feed, endBattle, setCam: (x, z, zm, y) => { camGoal.set(x, 0, z); camTarget.set(x, 0, z); zoomGoal = zoom = zm; if (y !== undefined) yaw = y; } };
frame();
['visibilitychange', 'pagehide'].forEach((ev) => addEventListener(ev, () => { if (mode !== 'title' && mode !== 'create' && player.rig) saveGame(); }));
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
</script></body></html>
