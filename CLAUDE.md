# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Fengyou Liu (Princeton '29, EE/Aerospace). Live at **https://www.fengyou.org**, hosted on GitHub Pages from the `main` branch of `Hat000/fengyou`.

## Core Concept

The site is an **immersive CSS 3D filing cabinet experience**. The visitor starts on a dark landing page with name/bio/links. As they scroll, a filing cabinet zooms into view — the top drawer pulls open with warm amber light flooding in, revealing manila folders inside. The **folders are the navigation**: clicking one opens a project detail panel. Design philosophy: nature meets engineer. Warm, textured, alive — not techy-clean.

## Stack & Deployment

- **Pure HTML/CSS/JS** — no framework, no bundler, no npm, no build step
- **No Three.js** — the 3D effect is built entirely with CSS 3D transforms (`perspective`, `translateZ`, `preserve-3d`)
- **CDN dependencies**:
  - GSAP 3.12.5 + ScrollTrigger (CDN) — scroll-scrubbed animation driver (`scrub: 1.5`)
  - Lenis 1.0.42 (CDN) — smooth scroll with physics feel (duration 2.2s)
- **Deployment**: Push to `main` branch on GitHub → GitHub Pages auto-deploys
- **Local preview**: `npx serve . -l 3000` or use Claude Preview
- **Domain**: `www.fengyou.org` via CNAME file — **do not modify CNAME**

## File Architecture

| File | Purpose |
|---|---|
| `index.html` | Single page: scroll-space div, light flood layers, CSS 3D cabinet scene, about overlay, project panel, loading screen, footer |
| `main.css` | All styles (~1120 lines). Design tokens in `:root`. Fixed overlays layered by z-index. CSS 3D cabinet built with nested divs. |
| `script.js` | GSAP ScrollTrigger animation, Lenis scroll wiring, project data, folder click → panel logic (~375 lines) |
| `FengyouLiu.jpg` | Profile photo |
| `CNAME` | GitHub Pages domain config — do not touch |
| `.claude/launch.json` | Dev server config for Claude Preview |

**Removed files** (no longer used):
- `rusty_filing_cabinet.glb` — replaced by CSS 3D cabinet
- `inspect-glb.js`, `glb-info.txt` — temporary debug files

## Design System

**Color palette** (warm, industrial, natural — not techy green):
```css
:root {
  --bg:             #0F0C09;   /* warm near-black, page bg */
  --bg-panel:       #1A1410;   /* panel background */
  --text:           #F2EDE4;   /* warm cream, primary text */
  --text-muted:     #A89880;   /* muted warm gray, secondary text */
  --accent:         #C4823A;   /* rust/amber — primary accent color */
  --folder-manila:  #C4A882;   /* manila folder color */
  --folder-tab:     #B8976A;   /* folder tab gradient base */
  --metal-dark:     #2A2420;   /* dark interior metal surfaces */
  --metal-mid:      #3D3028;   /* mid metal tone */
}
```

**Typography**: Space Grotesk (display) + Inter (body) via Google Fonts CDN.

## Architecture Patterns

### Layering (z-index stack, bottom to top):
1. `body::after` — `z-index: 3` — subtle vignette overlay
2. `#light-flood` — `z-index: 4` — warm glow, light rays, haze
3. `#scene-viewport` — `z-index: 5` — CSS 3D perspective container holding the cabinet
4. `#darkness` — `z-index: 10` — full black overlay, fades on scroll
5. `#about-overlay` — `z-index: 20` — name, tagline, bio, links (visible at start)
6. `#site-footer` — `z-index: 25` — copyright
7. `#scene-dim` — `z-index: 35` — dims scene when project panel is open
8. `#project-panel` — `z-index: 40` — slides in from right (desktop) or up (mobile) on folder click

### CSS 3D Cabinet Structure:
```
#scene-viewport (perspective: 900px, perspective-origin: 50% 48%)
└── #cabinet-scene (translateZ: 800px → 0 on scroll, preserve-3d)
    └── .cabinet-body (preserve-3d)
        ├── .drawer-front.drawer-top-2   (closed drawer)
        ├── .drawer-front.drawer-top-1   (closed drawer, has ::after warm reflection)
        ├── .drawer-open                 (open drawer assembly)
        │   ├── .drawer-face             (slides toward camera via translateZ, fades out)
        │   └── .drawer-interior         (dark recessed interior with inset shadows)
        │       ├── .wall-left/right/back/bottom (depth illusion)
        │       ├── .file-rail.rail-left/right   (metallic rails)
        │       └── .drawer-files        (4 × .file-folder with .folder-tab-label + .folder-body)
        ├── .drawer-front.drawer-bottom-1 (closed drawer, has ::after warm reflection)
        └── .cabinet-frame (top/bottom/left/right frame pieces)
```

### Scroll Animation (GSAP ScrollTrigger scrub: 1.5):
- **0%**: Landing page visible, darkness overlay at full opacity, cabinet zoomed in (translateZ: 800px)
- **0–25%**: Darkness fades out
- **3–48%**: Drawer face slides toward camera (translateZ: 0→400px) and fades
- **5–60%**: Light glow expands from thin line to full warm flood
- **10–40%**: About overlay fades out, `visibility: hidden` set at 0 opacity (prevents click blocking)
- **12–62%**: Light rays fan out with staggered timing
- **20–70%**: Interior wall glow ramps up, closed drawer reflections appear
- **45–80%**: Folders fade in with stagger effect
- **0–90%**: Cabinet zooms out (translateZ: 800→0) with easeOutQuart
- **85–100%**: Footer fades in

### Folder Click → Project Panel:
1. Folder gets GSAP `z: 80, scale: 1.15` animation
2. `#scene-dim` overlay activates (dims the cabinet)
3. `#project-panel` slides in (`translateX(100%)` → `translateX(0)`)
4. Panel shows: project number, title, description, tech tags, links, meta
5. Lenis scroll paused while panel is open
6. Close via X button, clicking dim overlay, or Escape key

## Performance Optimizations (Critical)

The site uses scroll-driven animation updating many elements per frame. These optimizations are essential for smooth full-screen performance:

1. **NO `filter: blur()` on animated elements** — blur forces GPU to create offscreen textures and run multi-pass Gaussian blur every frame. Use wider/softer gradients instead.
2. **NO CSS custom properties on `:root` updated per frame** — changing `:root` vars invalidates all elements that reference them. Set styles directly on specific elements.
3. **NO per-frame `box-shadow` rewriting** — box-shadows are paint-heavy. Use opacity on a fixed-shadow element instead.
4. **NO per-frame `body.backgroundColor` changes** — triggers full page repaint. Use overlay gradients for warmth.
5. **Value-change skipping** — track last written values and skip DOM writes when unchanged.
6. **`will-change: opacity` / `will-change: transform`** — on `#darkness`, `#about-overlay`, `.light-glow`, `.ray`, `.drawer-face`, `.drawer-interior::after` to promote to GPU layers.
7. **NO `backdrop-filter`** — use higher opacity backgrounds instead.

## Responsive & Accessibility

- **Desktop (769px+)**: Full CSS 3D experience with folder tabs visible
- **Mobile (≤768px)**: Cabinet scales down (`90vw`, `70vh`), folder tabs hidden, project panel slides up from bottom as a bottom-sheet (`85vh`, rounded corners)
- **Small mobile (≤480px)**: Further scaled cabinet, about overlay repositioned
- **`prefers-reduced-motion`**: All transitions/animations set to 0.01ms
- Semantic HTML: `role="dialog"`, `aria-modal`, `aria-label`, `aria-hidden` on project panel
- Keyboard: Escape closes panel, folder buttons are focusable

## Project Data

Projects are defined in the `PROJECTS` array in `script.js`:
1. **Autonomous Drone** — C++, ROS 2, Raspberry Pi, PX4, OpenCV, Python
2. **Signal Processor** — VHDL, FPGA, Xilinx Vivado, AXI, DSP, MATLAB
3. **ML Research Tool** — Python, PyTorch, Matplotlib, Click, YAML, SQLite
4. **This Website** — CSS 3D, GSAP, Lenis, JavaScript, HTML/CSS

## Owner Preferences

- Fengyou is not a web developer — explain changes in plain language
- Design decisions are delegated to Claude — use good judgment on UI/UX
- **Nature + engineer vibe** — warm textures, not cold techy-clean
- Fun features (easter eggs, mini-games) are **Phase 3** — not in scope now
