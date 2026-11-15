/* ================= helpers ================= */
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hash2(x, y) { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function vnoise(x, y) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
function fbm(x, y) { return vnoise(x, y) * 0.6 + vnoise(x * 2.1 + 7.3, y * 2.1 + 1.7) * 0.3 + vnoise(x * 4.3 + 3.1, y * 4.3 + 9.2) * 0.1; }
const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const shade = (c, k) => c.map((v) => Math.max(0, Math.min(255, Math.round(v * k))));
const mixc = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (t) => t * t * (3 - 2 * t);
const R0 = Math.random;

function pixCanvas(w, h, fn) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); const img = g.createImageData(w, h); const d = img.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const col = fn(x, y); const i = (y * w + x) * 4;
    d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = col[3] ?? 255;
  }
  g.putImageData(img, 0, 0); return c;
}
function toTex(c) { const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace; return t; }


const app = document.getElementById('app'), canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.autoClear = false; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const CAM_NEAR = 50, CAM_FAR = 120;
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, CAM_NEAR, CAM_FAR);
const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
let lowW = 320, lowH = 180, px = 3, colorRT, normalRT, compRT;
const normalMat = new THREE.MeshNormalMaterial();
const DETAIL = { halus: 400, sedang: 300, retro: 220 }; let detail = 'sedang';
const skyU = {
  skyTop: { value: new THREE.Color() }, skyBot: { value: new THREE.Color() }, cloudLit: { value: new THREE.Color() }, cloudShade: { value: new THREE.Color() },
  uCloud: { value: 0.3 }, uStars: { value: 0 }, uSun: { value: new THREE.Vector3() }, uMoon: { value: new THREE.Vector3() }, uSunCol: { value: new THREE.Color() },
  uFlash: { value: 0 }, uHaze: { value: 0 }, uHazeCol: { value: new THREE.Color() },
};
const outlineMat = new THREE.ShaderMaterial({
  uniforms: { tDiffuse: { value: null }, tDepth: { value: null }, tNormal: { value: null }, resolution: { value: new THREE.Vector4() }, uTime: { value: 0 }, uYaw: { value: 0 }, ...skyU },
  depthTest: true, depthWrite: true, depthFunc: THREE.AlwaysDepth,
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform sampler2D tDepth; uniform sampler2D tNormal;
    uniform vec4 resolution; uniform float uTime; uniform float uYaw;
    uniform vec3 skyTop; uniform vec3 skyBot; uniform vec3 cloudLit; uniform vec3 cloudShade;
    uniform float uCloud; uniform float uStars; uniform vec3 uSun; uniform vec3 uMoon; uniform vec3 uSunCol;
    uniform float uFlash; uniform float uHaze; uniform vec3 uHazeCol;
    varying vec2 vUv;
    float dAt(vec2 o){ return texture2D(tDepth, vUv + o * resolution.zw).r; }
    vec3 nAt(vec2 o){ return texture2D(tNormal, vUv + o * resolution.zw).rgb * 2.0 - 1.0; }
    float bayer4(vec2 p){
      int x = int(mod(p.x, 4.0)); int y = int(mod(p.y, 4.0));
      float m[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
      return (m[x + y * 4] + 0.5) / 16.0;
    }
    float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(h21(i), h21(i + vec2(1,0)), f.x), mix(h21(i + vec2(0,1)), h21(i + vec2(1,1)), f.x), f.y); }
    float fbm(vec2 p){ return vn(p) * 0.5 + vn(p * 2.03 + 3.1) * 0.27 + vn(p * 4.1 + 7.7) * 0.15 + vn(p * 8.3 + 1.3) * 0.08; }
    float depthEdge(float d){
      float diff = 0.0;
      diff += clamp(dAt(vec2(1,0)) - d, 0.0, 1.0); diff += clamp(dAt(vec2(-1,0)) - d, 0.0, 1.0);
      diff += clamp(dAt(vec2(0,1)) - d, 0.0, 1.0); diff += clamp(dAt(vec2(0,-1)) - d, 0.0, 1.0);
      return floor(smoothstep(0.004, 0.011, diff) * 2.0) / 2.0;
    }
    float nEdge1(vec2 o, float d, vec3 n){
      float dd = dAt(o) - d; vec3 nn = nAt(o);
      float nd = dot(n - nn, vec3(1.0));
      float ni = clamp(smoothstep(-0.01, 0.01, nd), 0.0, 1.0);
      float di = clamp(sign(dd * 0.25 + 0.0025), 0.0, 1.0);
      return (1.0 - dot(n, nn)) * di * ni;
    }
    float normalEdge(float d, vec3 n){
      float s = nEdge1(vec2(0,-1), d, n) + nEdge1(vec2(0,1), d, n) + nEdge1(vec2(-1,0), d, n) + nEdge1(vec2(1,0), d, n);
      return step(0.12, s);
    }
    vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }
    void main(){
      float d = dAt(vec2(0.0));
      vec3 col;
      if (d >= 0.99999) {
        vec2 p = floor(vUv * resolution.xy);
        float bay = bayer4(p);
        float steps = 8.0;
        float q = clamp(floor(vUv.y * steps + bay) / steps, 0.0, 1.0);
        col = mix(skyBot, skyTop, q);
        // stars
        if (uStars > 0.01 && vUv.y > 0.25) {
          float s = h21(p + 13.0);
          if (s > 0.9962) { float tw = 0.6 + 0.4 * sin(uTime * 3.0 + s * 900.0); col = mix(col, vec3(1.0, 0.97, 0.9), uStars * tw * (s > 0.9992 ? 1.0 : 0.6)); }
        }
        float px2 = resolution.y / 300.0;
        // sun and moon
        if (uSun.z > 0.5) {
          float sd = length(p - uSun.xy * resolution.xy) / px2;
          if (sd < 6.5) col = mix(uSunCol, vec3(1.0), 0.6);
          else if (sd < 9.5 && bay < 0.5) col = mix(col, uSunCol, 0.55);
          else if (sd < 15.0 && bay < 0.2) col = mix(col, uSunCol, 0.3);
        }
        if (uMoon.z > 0.5) {
          vec2 mp = (p - uMoon.xy * resolution.xy) / px2;
          float md = length(mp);
          if (md < 5.5) { col = vec3(0.93, 0.94, 0.86); if (h21(floor(mp + 40.0)) > 0.8 || length(mp - vec2(-1.5, 1.0)) < 1.4) col = vec3(0.76, 0.78, 0.74); }
          else if (md < 8.0 && bay < 0.3) col = mix(col, vec3(0.8, 0.85, 1.0), 0.35);
        }
        // clouds: three tones, coverage driven by weather
        vec2 cp = vec2(p.x + uYaw * resolution.x * 0.45 + uTime * 1.5 * px2, p.y * 2.4) * (0.011 / px2);
        float c = fbm(cp) - abs(vUv.y - 0.7) * (0.6 - uCloud * 0.35);
        float th = 0.6 - uCloud * 0.36;
        float cd = c + (bay - 0.5) * 0.03;
        float above = fbm(cp + vec2(0.0, 0.06 / px2)) - abs(vUv.y + 0.02 - 0.7) * (0.6 - uCloud * 0.35);
        if (cd > th) {
          vec3 cc = cd > th + 0.05 ? cloudLit : mix(cloudShade, cloudLit, 0.45);
          if (above < th + 0.02) cc = mix(cc, vec3(1.0), 0.25 * (1.0 - uCloud));
          if (cd > th + 0.12 && uCloud > 0.6) cc = cloudShade;
          col = cc;
        }
        col += vec3(0.75, 0.8, 1.0) * uFlash;
        gl_FragDepth = 1.0;
      } else {
        vec3 n = nAt(vec2(0.0));
        float de = depthEdge(d);
        float ne = normalEdge(d, n);
        float k = de > 0.0 ? (1.0 - 0.45 * de) : (1.0 + 0.4 * ne);
        col = texture2D(tDiffuse, vUv).rgb * k;
        col = mix(col, uHazeCol, uHaze);
        gl_FragDepth = d;
      }
      gl_FragColor = vec4(col, 1.0);
    }`,
});
const outlineScene = new THREE.Scene();
outlineScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), outlineMat));
const finalMat = new THREE.ShaderMaterial({
  uniforms: { tComp: { value: null }, uOffset: { value: new THREE.Vector2() } },
  depthTest: false, depthWrite: false,
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: `uniform sampler2D tComp; uniform vec2 uOffset; varying vec2 vUv;
    void main(){ gl_FragColor = vec4(texture2D(tComp, vUv + uOffset).rgb, 1.0);
    #include <colorspace_fragment>
    }`,
});
const finalScene = new THREE.Scene();
finalScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), finalMat));
function makeRT(w, h, opts = {}) { return new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, generateMipmaps: false, ...opts }); }
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  const cw = Math.max(1, app.clientWidth), ch = Math.max(1, app.clientHeight);
  const devW = Math.round(cw * dpr), devH = Math.round(ch * dpr);
  px = Math.max(1, Math.round(Math.min(devW, devH) / DETAIL[detail]));
  lowW = Math.ceil(devW / px); lowH = Math.ceil(devH / px);
  renderer.setPixelRatio(1);
  renderer.setSize(lowW * px, lowH * px, false);
  canvas.style.width = (lowW * px / dpr) + 'px'; canvas.style.height = (lowH * px / dpr) + 'px';
  [colorRT, normalRT, compRT].forEach((r) => r && r.dispose());
  colorRT = makeRT(lowW, lowH, { depthTexture: new THREE.DepthTexture(lowW, lowH) });
  colorRT.texture.colorSpace = THREE.SRGBColorSpace;
  normalRT = makeRT(lowW, lowH);
  compRT = makeRT(lowW, lowH);
  compRT.texture.colorSpace = THREE.SRGBColorSpace;
  outlineMat.uniforms.tDiffuse.value = colorRT.texture;
  outlineMat.uniforms.tDepth.value = colorRT.depthTexture;
  outlineMat.uniforms.tNormal.value = normalRT.texture;
  outlineMat.uniforms.resolution.value.set(lowW, lowH, 1 / lowW, 1 / lowH);
  finalMat.uniforms.tComp.value = compRT.texture;
}


const gradMap = new THREE.DataTexture(new Uint8Array([
  64, 70, 112, 255, 112, 118, 160, 255, 166, 168, 196, 255, 214, 212, 220, 255, 246, 240, 232, 255, 255, 252, 244, 255]), 6, 1, THREE.RGBAFormat);
gradMap.minFilter = gradMap.magFilter = THREE.NearestFilter; gradMap.needsUpdate = true;
const envU = { uSnow: { value: 0 }, uWet: { value: 0 } };
function patchEnv(sh) {
  Object.assign(sh.uniforms, envU);
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', '#include <common>\nuniform float uSnow; uniform float uWet;')
    .replace('#include <lights_toon_fragment>', `{
      vec3 wn = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
      diffuseColor.rgb *= 1.0 - uWet * 0.3;
      float sn = uSnow * smoothstep(0.42, 0.8, wn.y);
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.9, 0.94, 1.0), sn);
    }
    #include <lights_toon_fragment>`);
}
const toonA = (o) => { const m = new THREE.MeshToonMaterial({ gradientMap: gradMap, ...o }); m.onBeforeCompile = patchEnv; return m; };
const flat = (g) => { const n = g.index ? g.toNonIndexed() : g; n.computeVertexNormals(); return n; };
function faceColors(g, fn) {
  const pos = g.attributes.position, nrm = g.attributes.normal; const cols = new Float32Array(pos.count * 3); const c = new THREE.Color();
  for (let i = 0; i < pos.count; i += 3) {
    const cx = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3, cy = (pos.getY(i) + pos.getY(i + 1) + pos.getY(i + 2)) / 3, cz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3;
    fn(c, cx, cy, cz, nrm.getY(i), i / 3);
    for (let k = 0; k < 3; k++) cols.set([c.r, c.g, c.b], (i + k) * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  return g;
}


/* sky harian */
{ const u = skyU; u.skyTop.value.set('#8cc6ea'); u.skyBot.value.set('#eef4ee'); u.cloudLit.value.set('#ffffff'); u.cloudShade.value.set('#dce8ee'); u.uCloud.value = 0.3; u.uStars.value = 0;
  u.uSun.value.set(0.8, 0.8, 0); u.uMoon.value.set(0, 0, 0); u.uSunCol.value.set('#fff4e0'); u.uHaze.value = 0; u.uHazeCol.value.set('#eef4f4'); }
const hemi = new THREE.HemisphereLight(0xc4dcff, 0x6a5638, 1.05);
const sun = new THREE.DirectionalLight(0xfff0d4, 2.6);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 90 });
sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
sun.position.set(-18, 34, 14); sun.target.position.set(0, 0, 0);
[hemi, sun, sun.target].forEach((l) => { l.layers.enable(1); scene.add(l); });
const toon = (c, o = {}) => toonA({ color: c, ...o });
const glow = (c) => new THREE.MeshBasicMaterial({ color: c });
