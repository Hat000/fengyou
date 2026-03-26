/**
 * Navigation system
 * - Scroll spy for active section
 * - Nav blur on scroll
 * - Nav click smooth scroll
 * - Altitude meter
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initNav(lenis) {
  initScrollSpy();
  initNavBlur();
  initNavClicks(lenis);
  initAltimeter();
}

// ── SCROLL SPY ──────────────────────────────────────────
function initScrollSpy() {
  const sections = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];
  const dots = document.querySelectorAll('.nav-dot');

  sections.forEach((id, i) => {
    ScrollTrigger.create({
      trigger: `#${id}`,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setActive(dots, i),
      onEnterBack: () => setActive(dots, i),
    });
  });
}

function setActive(dots, index) {
  dots.forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}

// ── NAV BLUR ON SCROLL ──────────────────────────────────
function initNavBlur() {
  const nav = document.getElementById('main-nav');

  ScrollTrigger.create({
    trigger: '#hero',
    start: 'bottom 80px',
    onEnter: () => nav.classList.add('scrolled'),
    onLeaveBack: () => nav.classList.remove('scrolled'),
  });
}

// ── NAV CLICK → SMOOTH SCROLL ───────────────────────────
function initNavClicks(lenis) {
  document.querySelectorAll('.nav-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      const sectionId = dot.dataset.section;
      const target = document.getElementById(sectionId);
      if (target && lenis) {
        lenis.scrollTo(target, { duration: 1.2 });
      }

      const num = dot.querySelector('.nav-num');
      gsap.to(num, {
        color: '#4A9FBC',
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });
    });
  });

  document.querySelector('.nav-wordmark')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (lenis) lenis.scrollTo(0, { duration: 1 });
  });
}

// ── ALTITUDE METER ──────────────────────────────────────
function initAltimeter() {
  const indicator = document.getElementById('alt-indicator');
  const valueEl = document.getElementById('alt-value');
  if (!indicator || !valueEl) return;

  // Altitude descends as you scroll — like a plane landing into the content
  const altitudes = {
    0:   92000,
    15:  78000,
    35:  55000,
    55:  35000,
    80:  15000,
    92:  1000,
    100: 0,
  };

  let currentDisplayAlt = 92000;
  let targetAlt = 92000;

  function updateAltimeter() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    indicator.style.top = Math.min(progress, 100) + '%';

    const breakpoints = Object.keys(altitudes).map(Number).sort((a, b) => a - b);
    let alt = 0;

    for (let i = 0; i < breakpoints.length - 1; i++) {
      const low = breakpoints[i];
      const high = breakpoints[i + 1];
      if (progress >= low && progress <= high) {
        const t = (progress - low) / (high - low);
        const altLow = altitudes[low];
        const altHigh = altitudes[high];
        alt = Math.round(altLow + t * (altHigh - altLow));
        break;
      }
    }

    targetAlt = alt;
    requestAnimationFrame(updateAltimeter);
  }

  function animateAltValue() {
    currentDisplayAlt += (targetAlt - currentDisplayAlt) * 0.1;
    const rounded = Math.round(currentDisplayAlt);
    valueEl.textContent = rounded.toLocaleString();
    requestAnimationFrame(animateAltValue);
  }

  updateAltimeter();
  animateAltValue();
}
