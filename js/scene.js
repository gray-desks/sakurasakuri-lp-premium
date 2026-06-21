// ══════════════════════════════════════════════════════════
//  さくらさくり Premium LP — 3D 桜吹雪シーン (Three.js)
//  全面固定キャンバスに、奥行きのある桜の花びら + 金粉が舞う。
//  スクロール・端末の傾き・指のドラッグで視点が呼応する。
// ══════════════════════════════════════════════════════════
import * as THREE from "three";

const canvas = document.getElementById("scene");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ── 環境判定（モバイルは負荷を抑える） ──
const isMobile = Math.min(window.innerWidth, window.innerHeight) < 700;
const PETALS = reduce ? 24 : (isMobile ? 70 : 150);
const DUST   = reduce ? 0  : (isMobile ? 60 : 130);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xfbf6ef, 14, 46);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 24);

// ── ライティング（和の柔らかい光 + 金のリム） ──
scene.add(new THREE.AmbientLight(0xfff4ec, 0.95));
const key = new THREE.DirectionalLight(0xffffff, 1.1);
key.position.set(-6, 10, 8);
scene.add(key);
const rim = new THREE.PointLight(0xe5879f, 1.4, 60);
rim.position.set(10, -4, 10);
scene.add(rim);
const goldFill = new THREE.PointLight(0xe2c77f, 0.7, 50);
goldFill.position.set(-10, 6, 6);
scene.add(goldFill);

// ── 桜の花びら形状（先端に切れ込み） ──
function petalGeometry() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.55, 0.25, 0.62, 1.0, 0.12, 1.45);
  s.quadraticCurveTo(0.0, 1.62, -0.12, 1.45);   // 先端の切れ込み
  s.bezierCurveTo(-0.62, 1.0, -0.55, 0.25, 0, 0);
  const g = new THREE.ShapeGeometry(s, 18);
  g.translate(0, -0.7, 0);
  g.scale(0.5, 0.5, 0.5);
  return g;
}

const petalGeo = petalGeometry();
const petalMat = new THREE.MeshStandardMaterial({
  color: 0xf4aec0,
  roughness: 0.55,
  metalness: 0.0,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.96,
});
const petals = new THREE.InstancedMesh(petalGeo, petalMat, PETALS);
petals.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(PETALS * 3), 3);
scene.add(petals);

const RANGE_X = 30, RANGE_Y = 24, RANGE_Z = 24;
const tones = [0xf8d6e0, 0xf4aec0, 0xe5879f, 0xefc4d2, 0xfbe7ef];
const dummy = new THREE.Object3D();
const tmpColor = new THREE.Color();

const grains = []; // 各花びらの運動パラメータ
for (let i = 0; i < PETALS; i++) {
  grains.push({
    x: (Math.random() - 0.5) * RANGE_X,
    y: (Math.random() - 0.5) * RANGE_Y,
    z: (Math.random() - 0.5) * RANGE_Z,
    rx: Math.random() * Math.PI, ry: Math.random() * Math.PI, rz: Math.random() * Math.PI,
    vrot: (Math.random() - 0.5) * 0.012,
    fall: 0.012 + Math.random() * 0.03,
    sway: 0.4 + Math.random() * 1.2,
    swaySpeed: 0.4 + Math.random() * 0.9,
    phase: Math.random() * Math.PI * 2,
    scale: 0.7 + Math.random() * 0.9,
  });
  tmpColor.setHex(tones[i % tones.length]);
  petals.setColorAt(i, tmpColor);
}
petals.instanceColor.needsUpdate = true;

// ── 金粉（光る点） ──
let dust = null;
if (DUST > 0) {
  const pos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    pos[i*3]   = (Math.random() - 0.5) * RANGE_X;
    pos[i*3+1] = (Math.random() - 0.5) * RANGE_Y;
    pos[i*3+2] = (Math.random() - 0.5) * RANGE_Z;
  }
  const dgeo = new THREE.BufferGeometry();
  dgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const sprite = makeDustSprite();
  const dmat = new THREE.PointsMaterial({
    size: 0.42, map: sprite, color: 0xe2c77f,
    transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  dust = new THREE.Points(dgeo, dmat);
  scene.add(dust);
}

function makeDustSprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,248,220,1)");
  g.addColorStop(0.35, "rgba(226,199,127,0.7)");
  g.addColorStop(1, "rgba(226,199,127,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ── 入力（傾き・ドラッグ・スクロール） ──
const target = { x: 0, y: 0 };
const view   = { x: 0, y: 0 };
let scrollN = 0;

window.addEventListener("pointermove", (e) => {
  target.x = (e.clientX / window.innerWidth  - 0.5) * 2;
  target.y = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

window.addEventListener("deviceorientation", (e) => {
  if (e.gamma == null) return;
  target.x = THREE.MathUtils.clamp(e.gamma / 45, -1, 1);
  target.y = THREE.MathUtils.clamp((e.beta - 45) / 45, -1, 1);
}, { passive: true });

window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  scrollN = max > 0 ? window.scrollY / max : 0;
}, { passive: true });

// ── ループ ──
const clock = new THREE.Clock();
let running = true;
document.addEventListener("visibilitychange", () => {
  running = !document.hidden;
  if (running) { clock.start(); tick(); }
});

function tick() {
  if (!running) return;
  requestAnimationFrame(tick);
  const t = clock.getElapsedTime();

  // 視点をゆるやかに追従
  view.x += (target.x - view.x) * 0.04;
  view.y += (target.y - view.y) * 0.04;
  camera.position.x = view.x * 3.2;
  camera.position.y = -view.y * 2.4 - scrollN * 6;   // スクロールで沈み込む
  camera.lookAt(0, -scrollN * 3, 0);
  rim.position.x = 10 + view.x * 6;

  // 花びらを舞わせる
  for (let i = 0; i < PETALS; i++) {
    const g = grains[i];
    g.y -= g.fall;
    g.rx += g.vrot; g.ry += g.vrot * 1.3; g.rz += g.vrot * 0.7;
    if (g.y < -RANGE_Y / 2) { g.y = RANGE_Y / 2; g.x = (Math.random() - 0.5) * RANGE_X; }
    const sx = g.x + Math.sin(t * g.swaySpeed + g.phase) * g.sway;
    dummy.position.set(sx, g.y, g.z);
    dummy.rotation.set(g.rx, g.ry, g.rz);
    dummy.scale.setScalar(g.scale);
    dummy.updateMatrix();
    petals.setMatrixAt(i, dummy.matrix);
  }
  petals.instanceMatrix.needsUpdate = true;

  if (dust) { dust.rotation.y = t * 0.02; dust.position.y = Math.sin(t * 0.2) * 0.6; }

  renderer.render(scene, camera);
}
tick();

// ── リサイズ ──
let rT;
window.addEventListener("resize", () => {
  clearTimeout(rT);
  rT = setTimeout(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }, 150);
});

// iOS 13+ では傾きセンサーの許可が必要 → 最初のタップで要求
function requestTilt() {
  const D = window.DeviceOrientationEvent;
  if (D && typeof D.requestPermission === "function") {
    D.requestPermission().catch(() => {});
  }
  window.removeEventListener("touchend", requestTilt);
}
window.addEventListener("touchend", requestTilt, { once: true });
