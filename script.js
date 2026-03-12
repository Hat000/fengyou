/* ════════════════════════════════════════════════════════════
   FENGYOU.ORG — Main Script
   CSS 3D Filing Cabinet Experience
   GSAP ScrollTrigger · Lenis (no Three.js)
   ════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────
// PROJECT DATA
// ─────────────────────────────────────────────
const PROJECTS = [
  {
    number: '01',
    title: 'Autonomous Drone',
    description:
      'A custom-built quadrotor with onboard computer vision for obstacle avoidance and GPS-denied navigation. Uses a Raspberry Pi 4 with a depth camera and a custom PX4-based flight controller. Implements a modified RRT* path planner and a cascaded PID attitude controller tuned with Ziegler-Nichols.',
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
      'An immersive 3D portfolio built with CSS 3D transforms and GSAP. The viewer starts inside a closed filing cabinet drawer — scrolling pulls the drawer open and the camera zooms out. The folders inside are the navigation. No framework, no build step.',
    tags: ['CSS 3D', 'GSAP', 'Lenis', 'JavaScript', 'HTML/CSS'],
    links: [
      { label: 'GitHub Repo', url: 'https://github.com/Hat000/fengyou', icon: 'github' },
      { label: "You're looking at it", url: '#', icon: 'external' },
    ],
    meta: ['2026 · Ongoing', 'Creative Dev / 3D Web'],
  },
];

// ─────────────────────────────────────────────
// TAGLINES
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
  duration: 2.2,
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
// DOM REFERENCES
// ─────────────────────────────────────────────
const darkness     = document.getElementById('darkness');
const aboutOverlay = document.getElementById('about-overlay');
const cabinetScene = document.getElementById('cabinet-scene');
const drawerFace   = document.getElementById('drawer-face');
const lightGlow    = document.querySelector('.light-glow');
const lightRays    = document.querySelector('.light-rays');
const lightHaze    = document.querySelector('.light-haze');
const rays         = document.querySelectorAll('.ray');
const drawerFiles    = document.querySelector('.drawer-files');
const drawerInterior = document.querySelector('.drawer-interior');
const drawerOpen     = document.querySelector('.drawer-open');
const panel          = document.getElementById('project-panel');
const panelClose     = document.getElementById('panel-close');
const sceneDim       = document.getElementById('scene-dim');
const loadingScreen  = document.getElementById('loading-screen');

// Cache pseudo-element targets (we'll update their parent's style)
const drawerTop1     = document.querySelector('.drawer-top-1');
const drawerBottom1  = document.querySelector('.drawer-bottom-1');
// For interior ::after and ::before, we need to use a targeted approach
const interiorAfterStyle = document.createElement('style');
interiorAfterStyle.id = 'interior-glow-style';
document.head.appendChild(interiorAfterStyle);

// Read CSS custom property values
const style = getComputedStyle(document.documentElement);
const startZ = parseInt(style.getPropertyValue('--scene-z')) || 800;

// ─────────────────────────────────────────────
// LOADING — instant (no GLB to load)
// ─────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    // Remove from DOM after fade transition completes
    setTimeout(() => { loadingScreen.style.display = 'none'; }, 700);
    document.getElementById('site-footer').classList.add('visible');
    revealAboutOverlay();
    initScrollAnimation();
  }, 400);
});

// ─────────────────────────────────────────────
// ABOUT OVERLAY REVEAL
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
// GSAP SCROLL ANIMATION — the core experience
// ─────────────────────────────────────────────
function initScrollAnimation() {
  // Pre-cache static values for the ray animation
  const rayAngles = [-15, -6, 3, 11, 18];
  const rayDelays = [0, 0.06, 0.02, 0.08, 0.04];
  const folders   = drawerFiles.children;
  const footer    = document.getElementById('site-footer');

  // Track last values to skip redundant DOM writes (a big perf win)
  let lastDarkOp = -1, lastAboutOp = -1, lastZ = -1;
  let lastDrawerOp = -1, lastGlowOp = -1, lastWallGlow = -1;
  let lastFileOp = -1;

  // Main scroll timeline
  ScrollTrigger.create({
    trigger: '#scroll-space',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.5,
    onUpdate: (self) => {
      const p = self.progress; // 0 → 1

      // ── DARKNESS: 0 → 0.25 fades out ──
      const darkOpacity = p < 0.25 ? 1 - (p / 0.25) : 0;
      const darkRounded = Math.round(darkOpacity * 100) / 100;
      if (darkRounded !== lastDarkOp) {
        darkness.style.opacity = darkRounded;
        lastDarkOp = darkRounded;
      }

      // ── ABOUT OVERLAY: fades between 0.1 → 0.4 ──
      const aboutOpacity = p < 0.1 ? 1 : p < 0.4 ? 1 - ((p - 0.1) / 0.3) : 0;
      const aboutRounded = Math.round(aboutOpacity * 100) / 100;
      if (aboutRounded !== lastAboutOp) {
        aboutOverlay.style.opacity = aboutRounded;
        if (aboutRounded <= 0.01) {
          aboutOverlay.style.visibility = 'hidden';
        } else {
          aboutOverlay.style.visibility = '';
          aboutOverlay.style.pointerEvents = aboutRounded > 0.1 ? 'auto' : 'none';
        }
        lastAboutOp = aboutRounded;
      }

      // ── CABINET SCENE: zoom out (translateZ from startZ → 0) ──
      const zoomProgress = easeOutQuart(Math.min(1, p / 0.9));
      const currentZ = Math.round(startZ * (1 - zoomProgress));
      if (currentZ !== lastZ) {
        cabinetScene.style.transform = `translateZ(${currentZ}px)`;
        lastZ = currentZ;
      }

      // ── DRAWER FACE: slides toward camera and fades ──
      const drawerProg = clamp((p - 0.03) / 0.45, 0, 1);
      const drawerEased = easeOutCubic(drawerProg);
      const drawerZ = Math.round(drawerEased * 400);
      const drawerOpacity = Math.round((drawerProg < 0.6 ? 1 : 1 - ((drawerProg - 0.6) / 0.4)) * 100) / 100;
      if (drawerOpacity !== lastDrawerOp) {
        drawerFace.style.transform = `translateZ(${drawerZ}px)`;
        drawerFace.style.opacity = drawerOpacity;
        drawerFace.style.visibility = drawerOpacity <= 0.01 ? 'hidden' : '';
        lastDrawerOp = drawerOpacity;
      }

      // ── LIGHT GLOW: expands from thin line to full warm glow ──
      const lightProg = clamp((p - 0.05) / 0.55, 0, 1);
      const lightEased = easeOutQuad(lightProg);
      const glowOpRounded = Math.round(lightEased * 85) / 100;
      if (glowOpRounded !== lastGlowOp) {
        const glowScaleY = 0.01 + lightEased * 0.99;
        lightGlow.style.transform = `translate(-50%, -48%) scaleY(${glowScaleY})`;
        lightGlow.style.opacity = glowOpRounded;
        lastGlowOp = glowOpRounded;
      }

      // ── LIGHT RAYS: fan out (only update when visible) ──
      const rayProg = clamp((p - 0.12) / 0.5, 0, 1);
      if (rayProg > 0.001 || lastGlowOp > 0) {
        const rayEased = easeOutCubic(rayProg);
        lightRays.style.opacity = Math.round(rayEased * 80) / 100;
        for (let i = 0; i < rays.length; i++) {
          const thisProgress = clamp((rayProg - rayDelays[i]) / (1 - rayDelays[i]), 0, 1);
          const thisEased = easeOutCubic(thisProgress);
          rays[i].style.transform = `rotate(${rayAngles[i]}deg) scaleX(${thisEased})`;
          rays[i].style.opacity = thisEased;
        }
      }

      // ── LIGHT HAZE: warm ambient overlay ──
      const hazeProg = clamp((p - 0.15) / 0.55, 0, 1);
      lightHaze.style.opacity = Math.round(easeOutQuad(hazeProg) * 70) / 100;

      // ── INTERIOR GLOW — update specific elements directly (NOT :root) ──
      const wallGlowProg = clamp((p - 0.2) / 0.5, 0, 1);
      const wallGlowEased = easeOutQuad(wallGlowProg);
      const wallGlowRounded = Math.round(wallGlowEased * 100) / 100;

      if (wallGlowRounded !== lastWallGlow) {
        // Interior ::after glow — use stylesheet injection (only updates when value changes)
        interiorAfterStyle.textContent = `.drawer-interior::after { opacity: ${wallGlowRounded} !important; }`;

        // Closed drawer reflections
        if (drawerTop1) drawerTop1.style.setProperty('--glow', wallGlowRounded);
        if (drawerBottom1) drawerBottom1.style.setProperty('--glow', wallGlowRounded);

        // Use a simple opacity fade on the interior instead of rewriting box-shadow every frame
        // The initial heavy shadow is in CSS, we just lighten it via reduced opacity overlay
        if (drawerInterior) {
          drawerInterior.style.opacity = 1 - wallGlowEased * 0.15;
        }

        lastWallGlow = wallGlowRounded;
      }

      // ── DRAWER FILES: appear at 45%+ ──
      const fileProg = clamp((p - 0.45) / 0.35, 0, 1);
      const fileRounded = Math.round(easeOutCubic(fileProg) * 100) / 100;
      if (fileRounded !== lastFileOp) {
        drawerFiles.style.opacity = fileRounded;
        drawerFiles.style.pointerEvents = fileProg > 0.5 ? 'auto' : 'none';

        // Stagger individual folders
        for (let i = 0; i < folders.length; i++) {
          const folderDelay = i * 0.06;
          const folderProg = clamp((fileProg - folderDelay) / (1 - folderDelay * folders.length), 0, 1);
          const folderEased = easeOutCubic(folderProg);
          folders[i].style.opacity = folderEased;
          folders[i].style.transform = `translateY(${(1 - folderEased) * 12 + (i % 2 === 0 ? 2 : -1)}px)`;
        }
        lastFileOp = fileRounded;
      }

      // ── FOOTER: appears at 85%+ ──
      const footerProg = clamp((p - 0.85) / 0.15, 0, 1);
      footer.style.opacity = Math.round(footerProg * 100) / 100;
    },
  });
}

// ─────────────────────────────────────────────
// EASING & UTILITY
// ─────────────────────────────────────────────
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeOutQuad(t)  { return 1 - (1 - t) * (1 - t); }
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// ─────────────────────────────────────────────
// PROJECT PANEL
// ─────────────────────────────────────────────
let activeFolder = null;

function openProject(index) {
  const proj = PROJECTS[index];
  if (!proj) return;

  document.getElementById('panel-number').textContent      = proj.number;
  document.getElementById('panel-title').textContent       = proj.title;
  document.getElementById('panel-description').textContent = proj.description;

  // Tags
  document.getElementById('panel-tags').innerHTML = proj.tags
    .map((t) => `<span class="panel-tag">${t}</span>`)
    .join('');

  // Links
  document.getElementById('panel-links').innerHTML = proj.links
    .map((l) => {
      const icon = l.icon === 'github'
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;
      return `<a href="${l.url}" class="panel-link" target="_blank" rel="noopener">${icon}${l.label}</a>`;
    })
    .join('');

  // Meta
  document.getElementById('panel-meta').innerHTML = proj.meta
    .map((m) => `<span>${m}</span>`)
    .join('');

  // Show dim overlay + open panel
  sceneDim.classList.add('active');
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  panel.scrollTop = 0;
  panelClose.focus();

  lenis.stop();
}

function closeProject() {
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  sceneDim.classList.remove('active');

  // Reset active folder
  if (activeFolder) {
    activeFolder.classList.remove('active');
    gsap.to(activeFolder, {
      z: 0,
      scale: 1,
      duration: 0.3,
      ease: 'power2.inOut',
    });
  }
  activeFolder = null;
  lenis.start();
}

panelClose.addEventListener('click', closeProject);
sceneDim.addEventListener('click', closeProject);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && panel.classList.contains('open')) closeProject();
});

// ─────────────────────────────────────────────
// FOLDER CLICK HANDLERS
// ─────────────────────────────────────────────
document.querySelectorAll('.file-folder').forEach((folder) => {
  folder.addEventListener('click', () => {
    const index = parseInt(folder.dataset.project, 10);

    // Deselect previous
    document.querySelectorAll('.file-folder').forEach((f) => f.classList.remove('active'));

    // Animate this folder toward camera
    folder.classList.add('active');
    activeFolder = folder;

    gsap.to(folder, {
      z: 80,
      scale: 1.15,
      duration: 0.35,
      ease: 'power2.out',
      onComplete: () => openProject(index),
    });
  });
});

// ─────────────────────────────────────────────
// RESIZE HANDLER
// ─────────────────────────────────────────────
window.addEventListener('resize', () => {
  // Update perspective-related values if needed
  ScrollTrigger.refresh();
});

// (Interior glow is now handled via interiorAfterStyle element, updated in scroll handler)
