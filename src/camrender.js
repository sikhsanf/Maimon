
/* =====================================================================
   KAMERA ORTOGRAFIS + RENDER (pipeline Arena Piksel: normal pass, color pass, outline pass, final)
   ===================================================================== */
let yaw = 0.62, pitch = 0.66, zoom = 1, zoomGoal = 1;
const camTarget = new THREE.Vector3(), camGoal = new THREE.Vector3();
let dragging = false;
function fitViewH() { const aspect = lowW / lowH; return aspect >= 1 ? 13 : Math.max(13, 7.4 / aspect); }
function updateCamera(dt) {
  zoom += (zoomGoal - zoom) * Math.min(1, dt * 5);
  camTarget.lerp(camGoal, Math.min(1, dt * 6));
  const viewH = fitViewH() * zoom;
  const dir = new THREE.Vector3(Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch), Math.cos(pitch) * Math.cos(yaw));
  const t = camTarget.clone();
  cam.position.copy(t).addScaledVector(dir, 80); cam.up.set(0, 1, 0); cam.lookAt(t); cam.updateMatrixWorld();
  const camRight = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), camUp = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
  const s = viewH / lowH, tx = cam.position.dot(camRight), ty = cam.position.dot(camUp);
  const sx = Math.round(tx / s) * s, sy = Math.round(ty / s) * s;
  cam.position.addScaledVector(camRight, sx - tx).addScaledVector(camUp, sy - ty);
  finalMat.uniforms.uOffset.value.set(((tx - sx) / s) / lowW, ((ty - sy) / s) / lowH);
  const halfH = viewH / 2, halfW = halfH * lowW / lowH;
  Object.assign(cam, { left: -halfW, right: halfW, top: halfH, bottom: -halfH });
  cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  grassUniforms.uCamRight.value.copy(camRight).setY(0).normalize();
  outlineMat.uniforms.uYaw.value = yaw;
}
function render(T) {
  outlineMat.uniforms.uTime.value = T;
  cam.layers.set(0);
  renderer.setRenderTarget(normalRT); renderer.setClearColor(0x8080ff, 1); renderer.clear();
  scene.overrideMaterial = normalMat; renderer.render(scene, cam); scene.overrideMaterial = null;
  renderer.setRenderTarget(colorRT); renderer.setClearColor(0x000000, 1); renderer.clear();
  renderer.render(scene, cam);
  renderer.setRenderTarget(compRT);
  renderer.render(outlineScene, quadCam);
  cam.layers.set(1); renderer.render(scene, cam); cam.layers.set(0);
  renderer.setRenderTarget(null); renderer.clear();
  renderer.render(finalScene, quadCam);
}
