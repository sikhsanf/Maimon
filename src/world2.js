
/* =====================================================================
   POHON (faceted low-poly seperti Arena Piksel, digabung jadi 1 mesh), SEMAK, RUMPUT
   ===================================================================== */
const treeGeoms = [], treeSpots = [];
const _M = new THREE.Matrix4(), _Q = new THREE.Quaternion(), _E = new THREE.Euler();
function put(g, x, y, z, s = 1, ry = 0, rx = 0, rz = 0) { _E.set(rx, ry, rz); _Q.setFromEuler(_E); _M.compose(new THREE.Vector3(x, y, z), _Q, new THREE.Vector3(s, s, s)); g.applyMatrix4(_M); g.deleteAttribute('uv'); treeGeoms.push(g); }
function pineGeoms(x, z, s, seed) {
  const y0 = groundY(x, z), r = rng(seed);
  let tg = flat(new THREE.CylinderGeometry(0.12, 0.2, 1.1, 6)); tg = faceColors(tg, (c, cx, cy, cz, ny, f) => c.set(hash2(f, seed) < 0.5 ? '#6a4a30' : '#5a3e28')); put(tg, x, y0 + 0.55 * s, z, s);
  for (let k = 0; k < 4; k++) {
    let cg = flat(new THREE.ConeGeometry(1.0 - k * 0.2, 0.95, 7)); const cp = cg.attributes.position;
    for (let i = 0; i < cp.count; i++) { const y = cp.getY(i); if (y < 0) { const hk = hash2(Math.round(cp.getX(i) * 100), Math.round(cp.getZ(i) * 100) + k); cp.setX(i, cp.getX(i) * (1 + (hk - 0.5) * 0.15)); cp.setY(i, y - hk * 0.08); } }
    cg.computeVertexNormals();
    cg = faceColors(cg, (c, cx, cy, cz, ny, f) => { const h = hash2(f, k * 7 + seed); c.set(ny < -0.2 ? '#1f4a26' : (h < 0.2 ? '#4c9440' : (h < 0.6 ? '#3a7d3a' : '#2f6a33'))).multiplyScalar(0.9 + k * 0.05); });
    put(cg, x, y0 + (1.1 + k * 0.48) * s, z, s, r() * 6);
  }
}
function roundGeoms(x, z, s, seed, fruit) {
  const y0 = groundY(x, z), r = rng(seed);
  let tg = flat(new THREE.CylinderGeometry(0.13, 0.22, 1.4, 6)); tg = faceColors(tg, (c, cx, cy, cz, ny, f) => c.set(hash2(f, seed) < 0.5 ? '#74513a' : '#634532')); put(tg, x, y0 + 0.7 * s, z, s, 0, 0, 0.06);
  const blobs = [[0, 1.8, 0, 0.8], [0.45, 1.5, 0.2, 0.56], [-0.42, 1.55, -0.15, 0.58], [0.1, 2.2, -0.2, 0.5], [-0.2, 1.6, 0.42, 0.46]];
  blobs.forEach(([bx, by, bz, br], k) => {
    let bg = flat(new THREE.IcosahedronGeometry(br, 1));
    bg = faceColors(bg, (c, cx, cy, cz, ny, f) => { const h = hash2(f, k * 13 + seed); c.set(ny > 0.5 ? (h < 0.3 ? '#8cc656' : '#78b84a') : ny < -0.3 ? '#35672b' : (h < 0.5 ? '#5a9a3c' : '#4d8c35')); if (h > (fruit ? 0.9 : 0.985)) c.set(fruit ? '#ffe45a' : '#d8443a'); });
    put(bg, x + bx * s, y0 + by * s, z + bz * s, s, r() * 3, r() * 3);
  });
}
function bushGeoms(x, z, s, seed) {
  const y0 = groundY(x, z);
  let bg = flat(new THREE.IcosahedronGeometry(0.34, 1));
  bg = faceColors(bg, (c, cx, cy, cz, ny, f) => { const h = hash2(f, seed); c.set(ny > 0.4 ? (h < 0.4 ? '#82c04e' : '#6fb044') : (h < 0.5 ? '#4c8c36' : '#427e30')); if (h > 0.96) c.set(['#f0a0c0', '#ffd23a', '#fff6dc'][seed % 3]); });
  put(bg, x, y0 + 0.2 * s, z, s, seed, 0, 0);
}
function addTree(x, z, kind = 'pine', s = 1, seed = (x * 13 + z * 7) | 0) { if (Math.hypot(x - C.dais[0], z - C.dais[1]) < 3.4 || inRect(C.garden, x, z, 0.5)) return; treeSpots.push({ x, z, kind, s, seed }); circles.push({ x, z, r: 0.32 * s }); }
function addBush(x, z, s = 1, seed = 1) { treeSpots.push({ x, z, kind: 'bush', s, seed }); }
const treeMeshes = [];
function buildTrees(from = 0) {
  const mat = toon('#ffffff', { vertexColors: true });
  treeSpots.slice(from).forEach((t) => {
    const a = treeGeoms.length;
    if (t.kind === 'pine') pineGeoms(t.x, t.z, t.s, t.seed); else if (t.kind === 'round') roundGeoms(t.x, t.z, t.s, t.seed, false); else if (t.kind === 'fruit') roundGeoms(t.x, t.z, t.s, t.seed, true); else bushGeoms(t.x, t.z, t.s, t.seed);
    const gs = treeGeoms.slice(a); if (!gs.length) return;
    const m = new THREE.Mesh(mergeGeometries(gs), mat); m.castShadow = m.receiveShadow = true; m.userData = { x: t.x, z: t.z }; world.add(m); treeMeshes.push(m);
  });
}

/* rumput instanced dengan angin + tersibak oleh pemain/Maimon (lapisan 1: digambar setelah outline) */
const PUSH_N = 10, grassUniforms = { uTime: { value: 0 }, uCamRight: { value: new THREE.Vector3(1, 0, 0) }, uPush: { value: Array.from({ length: PUSH_N }, () => new THREE.Vector4()) }, uWind: { value: 1 } };
function buildGrass(bx0 = -HX, bx1 = HX, bz0 = -HZ, bz1 = HZ, kf = kindAt, N = 52000, seed = 42) {
  const R = rng(seed), base = [], params = [], tint = [];
  const push = (x, y, z, h, tx, tz, k, w = 0) => { base.push(x, y, z); params.push(h, tx, tz, w); tint.push(k * (0.92 + R() * 0.12), k * (0.95 + R() * 0.1), k * (0.85 + R() * 0.2)); };
  for (let i = 0; i < N; i++) {
    const x = bx0 + 0.05 + R() * (bx1 - bx0 - 0.1), z = bz0 + 0.05 + R() * (bz1 - bz0 - 0.1), k = kf(x, z);
    if (k !== 'grass' && k !== 'forest' && k !== 'lawn' && k !== 'orchard' && k !== 'bank') continue;
    if (k === 'bank' && R() > 0.25) continue;
    if (rects.some((b) => x > b[0] - 0.05 && x < b[1] + 0.05 && z > b[2] - 0.05 && z < b[3] + 0.05)) continue;
    const dens = fbm(x * 0.35 + 4, z * 0.35); if (R() > 0.3 + dens * 0.8) continue;
    const tall = (k === 'lawn' ? 0.14 : 0.2) + R() * 0.16 + dens * 0.16, fr = R();
    const flower = k === 'lawn' ? 0 : fr < 0.012 ? 1 : fr < 0.024 ? 2 : fr < 0.032 ? 3 : fr < 0.037 ? 4 : 0;
    push(x, groundY(x, z), z, tall + (flower ? 0.08 : 0), (R() - 0.5) * 0.35, (R() - 0.5) * 0.35, 0.8 + dens * 0.5, flower);
  }
  const count = base.length / 3, g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([-0.04, 0, 0, 0.04, 0, 0, 0, 0, 0], 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute([0.5, 0.58, 0.42, 0.5, 0.58, 0.42, 1.0, 1.0, 0.82], 3));
  g.setAttribute('aH', new THREE.Float32BufferAttribute([0, 0, 1], 1));
  g.setAttribute('aBase', new THREE.InstancedBufferAttribute(new Float32Array(base), 3));
  g.setAttribute('aParams', new THREE.InstancedBufferAttribute(new Float32Array(params), 4));
  g.setAttribute('aTint', new THREE.InstancedBufferAttribute(new Float32Array(tint), 3));
  g.instanceCount = count;
  const m = new THREE.MeshToonMaterial({ gradientMap: gradMap, color: 0x5f9a3a, vertexColors: true, side: THREE.DoubleSide });
  m.onBeforeCompile = (sh) => {
    patchEnv(sh); Object.assign(sh.uniforms, grassUniforms);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        attribute vec3 aBase; attribute vec4 aParams; attribute vec3 aTint; attribute float aH;
        uniform float uTime; uniform vec3 uCamRight; uniform vec4 uPush[${PUSH_N}]; uniform float uWind;`)
      .replace('#include <color_vertex>', `#include <color_vertex>
        vColor.rgb *= aTint;
        if (aH > 0.5 && aParams.w > 0.5) {
          float fw = aParams.w;
          vColor.rgb = fw < 1.5 ? vec3(1.0, 0.45, 0.68) : fw < 2.5 ? vec3(1.0, 0.82, 0.22) : fw < 3.5 ? vec3(0.98, 0.97, 0.92) : vec3(0.62, 0.48, 1.0);
        }`)
      .replace('#include <begin_vertex>', `
        vec2 bend = vec2(aParams.y, aParams.z);
        float w = sin(uTime * 1.6 + aBase.x * 0.55 + aBase.z * 0.4) * 0.6 + sin(uTime * 2.7 + aBase.x * 1.1 - aBase.z * 0.9) * 0.4;
        bend += vec2(w * 0.22, w * 0.12) * uWind;
        for (int i = 0; i < ${PUSH_N}; i++) {
          vec4 p = uPush[i]; vec2 d = aBase.xz - p.xy; float dist = length(d);
          float f = clamp(1.0 - dist / max(p.z, 0.001), 0.0, 1.0) * p.w;
          bend += (d / max(dist, 0.001)) * f * 2.2;
        }
        vec3 tipDir = normalize(vec3(bend.x, 1.0, bend.y));
        vec3 transformed = aBase + tipDir * aParams.x * aH + uCamRight * position.x * (1.0 - aH);
      `);
  };
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.receiveShadow = true; mesh.layers.set(1); scene.add(mesh);
}
