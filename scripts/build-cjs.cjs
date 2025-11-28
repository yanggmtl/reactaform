#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const esmFile = path.join(root, 'dist', 'reactaform.es.js');
const cjsFile = path.join(root, 'dist', 'reactaform.cjs.js');

if (!fs.existsSync(esmFile)) {
  console.error('ESM file not found at', esmFile, '— run Vite build first');
  process.exit(1);
}

try {
  // Build single-file ESM and CJS bundles from source using esbuild.
  const entry = path.join(root, 'src', 'package', 'index.ts');
  const esmOut = path.join(root, 'dist', 'reactaform.es.js');
  const cjsOut = path.join(root, 'dist', 'reactaform.cjs.js');

  const baseCmd = (out, format, platform) =>
    `npx esbuild ${JSON.stringify(entry)} --bundle --format=${format} --platform=${platform} --outfile=${JSON.stringify(out)} --target=es2019 --external:react --external:react-dom --jsx=automatic`;

  const cmdEsm = baseCmd(esmOut, 'esm', 'browser');
  console.log('Running:', cmdEsm);
  execSync(cmdEsm, { stdio: 'inherit' });
  console.log('Wrote ESM file to', esmOut);

  const cmdCjs = baseCmd(cjsOut, 'cjs', 'node');
  console.log('Running:', cmdCjs);
  execSync(cmdCjs, { stdio: 'inherit' });
  console.log('Wrote CJS file to', cjsOut);

  // Remove any Vite-generated runtime chunk files that may exist (we now bundle via esbuild)
  const files = fs.readdirSync(path.join(root, 'dist'));
  for (const f of files) {
    if (/^common-.*\.js$/.test(f) || /^common-.*\.cjs$/.test(f)) {
      try { fs.unlinkSync(path.join(root, 'dist', f)); } catch {}
    }
  }

} catch (err) {
  console.error('Failed to build bundles with esbuild:', err);
  process.exit(1);
}
