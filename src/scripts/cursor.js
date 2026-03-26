/**
 * Custom cursor system
 * Core (8px amber dot, instant tracking) + Aura (40px ring, lerped)
 * 8 contextual states + magnetic hover + idle pulse
 */

export function initCursor() {
  // Skip on touch devices
  if ('ontouchstart' in window || window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cursor = document.getElementById('cursor');
  const core = cursor.querySelector('.cursor-core');
  const aura = cursor.querySelector('.cursor-aura');
  const label = cursor.querySelector('.cursor-label');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let auraX = mouseX;
  let auraY = mouseY;
  let idleTimer = null;
  let isVisible = false;

  // ── MOUSE TRACKING ──────────────────────────────────
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      cursor.style.opacity = '1';
    }

    // Reset idle timer
    document.body.classList.remove('cursor-idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      document.body.classList.add('cursor-idle');
    }, 2000);
  });

  document.addEventListener('mouseleave', () => {
    isVisible = false;
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    cursor.style.opacity = '1';
  });

  // ── RENDER LOOP ─────────────────────────────────────
  function render() {
    // Core follows exactly
    core.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

    // Aura follows with lerp
    auraX += (mouseX - auraX) * 0.12;
    auraY += (mouseY - auraY) * 0.12;
    aura.style.transform = `translate(${auraX}px, ${auraY}px) translate(-50%, -50%)`;

    requestAnimationFrame(render);
  }
  render();

  // ── CURSOR STATE MANAGEMENT ─────────────────────────
  function setCursorState(state, labelText = '') {
    document.body.className = document.body.className
      .replace(/cursor-\w+/g, '')
      .trim();
    if (state) {
      document.body.classList.add(`cursor-${state}`);
    }
    label.textContent = labelText;
  }

  // Interactive element detection
  document.addEventListener('mouseover', (e) => {
    const el = e.target;

    if (el.closest('.mission-card')) {
      setCursorState('project', 'EXPLORE');
      return;
    }
    if (el.closest('a, button, .link-magnetic, .contact-link, .nav-dot')) {
      setCursorState('link', 'VIEW');
      return;
    }
    if (el.closest('p, .about-bio, .mission-desc, .timeline-detail, .contact-sub')) {
      setCursorState('text');
      return;
    }
  });

  document.addEventListener('mouseout', (e) => {
    const el = e.target;
    if (el.closest('a, button, .link-magnetic, .contact-link, .nav-dot, .mission-card, p')) {
      setCursorState(null);
    }
  });

  // Click state
  document.addEventListener('mousedown', () => {
    document.body.classList.add('cursor-click');
  });
  document.addEventListener('mouseup', () => {
    document.body.classList.remove('cursor-click');
  });

  // ── MAGNETIC HOVER ──────────────────────────────────
  const magneticElements = document.querySelectorAll('.link-magnetic, .nav-dot, .contact-link');
  const MAGNETIC_RADIUS = 120;
  const MAGNETIC_STRENGTH = 0.15;

  magneticElements.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < MAGNETIC_RADIUS) {
        const pull = (1 - dist / MAGNETIC_RADIUS) * 8;
        const moveX = (dx / dist) * pull * MAGNETIC_STRENGTH / 0.15;
        const moveY = (dy / dist) * pull * MAGNETIC_STRENGTH / 0.15;

        el.style.transform = `translate(${moveX}px, ${moveY}px)`;
        el.style.transition = 'transform 0.15s ease-out';
      }
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
  });
}
