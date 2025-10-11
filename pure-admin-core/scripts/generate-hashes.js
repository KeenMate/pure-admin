/**
 * Generate SHA-256 hashes for snippets and SCSS files
 *
 * Purpose: Track changes to snippets and SCSS files to detect when
 * framework wrappers (Svelte/Vue/React) need to be updated.
 *
 * Usage: node scripts/generate-hashes.js
 * Output: .hashes/manifest.json
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Directories to hash
const SNIPPET_DIR = path.join(__dirname, '../snippets');
const SCSS_DIR = path.join(__dirname, '../src/scss');
const OUTPUT_DIR = path.join(__dirname, '../.hashes');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'manifest.json');

/**
 * Calculate SHA-256 hash of file contents
 */
function calculateHash(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Recursively find all files in directory with given extensions
 */
function findFiles(dir, extensions, baseDir = dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...findFiles(fullPath, extensions, baseDir));
        } else if (stat.isFile()) {
            const ext = path.extname(item);
            if (extensions.includes(ext)) {
                // Store relative path from base directory
                const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
                files.push({
                    path: relativePath,
                    fullPath: fullPath
                });
            }
        }
    }

    return files;
}

/**
 * Generate hash manifest
 */
function generateManifest() {
    const manifest = {
        generated: new Date().toISOString(),
        version: '1.0.0',
        snippets: {},
        scss: {}
    };

    // Hash snippet files
    console.log('Hashing snippet files...');
    const snippetFiles = findFiles(SNIPPET_DIR, ['.html']);
    for (const file of snippetFiles) {
        const hash = calculateHash(file.fullPath);
        manifest.snippets[file.path] = {
            hash,
            size: fs.statSync(file.fullPath).size,
            modified: fs.statSync(file.fullPath).mtime.toISOString()
        };
        console.log(`  ${file.path}: ${hash.substring(0, 12)}...`);
    }

    // Hash SCSS files
    console.log('\nHashing SCSS files...');
    const scssFiles = findFiles(SCSS_DIR, ['.scss']);
    for (const file of scssFiles) {
        const hash = calculateHash(file.fullPath);
        manifest.scss[file.path] = {
            hash,
            size: fs.statSync(file.fullPath).size,
            modified: fs.statSync(file.fullPath).mtime.toISOString()
        };
        console.log(`  ${file.path}: ${hash.substring(0, 12)}...`);
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Write manifest
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

    console.log(`\n✅ Hash manifest generated: ${OUTPUT_FILE}`);
    console.log(`   Snippets: ${Object.keys(manifest.snippets).length} files`);
    console.log(`   SCSS: ${Object.keys(manifest.scss).length} files`);
}

// Run
try {
    generateManifest();
} catch (error) {
    console.error('❌ Error generating hashes:', error.message);
    process.exit(1);
}
