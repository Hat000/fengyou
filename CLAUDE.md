# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Fengyou Liu (Princeton '29, EE/Aerospace). Live at **https://www.fengyou.org**, hosted on GitHub Pages from the `main` branch of `Hat000/fengyou`.

## Stack & Deployment

- **Pure HTML/CSS/JS** — no framework, no bundler, no npm, no build step
- **CDN dependencies**: GSAP + ScrollTrigger (animations), Vanilla Tilt (3D card hover)
- **Deployment**: Push to `main` branch on GitHub → GitHub Pages auto-deploys
- **Local preview**: Use Claude Preview with a simple static server (`npx serve .` or similar)
- **Domain**: `www.fengyou.org` via CNAME file — do not modify CNAME

## File Architecture

| File | Purpose |
|---|---|
| `index.html` | Single-page site: Hero, Work (bento grid), About, Contact/Footer |
| `main.css` | All styles. Design tokens as CSS custom properties in `:root` |
| `script.js` | All JS: particle canvas, GSAP scroll animations, nav logic, hamburger menu, tagline randomizer, vanilla-tilt init |
| `FengyouLiu.jpg` | Profile photo used in About section |
| `CNAME` | GitHub Pages domain config — do not touch |

## Design System

**Color (70-25-5 rule):**
- 70% Neutrals: `--bg-primary: #0B0F0E`, `--bg-card: #131A17`, `--text-primary: #F0FDF4`
- 25% Emerald: `--accent: #10B981`, `--accent-light: #34D399`, `--accent-deep: #059669`
- 5% Amber pop: `--pop: #E8A034` — used only for featured badge, "Currently" label, and rare highlights

**Typography:** Syne (headings, `--font-display`) + Inter (body, `--font-body`) via Google Fonts CDN.

**Animation classes:** `.reveal` (fade up), `.reveal-left`, `.reveal-right` — these are initial states that GSAP animates to visible. Hero elements use inline `opacity: 0` that GSAP resolves on load.

## Key Patterns

- **All design tokens live in `:root`** in main.css — change colors/spacing there, not inline
- **Responsive breakpoints**: 1024px (tablet), 768px (mobile nav + single-col), 420px (small mobile)
- **`prefers-reduced-motion`** disables all animations and hides the particle canvas
- **Hero tagline** is set dynamically in JS — the `#tagline` element starts empty, JS picks randomly between two strings on load
- **Project cards** use `data-tilt` attributes — Vanilla Tilt auto-initializes from these
- **Nav state**: JS adds `.scrolled` class to `#nav` on scroll, and `.active` class to nav links based on scroll position

## Owner Preferences

- Fengyou is not a web developer — explain changes in plain language when communicating
- Design decisions are delegated to Claude — use good judgment on UI/UX
- Fun features (easter eggs, mini-games) are **Phase 2** — don't add them to the core site yet
- No terminal/hacker aesthetics — keep it clean and confident
- `ssl-manager.php` is a dead file from old hosting — safe to delete
