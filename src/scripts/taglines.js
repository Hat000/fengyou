/**
 * Random tagline picker
 * Reads taglines from the data-taglines attribute injected at build time.
 */

export function initTaglines() {
  const el = document.getElementById('tagline');
  if (!el) return;

  const raw = el.getAttribute('data-taglines');
  if (raw) {
    try {
      const taglines = JSON.parse(raw);
      el.textContent = taglines[Math.floor(Math.random() * taglines.length)];
    } catch (e) {
      // Fallback if parsing fails
      el.textContent = el.textContent || '';
    }
  }
}
