import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

// ---------- Utilidades ----------
let seed = 1337;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const noise = new SimplexNoise({ random: rand });
const smoothstep = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};
const fbm = (x, z, oct = 4) => {
  let a = 1, f = 1, s = 0;
  for (let i = 0; i < oct; i++) { s += a * noise.noise(x * f, z * f); a *= 0.5; f *= 2; }
  return s;
};

// ---------- Renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const HORIZON = new THREE.Color(0xd9a06a); // caramelo polvoriento
scene.fog = new THREE.FogExp2(HORIZON, 0.0026);

const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 4000);
camera.position.set(-6, 7, 34);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 3, -40);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 5;
controls.maxDistance = 300;

// ---------- Sol de la tarde ----------
const SUN_DIR = new THREE.Vector3(-0.55, 0.16, -0.82).normalize();

const sun = new THREE.DirectionalLight(0xffb27a, 3.2);
sun.position.copy(SUN_DIR).multiplyScalar(250);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -160, right: 160, top: 160, bottom: -160, near: 1, far: 700 });
sun.shadow.bias = -0.0005;
sun.shadow.normalBias = 0.6;
sun.shadow.radius = 4;
scene.add(sun, sun.target);

scene.add(new THREE.HemisphereLight(0xf2b98a, 0x6b3018, 0.9)); // rebote cálido del cielo y del suelo
scene.add(new THREE.AmbientLight(0xffd6b0, 0.12));

// ---------- Cielo (shader con degradado, halo y disco solar) ----------
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(2000, 48, 24),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { sunDir: { value: SUN_DIR } },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vDir = wp.xyz - cameraPosition;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 sunDir;
      varying vec3 vDir;
      void main() {
        vec3 dir = normalize(vDir);
        float h = dir.y;
        vec3 horizon = vec3(0.85, 0.62, 0.42);  // caramelo
        vec3 mid     = vec3(0.74, 0.50, 0.40);  // rosado polvoriento
        vec3 zenith  = vec3(0.42, 0.28, 0.27);  // rosa oscuro
        vec3 col = mix(horizon, mid, smoothstep(0.0, 0.18, h));
        col = mix(col, zenith, smoothstep(0.15, 0.85, h));
        col = mix(col, horizon * 0.95, smoothstep(0.0, -0.1, h));
        float d = max(dot(dir, sunDir), 0.0);
        col += vec3(1.0, 0.72, 0.42) * pow(d, 6.0) * 0.35;   // halo amplio
        col += vec3(1.0, 0.86, 0.62) * pow(d, 90.0) * 0.8;   // corona
        col += vec3(1.0, 0.96, 0.88) * smoothstep(0.99975, 0.99988, d) * 4.0; // disco (Marte: sol más pequeño)
        col = pow(col, vec3(2.2)); // sRGB -> lineal
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
);
sky.renderOrder = -1;
scene.add(sky);

// ---------- Terreno con dunas ----------
function terrainHeight(x, z) {
  const dist = Math.hypot(x, z);
  // Dunas asimétricas (barlovento suave, cara de avalancha empinada), deformadas por ruido.
  const warp = noise.noise(x * 0.004, z * 0.004) * 45;
  const u = (x * 0.55 + z * 0.83 + warp) * 0.04;
  const s = u - Math.floor(u);
  let profile = s < 0.78 ? s / 0.78 : (1 - s) / 0.22;
  profile = profile * profile * (3 - 2 * profile);
  const duneAmp = (noise.noise(x * 0.003 + 31, z * 0.003 - 7) * 0.5 + 0.5) * 7 + 1.2;
  let h = profile * duneAmp;
  h *= smoothstep(6, 30, dist) * 0.8 + 0.2;               // zona central más llana (para el rover)
  h += fbm(x * 0.0018, z * 0.0018, 2) * 7;                    // lomas grandes
  h += fbm(x * 0.05, z * 0.05, 3) * 0.35;                     // detalle fino
  const m = fbm(x * 0.0035 + 9, z * 0.0035, 3) + 0.7;         // mesetas y cráteres lejanos (suavizados)
  h += smoothstep(300, 650, dist) * Math.max(m, 0) ** 1.5 * 45;
  return h;
}

{
  const SIZE = 1400, SEG = 320;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const low = new THREE.Color(0x6e2e14), mid = new THREE.Color(0xb35a2c), crest = new THREE.Color(0xd99862);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const y = terrainHeight(x, z);
    pos.setY(i, y);
    const t = THREE.MathUtils.clamp((y + 6) / 18, 0, 1) + noise.noise(x * 0.08, z * 0.08) * 0.08;
    c.copy(low).lerp(mid, smoothstep(0, 0.5, t)).lerp(crest, smoothstep(0.5, 1.1, t));
    c.multiplyScalar(0.92 + noise.noise(x * 0.4, z * 0.4) * 0.08);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.97, metalness: 0 })
  );
  ground.receiveShadow = true;
  ground.castShadow = true;
  scene.add(ground);
}

// ---------- Rocas ----------
function makeRockGeometry(s) {
  const g = new THREE.IcosahedronGeometry(1, 2);
  const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const k = 1 + noise.noise3d(v.x * 1.4 + s, v.y * 1.4, v.z * 1.4) * 0.32
                + noise.noise3d(v.x * 4 + s, v.y * 4, v.z * 4) * 0.08;
    v.multiplyScalar(k);
    v.y *= 0.62;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

{
  const rockMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92, flatShading: true });
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  for (let variant = 0; variant < 4; variant++) {
    const COUNT = 180;
    const rocks = new THREE.InstancedMesh(makeRockGeometry(variant * 17.3), rockMat, COUNT);
    rocks.castShadow = rocks.receiveShadow = true;
    for (let i = 0; i < COUNT; i++) {
      const r = 6 + Math.pow(rand(), 0.7) * 260;
      const a = rand() * Math.PI * 2;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      const big = rand() < 0.06;
      const s = big ? 2.5 + rand() * 3 : 0.15 + Math.pow(rand(), 2.5) * 1.6;
      dummy.position.set(x, terrainHeight(x, z) - s * 0.15, z);
      dummy.rotation.set((rand() - 0.5) * 0.4, rand() * Math.PI * 2, (rand() - 0.5) * 0.4);
      dummy.scale.set(s * (0.8 + rand() * 0.6), s, s * (0.8 + rand() * 0.6));
      dummy.updateMatrix();
      rocks.setMatrixAt(i, dummy.matrix);
      col.setHSL(0.03 + rand() * 0.03, 0.45 + rand() * 0.15, 0.16 + rand() * 0.12);
      rocks.setColorAt(i, col);
    }
    scene.add(rocks);
  }
}

// ---------- Lunas: Fobos y Deimos ----------
function makeMoon(radius, stretch, seedOffset, dir, distance) {
  const g = new THREE.IcosahedronGeometry(radius, 5);
  const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const n = noise.noise3d(v.x * 2 + seedOffset, v.y * 2, v.z * 2) * 0.14
            + noise.noise3d(v.x * 6 + seedOffset, v.y * 6, v.z * 6) * 0.06
            - Math.abs(noise.noise3d(v.x * 9 + seedOffset, v.y * 9, v.z * 9)) * 0.05; // cráteres
    v.multiplyScalar(radius * (1 + n));
    v.x *= stretch;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  const moon = new THREE.Mesh(g, new THREE.MeshStandardMaterial({
    color: 0xcdb3a0, roughness: 1, fog: false, flatShading: true,
    emissive: 0x8a6550, emissiveIntensity: 0.35, // pálidas, como vistas a través del polvo
  }));
  moon.position.copy(dir.normalize()).multiplyScalar(distance);
  moon.rotation.set(rand() * 3, rand() * 3, rand() * 3);
  scene.add(moon);
  return moon;
}
const phobos = makeMoon(38, 1.35, 5, new THREE.Vector3(0.45, 0.27, -0.85), 1100);
const deimos = makeMoon(15, 1.15, 50, new THREE.Vector3(0.14, 0.36, -0.92), 1300);

// Cámara por encima del relieve, mirando hacia el sol y las dunas.
camera.position.y = terrainHeight(camera.position.x, camera.position.z) + 9;
controls.target.y = terrainHeight(0, -40) + 3;

// ---------- Polvo en suspensión ----------
const DUST = 2500, BOX = 160;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(DUST * 3);
for (let i = 0; i < DUST; i++) {
  dustPos[i * 3] = (rand() - 0.5) * BOX;
  dustPos[i * 3 + 1] = rand() * 25;
  dustPos[i * 3 + 2] = (rand() - 0.5) * BOX;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
  color: 0xf0c08a, size: 0.12, transparent: true, opacity: 0.55, depthWrite: false,
}));
scene.add(dust);

// ---------- Bucle ----------
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

window.__frames = 0;
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.1);
  const t = clock.elapsedTime;
  // Viento: el polvo deriva y se recicla alrededor de la cámara.
  const p = dustGeo.attributes.position;
  for (let i = 0; i < DUST; i++) {
    let x = p.getX(i) + dt * 2.2, y = p.getY(i) + Math.sin(t + i) * dt * 0.3;
    if (x > BOX / 2) x -= BOX;
    p.setX(i, x); p.setY(i, y);
  }
  p.needsUpdate = true;
  dust.position.set(camera.position.x, 0, camera.position.z);

  phobos.rotation.y += dt * 0.02;
  deimos.rotation.y += dt * 0.01;
  sky.position.copy(camera.position);

  controls.update();
  renderer.render(scene, camera);
  window.__frames++;
});
