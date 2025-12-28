// Script to copy theme CSS files to dist/themes folder
import { copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = join(__dirname, '..');
const themesDir = join(projectRoot, 'src', 'themes');
const distThemesDir = join(projectRoot, 'dist', 'themes');

try {
  // Create dist/themes directory
  mkdirSync(distThemesDir, { recursive: true });
  console.log(`✓ Created dist/themes/ directory`);

  // Copy all CSS files from src/themes/ to dist/themes/
  const files = readdirSync(themesDir);
  const cssFiles = files.filter(file => file.endsWith('.css'));

  cssFiles.forEach(file => {
    const src = join(themesDir, file);
    const dest = join(distThemesDir, file);
    copyFileSync(src, dest);
    console.log(`✓ Copied ${file} to dist/themes/`);
  });

  console.log(`\n✓ Successfully copied ${cssFiles.length} theme files to dist/themes/`);
} catch (error) {
  console.error('Error copying theme files:', error);
  process.exit(1);
}
