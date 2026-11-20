/* =====================================================================
   EVOLUSI: konfirmasi, animasi, penerapan ke rig di dunia
   ===================================================================== */
let evoBusy = false;
function markForm(sp, st) { S.fm = S.fm || {}; if ((S.fm[sp] || 1) < st) { S.fm[sp] = st; saveGame(); } }
function applyEvolution(m) {
  const d = MAI[m.sp]; world.remove(m.rig.root);
  m.st++; const rig = d.build(m.st); rig.off = R0() * 3; castAll(rig.root); world.add(rig.root); m.rig = rig;
  const oldMax = m.hpMax; m.hpMax = hpMaxOf(m.sp, m.st, m.lv); m.hp = Math.min(m.hpMax, m.hp + Math.max(0, m.hpMax - oldMax));
  m.name = m.nick || d.n[Math.min(m.st, d.n.length) - 1]; m.type2 = (d.t2 && d.t2[m.st]) || d.type2; m.sc = rig.size * d.s * 0.8; m.pop = 0.2;
  markForm(m.sp, m.st); markDex(m.sp, 2); renderChips(); saveGame();
}
function evoSparks(n, cols) {
  const st = $('evStage'), r = st.getBoundingClientRect(), cx = r.width / 2, cy = r.height / 2;
  for (let i = 0; i < n; i++) {
    const e = document.createElement('i'), a = Math.random() * Math.PI * 2, dist = r.width * (0.4 + Math.random() * 0.7), sz = 6 + Math.random() * 10;
    e.className = 'evp'; e.style.cssText = `left:${cx}px;top:${cy}px;width:${sz}px;height:${sz}px;background:${cols[i % cols.length]}`; st.appendChild(e);
    e.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * dist}px),calc(-50% + ${Math.sin(a) * dist}px)) scale(0.2) rotate(180deg)`, opacity: 0 }], { duration: 900 + Math.random() * 900, easing: 'cubic-bezier(.1,.7,.3,1)' }).onfinish = () => e.remove();
  }
}
function evoAsk(m) {
  return new Promise((res) => {
    const ov = $('evo'), nn = MAI[m.sp].n[m.st];
    $('evA').src = portrait(m.sp, m.st); $('evA').className = ''; $('evB').style.display = 'none'; ov.classList.remove('go'); ov.classList.add('ask');
    $('evT').innerHTML = `<b>${m.name}</b> bersinar terang!<br>Berevolusi menjadi <b>${nn}</b>?`; $('evBtn').style.display = 'flex'; ov.style.display = 'flex'; Music.blip(880);
    $('evYes').onclick = () => { $('evBtn').style.display = 'none'; ov.classList.remove('ask'); res(true); };
    $('evNo').onclick = () => { ov.style.display = 'none'; ov.classList.remove('ask'); toast(`${m.name} menunda evolusi. Bisa dilanjutkan dari menu Tim ✨`, 2.6); res(false); };
  });
}
async function evolveScene(m) {
  if (evoBusy || !canEvolve(m)) return; evoBusy = true;
  const ov = $('evo'), d = MAI[m.sp], oldN = m.name, nn = d.n[m.st], A = $('evA'), B = $('evB'), T = $('evT'), fl = $('evFlash'), stg = $('evStage');
  A.src = portrait(m.sp, m.st); B.src = portrait(m.sp, m.st + 1); A.className = ''; B.className = ''; A.style.display = 'block'; B.style.display = 'block'; A.style.opacity = 1; B.style.opacity = 0;
  $('evBtn').style.display = 'none'; ov.style.display = 'flex'; ov.classList.add('go'); T.innerHTML = `<b>${oldN}</b> berevolusi…`;
  stg.style.transform = 'scale(1)';
  let delay = 460;
  for (let i = 0; i < 18; i++) {
    const showB = i % 2 === 1; A.className = 'sil'; B.className = 'sil'; A.style.opacity = showB ? 0 : 1; B.style.opacity = showB ? 1 : 0;
    stg.style.transform = `scale(${1 + 0.05 * Math.sin(i) + i * 0.012})`; Music.blip(330 + i * 55); await sleep(delay); delay = Math.max(60, delay * 0.8);
  }
  fl.style.transition = 'opacity .18s'; fl.style.opacity = 1; Music.jingle('level'); await sleep(200);
  applyEvolution(m); A.style.display = 'none'; B.className = ''; B.style.opacity = 1; stg.style.transform = 'scale(1.15)';
  T.innerHTML = `Selamat! <b>${oldN}</b><br>berevolusi menjadi <b>${nn}</b>! ✨`;
  fl.style.transition = 'opacity .9s'; fl.style.opacity = 0; evoSparks(46, ['#ffe066', '#ffffff', '#7fe0ff', '#ff9ac8', '#9be85a']);
  burst(m.x, 0.8, m.z, '#ffe066', 30); await sleep(700); evoSparks(30, ['#ffe066', '#ffffff']); stg.style.transform = 'scale(1)';
  await sleep(2200); T.innerHTML += `<br><small>Ketuk untuk lanjut</small>`;
  await new Promise((r) => { const t = setTimeout(r, 3500); ov.onclick = () => { clearTimeout(t); r(); }; }); ov.onclick = null;
  ov.style.display = 'none'; ov.classList.remove('go'); evoBusy = false;
  const newMoves = MAI[m.sp].ls.filter((x) => x[0] > m.lv - 0 && false); void newMoves;
  if (mode === 'menu' && typeof renderTeam === 'function') renderTeam();
}
async function evolveOffer(m) { if (await evoAsk(m)) await evolveScene(m); }
