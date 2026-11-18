
/* =====================================================================
   MENU ☰ : Maimondex (ensiklopedia) · Tim Saya (Maimon yang kita punya) · Tas (makanan)
   ===================================================================== */
const PR = { r: null, s: null, cam: null, cache: {} };
function portraitRig(key, build, rot = 0.75, bust = false) {
  if (PR.cache[key]) return PR.cache[key];
  try {
    if (!PR.r) {
      PR.r = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true }); PR.r.setPixelRatio(1); PR.r.setSize(160, 160, false); PR.r.setClearColor(0x000000, 0);
      PR.s = new THREE.Scene(); PR.s.add(new THREE.HemisphereLight('#ffffff', '#9a8a6a', 2.1)); const dl = new THREE.DirectionalLight('#ffffff', 2.6); dl.position.set(2.5, 4, 3.5); PR.s.add(dl);
      PR.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 60);
    }
    PR.r.setSize(bust === 'full' ? 320 : bust ? 384 : 160, bust === 'full' ? 512 : bust ? 384 : 160, false); const rig = build(); rig.root.rotation.y = rot; rig.update && rig.update(0.3, false); PR.s.add(rig.root); rig.root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(rig.root), c = bb.getCenter(new THREE.Vector3()), sz = bb.getSize(new THREE.Vector3()), r = Math.max(sz.x, sz.y * 1.05, sz.z) * 0.62;
    if (bust === 'full') { const rh = sz.y * 0.56, rw = rh * 320 / 512, cy = bb.min.y + sz.y * 0.5; PR.cam.left = -rw; PR.cam.right = rw; PR.cam.top = rh; PR.cam.bottom = -rh; PR.cam.updateProjectionMatrix(); c.y = cy; const sh = new THREE.Mesh(new THREE.CircleGeometry(sz.y * 0.3, 20), new THREE.MeshBasicMaterial({ color: 0x103a3f, transparent: true, opacity: 0.4 })); sh.rotation.x = -Math.PI / 2; sh.position.set(c.x, bb.min.y + 0.01, c.z); sh.scale.set(1, 0.9, 1); PR.s.add(sh); PR.cam.position.set(c.x + 1.5, cy + 1.6, c.z + 5); PR.cam.lookAt(c); PR.r.render(PR.s, PR.cam); const url0 = PR.r.domElement.toDataURL('image/png'); PR.s.remove(sh); PR.s.remove(rig.root); PR.cache[key] = url0; return url0; }
    if (bust) { const cy = bb.max.y - sz.y * 0.36, rb = sz.y * 0.44; PR.cam.left = -rb; PR.cam.right = rb; PR.cam.top = rb; PR.cam.bottom = -rb; PR.cam.updateProjectionMatrix(); c.y = cy; PR.cam.position.set(c.x + 1.3, cy + 0.7, c.z + 5); PR.cam.lookAt(c); }
    else { PR.cam.left = -r; PR.cam.right = r; PR.cam.top = r; PR.cam.bottom = -r; PR.cam.updateProjectionMatrix();
    PR.cam.position.set(c.x + 3.2, c.y + 2.6, c.z + 4.2); PR.cam.lookAt(c); }
    PR.r.render(PR.s, PR.cam); const url = PR.r.domElement.toDataURL('image/png'); PR.s.remove(rig.root); PR.cache[key] = url; return url;
  } catch (e) { console.warn('portrait', e); return ''; }
}
const portrait = (sp, st = 1) => portraitRig(sp + st, () => MAI[sp].build(st));
const portraitHuman = (g) => portraitRig('h_' + g, () => buildPlayer2(g), 0.4);
const bustHuman = (g) => portraitRig('hf_' + g, () => buildPlayer2(g), -0.15, 'full');
const bustProf = () => portraitRig('hf_prof', () => buildHuman(LOOK.prof), 0.12, 'full');
const pimg = (sp, st, cls = '') => { const u = portrait(sp, st); return u ? `<img class="${cls}" src="${u}" alt="">` : `<div class="q">${MAI[sp].info.emo}</div>`; };
const chipT = (t) => `<span class="chip" style="background:${TCOL[t]}">${t}</span>`;
const pad3 = (n) => String(n).padStart(3, '0');
const nameOf = (sp, st) => MAI[sp].n[Math.min(st, MAI[sp].n.length) - 1];

/* ----- Maimondex ----- */
let dexSel = null;
function renderDex() {
  const L = $('dexl'); L.innerHTML = '';
  DEXLIST.forEach((sp, i) => {
    const d = MAI[sp], v = S.dex[sp] || 0, r = document.createElement('div'); r.className = 'dr' + (v ? '' : ' un') + (dexSel === sp ? ' sel' : '');
    r.innerHTML = (v ? pimg(sp, 1) : '<div class="q">❔</div>') + `<div class="nm"><small>No.${pad3(i + 1)}</small><b>${v ? d.n[0] : '???'}</b></div>${v > 1 ? '<i>✅</i>' : v ? '<i>👀</i>' : ''}`;
    r.onclick = () => { dexSel = sp; renderDex(); }; L.appendChild(r);
  });
  const n = DEXLIST.filter((s) => S.dex[s] > 1).length, seen = DEXLIST.filter((s) => S.dex[s] > 0).length;
  $('dexh').textContent = `✅ ${n} tertangkap · 👀 ${seen} terlihat · dari ${DEXLIST.length}`;
  const D = $('dexd');
  if (!dexSel) dexSel = DEXLIST.find((s) => S.dex[s]) || null;
  if (!dexSel) { D.innerHTML = '<div class="hint2">Belum ada data. Temukan Maimon di Depok!</div>'; return; }
  const sp = dexSel, d = MAI[sp], v = S.dex[sp] || 0, i = DEXLIST.indexOf(sp), col = TCOL[d.type];
  if (!v) { D.innerHTML = `<div class="plate" style="background:linear-gradient(150deg,#6b6b6b,#3a3a3a)"><div class="t"><small>No.${pad3(i + 1)}</small><b>???</b></div></div><div class="hint2">Belum pernah ditemukan. Jelajahi Depok!</div>`; return; }
  const dty = tyOf(d), weak = [...new Set(Object.keys(BEATS).filter((t) => dty.some((x) => BEATS[t].includes(x))))], strong = [...new Set(dty.flatMap((x) => BEATS[x]))];
  const rare = RARE_SP.includes(sp) ? '<span class="rareb">✨ LANGKA</span>' : '';
  const evo = d.n.length > 1 ? `<div class="evo">${d.n.join(' → ')}</div>` : '';
  let h = `<div class="plate" style="background:linear-gradient(150deg,${col},#2c2118)">${pimg(sp, 1)}<div class="t"><small>No.${pad3(i + 1)} · ${d.info.cat}</small><b>${d.n[0]}</b>${evo}${dty.map(chipT).join('')}${rare}</div></div>`;
  h += `<div class="sec"><h4>KELEBIHAN & KELEMAHAN</h4><div class="chips2"><span>💪 Kuat lawan</span>${strong.map(chipT).join('')}</div><div class="chips2" style="margin-top:4px"><span>😵 Lemah lawan</span>${weak.map(chipT).join('')}</div></div>`;
  if (v > 1) {
    h += `<div class="sec"><h4>CATATAN PENELITI</h4><div class="quote">${d.info.desc}</div></div>`;
    h += `<div class="sec"><div class="stats"><div class="stat"><small>TINGGI</small>${d.info.ht}</div><div class="stat"><small>BERAT</small>${d.info.wt}</div><div class="stat"><small>FAVORIT</small>${FOOD[d.fav][2]} ${FOOD[d.fav][1]}</div></div><div class="mr" style="margin-top:6px"><b>⚡ Kecepatan</b><span class="pw"><i style="width:${d.spd}%;background:#e8b030"></i></span><b>${d.spd}</b></div></div>`;
    h += `<div class="sec"><h4>HABITAT</h4><div class="quote">📍 ${d.info.hab}</div></div>`;
    h += `<div class="sec"><h4>JURUS (MAKS. 4 · TERBUKA SESUAI LEVEL)</h4>${d.ls.map((m) => `<div class="mr"><span class="lvb">Lv ${m[0]}</span><b>${m[1]}</b>${chipT(m[2])}<span class="pw"><i style="width:${Math.round(m[3])}%;background:${TCOL[m[2]]}"></i></span></div>`).join('')}</div>`;
    h += `<div class="sec"><h4>KOLEKSIMU</h4><div class="quote">🎒 Kamu punya ${countOf(sp)} ${d.n[0]}</div></div>`;
  } else h += `<div class="sec"><div class="hint2">👀 Baru terlihat. Menangkapnya akan membuka catatan, habitat, makanan favorit, dan jurusnya.</div></div>`;
  D.innerHTML = h;
}

/* ----- Tim Saya ----- */
function renderTeam() {
  const B = $('teamb'); B.innerHTML = ''; $('teamh').textContent = `Ikut denganmu ${mates.length}/${MAXP} · dititip ${stash.length}`;
  const g = document.createElement('div'); g.className = 'teamg';
  mates.forEach((m, i) => {
    const hp = Math.max(0, m.hp) / m.hpMax, need = xpNeed(m.lv), xp = m.lv >= LVCAP ? 1 : m.xp / need, kn = movesAt(m.sp, m.lv), lk = MAI[m.sp].ls.filter((x) => x[0] > m.lv).slice(0, 4 - kn.length);
    const c = document.createElement('div'); c.className = 'tc';
    c.innerHTML = `<div class="hd">${pimg(m.sp, m.st)}<div><b>${i === 0 ? '⭐ ' : ''}${m.name}</b><small>Lv ${m.lv}${i === 0 ? ' · PEMIMPIN' : ''} · ⚡ ${speedOf(m)}</small><div style="margin-top:3px">${chipT(m.type)}</div></div></div>` +
      `<div><div class="tl"><span>HP</span><span>${Math.ceil(m.hp)} / ${m.hpMax}</span></div><div class="tb"><i style="width:${Math.round(hp * 100)}%;background:${hp < 0.25 ? '#d8452e' : hp < 0.55 ? '#e8b030' : '#5cae3c'}"></i></div></div>` +
      `<div><div class="tl"><span>XP</span><span>${m.lv >= LVCAP ? 'MAKS' : `${m.xp} / ${need}`}</span></div><div class="tb"><i style="width:${Math.round(xp * 100)}%;background:#4a9ae8"></i></div></div>` +
      `<div class="mvg">${kn.map((x) => `<div class="m"><i class="chip" style="background:${TCOL[x[2]]};padding:0 4px">&nbsp;</i><span>${x[1]}</span></div>`).join('')}${lk.map((x) => `<div class="m lk">🔒 <span>Lv ${x[0]}</span></div>`).join('')}</div>`;
    if (i > 0) { const b = document.createElement('button'); b.textContent = '⭐ Jadikan Pemimpin'; b.onclick = () => { mates.unshift(mates.splice(i, 1)[0]); renderChips(); saveGame(); renderTeam(); }; c.appendChild(b); }
    g.appendChild(c);
  });
  B.appendChild(g);
  const sec = document.createElement('div'); sec.className = 'sec'; sec.innerHTML = `<h4>🏠 DITITIP DI HOTEL MAIMON (${stash.length}) · ATUR DI HOTEL MAIMON (BU WATI)</h4>`;
  if (!stash.length) sec.innerHTML += '<div class="hint2">Belum ada. Kalau timmu penuh (maks. 3), Maimon baru dititip di sini.</div>';
  else { const mi = document.createElement('div'); mi.className = 'mini'; stash.forEach((r) => { const lv = r.lv || 5; mi.innerHTML += `<div class="mc">${pimg(r.sp, r.st)}<div><b>${nameOf(r.sp, r.st)}</b><br><small>Lv ${lv} · HP ${Math.ceil(r.hp)}/${hpMaxOf(r.sp, r.st, lv)}</small></div></div>`; }); sec.appendChild(mi); }
  B.appendChild(sec);
}

/* ----- Tas ----- */
function renderBag() {
  const B = $('bagb'); B.innerHTML = ''; const tot = FOODS.reduce((a, f) => a + bagN(f[0]), 0); $('bagh').textContent = `${tot} makanan`;
  const g = document.createElement('div'); g.className = 'bagg';
  FOODS.forEach(([id, name, em]) => {
    const n = bagN(id), fans = DEXLIST.filter((s) => MAI[s].fav === id).map((s) => (S.dex[s] ? MAI[s].n[0] : '???')).join(', ');
    const c = document.createElement('div'); c.className = 'bi' + (n ? '' : ' zero');
    c.innerHTML = `<div class="em">${em}</div><div><b>${name}</b><span class="n">x${n}</span><small>Disukai: ${fans}</small><small>${FOODWHERE[id]}</small></div>`; g.appendChild(c);
  });
  B.appendChild(g);
  const h = document.createElement('div'); h.className = 'hint2'; h.textContent = 'Setelah menang battle, beri Maimon makanan favoritnya supaya mau ikut. Makanan yang dipakai akan berkurang dari Tas.'; B.appendChild(h);
}

/* ----- navigasi menu ----- */
const SCR = { dex: renderDex, team: renderTeam, bag: renderBag };
const closeMenuPop = () => { $('menu').style.display = 'none'; };
function openScr(id) { if (S.stage === 1) S.tf[id === 'bag' ? 'bag' : 'menu'] = 1; closeMenuPop(); mode = 'menu'; $('joy').style.display = 'none'; SCR[id](); $(id).style.display = 'flex'; }
function closeScr(id) { $(id).style.display = 'none'; mode = 'play'; cooldown = Math.max(cooldown, T + 1.5); $('joy').style.display = ''; }
$('dexb').onclick = () => {
  if (mode === 'menu' && $('menu').style.display === 'flex') { closeMenuPop(); mode = 'play'; cooldown = Math.max(cooldown, T + 1.5); $('joy').style.display = ''; return; }
  if (mode !== 'play') return; mode = 'menu'; $('joy').style.display = 'none'; $('menu').style.display = 'flex';
};
document.querySelectorAll('#menu button').forEach((b) => { b.onclick = () => openScr(b.dataset.s); });
document.querySelectorAll('.scr [data-x]').forEach((b) => { b.onclick = () => closeScr(b.dataset.x); });
