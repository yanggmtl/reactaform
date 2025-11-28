#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const files = fs.readdirSync(cwd);
for (const f of files) {
  if (/^reactaform-.*\.tgz$/.test(f)) {
    try { fs.unlinkSync(path.join(cwd, f)); console.log('Removed', f); } catch (e) {}
  }
}
console.log('Cleaned old tgz files');
