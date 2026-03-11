/* ════════════════════════════════════════════════════════════
   FENGYOU.ORG — Main Script
   3D Filing Cabinet Experience
   Three.js r161 · GSAP ScrollTrigger · Lenis
   ════════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { GLTFLoader }               from 'three/addons/loaders/GLTFLoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

// ─────────────────────────────────────────────
// PROJECT DATA
// ─────────────────────────────────────────────
const PROJECTS = [
  {
    number: '01',
    title: 'Autonomous Drone',
    description:
      'A custom-built quadrotor with onboard computer vision for obstacle avoidance and GPS-denied navigation. Uses a Raspberry Pi 4 with a depth camera and a custom PX4-based flight controller. Implements a modified RRT* path planner and a cascaded PID attitude controller tuned with Ziegler–Nichols.',
    tags: ['C++', 'ROS 2', 'Raspberry Pi', 'PX4', 'OpenCV', 'Python'],
    links: [
      { label: 'GitHub Repo', url: 'https://github.com/Hat000', icon: 'github' },
    ],
    meta: ['2025 · Ongoing', 'Hardware + Software'],
  },
  {
    number: '02',
    title: 'Signal Processor',
    description:
      'A real-time FPGA-based digital signal processor implementing an FFT pipeline for audio spectrum analysis. Written in VHDL with a custom AXI-lite interface. Achieves sub-millisecond latency at 48 kHz sample rate with 1024-point FFT.',
    tags: ['VHDL', 'FPGA', 'Xilinx Vivado', 'AXI', 'DSP', 'MATLAB'],
    links: [
      { label: 'GitHub Repo', url: 'https://github.com/Hat000', icon: 'github' },
    ],
    meta: ['2025 · Complete', 'Digital Hardware Design'],
  },
  {
    number: '03',
    title: 'ML Research Tool',
    description:
      'A research automation tool for running and visualizing PyTorch experiments. Handles hyperparameter sweeps, live loss curves, and experiment comparison. Designed to make the iterate-train-compare loop as fast as possible for solo researchers.',
    tags: ['Python', 'PyTorch', 'Matplotlib', 'Click', 'YAML', 'SQLite'],
    links: [
      { label: 'GitHub Repo', url: 'https://github.com/Hat000', icon: 'github' },
    ],
    meta: ['2024 · Complete', 'Developer Tooling'],
  },
  {
    number: '04',
    title: 'This Website',
    description:
      'An immersive 3D portfolio built with Three.js. The viewer starts inside a closed filing cabinet drawer — scrolling pulls the drawer open. The folders inside are the navigation. No framework, no build step. Just HTML, CSS, and a lot of WebGL.',
    tags: ['Three.js', 'WebGL', 'GSAP', 'Lenis', 'GLTF', 'JavaScript'],
    links: [
      { label: 'GitHub Repo', url: 'https://github.com/Hat000/fengyou', icon: 'github' },
      { label: 'You\'re looking at it', url: '#', icon: 'external' },
    ],
    meta: ['2026 · Ongoing', 'Creative Dev / 3D Web'],
  },
];

// ─────────────────────────────────────────────
// TAGLINES (random on load)
// ─────────────────────────────────────────────
const TAGLINES = [
  '"Making electrons do useless things — some more useless than others."',
  '"I build things that fly, things that think, and things nobody asked for."',
  '"Somewhere between the schematic and the crash log is where I live."',
  '"If it doesn\'t have a battery, I\'m probably not interested."',
];

document.getElementById('tagline').textContent =
  TAGLINES[Math.floor(Math.random() * TAGLINES.length)];

// ─────────────────────────────────────────────
// GSAP PLUGIN REGISTRATION
// ─────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────
// LENIS SMOOTH SCROLL
// ─────────────────────────────────────────────
const lenis = new Lenis({
  duration: 2.2,          // slow, physical "pulling drawer" feel
  smoothWheel: true,
  smoothTouch: false,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ─────────────────────────────────────────────
// THREE.JS SCENE SETUP
// ─────────────────────────────────────────────
const canvas  = document.getElementById('three-canvas');
const W       = window.innerWidth;
const H       = window.innerHeight;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setSize(W, H);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.toneMapping       = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.02;  // near-black at start
renderer.outputColorSpace  = THREE.SRGBColorSpace;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.FogExp2(0x1a0e08, 0.18); // warm dark fog, density decreases on scroll

// Camera — starts inside the cabinet
const camera = new THREE.PerspectiveCamera(70, W / H, 0.01, 500);
// Initial position: inside the closed drawer — we'll fine-tune after model loads
camera.position.set(0, 0.5, -2);
camera.lookAt(0, 0, 2);

// ─────────────────────────────────────────────
// LIGHTS
// ─────────────────────────────────────────────
RectAreaLightUniformsLib.init();

// Ambient — very dim, warms up on scroll
const ambientLight = new THREE.AmbientLight(0x3D2A18, 0.08);
scene.add(ambientLight);

// Rect area light — light flooding in from the FRONT of the cabinet
// Position will be updated in fitCameraToModel after we know the real bounds
const rectLight = new THREE.RectAreaLight(0xFFD9A0, 0, 80, 100);
rectLight.position.set(0, 0, -80);
rectLight.lookAt(0, 0, 0);
scene.add(rectLight);

// Spot light from the front — creates the "door of light" cone into the interior
const spotLight = new THREE.SpotLight(0xFFCB87, 0, 400, Math.PI * 0.35, 0.4, 1.5);
spotLight.position.set(0, 0, -80);
spotLight.target.position.set(0, 0, 50);
scene.add(spotLight);
scene.add(spotLight.target);

// Point light deep inside cabinet — warm fill for back wall and ceiling
const innerLight = new THREE.PointLight(0xCC8844, 0, 300);
innerLight.position.set(0, 0, 20);
scene.add(innerLight);

// ─────────────────────────────────────────────
// GLTF MODEL LOADING
// ─────────────────────────────────────────────
let cabinetScene   = null;
let mainDrawer     = null;  // drawer_04_low — animation target
let drawerAxis     = 'z';   // default pull axis (to be confirmed visually)
let drawerOpenDist = -14;   // negative = pull toward camera (tune after visual check)

const loadingFill = document.getElementById('loading-fill');
const loadingScreen = document.getElementById('loading-screen');

const loader = new GLTFLoader();
loader.load(
  './rusty_filing_cabinet.glb',

  // onLoad
  (gltf) => {
    cabinetScene = gltf.scene;
    scene.add(cabinetScene);

    // Apply DoubleSide to all materials — critical for viewing interior surfaces
    cabinetScene.traverse((child) => {
      if (child.isMesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => { mat.side = THREE.DoubleSide; });
        } else {
          child.material.side = THREE.DoubleSide;
        }
      }
    });

    // Find animation target
    mainDrawer = cabinetScene.getObjectByName('drawer_04_low');

    // Auto-fit camera to model bounds
    fitCameraToModel(cabinetScene);

    // Initialize scroll animation now that model is loaded
    initScrollAnimation();

    // Reveal canvas + hide loading screen
    canvas.classList.add('loaded');
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      document.getElementById('site-footer').classList.add('visible');
      // Animate about overlay in
      revealAboutOverlay();
    }, 600);
  },

  // onProgress
  (progress) => {
    if (progress.lengthComputable) {
      const pct = (progress.loaded / progress.total) * 100;
      loadingFill.style.width = pct + '%';
    }
  },

  // onError
  (error) => {
    console.error('GLB load error:', error);
    // Graceful fallback — show overlay without 3D
    loadingScreen.classList.add('hidden');
    canvas.style.display = 'none';
    document.getElementById('darkness').style.opacity = '0';
    document.getElementById('about-overlay').style.opacity = '1';
    document.getElementById('about-overlay').style.pointerEvents = 'auto';
    revealAboutOverlay();
  }
);

// ─────────────────────────────────────────────
// CAMERA FIT
// ─────────────────────────────────────────────
function fitCameraToModel(model) {
  const box    = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size   = box.getSize(new THREE.Vector3());

  // ── CAMERA ──────────────────────────────────────────────────────
  // Position: inside the cabinet, near the front face, slightly below center.
  // We want to look UP and INWARD so the rusty ceiling is dramatic above us,
  // and we can see into the dark interior (the "closed drawer" feel).
  const camZ = box.min.z + size.z * 0.08;   // just inside the front face
  const camY = center.y - size.y * 0.15;    // slightly below center (looking up)
  camera.position.set(center.x, camY, camZ);
  camera.lookAt(center.x, center.y + size.y * 0.18, center.z + size.z * 0.4);

  // ── LIGHTS ──────────────────────────────────────────────────────
  // Front rect light: positioned OUTSIDE the front face, shining INTO the cabinet.
  // When the drawer is pulled out, this light floods straight through the opening.
  const lightZ = box.min.z - size.z * 0.25;  // in front of the cabinet face
  rectLight.position.set(center.x, center.y, lightZ);
  rectLight.width  = size.x * 1.4;
  rectLight.height = size.y * 1.2;
  rectLight.lookAt(center.x, center.y, center.z);

  // Spot light from same front direction — for the dramatic light-cone effect
  spotLight.position.set(center.x, center.y + size.y * 0.1, lightZ);
  spotLight.target.position.set(center.x, center.y, center.z + size.z * 0.3);
  spotLight.target.updateMatrixWorld();
  spotLight.distance = size.z * 4;

  // Interior fill light — warm glow from slightly above center inside the cabinet
  innerLight.position.set(center.x, center.y + size.y * 0.15, center.z);
  innerLight.distance = size.z * 3;

  // ── FOG ─────────────────────────────────────────────────────────
  // Calibrate fog so it fades out at roughly the back wall distance
  scene.fog.density = 0.6 / size.z;

  // ── NEAR/FAR CLIP ───────────────────────────────────────────────
  camera.near = size.z * 0.002;
  camera.far  = size.z * 10;
  camera.updateProjectionMatrix();

  // Store for scroll animation
  window._cabinetData = { box, center, size };
}

// ─────────────────────────────────────────────
// GSAP SCROLL ANIMATION
// ─────────────────────────────────────────────
const darkness      = document.getElementById('darkness');
const aboutOverlay  = document.getElementById('about-overlay');
const folderUI      = document.getElementById('folder-ui');

function initScrollAnimation() {
  if (!cabinetScene) return;

  const { center, size } = window._cabinetData || {};
  drawerOpenDist = size ? -(size.z * 0.75) : -14;

  // Store original drawer position for animation reference
  if (mainDrawer) {
    mainDrawer.userData.originalPos = mainDrawer.position.clone();
  }

  ScrollTrigger.create({
    trigger: '#scroll-space',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.5,   // laggy for that physical drag feel
    onUpdate: (self) => {
      const p = self.progress; // 0 → 1

      // ── PHASE 1: 0–0.25 → darkness fades, about overlay stays ──
      const darkOpacity = p < 0.25 ? 1 - (p / 0.25) : 0;
      darkness.style.opacity = darkOpacity;

      // ── PHASE 2: 0.15–0.45 → about overlay fades ──
      const aboutOpacity = p < 0.15 ? 1 : p < 0.45 ? 1 - ((p - 0.15) / 0.30) : 0;
      aboutOverlay.style.opacity = aboutOpacity;
      aboutOverlay.style.pointerEvents = aboutOpacity > 0.1 ? 'auto' : 'none';

      // ── DRAWER ANIMATION: 0.1 → 0.9 → pulls open ──
      if (mainDrawer && mainDrawer.userData.originalPos) {
        const drawerProgress = Math.max(0, Math.min(1, (p - 0.1) / 0.8));
        const eased = easeOutCubic(drawerProgress);
        const offset = eased * drawerOpenDist;

        // Apply offset on the correct axis (determined by inspection)
        const orig = mainDrawer.userData.originalPos;
        if (drawerAxis === 'z') {
          mainDrawer.position.z = orig.z + offset;
        } else if (drawerAxis === 'x') {
          mainDrawer.position.x = orig.x + offset;
        } else {
          mainDrawer.position.y = orig.y + offset;
        }
      }

      // ── LIGHTING: 0.15 → 1.0 → warm light floods in ──
      const lightProgress = Math.max(0, Math.min(1, (p - 0.15) / 0.85));
      const lightEased = easeOutQuad(lightProgress);
      const { size } = window._cabinetData || { size: { z: 100 } };

      renderer.toneMappingExposure = 0.02 + lightEased * 1.38;
      rectLight.intensity          = lightEased * 12;
      spotLight.intensity          = lightEased * 8;
      innerLight.intensity         = lightEased * 6;
      ambientLight.intensity       = 0.08 + lightEased * 1.2;
      scene.fog.density            = (0.6 / size.z) * (1 - lightEased * 0.7);

      // ── FOLDER UI: appears at 85%+ ──
      if (p >= 0.85) {
        folderUI.classList.add('visible');
      } else {
        folderUI.classList.remove('visible');
      }
    },
  });
}

// ─────────────────────────────────────────────
// EASING FUNCTIONS
// ─────────────────────────────────────────────
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeOutQuad(t)  { return 1 - (1 - t) * (1 - t); }

// ─────────────────────────────────────────────
// ABOUT OVERLAY REVEAL ANIMATION
// ─────────────────────────────────────────────
function revealAboutOverlay() {
  const tl = gsap.timeline({ delay: 0.3 });
  tl.to('.about-eyebrow', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' })
    .to('.about-name',    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.4')
    .to('.about-tagline', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.5')
    .to('.about-details', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .to('.about-links',   { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .to('.scroll-hint',   { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.2');
}

// ─────────────────────────────────────────────
// PROJECT PANEL
// ─────────────────────────────────────────────
const panel      = document.getElementById('project-panel');
const panelClose = document.getElementById('panel-close');
let activeFolder = null;
let activeFolderOrigPos = null;

function openProject(index) {
  const proj = PROJECTS[index];
  if (!proj) return;

  // Populate panel
  document.getElementById('panel-number').textContent      = proj.number;
  document.getElementById('panel-title').textContent       = proj.title;
  document.getElementById('panel-description').textContent = proj.description;

  // Tags
  const tagsEl = document.getElementById('panel-tags');
  tagsEl.innerHTML = proj.tags
    .map((t) => `<span class="panel-tag">${t}</span>`)
    .join('');

  // Links
  const linksEl = document.getElementById('panel-links');
  linksEl.innerHTML = proj.links
    .map((l) => {
      const icon = l.icon === 'github'
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
      return `<a href="${l.url}" class="panel-link" target="_blank" rel="noopener">${icon}${l.label}</a>`;
    })
    .join('');

  // Meta
  const metaEl = document.getElementById('panel-meta');
  metaEl.innerHTML = proj.meta
    .map((m) => `<span>${m}</span>`)
    .join('');

  // Open panel
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  panel.scrollTop = 0;
  panelClose.focus();

  // Disable lenis while panel is open
  lenis.stop();
}

function closeProject() {
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  activeFolder = null;
  lenis.start();
}

// Panel close button
panelClose.addEventListener('click', closeProject);

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && panel.classList.contains('open')) closeProject();
});

// Folder tab click handlers
document.querySelectorAll('.folder-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const index = parseInt(tab.dataset.project, 10);

    // Visual: deselect all, select clicked
    document.querySelectorAll('.folder-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    activeFolder = tab;

    openProject(index);
  });
});

// ─────────────────────────────────────────────
// RENDER LOOP
// ─────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

// ─────────────────────────────────────────────
// RESIZE HANDLER
// ─────────────────────────────────────────────
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ─────────────────────────────────────────────
// MOBILE FALLBACK
// (If WebGL is not supported or fails, show static layout)
// ─────────────────────────────────────────────
function checkWebGL() {
  try {
    const testCanvas = document.createElement('canvas');
    return !!(testCanvas.getContext('webgl2') || testCanvas.getContext('webgl'));
  } catch (e) {
    return false;
  }
}

if (!checkWebGL()) {
  canvas.style.display = 'none';
  loadingScreen.classList.add('hidden');
  document.getElementById('darkness').style.opacity = '0';
  document.getElementById('about-overlay').style.opacity = '1';
  document.getElementById('about-overlay').style.pointerEvents = 'auto';
  document.getElementById('folder-ui').classList.add('visible');
  revealAboutOverlay();
  console.warn('[FALLBACK] WebGL not available — showing static layout');
}
