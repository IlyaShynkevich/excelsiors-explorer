import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Writes the list of built (hashed) files into dist/sw.js, so the service worker can cache them
// on install and drop files from older builds. The list changes with every build that changes
// code or assets, which also makes phones pick up the new service worker.
function swAssets() {
  let files = [];
  let outDir = 'dist';
  return {
    name: 'ee-sw-assets',
    apply: 'build',
    configResolved(c) { outDir = path.resolve(c.root, c.build.outDir); },
    generateBundle(_, bundle) { files = Object.keys(bundle).filter(f => f !== 'index.html' && !f.endsWith('.map')); },
    closeBundle() {
      const file = path.join(outDir, 'sw.js');
      const src = fs.readFileSync(file, 'utf8');
      if (!src.includes('/* BUILD_FILES */[]')) throw new Error('sw.js: BUILD_FILES placeholder missing');
      fs.writeFileSync(file, src.replace('/* BUILD_FILES */[]', JSON.stringify(files.sort())));
    },
  };
}

export default defineConfig({
  plugins: [react(), swAssets()],
  // The Lego avatar (10 kB) stays inlined like in the old single file, so avatars never pop in late.
  build: { assetsInlineLimit: file => (file.endsWith('lego.jpg') ? true : undefined) },
});
