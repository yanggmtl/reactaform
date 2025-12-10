#!/usr/bin/env node
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  const root = process.cwd();
  const staging = path.join(root, 'package');
  try {
    await fsp.rm(staging, { recursive: true, force: true });
  } catch (e) {}
  await fsp.mkdir(path.join(staging, 'dist'), { recursive: true });

  // copy package.json and README.md
  await fsp.copyFile(path.join(root, 'package.json'), path.join(staging, 'package.json'));
  if (fs.existsSync(path.join(root, 'README.md'))) {
    await fsp.copyFile(path.join(root, 'README.md'), path.join(staging, 'README.md'));
  }

  // copy only root-level files from dist (files only), and ensure index.d.ts is present
  const distDir = path.join(root, 'dist');
  const stagingDist = path.join(staging, 'dist');
  if (!fs.existsSync(distDir)) {
    console.error('dist directory not found. Run the build first.');
    process.exit(1);
  }
  const entries = await fsp.readdir(distDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile()) {
      const src = path.join(distDir, entry.name);
      const dest = path.join(stagingDist, entry.name);
      await fsp.copyFile(src, dest);
    }
  }

  // ensure index.d.ts exists at root of dist and copy (if it wasn't a root file)
  const rootIndex = path.join(distDir, 'index.d.ts');
  if (fs.existsSync(rootIndex)) {
    await fsp.copyFile(rootIndex, path.join(stagingDist, 'index.d.ts'));
  }

  // run npm pack on staging
  try {
    execSync('npm pack ' + staging, { stdio: 'inherit' });
  } catch (err) {
    console.error('npm pack failed', err);
    process.exit(1);
  }

  // cleanup staging dir
  try {
    await fsp.rm(staging, { recursive: true, force: true });
  } catch (e) {}
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
