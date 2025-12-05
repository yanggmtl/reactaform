#!/usr/bin/env node
import { spawn } from 'child_process';

const [, , cmd, appName] = process.argv;

if (!cmd || !appName) {
  console.error('Usage: node ./scripts/run-workspace.js <cmd> <appName>');
  console.error('Example: npm run dev:app -- custom-styles-app');
  process.exit(1);
}

const workspace = `packages/apps/${appName}`;
console.log(`Running: npm --workspace=${workspace} run ${cmd}`);

const child = spawn('npm', ['--workspace', workspace, 'run', cmd], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => process.exit(code));
child.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
