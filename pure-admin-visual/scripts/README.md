# Scripts

## Hash Generation System

### Purpose

The hash generation system tracks changes to snippets and SCSS files using SHA-256 hashes. This allows framework wrapper maintainers (Svelte/Vue/React) to detect exactly which components need to be updated when the core framework changes.

### Usage

```bash
# Generate hash manifest
npm run generate-hashes

# Output: .hashes/manifest.json
```

### Manifest Structure

The generated `manifest.json` contains:

```json
{
  "generated": "2025-10-08T12:00:00.000Z",
  "version": "1.0.0",
  "snippets": {
    "timeline.html": {
      "hash": "53cb73a1b1ce...",
      "size": 12345,
      "modified": "2025-10-08T11:30:00.000Z"
    }
  },
  "scss": {
    "core-components/_timeline.scss": {
      "hash": "bdf8cbb686ca...",
      "size": 23456,
      "modified": "2025-10-08T11:45:00.000Z"
    }
  }
}
```

### Use Cases

#### 1. Framework Wrapper Updates

When generating Svelte/Vue/React components:

```bash
# Before updating
npm run generate-hashes
cp .hashes/manifest.json .hashes/manifest-old.json

# After making changes
npm run generate-hashes

# Compare manifests to find changed components
node scripts/compare-hashes.js .hashes/manifest-old.json .hashes/manifest.json
```

#### 2. CI/CD Integration

```yaml
# .github/workflows/check-changes.yml
- name: Generate hashes
  run: npm run generate-hashes

- name: Check for component changes
  run: |
    git diff --exit-code .hashes/manifest.json || \
    echo "Components changed - update wrappers!"
```

#### 3. Package Publishing

Before publishing `@pure-admin/svelte`, check which snippets changed:

```bash
# Compare current hash with last published version
diff .hashes/manifest.json ../pure-admin-svelte/.hashes/last-sync.json
```

### Benefits

1. **Precision**: Know exactly which files changed, not just that "something" changed
2. **Automation**: Build tools that automatically regenerate only changed components
3. **Verification**: Ensure wrapper components stay in sync with core framework
4. **History**: Track component evolution over time

### Integration Example

```javascript
// scripts/sync-to-svelte.js
const oldManifest = require('../pure-admin-svelte/.hashes/last-sync.json');
const newManifest = require('./.hashes/manifest.json');

// Find changed snippets
const changedSnippets = Object.keys(newManifest.snippets).filter(file => {
  return oldManifest.snippets[file]?.hash !== newManifest.snippets[file].hash;
});

console.log('Components to regenerate:', changedSnippets);
// Output: ['timeline.html', 'alerts.html']

// Regenerate only changed components
for (const snippet of changedSnippets) {
  generateSvelteComponent(snippet);
}
```

### Files

- `generate-hashes.js` - Hash generation script
- `../. hashes/manifest.json` - Generated hash manifest (gitignored)
- Output includes: snippets/*.html, src/scss/**/*.scss

### Notes

- Hashes are SHA-256 of file contents (whitespace-sensitive)
- The `.hashes/` directory is gitignored (regenerate locally)
- Manifest includes file size and modification time for reference
- Paths use forward slashes (cross-platform compatible)
