# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Fengyou Liu (Princeton '29, EE/Aerospace). Live at **https://www.fengyou.org**, hosted on GitHub Pages from the `main` branch of `Hat000/fengyou`.

## Stack & Deployment

- **Vite** build system with ES modules
- **Three.js** (3D crane scene), **GSAP + ScrollTrigger** (animations), **Lenis** (smooth scroll), **SplitType** (text effects)
- **Google Fonts** CDN (Space Grotesk, Inter, JetBrains Mono)
- **Deployment**: `npm run build` → push `dist/` to `main` on GitHub → GitHub Pages auto-deploys
- **Dev server**: `npm run dev` (Vite on port 3000) or use Claude Preview
- **Domain**: `www.fengyou.org` via CNAME file — **do not modify CNAME**

## Content Management

All site content is stored in JSON files in the `content/` directory. A custom Vite plugin (`vite-plugin-content.js`) injects this content into the HTML at build time, so the output is fully static and SEO-friendly.

**To update content:**
1. Edit the relevant JSON file in `content/`
2. Run `npm run build`
3. Push to GitHub

**Content files:**

| File | What it controls |
|---|---|
| `content/hero.json` | Name, eyebrow text, taglines, bio, hero links |
| `content/about.json` | Bio paragraphs, stats grid, photo path |
| `content/skills.json` | Skill categories and tags with details |
| `content/projects.json` | Project cards (id, name, subtitle, status, description, tags) |
| `content/experience.json` | Timeline entries (year, org, role, detail) |
| `content/contact.json` | Contact headline, subtext, links, footer text |

**Adding a new project:** Copy an existing entry in `content/projects.json`, change the fields, and rebuild. New projects get a default thumbnail SVG automatically. To add a custom thumbnail, add an entry to the `THUMBNAILS` map in `src/scripts/render-content.js`.

## File Architecture

```
content/                    ← Content JSON files (edit these to update the site)
  hero.json, about.json, skills.json, projects.json, experience.json, contact.json
src/
  index.html                ← HTML template with <!-- CONTENT:section --> placeholders
  scripts/
    main.js                 ← Entry point: initializes all modules in sequence
    scene.js                ← Three.js 3D crane scene, particles, camera
    animations.js           ← GSAP scroll-triggered text/element animations
    cursor.js               ← Custom cursor with aura + magnetic hover
    nav.js                  ← Numbered navigation + scroll spy
    scroll.js               ← Lenis smooth scroll setup
    taglines.js             ← Random tagline picker (reads from data attribute)
    render-content.js       ← Build-time HTML renderer (used by Vite plugin)
  styles/
    main.css                ← All styles (~1500 lines)
public/
  CNAME                     ← GitHub Pages domain config — do not touch
  FengyouLiu.jpg            ← Profile photo
vite.config.js              ← Vite config (registers content plugin)
vite-plugin-content.js      ← Custom plugin: reads content/*.json → injects into HTML
dist/                       ← Build output (deployed to GitHub Pages)
```

Root-level `index.html`, `main.css`, and `script.js` are the **original simple landing page** from the `main` branch. The redesign lives entirely in `src/`.

## Page Sections

The site has 6 scrollable sections plus a footer:

1. **Hero** — eyebrow, name, random tagline, bio, links
2. **About** — bio paragraphs, stats grid, photo
3. **Skills** — three categories (Hardware, Software, Aerospace) with tags
4. **Projects** — mission-style cards with thumbnails, status, tags
5. **Experience** — vertical timeline with wave icons
6. **Contact** — headline, subtext, links
7. **Footer** — message + copyright

Navigation: numbered dot buttons (01–06) with scroll spy. Theme toggle (light/dark).

## Key Technical Details

- **Content injection**: `vite-plugin-content.js` runs `transformIndexHtml` to replace `<!-- CONTENT:section -->` placeholders with rendered HTML from `render-content.js`. Content JSON files are watched for HMR in dev.
- **Animation classes**: `render-content.js` must output HTML with exact CSS classes that `animations.js` queries: `.split-chars`, `.split-lines`, `.scramble-text`, `.mission-card`, `.timeline-entry`, `.toolkit-tag`, etc.
- **Taglines**: All taglines are embedded in a `data-taglines` attribute on `#tagline` at build time. `taglines.js` picks one randomly at runtime.

## Design System

**Typography**: Space Grotesk (headings) + Inter (body) + JetBrains Mono (code/labels)

**Theme**: Dark by default with a light mode toggle. Colors defined in CSS custom properties in `src/styles/main.css`.

## Owner Preferences

- Fengyou is not a web developer — explain changes in plain language
- Design decisions are delegated to Claude — use good judgment on UI/UX
- **Nature + engineer vibe** — warm textures, not cold techy-clean
