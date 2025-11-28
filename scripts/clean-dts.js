#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const root = path.resolve('dist');
const keep = path.resolve(path.join(root, 'index.d.ts'));

async function removeDts(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.resolve(path.join(dir, ent.name));
    if (ent.isDirectory()) {
      await removeDts(full);
      // try to remove the directory if empty
      try {
        const rem = await fs.readdir(full);
        if (rem.length === 0) {
          await fs.rmdir(full);
//          console.log('Removed empty directory', full);
        }
      } catch (e) {
        // ignore
      }
    } else if (ent.isFile()) {
      if (full.endsWith('.d.ts') && full !== keep) {
        try {
          await fs.unlink(full);
//          console.log('Removed', full);
        } catch (err) {
          console.error('Failed to remove', full, err && err.message ? err.message : err);
        }
      }
    }
  }
}

(async () => {
  try {
    console.log('Cleaning .d.ts files in subfolders of', root);
    await fs.access(root);
  } catch (e) {
    console.log('No dist directory found — nothing to clean.');
    process.exit(0);
  }

  try {
    await removeDts(root);
    console.log('Finished cleaning .d.ts files (kept dist/index.d.ts).');
  } catch (err) {
    console.error('Error cleaning .d.ts files:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
