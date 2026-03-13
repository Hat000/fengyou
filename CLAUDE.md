# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Fengyou Liu (Princeton '29, EE/Aerospace). Live at **https://www.fengyou.org**, hosted on GitHub Pages from the `main` branch of `Hat000/fengyou`.

## Core Concept

A simple, static landing page on a dark background. Shows name, tagline, bio, and links. No scrolling behavior, no animations beyond a CSS fade-in on load.

## Stack & Deployment

- **Pure HTML/CSS/JS** — no framework, no bundler, no npm, no build step
- **No CDN dependencies** — just Google Fonts
- **Deployment**: Push to `main` branch on GitHub → GitHub Pages auto-deploys
- **Local preview**: `npx serve . -l 3000` or use Claude Preview
- **Domain**: `www.fengyou.org` via CNAME file — **do not modify CNAME**

## File Architecture

| File | Purpose |
|---|---|
| `index.html` | Single page: landing section with name/tagline/bio/links, footer (~65 lines) |
| `main.css` | All styles (~145 lines). Design tokens in `:root`. CSS fade-in animations on load. |
| `script.js` | Picks a random tagline from a list and sets it on page load (~8 lines) |
| `FengyouLiu.jpg` | Profile photo |
| `CNAME` | GitHub Pages domain config — do not touch |
| `.claude/launch.json` | Dev server config for Claude Preview |

## Design System

**Color palette** (warm, dark):
```css
:root {
  --bg:          #0F0C09;   /* warm near-black, page bg */
  --text:        #F2EDE4;   /* warm cream, primary text */
  --text-muted:  #A89880;   /* muted warm gray, secondary text */
  --text-faint:  #6B5E52;   /* faint text, footer */
  --accent:      #C4823A;   /* rust/amber — primary accent color */
}
```

**Typography**: Space Grotesk (display) + Inter (body) via Google Fonts CDN.

## Page Structure

```
<main id="landing">
  .about-eyebrow   — "Princeton '29 · EE & Aerospace"
  .about-name      — "Fengyou Liu"
  .about-tagline   — random tagline (set by script.js)
  .about-details   — bio paragraph
  .about-links     — Email, GitHub, LinkedIn links
<footer id="site-footer">  — "© 2026 Fengyou Liu"
```

Each element fades in via a CSS `@keyframes fadeUp` animation with staggered `animation-delay`.

## Responsive & Accessibility

- **Mobile (≤480px)**: Padding reduced, name font size scales down
- **`prefers-reduced-motion`**: All transitions/animations set to 0.01ms

## Owner Preferences

- Fengyou is not a web developer — explain changes in plain language
- Design decisions are delegated to Claude — use good judgment on UI/UX
- **Nature + engineer vibe** — warm textures, not cold techy-clean
- Fun features (easter eggs, mini-games) are **Phase 3** — not in scope now
