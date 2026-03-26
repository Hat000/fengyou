/**
 * Smooth scroll (Lenis) + GSAP ScrollTrigger integration
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScroll() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // ease-out-expo
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  });

  // Sync Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Scroll-to for nav clicks
  window.__lenis = lenis;

  // Hide scroll prompt after first scroll
  let hasScrolled = false;
  lenis.on('scroll', () => {
    if (!hasScrolled) {
      hasScrolled = true;
      const prompt = document.getElementById('scroll-prompt');
      if (prompt) {
        gsap.to(prompt, { opacity: 0, duration: 0.4, ease: 'power2.out' });
      }
    }
  });

  return lenis;
}
