# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Fengyou Liu (Princeton '29, EE/Aerospace). Live at **https://www.fengyou.org**, hosted on GitHub Pages from the `main` branch of `Hat000/fengyou`.

## Core Concept

The site is an **immersive 3D filing cabinet experience**. The visitor starts in pitch blackness (camera is inside a closed drawer). As they scroll, the drawer pulls open — warm light floods in from below, revealing a hyper-realistic rusty metal filing cabinet interior. The **folders inside the drawer are the navigation**. Clicking a folder causes it to animate floating out toward the camera. Design philosophy: nature meets engineer. Warm, textured, alive — not techy-clean.

## Stack & Deployment

- **Pure HTML/CSS/JS** — no framework, no bundler, no npm, no build step
- **CDN dependencies**:
  - Three.js r161 (via importmap + CDN ES modules) — WebGL 3D scene
  - GLTFLoader (Three.js addon) — loads the `.glb` cabinet model
  - RectAreaLight (Three.js addon) — warm light flooding into cabinet
  - GSAP + ScrollTrigger (CDN) — scroll-scrubbed animation driver
  - Lenis (CDN) — smooth scroll with physics feel (duration ~2s)
- **No Vanilla Tilt** — removed in Phase 2 redesign
- **Deployment**: Push to `main` branch on GitHub → GitHub Pages auto-deploys
- **Local preview**: Use Claude Preview with a simple static server
- **Domain**: `www.fengyou.org` via CNAME file — **do not modify CNAME**

## File Architecture

| File | Purpose |
|---|---|
| `index.html` | Canvas element, scroll-space div, HTML overlay layers (about, folder UI, project panel) |
| `main.css` | All styles. Design tokens in `:root`. Canvas fixed full-viewport. All UI overlays positioned above canvas. |
| `script.js` | Three.js scene, GLTF load, Lenis+GSAP scroll wiring, drawer animation, folder click → project panel |
| `rusty_filing_cabinet.glb` | 3D model — 676 triangles, 5 meshes, 6 embedded PBR textures, 18.84MB |
| `FengyouLiu.jpg` | Profile photo (may be shown in project panel or about overlay) |
| `CNAME` | GitHub Pages domain config — do not touch |

## GLTF Model: `rusty_filing_cabinet.glb`

**Source**: Sketchfab, Amiel Goco (@pamikoe), CC Attribution
**Attribution required**: "Rusty Filing Cabinet" by Amiel Goco on Sketchfab

**Node hierarchy** (names to use in `scene.getObjectByName()`):
```
filing_cabinet_low          ← root parent of all meshes
├── drawer_01_low           ← local Z = 5  (second from bottom)
├── drawer_02_low           ← local Z = 11 (third from bottom)
├── drawer_03_low           ← local Z = 4  (bottom drawer)
├── drawer_04_low           ← local Z = 15 (top drawer) ← PRIMARY ANIMATION TARGET
└── cabinet_low             ← local Z = 0  (cabinet body, never moves)
```

**Materials**:
- `mat_drawers` — shared across all 4 drawer meshes; has PBR rust/paint textures
- `mat_cabinet` — cabinet body material

**Critical**: Apply `THREE.DoubleSide` to ALL materials after load, or interior surfaces won't render when camera is inside the cabinet.

**Coordinate system**: Model was created in Maya (Z-up), exported FBX → GLTF. Root transform nodes swap Y and Z. The drawer Z-offsets in GLTF space become Y-positions (heights) in Three.js world space. The actual "pull out" axis (front of cabinet) must be confirmed visually — use OrbitControls + keyboard debug during Phase 1.

## Design System

**Color palette** (warm, industrial, natural — not techy green):
```css
:root {
  --bg:             #0F0C09;   /* warm near-black, page bg */
  --text:           #F2EDE4;   /* warm cream, primary text */
  --text-muted:     #A89880;   /* muted warm gray, secondary text */
  --accent:         #C4823A;   /* rust/amber — primary accent color */
  --folder-manila:  #C4A882;   /* manila folder color */
  --metal-dark:     #2A2420;   /* dark interior metal surfaces */
}
```

**Typography**: Space Grotesk or Inter (body) via Google Fonts CDN. Keep it warm and readable — not sterile.

## Architecture Patterns

### Layering (z-index stack, bottom to top):
1. `<canvas id="three-canvas">` — `position: fixed; z-index: 0` — Three.js renders here
2. `#scroll-space` — `height: 500vh; pointer-events: none` — creates GSAP scrub range
3. `#darkness` — `position: fixed; z-index: 10; background: #000` — full black overlay, fades on scroll
4. `#about-overlay` — `position: fixed; z-index: 20` — name, tagline, scroll hint (visible at start)
5. `#folder-ui` — `position: fixed; z-index: 30` — folder tabs, appear at 80%+ scroll progress
6. `#project-panel` — `position: fixed; z-index: 40` — slides in from right on folder click

### Scroll animation (GSAP ScrollTrigger scrub):
- `start: "top top"`, `end: "bottom bottom"`, `scrub: 1`
- At 0%: `renderer.toneMappingExposure = 0.02`, `rectLight.intensity = 0`, `#darkness opacity = 1`
- At 30%: `#darkness` fully faded
- At 60%: drawer 50% open, light ramping up
- At 100%: drawer fully open, `toneMappingExposure = 1.3`, scene fully lit

### Drawer animation (to be confirmed visually):
- Animated object: `drawer_04_low` (top drawer, most dramatic visual)
- Expected pull direction: negative Z in Three.js world space (toward camera) — **verify with keyboard debug**
- Open distance: ~15–20 Three.js units (tune visually)
- Also animate `cabinet_low` material slightly (subtle lighting change)

### Folder click → project panel:
1. Clicked folder object gets a GSAP float-toward-camera animation (scale + position)
2. `#project-panel` slides in from the right (`translateX(100%)` → `translateX(0)`)
3. Panel contains: project title, description, tech tags, GitHub/demo links
4. Close button reverses the folder animation and hides panel

## Key JS Patterns

```javascript
// Three.js via importmap (ES module, no build step)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Lenis + GSAP wiring
const lenis = new Lenis({ duration: 2.0, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// Apply DoubleSide after model load
gltf.scene.traverse((child) => {
  if (child.isMesh) {
    child.material.side = THREE.DoubleSide;
    child.material.needsUpdate = true;
  }
});

// Find animated node
const mainDrawer = gltf.scene.getObjectByName('drawer_04_low');

// Tone mapping for pitch-black start
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.02;
```

## Debug Approach (Phase 1 only — remove before deploy)

- Include `OrbitControls` to freely rotate camera and verify model orientation
- Keyboard shortcuts to test drawer axis:
  - `Z` + `+`/`-` → move drawer on Z axis
  - `X` + `+`/`-` → move drawer on X axis
  - `Y` + `+`/`-` → move drawer on Y axis
- Bounding box helper to visualize model bounds

## Responsive & Accessibility

- Desktop (1024px+): Full 3D experience
- Mobile (<768px): Simplified fallback — static image of cabinet or just the about overlay + project list. The 3D experience is desktop-first; mobile gets a graceful degradation.
- `prefers-reduced-motion`: Disable all animations; show a static lit scene
- Semantic HTML for overlay content (headings, links, `aria-label`)

## Owner Preferences

- Fengyou is not a web developer — explain changes in plain language
- Design decisions are delegated to Claude — use good judgment on UI/UX
- **Nature + engineer vibe** — warm textures, not cold techy-clean
- **Hyper-realistic** feel — let the PBR textures do the work
- Fun features (easter eggs, mini-games) are **Phase 2** — don't add to core site
- `ssl-manager.php` is a dead file from old hosting — safe to delete
- `inspect-glb.js` and `glb-info.txt` are temporary debug files — delete after build

## Attribution (must be in footer or credits)

- 3D Model: "Rusty Filing Cabinet" by Amiel Goco on Sketchfab (CC BY 4.0)
