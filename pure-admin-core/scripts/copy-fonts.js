const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'fonts');
const destDir = path.join(__dirname, '..', 'dist', 'fonts');

// Create dist/fonts directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy fonts directory
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log('No fonts directory found, skipping...');
    return;
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(sourceDir, destDir);
console.log('Fonts copied to dist/fonts');
