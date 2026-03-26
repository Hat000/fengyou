/**
 * GSAP text animations + scroll-triggered effects
 * Wind/cloud themed — varied entrance animations per section
 * SplitType for character/line splitting
 * Custom scramble text effect
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  gsap.set('.hero-eyebrow, .hero-tagline, .hero-links a', { opacity: 0 });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        heroEntrance();
        scrollAnimations();
      });
    });
  } else {
    setTimeout(() => {
      heroEntrance();
      scrollAnimations();
    }, 200);
  }
}

// ── HERO ENTRANCE ───────────────────────────────────────
function heroEntrance() {
  const tl = gsap.timeline({ delay: 0.2 });

  // Eyebrow — scramble text + fade in
  const eyebrow = document.querySelector('.hero-eyebrow');
  if (eyebrow) {
    tl.to(eyebrow, { opacity: 1, duration: 0.01 }, 0);
    scrambleText(eyebrow, 0.6, tl, 0);
  }

  // Name — wind sweep: chars blow in from right with rotation
  const name = document.querySelector('.hero-name');
  if (name) {
    const split = new SplitType(name, { types: 'chars' });
    gsap.set(split.chars, {
      opacity: 0,
      x: 40,
      y: 20,
      rotateZ: 8,
      filter: 'blur(6px)',
      transformOrigin: 'center bottom',
    });
    tl.to(split.chars, {
      x: 0,
      y: 0,
      rotateZ: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.03,
    }, 0.1);
  }

  // Tagline — float up like paper on wind
  const tagline = document.querySelector('.hero-tagline');
  if (tagline) {
    gsap.set(tagline, { opacity: 0, y: 20, filter: 'blur(4px)' });
    tl.to(tagline, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.6,
      ease: 'power2.out',
    }, 0.5);
  }

  // Bio — lines drift in from left with slight rotation (paper blowing)
  const bioParagraphs = document.querySelectorAll('.hero-bio .split-lines');
  bioParagraphs.forEach((p) => {
    const split = new SplitType(p, { types: 'lines' });
    split.lines.forEach((line) => {
      const wrapper = document.createElement('div');
      wrapper.style.overflow = 'hidden';
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });
    gsap.set(split.lines, { opacity: 0, x: -25, rotateZ: -1.5, filter: 'blur(2px)' });
    tl.to(split.lines, {
      x: 0,
      rotateZ: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.07,
    }, 0.6);
  });

  // Links — fade up with scale
  const links = document.querySelectorAll('.hero-links a');
  gsap.set(links, { opacity: 0, y: 12, scale: 0.9 });
  tl.to(links, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.4,
    ease: 'back.out(1.2)',
    stagger: 0.08,
  }, 0.8);
}

// ── SCROLL-TRIGGERED ANIMATIONS ─────────────────────────
function scrollAnimations() {
  // Section dividers — draw in from left
  document.querySelectorAll('.section-divider').forEach((div) => {
    gsap.to(div, {
      scaleX: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: div,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Section labels — scramble text on scroll
  document.querySelectorAll('.section-label.scramble-text').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => scrambleText(el, 0.6),
    });
  });

  // ── VARIED SECTION HEADINGS ─────────────────────────
  const headings = document.querySelectorAll('.section-heading.split-chars');
  headings.forEach((heading, index) => {
    const split = new SplitType(heading, { types: 'chars' });

    // Different animation per section
    if (index === 0) {
      // About: chars sweep in from right (wind direction)
      gsap.set(split.chars, { opacity: 0, x: 30, rotateZ: 5, filter: 'blur(4px)' });
      gsap.to(split.chars, {
        x: 0, rotateZ: 0, opacity: 1, filter: 'blur(0px)',
        duration: 0.6, ease: 'power3.out', stagger: 0.025,
        scrollTrigger: { trigger: heading, start: 'top 85%', toggleActions: 'play none none none' },
      });
    } else if (index === 1) {
      // Toolkit: chars scale up from center with blur clear
      gsap.set(split.chars, { opacity: 0, scale: 0.5, filter: 'blur(6px)' });
      gsap.to(split.chars, {
        scale: 1, opacity: 1, filter: 'blur(0px)',
        duration: 0.5, ease: 'back.out(1.5)', stagger: 0.03,
        scrollTrigger: { trigger: heading, start: 'top 85%', toggleActions: 'play none none none' },
      });
    } else if (index === 2) {
      // Projects: chars drop in from above (like landing)
      gsap.set(split.chars, { opacity: 0, y: -40, rotateX: 60, transformOrigin: 'top' });
      gsap.to(split.chars, {
        y: 0, rotateX: 0, opacity: 1,
        duration: 0.5, ease: 'power3.out', stagger: 0.02,
        scrollTrigger: { trigger: heading, start: 'top 85%', toggleActions: 'play none none none' },
      });
    } else {
      // Experience & others: classic flip up
      gsap.set(split.chars, { opacity: 0, y: 50, rotateX: -90, transformOrigin: 'bottom' });
      gsap.to(split.chars, {
        y: 0, rotateX: 0, opacity: 1,
        duration: 0.6, ease: 'power3.out', stagger: 0.02,
        scrollTrigger: { trigger: heading, start: 'top 85%', toggleActions: 'play none none none' },
      });
    }
  });

  // ── BODY PARAGRAPHS — paper float (drift in with slight rotation + blur) ──
  document.querySelectorAll('.about-bio .split-lines, .mission-desc.split-lines, .contact-sub.split-lines').forEach((p) => {
    const split = new SplitType(p, { types: 'lines' });
    split.lines.forEach((line) => {
      const wrapper = document.createElement('div');
      wrapper.style.overflow = 'hidden';
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });
    gsap.set(split.lines, { opacity: 0, x: -20, rotateZ: -1, filter: 'blur(2px)' });
    gsap.to(split.lines, {
      x: 0, rotateZ: 0, opacity: 1, filter: 'blur(0px)',
      duration: 0.55, ease: 'power2.out', stagger: 0.07,
      scrollTrigger: { trigger: p, start: 'top 85%', toggleActions: 'play none none none' },
    });
  });

  // Toolkit intro text
  const toolkitIntro = document.querySelector('.toolkit-intro');
  if (toolkitIntro) {
    gsap.set(toolkitIntro, { opacity: 0, y: 10, filter: 'blur(3px)' });
    gsap.to(toolkitIntro, {
      opacity: 1, y: 0, filter: 'blur(0px)',
      duration: 0.5, ease: 'power2.out',
      scrollTrigger: { trigger: toolkitIntro, start: 'top 85%', toggleActions: 'play none none none' },
    });
  }

  // Mission card names — wind sweep from left
  document.querySelectorAll('.mission-name.split-chars').forEach((name) => {
    const split = new SplitType(name, { types: 'chars' });
    gsap.set(split.chars, { opacity: 0, x: -20, rotateZ: -3, filter: 'blur(3px)' });
    gsap.to(split.chars, {
      x: 0, rotateZ: 0, opacity: 1, filter: 'blur(0px)',
      duration: 0.5, ease: 'power3.out', stagger: 0.02,
      scrollTrigger: { trigger: name, start: 'top 85%', toggleActions: 'play none none none' },
    });
  });

  // Mission IDs — scramble
  document.querySelectorAll('.mission-id.scramble-text').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => scrambleText(el, 0.5),
    });
  });

  // Toolkit tags — scatter in like leaves
  document.querySelectorAll('.toolkit-category').forEach((cat) => {
    const tags = cat.querySelectorAll('.toolkit-tag');
    tags.forEach((tag, i) => {
      const angle = (Math.random() - 0.5) * 15;
      const dist = 15 + Math.random() * 10;
      gsap.set(tag, {
        opacity: 0,
        y: dist,
        x: (Math.random() - 0.5) * 20,
        rotateZ: angle,
        scale: 0.9,
      });
    });
    gsap.to(tags, {
      opacity: 1, y: 0, x: 0, rotateZ: 0, scale: 1,
      duration: 0.4, ease: 'power2.out', stagger: 0.05,
      scrollTrigger: { trigger: cat, start: 'top 85%', toggleActions: 'play none none none' },
    });
  });

  // Project thumbnails — fade in with scale
  document.querySelectorAll('.mission-visual').forEach((visual) => {
    gsap.set(visual, { opacity: 0, scale: 0.95 });
    gsap.to(visual, {
      opacity: 1, scale: 1,
      duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: visual, start: 'top 90%', toggleActions: 'play none none none' },
    });
  });

  // Timeline entries — sweep in from right (like wind carrying them)
  document.querySelectorAll('.timeline-entry').forEach((entry, i) => {
    gsap.set(entry, { opacity: 0, x: 40, filter: 'blur(3px)' });
    gsap.to(entry, {
      x: 0, opacity: 1, filter: 'blur(0px)',
      duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: entry, start: 'top 85%', toggleActions: 'play none none none' },
    });
  });

  // Contact headline — words float in with blur
  const contactHeadline = document.querySelector('.contact-headline');
  if (contactHeadline) {
    const split = new SplitType(contactHeadline, { types: 'words' });
    gsap.set(split.words, { opacity: 0, y: 30, filter: 'blur(5px)', scale: 0.9 });
    gsap.to(split.words, {
      y: 0, opacity: 1, filter: 'blur(0px)', scale: 1,
      duration: 0.7, ease: 'back.out(1.3)', stagger: 0.06,
      scrollTrigger: { trigger: contactHeadline, start: 'top 85%', toggleActions: 'play none none none' },
    });
  }

  // Contact links — float up
  document.querySelectorAll('.contact-link').forEach((link, i) => {
    gsap.set(link, { opacity: 0, y: 20, filter: 'blur(2px)' });
    gsap.to(link, {
      y: 0, opacity: 1, filter: 'blur(0px)',
      duration: 0.4, ease: 'power2.out', delay: i * 0.1,
      scrollTrigger: { trigger: link, start: 'top 90%', toggleActions: 'play none none none' },
    });
  });

  // Footer — gentle fade
  gsap.set('.footer-message', { opacity: 0, filter: 'blur(4px)' });
  gsap.to('.footer-message', {
    opacity: 1, filter: 'blur(0px)',
    duration: 0.6,
    scrollTrigger: { trigger: '.section-footer', start: 'top 80%' },
  });

  // Mission cards — mouse follow glow
  document.querySelectorAll('.mission-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
    });
  });

  // Heading char scatter on hover (wind push effect)
  document.querySelectorAll('.hero-name, .section-heading').forEach((heading) => {
    heading.addEventListener('mousemove', (e) => {
      const chars = heading.querySelectorAll('.char');
      if (!chars.length) return;
      const rect = heading.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      chars.forEach((char) => {
        const cr = char.getBoundingClientRect();
        const cx = cr.left - rect.left + cr.width / 2;
        const cy = cr.top - rect.top + cr.height / 2;
        const dist = Math.hypot(mx - cx, my - cy);

        if (dist < 80) {
          const angle = Math.atan2(cy - my, cx - mx);
          const force = (1 - dist / 80) * 4;
          gsap.to(char, {
            x: Math.cos(angle) * force,
            y: Math.sin(angle) * force,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      });
    });

    heading.addEventListener('mouseleave', () => {
      const chars = heading.querySelectorAll('.char');
      gsap.to(chars, {
        x: 0, y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      });
    });
  });
}

// ── SCRAMBLE TEXT EFFECT ─────────────────────────────────
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·&/[]';

function scrambleText(el, duration = 0.6, timeline = null, position = null) {
  const target = el.dataset.scramble || el.textContent;
  const length = target.length;
  let frame = 0;
  const totalFrames = Math.round(duration * 60);

  function update() {
    let text = '';
    for (let i = 0; i < length; i++) {
      const revealAt = (i / length) * totalFrames;
      if (frame >= revealAt) {
        text += target[i];
      } else {
        text += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
    }
    el.textContent = text;
    frame++;
    if (frame <= totalFrames) {
      requestAnimationFrame(update);
    }
  }

  if (timeline) {
    timeline.call(() => update(), null, position);
  } else {
    update();
  }
}
