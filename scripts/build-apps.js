import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const appsDir = path.resolve(process.cwd(), 'packages', 'apps');
if (!fs.existsSync(appsDir)) process.exit(0);

const apps = fs.readdirSync(appsDir).filter(name => {
  const pkg = path.join(appsDir, name, 'package.json');
  return fs.existsSync(pkg);
});

for (const app of apps) {
  const pkgPath = path.join(appsDir, app, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (pkg.scripts && pkg.scripts.build) {
    console.log(`\n=== Building ${pkg.name} ===`);
    execSync(`npm --workspace=${pkg.name} run build`, { stdio: 'inherit' });
  } else {
    console.log(`Skipping ${pkg.name} (no build script)`);
  }
}
