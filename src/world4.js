
function populateWorld() {
  buildBuildings(); buildProps();
  // hutan kampus UI
  let tries = 0, n = 0;
  while (n < 70 && tries++ < 4000) {
    const x = C.forest[0] + 0.7 + R0() * (C.forest[1] - C.forest[0] - 1.4), z = C.forest[2] + 0.7 + R0() * (C.forest[3] - C.forest[2] - 1.4);
    if (kindAt(x, z) !== 'forest') continue;
    if (rects.some((b) => x > b[0] - 1.0 && x < b[1] + 1.0 && z > b[2] - 1.0 && z < b[3] + 1.0)) continue;
    if (treeSpots.some((p) => Math.hypot(p.x - x, p.z - z) < 1.7)) continue;
    addTree(x, z, R0() < 0.6 ? 'pine' : 'round', 0.85 + R0() * 0.4); n++;
  }
  // kebun belimbing
  [3.2, 4.8, 6.4].forEach((x) => [8.3, 10.0, 11.7].forEach((z) => addTree(x, z, 'fruit', 0.8, (x * 7 + z * 3) | 0)));
  // trotoar tengah Margonda: pohon kecil + semak
  { const L2 = polyLen(C.margonda.pts); for (let s = 1.5; s < L2 - 0.5; s += 2.7) { const [x, z] = polyAt(C.margonda.pts, s); addBush(x, z, 1.0, (s * 10) | 0); if ((s / 2.7 | 0) % 2 === 0) addTree(x, z + 1.35, 'round', 0.5, (s * 5) | 0); } }
  // tepi diorama + tersebar
  for (let i = -HX + 1.4; i < HX - 1; i += 2.0) [[i, -HZ + 1.0], [i, HZ - 1.0]].forEach(([x, z]) => { const k = kindAt(x, z); if (k === 'grass' || k === 'forest' || k === 'lawn' || k === 'bank') addTree(x + (R0() - 0.5) * 0.4, z, R0() < 0.5 ? 'pine' : 'round', 0.85 + R0() * 0.3); });
  for (let i = -HZ + 1.4; i < HZ - 1; i += 2.0) [[-HX + 1.0, i], [HX - 1.0, i]].forEach(([x, z]) => { const k = kindAt(x, z); if (k === 'grass' || k === 'forest' || k === 'lawn' || k === 'bank') addTree(x, z + (R0() - 0.5) * 0.4, R0() < 0.5 ? 'pine' : 'round', 0.85 + R0() * 0.3); });
  tries = 0; n = 0;
  while (n < 22 && tries++ < 3000) {
    const x = (R0() - 0.5) * 2 * (HX - 2), z = (R0() - 0.5) * 2 * (HZ - 2), k = kindAt(x, z);
    if (k !== 'grass' && k !== 'lawn') continue;
    if (rects.some((b) => x > b[0] - 1.1 && x < b[1] + 1.1 && z > b[2] - 1.1 && z < b[3] + 1.1)) continue;
    if (treeSpots.some((p) => Math.hypot(p.x - x, p.z - z) < 2.0)) continue;
    addTree(x, z, R0() < 0.5 ? 'pine' : 'round', 0.8 + R0() * 0.35); n++;
  }
  tries = 0; n = 0;
  while (n < 40 && tries++ < 3000) {
    const x = (R0() - 0.5) * 2 * (HX - 1.5), z = (R0() - 0.5) * 2 * (HZ - 1.5), k = kindAt(x, z);
    if (k !== 'grass' && k !== 'forest' && k !== 'lawn') continue;
    if (rects.some((b) => x > b[0] - 0.2 && x < b[1] + 0.2 && z > b[2] - 0.2 && z < b[3] + 0.2)) continue;
    addBush(x, z, 0.8 + R0() * 0.6, (R0() * 100) | 0); n++;
  }
  buildTrees(); buildGrass(); buildTraffic(); buildTrain();
}
