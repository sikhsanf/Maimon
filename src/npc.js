
/* =====================================================================
   MANUSIA: pemain (cowok/cewek), Prof. Catherine, Dokter Klinik
   ===================================================================== */
function buildHuman(o) {
  const r = newRig(), g = r.root, M = (c) => toon(c);
  const skin = o.skin || '#f0c19a', hair = o.hair || '#2b1d1a';
  const body = grp(g, 0, 0.78, 0); r.body = body;
  box(body, 0.5, 0.5, 0.3, M(o.shirt));
  box(body, 0.52, 0.08, 0.32, M(o.belt || '#ffd84a'), 0, 0.0, 0, { no: true });
  if (o.coat) {
    box(body, 0.57, 0.5, 0.35, M(o.coat), 0, -0.02, 0);
    box(body, 0.14, 0.34, 0.02, M(o.shirt), 0, 0.08, 0.18);
    box(g, 0.57, 0.3, 0.35, M(o.coat), 0, 0.42, 0);
  }
  if (o.bag) box(body, 0.38, 0.44, 0.16, M(o.bag), 0, -0.02, -0.25);
  const sleeve = o.coat || o.shirt;
  [-1, 1].forEach((sx) => {
    const l = grp(g, sx * 0.12, 0.52, 0); box(l, 0.2, 0.5, 0.22, M(o.pants), 0, -0.25, 0); box(l, 0.22, 0.1, 0.3, M(o.shoe || '#f2f2f2'), 0, -0.5, 0.04); r.legs.push({ p: l, ph: sx > 0 ? Math.PI : 0 });
    const a = grp(body, sx * 0.34, 0.2, 0); box(a, 0.16, 0.42, 0.18, M(sleeve), 0, -0.18, 0); box(a, 0.14, 0.12, 0.16, M(skin), 0, -0.4, 0); r.arms = (r.arms || []).concat([{ a, ph: sx > 0 ? 0 : Math.PI }]);
  });
  const head = grp(body, 0, 0.58, 0); r.head = head;
  faceBox(r, head, 0.64, 0.58, 0.56, skin, { mouth: true });
  const top = o.cap || hair;
  box(head, 0.68, 0.2, 0.6, M(top), 0, 0.33, -0.02);
  if (o.cap) { box(head, 0.7, 0.07, 0.3, M(o.cap), 0, 0.27, 0.36); box(head, 0.68, 0.34, 0.14, M(hair), 0, 0.1, -0.27); }
  else if (o.style === 'long') { box(head, 0.68, 0.62, 0.14, M(hair), 0, -0.02, -0.27); [-1, 1].forEach((sx) => box(head, 0.1, 0.42, 0.34, M(hair), sx * 0.34, 0.04, -0.12)); }
  else if (o.style === 'pig') { box(head, 0.68, 0.34, 0.14, M(hair), 0, 0.1, -0.27); [-1, 1].forEach((sx) => { box(head, 0.14, 0.5, 0.14, M(hair), sx * 0.42, -0.1, -0.12); box(head, 0.16, 0.08, 0.16, M('#ff5a8a'), sx * 0.42, 0.14, -0.12); }); }
  else if (o.style === 'bun') { box(head, 0.68, 0.34, 0.14, M(hair), 0, 0.1, -0.27); box(head, 0.28, 0.24, 0.28, M(hair), 0, 0.52, -0.12); }
  else box(head, 0.68, 0.34, 0.14, M(hair), 0, 0.1, -0.27);
  if (o.band) box(head, 0.7, 0.07, 0.62, M(o.band), 0, 0.23, -0.02);
  if (o.glasses) { const gm = M('#2a2a33'); box(head, 0.52, 0.04, 0.03, gm, 0, 0.04, 0.29); [-1, 1].forEach((sx) => { box(head, 0.2, 0.025, 0.03, gm, sx * 0.14, 0.12, 0.29); box(head, 0.2, 0.025, 0.03, gm, sx * 0.14, -0.04, 0.29); box(head, 0.025, 0.16, 0.03, gm, sx * 0.24, 0.04, 0.29); box(head, 0.025, 0.16, 0.03, gm, sx * 0.04, 0.04, 0.29); }); }
  if (o.hat) { box(head, 0.36, 0.14, 0.22, M('#ffffff'), 0, 0.46, 0.1); box(head, 0.36, 0.05, 0.23, M('#ff6f9a'), 0, 0.41, 0.1); box(head, 0.08, 0.1, 0.03, M('#ff6f9a'), 0, 0.46, 0.22); box(head, 0.3, 0.04, 0.03, M('#ff6f9a'), 0, 0.46, 0.22); }
  r.update = (t, walk) => {
    r.legs.forEach((l) => { l.p.rotation.x = walk ? Math.sin(t * 9 + l.ph) * 0.7 : 0; });
    r.arms.forEach((a) => { a.a.rotation.x = walk ? Math.sin(t * 9 + a.ph) * 0.6 : 0; });
    body.position.y = 0.78 + (walk ? Math.abs(Math.sin(t * 9)) * 0.04 : Math.sin(t * 2) * 0.01);
    head.rotation.x = Math.sin(t * 1.3) * 0.03;
  };
  return r;
}
const LOOK = {
  boy: { shirt: '#3a86d6', pants: '#33405a', cap: '#e24a3a', hair: '#2b1d1a', bag: '#f2c230', belt: '#f2f2f2' },
  girl: { shirt: '#ffd23a', pants: '#3d5a9e', style: 'pig', hair: '#2b1d1a', band: null, bag: '#e84a8a', belt: '#ffffff' },
  prof: { skin: '#e8b890', shirt: '#3aa8a0', pants: '#3a3f58', coat: '#f4f6fa', style: 'bun', hair: '#3a2418', glasses: true, belt: '#ffffff', shoe: '#33405a' },
  nurse: { skin: '#f0c19a', shirt: '#ffffff', pants: '#e8708f', coat: '#ffd6e5', style: 'long', hair: '#1d1612', hat: true, belt: '#ffffff', shoe: '#ffffff' },
};
const buildPlayer2 = (gender) => buildHuman(LOOK[gender] || LOOK.boy);
