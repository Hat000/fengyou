/**
 * vite-plugin-content.js — Injects content from JSON files into HTML at build time.
 *
 * Reads content/*.json, renders HTML via render-content.js,
 * and replaces <!-- CONTENT:section --> placeholders in index.html.
 */

import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import {
  renderHero,
  renderAbout,
  renderSkills,
  renderProjects,
  renderExperience,
  renderContact,
  renderFooter,
} from './src/scripts/render-content.js';

const RENDERERS = {
  hero: renderHero,
  about: renderAbout,
  skills: renderSkills,
  projects: renderProjects,
  experience: renderExperience,
  contact: renderContact,
  footer: (data) => renderFooter(data),
};

export default function contentPlugin() {
  const contentDir = resolve(process.cwd(), 'content');

  function loadContent() {
    const content = {};
    const files = readdirSync(contentDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const key = file.replace('.json', '');
      const raw = readFileSync(join(contentDir, file), 'utf-8');
      content[key] = JSON.parse(raw);
    }
    return content;
  }

  return {
    name: 'vite-plugin-content',
    enforce: 'pre',

    transformIndexHtml(html) {
      const content = loadContent();

      // Replace <!-- CONTENT:section --> placeholders
      return html.replace(/<!--\s*CONTENT:(\w+)\s*-->/g, (match, section) => {
        const renderer = RENDERERS[section];
        if (!renderer) {
          console.warn(`[content-plugin] No renderer for section: ${section}`);
          return match;
        }
        // footer uses contact.json data
        const data = section === 'footer' ? content.contact : content[section];
        if (!data) {
          console.warn(`[content-plugin] No data file for section: ${section}`);
          return match;
        }
        return renderer(data);
      });
    },

    configureServer(server) {
      // Watch content/ directory for changes in dev mode
      server.watcher.add(resolve(contentDir));
      server.watcher.on('change', (file) => {
        if (file.startsWith(contentDir) && file.endsWith('.json')) {
          // Trigger full page reload when content changes
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
  };
}
