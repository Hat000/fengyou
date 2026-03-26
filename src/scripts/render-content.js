/**
 * render-content.js — Build-time HTML renderer
 * Reads JSON content files and returns HTML strings matching
 * the exact DOM structure expected by animations.js and main.css.
 *
 * Used by vite-plugin-content.js at build time (Node.js context).
 */

// ── SVG ICONS ────────────────────────────────────────────

const ICONS = {
  email: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>`,
  github: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>`,
  linkedin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>`,
};

const ICONS_LG = {
  email: `<svg class="contact-link-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>`,
  github: `<svg class="contact-link-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>`,
  linkedin: `<svg class="contact-link-icon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>`,
};

// ── PROJECT THUMBNAIL SVGs ───────────────────────────────

const THUMBNAILS = {
  aeolus: `<svg class="thumbnail-placeholder" viewBox="0 0 120 80" fill="none">
    <path d="M20 60 L60 20 L100 60" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
    <circle cx="85" cy="25" r="8" stroke="currentColor" stroke-width="1" opacity="0.2"/>
    <path d="M10 65 Q40 45 60 55 Q80 65 110 50" stroke="currentColor" stroke-width="1" opacity="0.15"/>
  </svg>`,
  'signal-noise': `<svg class="thumbnail-placeholder" viewBox="0 0 120 80" fill="none">
    <path d="M10 40 Q20 20 30 40 Q40 60 50 40 Q60 20 70 40 Q80 60 90 40 Q100 20 110 40" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
    <path d="M10 50 Q30 35 50 50 Q70 65 90 50 Q110 35 110 50" stroke="currentColor" stroke-width="1" opacity="0.15"/>
  </svg>`,
  'paper-tiger': `<svg class="thumbnail-placeholder" viewBox="0 0 120 80" fill="none">
    <polygon points="60,10 20,70 100,70" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
    <polygon points="60,25 35,60 85,60" stroke="currentColor" stroke-width="1" opacity="0.2"/>
    <line x1="60" y1="10" x2="60" y2="70" stroke="currentColor" stroke-width="0.5" opacity="0.15"/>
  </svg>`,
  voltaic: `<svg class="thumbnail-placeholder" viewBox="0 0 120 80" fill="none">
    <circle cx="60" cy="40" r="25" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
    <path d="M60 15 L60 5 M85 40 L95 40 M60 65 L60 75 M35 40 L25 40" stroke="currentColor" stroke-width="1" opacity="0.2"/>
    <path d="M55 30 L65 30 L55 50 L65 50" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
  </svg>`,
};

// Default thumbnail for new projects
const DEFAULT_THUMBNAIL = `<svg class="thumbnail-placeholder" viewBox="0 0 120 80" fill="none">
  <rect x="20" y="15" width="80" height="50" rx="4" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
  <circle cx="60" cy="40" r="12" stroke="currentColor" stroke-width="1" opacity="0.2"/>
</svg>`;

// ── TIMELINE ICON SVGs ───────────────────────────────────

const TIMELINE_ICONS = {
  wave: `<svg class="wave-icon" width="24" height="12" viewBox="0 0 24 12" aria-hidden="true">
    <path d="M0 6 Q3 0 6 6 Q9 12 12 6 Q15 0 18 6 Q21 12 24 6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,
  zigzag: `<svg class="wave-icon" width="24" height="12" viewBox="0 0 24 12" aria-hidden="true">
    <path d="M0 6 L6 0 L12 6 L18 0 L24 6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,
  smooth: `<svg class="wave-icon" width="24" height="12" viewBox="0 0 24 12" aria-hidden="true">
    <path d="M0 6 Q6 0 12 6 Q18 12 24 6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,
  sharp: `<svg class="wave-icon" width="24" height="12" viewBox="0 0 24 12" aria-hidden="true">
    <path d="M0 6 L4 2 L8 6 L12 2 L16 6 L20 2 L24 6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  </svg>`,
};

// ── RENDER FUNCTIONS ─────────────────────────────────────

export function renderHero(data) {
  const linksHtml = data.links.map(link => {
    const icon = ICONS[link.icon] || '';
    const isExternal = !link.url.startsWith('mailto:');
    const attrs = isExternal ? ' target="_blank" rel="noopener"' : '';
    const ariaLabel = link.label === 'Email' ? 'Email Fengyou' : `${link.label} profile`;
    return `<a href="${link.url}" class="link-magnetic"${attrs} aria-label="${ariaLabel}">
          ${icon}
          <span>${link.label}</span>
        </a>`;
  }).join('\n        ');

  // Render all taglines as data attribute for client-side random pick
  const taglinesJson = JSON.stringify(data.taglines).replace(/"/g, '&quot;');

  return `<div class="section-content hero-content">
      <div class="hero-eyebrow scramble-text" data-scramble="${data.eyebrow}">
        ${data.eyebrow}
      </div>
      <h1 class="hero-name split-chars">${data.name}</h1>
      <p class="hero-tagline" id="tagline" data-taglines="${taglinesJson}"></p>
      <div class="hero-bio">
        <p class="split-lines">
          ${data.bio}
        </p>
      </div>
      <div class="hero-links">
        ${linksHtml}
      </div>
    </div>`;
}

export function renderAbout(data) {
  const paragraphs = data.paragraphs.map(p =>
    `<p class="split-lines">\n            ${p}\n          </p>`
  ).join('\n          ');

  const stats = data.stats.map(s => {
    const dotClass = s.pulse ? 'stat-dot stat-dot--pulse' : 'stat-dot';
    return `<div class="stat-row">
            <span class="stat-key">${s.key}</span>
            <span class="stat-val typewriter-text" data-text="${s.value}">${s.value}</span>
            <span class="${dotClass}"></span>
          </div>`;
  }).join('\n          ');

  return `<div class="section-divider"></div>
    <div class="section-content about-grid">
      <div class="about-left">
        <div class="section-label scramble-text" data-scramble="[ 02 / ABOUT ]">[ 02 / ABOUT ]</div>
        <h2 class="section-heading split-chars">About Me</h2>
        <div class="about-bio">
          ${paragraphs}
        </div>
        <div class="stats-grid">
          ${stats}
        </div>
      </div>
      <div class="about-right">
        <div class="photo-frame">
          <img src="${data.photo}" alt="Fengyou Liu" class="about-photo" loading="lazy" />
          <div class="photo-scanlines" aria-hidden="true"></div>
          <div class="photo-border" aria-hidden="true"></div>
        </div>
      </div>
    </div>`;
}

export function renderSkills(data) {
  const categories = data.categories.map(cat => {
    const tags = cat.tags.map(t =>
      `<span class="toolkit-tag" data-detail="${t.detail}">${t.name}</span>`
    ).join('\n            ');

    return `<div class="toolkit-category">
          <h3 class="toolkit-title">${cat.title}</h3>
          <div class="toolkit-tags">
            ${tags}
          </div>
        </div>`;
  }).join('\n        ');

  return `<div class="section-divider"></div>
    <div class="section-content">
      <div class="section-label scramble-text" data-scramble="[ 03 / SKILLS ]">[ 03 / SKILLS ]</div>
      <h2 class="section-heading split-chars">Toolkit</h2>
      <p class="toolkit-intro split-lines">${data.intro}</p>
      <div class="toolkit-grid">
        ${categories}
      </div>
    </div>`;
}

export function renderProjects(data) {
  const cards = data.projects.map(p => {
    const thumbnail = THUMBNAILS[p.thumbnail] || DEFAULT_THUMBNAIL;
    const statusClass = p.status === 'active' ? 'mission-status--active' : 'mission-status--complete';
    const tags = p.tags.map(t => `<span class="tag">${t}</span>`).join('\n              ');
    const num = p.id.padStart(2, '0');

    return `<!-- Project ${num} -->
        <article class="mission-card" data-mission="${num}">
          <div class="mission-visual">
            <div class="mission-thumbnail" data-project="${p.thumbnail}">
              ${thumbnail}
            </div>
          </div>
          <div class="mission-info">
            <div class="mission-header">
              <span class="mission-id scramble-text" data-scramble="PROJECT ${num}">PROJECT ${num}</span>
              <span class="mission-status ${statusClass}">
                <span class="status-dot"></span>${p.statusLabel}
              </span>
            </div>
            <h3 class="mission-name split-chars">${p.name}</h3>
            <p class="mission-subtitle">${p.subtitle}</p>
            <p class="mission-desc split-lines">
              ${p.description}
            </p>
            <div class="mission-tags">
              ${tags}
            </div>
          </div>
        </article>`;
  }).join('\n\n        ');

  return `<div class="section-divider"></div>
    <div class="section-content">
      <div class="section-label scramble-text" data-scramble="[ 04 / PROJECTS ]">[ 04 / PROJECTS ]</div>
      <h2 class="section-heading split-chars">Projects</h2>

      <div class="missions">
        ${cards}
      </div>
    </div>`;
}

export function renderExperience(data) {
  const entries = data.entries.map(e => {
    const icon = TIMELINE_ICONS[e.iconType] || TIMELINE_ICONS.wave;
    return `<div class="timeline-entry" data-year="${e.year}">
          <div class="timeline-node">
            ${icon}
          </div>
          <div class="timeline-content">
            <span class="timeline-date">${e.date}</span>
            <h3 class="timeline-org">${e.org}</h3>
            <p class="timeline-role">${e.role}</p>
            <p class="timeline-detail">${e.detail}</p>
          </div>
        </div>`;
  }).join('\n\n        ');

  return `<div class="section-divider"></div>
    <div class="section-content">
      <div class="section-label scramble-text" data-scramble="[ 05 / EXPERIENCE ]">[ 05 / EXPERIENCE ]</div>
      <h2 class="section-heading split-chars">Experience</h2>

      <div class="timeline">
        <div class="timeline-wire" aria-hidden="true"></div>

        ${entries}
      </div>
    </div>`;
}

export function renderContact(data) {
  const links = data.links.map(link => {
    const icon = ICONS_LG[link.icon] || '';
    const isExternal = !link.url.startsWith('mailto:');
    const attrs = isExternal ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${link.url}" class="contact-link link-magnetic"${attrs}>
          ${icon}
          <span class="contact-link-name">${link.label}</span>
        </a>`;
  }).join('\n        ');

  return `<div class="section-divider"></div>
    <div class="section-content contact-content">
      <div class="section-label scramble-text" data-scramble="[ 06 / CONTACT ]">[ 06 / CONTACT ]</div>
      <h2 class="contact-headline split-words">${data.headline}</h2>
      <p class="contact-sub split-lines">
        ${data.subtext}
      </p>

      <div class="contact-links">
        ${links}
      </div>
    </div>`;
}

export function renderFooter(data) {
  return `<div class="footer-message">${data.footer.message}</div>
    <div class="footer-copy">${data.footer.copy}</div>`;
}
