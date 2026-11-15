
function buildQuad(S) {
  const r = newRig(), g = r.root; r.size = 1; r.h = S.h || 0.8;
  const F = toon(S.fur), D = toon(S.dark || S.fur), B = toon(S.belly || S.fur), W = toon(S.wool || S.fur);
  const legH = S.legH, [bw, bh, bd] = S.body;
  const body = grp(g, 0, legH + bh / 2, 0); r.body = body; r.baseY = legH + bh / 2;
  box(body, bw, bh, bd, W);
  if (S.belly) box(body, bw * 0.8, 0.05, bd * 0.8, B, 0, -bh / 2 + 0.02, 0.02);
  (S.stripes || []).forEach((z) => box(body, bw * 0.7, 0.03, 0.07, D, 0, bh / 2 + 0.005, z, { no: true }));
  if (S.bumps) for (let i = 0; i < 9; i++) { const a = i * 2.4; box(body, 0.2, 0.18, 0.2, toon('#fffaf0'), Math.cos(a) * bw * 0.42, (i % 3 - 1) * 0.12 + 0.05, Math.sin(a * 1.3) * bd * 0.36, { no: true, rz: a, rx: a * 0.5 }); }
  [[-1, 0.33, 0], [1, 0.33, Math.PI], [-1, -0.33, Math.PI], [1, -0.33, 0]].forEach(([sx, sz, ph]) => {
    const p = grp(g, sx * bw * 0.3, legH, sz * bd); box(p, 0.12, legH, 0.12, D, 0, -legH / 2, 0); box(p, 0.135, 0.06, 0.15, toon(S.foot || '#3b2b22'), 0, -legH + 0.03, 0.01); r.legs.push({ p, ph });
  });
  const hw = S.head[0], hh = S.head[1], hd = S.head[2];
  const head = grp(body, 0, bh * 0.3, bd / 2 + hd / 2 - 0.06); r.head = head;
  faceBox(r, head, hw, hh, hd, S.headCol || S.fur, { blush: S.blush || '#f59a9a' });
  if (S.snout) { box(head, hw * 0.5, hh * 0.3, 0.1, toon(S.snout), 0, -hh * 0.16, hd / 2 + 0.04); box(head, 0.07, 0.05, 0.04, toon(S.nose || '#3a2a22'), 0, -hh * 0.06, hd / 2 + 0.1, { no: true }); }
  r.ears = [];
  [-1, 1].forEach((sx) => {
    const e = grp(head, sx * hw * 0.33, hh / 2 - 0.02, -0.02);
    if (S.ear === 'point') { box(e, 0.14, 0.2, 0.06, F, 0, 0.1, 0); box(e, 0.07, 0.11, 0.02, toon('#f2b3a9'), 0, 0.09, 0.035, { no: true }); }
    else if (S.ear === 'round') { box(e, 0.24, 0.24, 0.05, F, 0, 0.12, 0); box(e, 0.15, 0.15, 0.02, toon('#f2b3a9'), 0, 0.12, 0.035, { no: true }); }
    else if (S.ear === 'floppy') { e.position.set(sx * (hw / 2 + 0.05), hh * 0.15, 0); box(e, 0.1, 0.22, 0.14, D, 0, -0.08, 0); }
    e.rotation.z = -sx * (S.ear === 'floppy' ? 0.5 : 0.3); r.ears.push({ e, sx, base: e.rotation.z });
  });
  if (S.horns) [-1, 1].forEach((sx) => { const hg = grp(head, sx * hw * 0.55, hh * 0.3, 0); box(hg, 0.12, 0.12, 0.22, toon('#e8dcc0'), 0, 0, 0); box(hg, 0.12, 0.2, 0.12, toon('#e8dcc0'), sx * 0.08, -0.1, -0.1); });
  const tail = grp(body, 0, bh * 0.15, -bd / 2); r.tail = tail;
  if (S.tail === 'long') { box(tail, 0.08, 0.08, 0.1, F, 0, 0, -0.05); box(tail, 0.07, 0.34, 0.07, F, 0, 0.18, -0.12, { rx: -0.3 }); box(tail, 0.07, 0.07, 0.07, D, 0, 0.38, -0.17); }
  else if (S.tail === 'thin') { for (let i = 0; i < 4; i++) box(tail, 0.05, 0.05, 0.14, toon('#f2a9b0'), 0, -i * 0.01, -0.07 - i * 0.14, { no: true }); }
  else box(tail, 0.16, 0.16, 0.16, toon('#fffaf0'), 0, 0, -0.06);
  r.update = (t, walk) => {
    const sp = walk ? 8 : 0;
    r.legs.forEach((l) => { l.p.rotation.x = walk ? Math.sin(t * sp + l.ph) * 0.6 : 0; });
    body.position.y = r.baseY + (walk ? Math.abs(Math.sin(t * sp)) * 0.035 : Math.sin(t * 2) * 0.008);
    head.rotation.x = Math.sin(t * 1.3) * 0.06 + (walk ? Math.sin(t * sp * 2) * 0.03 : 0);
    tail.rotation.z = Math.sin(t * (walk ? 9 : 3)) * 0.35; if (S.tail === 'long') tail.rotation.x = Math.sin(t * 2) * 0.1;
    r.ears.forEach((e, i) => { e.e.rotation.z = e.base + Math.sin(t * 2 + i * 1.7) * 0.05 + (Math.sin(t * 0.8 + i) > 0.95 ? -e.sx * 0.25 : 0); });
  };
  return r;
}
const SPEC = {
  kucingko: { fur: '#e89a4a', dark: '#c97a2c', belly: '#fff1d6', body: [0.4, 0.36, 0.62], head: [0.46, 0.4, 0.4], legH: 0.24, ear: 'point', tail: 'long', stripes: [-0.2, 0, 0.2], snout: '#fff1d6', nose: '#e0587a', h: 0.8 },
  tikusil: { fur: '#a9adb8', dark: '#8d92a0', belly: '#eceef2', body: [0.34, 0.3, 0.46], head: [0.36, 0.32, 0.36], legH: 0.16, ear: 'round', tail: 'thin', snout: '#f2c0c6', nose: '#e0587a', h: 0.6 },
  dombanyo: { fur: '#7a5a46', dark: '#5c4334', wool: '#fff6e0', body: [0.62, 0.52, 0.74], head: [0.38, 0.36, 0.34], legH: 0.3, ear: 'floppy', tail: 'pom', bumps: true, horns: true, h: 1.0, foot: '#2f2420' },
};


function buildPlayer() {
  const r = newRig(), g = r.root;
  const skin = '#f0c19a', shirt = '#ff6f61', pants = '#3d5a9e', hair = '#2b1d1a';
  const body = grp(g, 0, 0.78, 0); r.body = body; box(body, 0.5, 0.5, 0.3, toon(shirt)); box(body, 0.52, 0.08, 0.32, toon('#ffd84a'), 0, 0.0, 0, { no: true });
  [-1, 1].forEach((sx) => {
    const l = grp(g, sx * 0.12, 0.52, 0); box(l, 0.2, 0.5, 0.22, toon(pants), 0, -0.25, 0); box(l, 0.22, 0.1, 0.3, toon('#f2f2f2'), 0, -0.5, 0.04); r.legs.push({ p: l, ph: sx > 0 ? Math.PI : 0 });
    const a = grp(body, sx * 0.34, 0.2, 0); box(a, 0.16, 0.42, 0.18, toon(shirt), 0, -0.18, 0); box(a, 0.14, 0.12, 0.16, toon(skin), 0, -0.4, 0); r.arms = (r.arms || []).concat([{ a, ph: sx > 0 ? 0 : Math.PI }]);
  });
  const head = grp(body, 0, 0.58, 0); r.head = head;
  faceBox(r, head, 0.64, 0.58, 0.56, skin, { mouth: true });
  box(head, 0.68, 0.2, 0.6, toon(hair), 0, 0.33, -0.02); box(head, 0.68, 0.4, 0.14, toon(hair), 0, 0.08, -0.27);
  box(head, 0.7, 0.07, 0.3, toon('#4aa3d9'), 0, 0.27, 0.36);
  r.update = (t, walk) => {
    r.legs.forEach((l) => { l.p.rotation.x = walk ? Math.sin(t * 9 + l.ph) * 0.7 : 0; });
    r.arms.forEach((a) => { a.a.rotation.x = walk ? Math.sin(t * 9 + a.ph) * 0.6 : 0; });
    body.position.y = 0.78 + (walk ? Math.abs(Math.sin(t * 9)) * 0.04 : Math.sin(t * 2) * 0.01);
    head.rotation.x = Math.sin(t * 1.3) * 0.03;
  };
  return r;
}
