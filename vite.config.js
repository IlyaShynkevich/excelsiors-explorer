import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Writes the list of built (hashed) files into dist/sw.js, so the service worker can cache them
// on install and drop files from older builds. The list changes with every build that changes
// code or assets, which also makes phones pick up the new service worker.
// The list is read from dist/ after everything is written (closeBundle), so it only names files that exist:
// one missing file makes the whole install fail (that happened with a CSS-only Leaflet chunk Vite drops later).
// Only hashed files under assets/ (JS, CSS, own images); the icons in public/assets/ are not precached
// (sw.js CORE adds the one the offline app needs).
const HASHED = /^assets\/.+-[\w-]{8}\.\w+$/;
function swAssets() {
  let outDir = 'dist';
  return {
    name: 'ee-sw-assets',
    apply: 'build',
    configResolved(c) { outDir = path.resolve(c.root, c.build.outDir); },
    closeBundle() {
      const files = fs.readdirSync(path.join(outDir, 'assets')).map(f => 'assets/' + f).filter(f => HASHED.test(f) && !f.endsWith('.map')).sort();
      const file = path.join(outDir, 'sw.js');
      const src = fs.readFileSync(file, 'utf8');
      if (!src.includes('/* BUILD_FILES */[]')) throw new Error('sw.js: BUILD_FILES placeholder missing');
      const core = JSON.parse(src.match(/const CORE = (\[[^\]]*\])/)[1].replace(/'/g, '"'));
      const missing = [...core.filter(f => f !== './'), ...files].filter(f => !fs.existsSync(path.join(outDir, f)));
      if (missing.length) throw new Error('sw.js: precache files missing in dist/: ' + missing.join(', '));
      fs.writeFileSync(file, src.replace('/* BUILD_FILES */[]', JSON.stringify(files)));
    },
  };
}

export default defineConfig({
  plugins: [react(), swAssets()],
  // The Lego avatar (10 kB) stays inlined like in the old single file, so avatars never pop in late.
  build: { assetsInlineLimit: file => (file.endsWith('lego.jpg') ? true : undefined) },
});
