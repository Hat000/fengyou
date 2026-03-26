/**
 * FENGYOU.ORG v3 — Main Entry Point
 * Initializes all modules in sequence
 */

import '../styles/main.css';
import { initScroll } from './scroll.js';
import { initCursor } from './cursor.js';
import { initNav } from './nav.js';
import { initAnimations } from './animations.js';
import { initScene } from './scene.js';
import { initTaglines } from './taglines.js';

// ── INITIALIZATION ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Theme first (prevents flash)
  initTheme();

  // Taglines (immediate, no deps)
  initTaglines();

  // Scroll system (Lenis + ScrollTrigger)
  const lenis = initScroll();

  // GSAP text animations + scroll triggers
  initAnimations(lenis);

  // Navigation (scroll spy)
  initNav(lenis);

  // Custom cursor
  initCursor();

  // Three.js scene
  initScene();

  // Click ripple on empty space
  initClickRipple();
});

// ── THEME TOGGLE ─────────────────────────────────────────
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');

  if (saved === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  }

  toggle?.addEventListener('click', () => {
    const isDark = document.documentElement.dataset.theme === 'dark';
    if (isDark) {
      delete document.documentElement.dataset.theme;
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.dataset.theme = 'dark';
      localStorage.setItem('theme', 'dark');
    }
  });
}

// ── CLICK RIPPLE ────────────────────────────────────────
function initClickRipple() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('a, button, .mission-card, .contact-link, #three-canvas')) return;

    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);

    ripple.addEventListener('animationend', () => ripple.remove());
  });
}
