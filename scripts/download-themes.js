#!/usr/bin/env node

/**
 * Download themes from pureadmin.io
 *
 * Reads themes.json + .themes.json (local override) and downloads
 * themes that don't have a local "path" set.
 *
 * Format:
 *   {
 *     "themes": {
 *       "audi": {},                                    // download from pureadmin.io
 *       "corporate": { "path": "../my-themes/corp" },  // use local path
 *       "custom": { "url": "https://..." }             // download from custom URL
 *     }
 *   }
 *
 * Downloaded themes are saved to ./themes/{name}/dist/{name}.css
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const BUNDLE_URL = 'https://pureadmin.io/api/bundle';
const PROJECT_ROOT = process.cwd();
const THEMES_DIR = path.join(PROJECT_ROOT, 'themes');
const THEMES_CONFIG = path.join(PROJECT_ROOT, 'themes.json');
const THEMES_LOCAL = path.join(PROJECT_ROOT, '.themes.json');

function download(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;

        client.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return download(res.headers.location).then(resolve).catch(reject);
            }

            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode} for ${url}`));
                return;
            }

            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

function extractZip(buffer, destDir) {
    const tmpFile = path.join(destDir, '..', '_tmp_theme.zip');
    if (!fs.existsSync(path.dirname(tmpFile))) {
        fs.mkdirSync(path.dirname(tmpFile), { recursive: true });
    }
    fs.writeFileSync(tmpFile, buffer);

    const { execSync } = require('child_process');
    try {
        execSync(`unzip -o "${tmpFile}" -d "${destDir}"`, { stdio: 'ignore' });
    } catch (e) {
        try {
            execSync(`powershell -Command "Expand-Archive -Force -Path '${tmpFile}' -DestinationPath '${destDir}'"`, { stdio: 'ignore' });
        } catch (e2) {
            fs.unlinkSync(tmpFile);
            throw new Error('Could not extract zip. Install unzip or use PowerShell.');
        }
    }
    fs.unlinkSync(tmpFile);
}

function findThemeCss(dir, themeName) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isFile() && entry.name === `${themeName}.css`) {
            return fullPath;
        }

        if (entry.isDirectory()) {
            const found = findThemeCss(fullPath, themeName);
            if (found) return found;
        }
    }

    return null;
}

function getThemeVersion(themeDir) {
    const manifestPath = path.join(themeDir, 'theme.json');
    if (fs.existsSync(manifestPath)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            return manifest.version || null;
        } catch (e) {
            return null;
        }
    }
    return null;
}

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

async function main() {
    // Load themes.json (base) + .themes.json (local overrides)
    let themes = {};

    if (fs.existsSync(THEMES_CONFIG)) {
        const base = JSON.parse(fs.readFileSync(THEMES_CONFIG, 'utf-8'));
        themes = { ...themes, ...(base.themes || {}) };
        console.log(`Loaded themes.json (${Object.keys(base.themes || {}).length} theme(s))`);
    }

    if (fs.existsSync(THEMES_LOCAL)) {
        const local = JSON.parse(fs.readFileSync(THEMES_LOCAL, 'utf-8'));
        themes = { ...themes, ...(local.themes || {}) };
        console.log(`Loaded .themes.json (${Object.keys(local.themes || {}).length} override(s))`);
    }

    if (Object.keys(themes).length === 0) {
        console.error('No themes found. Create themes.json or .themes.json, e.g.:');
        console.error('  { "themes": { "audi": {}, "corporate": {} } }');
        process.exit(1);
    }

    console.log('');

    // Ensure themes directory exists
    if (!fs.existsSync(THEMES_DIR)) {
        fs.mkdirSync(THEMES_DIR, { recursive: true });
    }

    // Separate themes by type
    const bundleThemes = [];  // No path, no url — download from bundle
    const urlThemes = [];     // Custom url
    const localThemes = [];   // Has path — skip

    for (const [name, config] of Object.entries(themes)) {
        const cfg = config || {};
        if (cfg.path) {
            localThemes.push(name);
        } else if (cfg.url) {
            urlThemes.push({ name, url: cfg.url });
        } else {
            bundleThemes.push(name);
        }
    }

    let downloaded = 0;

    // Download named themes via bundle (single request)
    if (bundleThemes.length > 0) {
        process.stdout.write(`Fetching theme bundle from pureadmin.io (${bundleThemes.length} theme(s))...`);

        try {
            const data = await download(BUNDLE_URL);
            console.log(` ${(data.length / 1024).toFixed(0)}KB`);

            // Extract bundle to temp dir
            const tmpDir = path.join(THEMES_DIR, '_bundle_tmp');
            if (fs.existsSync(tmpDir)) {
                fs.rmSync(tmpDir, { recursive: true });
            }
            fs.mkdirSync(tmpDir, { recursive: true });
            extractZip(data, tmpDir);

            // Find and copy requested themes
            for (const name of bundleThemes) {
                const cssFile = findThemeCss(tmpDir, name);

                if (cssFile) {
                    const themeDestDir = path.join(THEMES_DIR, name);
                    const distDir = path.join(themeDestDir, 'dist');
                    if (!fs.existsSync(distDir)) {
                        fs.mkdirSync(distDir, { recursive: true });
                    }
                    fs.copyFileSync(cssFile, path.join(distDir, `${name}.css`));

                    // Copy assets dir if it exists (fonts etc.)
                    const assetsDir = path.join(path.dirname(cssFile), 'assets');
                    if (fs.existsSync(assetsDir)) {
                        copyDir(assetsDir, path.join(distDir, 'assets'));
                    }

                    // Copy theme.json manifest if it exists
                    const themeJsonSrc = path.join(path.dirname(cssFile), '..', 'theme.json');
                    if (fs.existsSync(themeJsonSrc)) {
                        fs.copyFileSync(themeJsonSrc, path.join(themeDestDir, 'theme.json'));
                    }

                    // Read version from theme.json
                    const version = getThemeVersion(themeDestDir);
                    console.log(`  ${name}: extracted${version ? ` (v${version})` : ''}`);
                    downloaded++;
                } else {
                    console.log(`  ${name}: NOT FOUND in bundle`);
                }
            }

            // Clean up temp dir
            fs.rmSync(tmpDir, { recursive: true });
        } catch (err) {
            console.log(` FAILED: ${err.message}`);
        }
    }

    // Download URL themes individually
    for (const { name, url } of urlThemes) {
        process.stdout.write(`  ${name}: downloading from ${url}...`);

        try {
            const data = await download(url);
            const themeDestDir = path.join(THEMES_DIR, name);

            if (data[0] === 0x50 && data[1] === 0x4B) {
                if (!fs.existsSync(themeDestDir)) {
                    fs.mkdirSync(themeDestDir, { recursive: true });
                }
                extractZip(data, themeDestDir);
            } else {
                const distDir = path.join(themeDestDir, 'dist');
                if (!fs.existsSync(distDir)) {
                    fs.mkdirSync(distDir, { recursive: true });
                }
                fs.writeFileSync(path.join(distDir, `${name}.css`), data);
            }

            console.log(' done');
            downloaded++;
        } catch (err) {
            console.log(` FAILED: ${err.message}`);
        }
    }

    // Report skipped
    for (const name of localThemes) {
        console.log(`  ${name}: local path (${themes[name].path}), skipping`);
    }

    console.log(`\nDownloaded ${downloaded} theme(s), skipped ${localThemes.length} local path(s)`);
}

console.log('Downloading themes...\n');
main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
