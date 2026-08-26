#!/usr/bin/env node

// =============================================================================
// pack-theme.js — Package a Pure Admin theme into a distributable zip
// =============================================================================
//
// Usage:
//   node pack-theme.js <theme-dir> [--output <dir>]
//
// Example:
//   node pack-theme.js ../pure-admin-cafeindustrial-theme/
//   node pack-theme.js ./my-theme --output ./releases/
//
// The script:
//   1. Reads and validates theme.json from the theme directory
//   2. Verifies CSS file exists (or compiles SCSS if missing)
//   3. Generates a README.md with usage instructions
//   4. Packages everything into pure-admin-theme-{id}-{version}.zip
//
// Zip contents:
//   pure-admin-theme-{id}-{version}.zip
//   ├── theme.json
//   ├── css/{id}.css
//   ├── scss/{id}.scss
//   ├── preview/thumbnail.png  (if exists)
//   └── README.md
// =============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ---------------------------------------------------------------------------
// Parse arguments
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
let themeDir = null;
let outputDir = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output' && args[i + 1]) {
    outputDir = args[++i];
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: node pack-theme.js <theme-dir> [--output <dir>]

Options:
  --output <dir>   Output directory for the zip (default: theme-dir/dist/)
  --help, -h       Show this help message

Examples:
  node pack-theme.js ../pure-admin-cafeindustrial-theme/
  node pack-theme.js ./my-theme --output ./releases/
`);
    process.exit(0);
  } else if (!themeDir) {
    themeDir = args[i];
  }
}

if (!themeDir) {
  console.error('Error: No theme directory specified.');
  console.error('Usage: node pack-theme.js <theme-dir> [--output <dir>]');
  process.exit(1);
}

// Resolve paths
themeDir = path.resolve(themeDir);
const coreDir = path.resolve(__dirname, '..');

if (!fs.existsSync(themeDir)) {
  console.error(`Error: Theme directory not found: ${themeDir}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 1. Read and validate theme.json
// ---------------------------------------------------------------------------
const themeJsonPath = path.join(themeDir, 'theme.json');
if (!fs.existsSync(themeJsonPath)) {
  console.error(`Error: theme.json not found in ${themeDir}`);
  process.exit(1);
}

let theme;
try {
  theme = JSON.parse(fs.readFileSync(themeJsonPath, 'utf-8'));
} catch (err) {
  console.error(`Error: Invalid JSON in theme.json: ${err.message}`);
  process.exit(1);
}

// Validate required fields
const requiredFields = ['name', 'id', 'version', 'modes', 'exports'];
const missing = requiredFields.filter(f => !theme[f]);
if (missing.length > 0) {
  console.error(`Error: theme.json is missing required fields: ${missing.join(', ')}`);
  process.exit(1);
}

// Validate id format
if (!/^[a-z][a-z0-9-]*$/.test(theme.id)) {
  console.error(`Error: theme.id "${theme.id}" must be lowercase alphanumeric with hyphens (e.g. "cafeindustrial")`);
  process.exit(1);
}

// Validate version format
if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/.test(theme.version)) {
  console.error(`Error: theme.version "${theme.version}" must be semver (e.g. "1.0.0")`);
  process.exit(1);
}

console.log(`Packaging theme: ${theme.name} v${theme.version} (${theme.id})`);

// ---------------------------------------------------------------------------
// 2. Locate or compile CSS
// ---------------------------------------------------------------------------
let cssSourcePath = null;

// Check exports.css path first
if (theme.exports && theme.exports.css) {
  const exportedCss = path.resolve(themeDir, theme.exports.css);
  if (fs.existsSync(exportedCss)) {
    cssSourcePath = exportedCss;
  }
}

// Also check common locations
if (!cssSourcePath) {
  const candidates = [
    path.join(themeDir, 'dist', `${theme.id}.css`),
    path.join(themeDir, 'dist', 'css', `${theme.id}.css`),
    path.join(themeDir, 'css', `${theme.id}.css`),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      cssSourcePath = candidate;
      break;
    }
  }
}

// If no CSS found, try to compile from SCSS
if (!cssSourcePath) {
  console.log('No compiled CSS found, attempting to compile from SCSS...');

  let scssPath = null;
  if (theme.exports && theme.exports.scss) {
    const exportedScss = path.resolve(themeDir, theme.exports.scss);
    if (fs.existsSync(exportedScss)) {
      scssPath = exportedScss;
    }
  }
  if (!scssPath) {
    scssPath = path.join(themeDir, 'src', 'scss', `${theme.id}.scss`);
  }

  if (!fs.existsSync(scssPath)) {
    console.error(`Error: No CSS or SCSS source found for theme "${theme.id}"`);
    process.exit(1);
  }

  // Compile SCSS
  const tempCssDir = path.join(themeDir, 'dist');
  if (!fs.existsSync(tempCssDir)) {
    fs.mkdirSync(tempCssDir, { recursive: true });
  }

  const tempCssPath = path.join(tempCssDir, `${theme.id}.css`);

  // Build load paths for sass
  // 1. node_modules at workspace root (for @keenmate/pure-admin-core/... imports)
  // 2. core scss dir (for legacy bare imports)
  const loadPaths = [];

  // Check for node_modules in various locations
  const nodeModulesCandidates = [
    path.join(themeDir, 'node_modules'),
    path.join(themeDir, '..', 'node_modules'),
    path.join(coreDir, '..', '..', 'node_modules'),
  ];
  for (const nm of nodeModulesCandidates) {
    if (fs.existsSync(nm)) {
      loadPaths.push(nm);
    }
  }

  // Also add core scss dir for bare imports
  loadPaths.push(path.join(coreDir, 'src', 'scss'));

  const loadPathArgs = loadPaths.map(p => `--load-path="${p}"`).join(' ');
  const sassCmd = `sass "${scssPath}" "${tempCssPath}" --no-source-map --silence-deprecation=import ${loadPathArgs}`;

  try {
    console.log(`  Compiling: ${path.basename(scssPath)}`);
    execSync(sassCmd, { stdio: 'pipe' });
    cssSourcePath = tempCssPath;
    console.log('  Compilation successful.');
  } catch (err) {
    console.error(`Error: SCSS compilation failed:`);
    console.error(err.stderr ? err.stderr.toString() : err.message);
    process.exit(1);
  }
}

console.log(`  CSS: ${path.relative(themeDir, cssSourcePath)}`);

// ---------------------------------------------------------------------------
// 3. Locate SCSS source
// ---------------------------------------------------------------------------
let scssSourcePath = null;
if (theme.exports && theme.exports.scss) {
  const exportedScss = path.resolve(themeDir, theme.exports.scss);
  if (fs.existsSync(exportedScss)) {
    scssSourcePath = exportedScss;
  }
}
if (!scssSourcePath) {
  const candidate = path.join(themeDir, 'src', 'scss', `${theme.id}.scss`);
  if (fs.existsSync(candidate)) {
    scssSourcePath = candidate;
  }
}

if (scssSourcePath) {
  console.log(`  SCSS: ${path.relative(themeDir, scssSourcePath)}`);
}

// ---------------------------------------------------------------------------
// 4. Locate preview thumbnail
// ---------------------------------------------------------------------------
let thumbnailPath = null;
const thumbnailCandidates = [
  theme.preview && theme.preview.thumbnail ? path.resolve(themeDir, theme.preview.thumbnail) : null,
  path.join(themeDir, 'preview', 'thumbnail.png'),
  path.join(themeDir, 'preview', 'thumbnail.jpg'),
].filter(Boolean);

for (const candidate of thumbnailCandidates) {
  if (fs.existsSync(candidate)) {
    thumbnailPath = candidate;
    break;
  }
}

if (thumbnailPath) {
  console.log(`  Preview: ${path.relative(themeDir, thumbnailPath)}`);
}

// ---------------------------------------------------------------------------
// 5. Generate README.md
// ---------------------------------------------------------------------------
const modesText = theme.modes && theme.modes.supported
  ? theme.modes.supported.join(', ')
  : 'light';

const tagsText = theme.tags && theme.tags.length > 0
  ? theme.tags.join(', ')
  : '';

const coreVersionText = theme.coreVersion || (theme.dependencies && theme.dependencies.core) || '>=1.5.0';

const readme = `# ${theme.name}

${theme.description || ''}

- **Version:** ${theme.version}
- **Author:** ${theme.author || 'Unknown'}
- **License:** ${theme.license || 'MIT'}
- **Modes:** ${modesText}
- **Core Version:** ${coreVersionText}
${tagsText ? `- **Tags:** ${tagsText}` : ''}

## Quick Start — CSS Only

Drop the compiled CSS file into your project:

\`\`\`html
<link rel="stylesheet" href="css/${theme.id}.css">
\`\`\`

No build tools required. The CSS is fully self-contained.

## Quick Start — SCSS Customization

If you want to customize theme variables before compiling:

1. Install the core package:
   \`\`\`bash
   npm install @keenmate/pure-admin-core
   \`\`\`

2. Compile with sass:
   \`\`\`bash
   sass scss/${theme.id}.scss output.css \\
     --load-path=node_modules \\
     --silence-deprecation=import
   \`\`\`

3. Or import in your own SCSS and override variables before the import.

## Mode Switching
${theme.modes && theme.modes.supported && theme.modes.supported.length > 1
  ? `This theme supports ${modesText} modes. Add the mode class to toggle:

\`\`\`html
<body class="pc-mode-dark">  <!-- dark mode -->
<body class="pc-mode-light"> <!-- light mode -->
\`\`\``
  : `This theme supports ${modesText} mode.`}

## More Information

- Pure Admin documentation: https://demo.pureadmin.io
- Theme gallery: https://pureadmin.io
${theme.homepage ? `- Theme homepage: ${theme.homepage}` : ''}

---
*Generated by pure-admin-core pack-theme*
`;

// ---------------------------------------------------------------------------
// 6. Create the zip
// ---------------------------------------------------------------------------
const zipName = `pure-admin-theme-${theme.id}-${theme.version}.zip`;

if (!outputDir) {
  outputDir = path.join(themeDir, 'dist');
}
outputDir = path.resolve(outputDir);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const zipPath = path.join(outputDir, zipName);

// Try to load archiver, fall back to manual zip creation
let archiver;
try {
  archiver = require('archiver');
} catch {
  console.error('Error: "archiver" package is required but not installed.');
  console.error('Install it with: npm install archiver --save-dev');
  process.exit(1);
}

const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

archive.on('error', (err) => {
  console.error(`Error creating zip: ${err.message}`);
  process.exit(1);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(`Warning: ${err.message}`);
  } else {
    throw err;
  }
});

output.on('close', () => {
  const sizeKB = (archive.pointer() / 1024).toFixed(1);
  console.log(`\nCreated: ${zipPath}`);
  console.log(`Size: ${sizeKB} KB`);
  console.log('\nZip contents:');
  console.log(`  theme.json`);
  console.log(`  css/${theme.id}.css`);
  if (scssSourcePath) console.log(`  scss/${theme.id}.scss`);
  if (thumbnailPath) console.log(`  preview/${path.basename(thumbnailPath)}`);
  console.log(`  README.md`);
});

archive.pipe(output);

// Add theme.json
archive.file(themeJsonPath, { name: 'theme.json' });

// Add CSS
archive.file(cssSourcePath, { name: `css/${theme.id}.css` });

// Add SCSS (if available)
if (scssSourcePath) {
  archive.file(scssSourcePath, { name: `scss/${theme.id}.scss` });
}

// Add preview thumbnail (if available)
if (thumbnailPath) {
  archive.file(thumbnailPath, { name: `preview/${path.basename(thumbnailPath)}` });
}

// Add generated README
archive.append(readme, { name: 'README.md' });

archive.finalize();
