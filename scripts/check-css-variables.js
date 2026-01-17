#!/usr/bin/env node
/**
 * CSS Variable Validator
 * Scans CSS/SCSS files for potentially corrupted or nonsensical variable names.
 *
 * Usage: node scripts/check-css-variables.js [path]
 * Default path: packages/
 */

const fs = require('fs');
const path = require('path');

// Patterns that indicate corrupted variable names
const SUSPICIOUS_PATTERNS = [
  // Repeated segments (e.g., --pa-bg-bg, --pa-text-text)
  /--[\w]+-(\w+)-\1(?:-|$|:)/,

  // Truncated common suffixes (e.g., --pa-text-col instead of --pa-text-color)
  /--[\w]+-(?:col|bg|txt|btn|bord)(?:$|:|\s|;)/,

  // Missing segment after hyphen (e.g., --pa-text-)
  /--[\w]+-[\w]+-(?:$|:|\s|;)/,

  // Double hyphens in middle (e.g., --pa--text)
  /--[\w]+--[\w]+/,

  // Very short variable names that look incomplete (e.g., --pa-b, --base-t)
  /--(?:pa|base)-[a-z](?:$|:|\s|;)/,
];

// Known valid patterns that might trigger false positives
const VALID_EXCEPTIONS = [
  '--pa-color-1', '--pa-color-2', '--pa-color-3', '--pa-color-4', '--pa-color-5',
  '--pa-color-6', '--pa-color-7', '--pa-color-8', '--pa-color-9',
  '--base-font-size-2xs', '--base-font-size-2xl',
  '--wg-z-dropdown', '--wg-z-toolbar', '--wg-z-context-menu', '--wg-z-tooltip',
];

// Semantic validation: known good variable name segments
const VALID_SEGMENTS = {
  prefixes: ['pa', 'base', 'wg', 'ms', 'drp', 'page-loader'],
  categories: [
    'main', 'page', 'subtle', 'hover', 'active', 'disabled', 'inverse', 'overlay',
    'text', 'color', 'bg', 'background', 'border', 'accent', 'surface',
    'header', 'sidebar', 'footer', 'card', 'btn', 'button', 'input', 'select', 'textarea',
    'table', 'modal', 'alert', 'badge', 'tooltip', 'popover', 'dropdown',
    'success', 'danger', 'warning', 'info', 'primary', 'secondary', 'light', 'dark',
    'font', 'size', 'weight', 'line', 'height', 'width', 'padding', 'margin', 'spacing',
    'radius', 'shadow', 'z', 'index', 'transition', 'animation',
    'checkbox', 'multiselect', 'loader', 'profile', 'command', 'palette', 'composite',
    'submenu', 'group', 'prepend', 'append', 'focus', 'placeholder', 'ring',
    'filter', 'row', 'cell', 'sort', 'pagination', 'empty', 'error', 'editor',
    'toolbar', 'context', 'menu', 'frozen', 'column', 'resize', 'handle', 'fill',
    'selection', 'inline', 'actions', 'trigger', 'label', 'option', 'hint', 'pill',
    'tabs', 'stripe', 'content', 'overlay', 'backdrop', 'highlight', 'item',
    'name', 'icon', 'spinner', 'checkmark', 'indeterminate', 'validating',
    'xs', 'sm', 'md', 'lg', 'xl', '2xs', '2xl',
    'normal', 'medium', 'semibold', 'bold', 'tight', 'relaxed',
    'mono', 'family', 'base', 'inverted', 'on', 'light', 'subtle',
  ],
};

// Check if variable matches suspicious patterns
function isSuspicious(varName) {
  // Skip known valid exceptions
  if (VALID_EXCEPTIONS.some(valid => varName.startsWith(valid))) {
    return false;
  }

  // Skip SCSS interpolation patterns (contain #{)
  if (varName.includes('#{') || varName.includes('#$')) {
    return false;
  }

  // Skip incomplete variable references (SCSS loops)
  if (varName.endsWith('-')) {
    return false;
  }

  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(varName));
}

// Analyze variable name structure
function analyzeVariable(varName) {
  const issues = [];

  // Extract the variable name without -- prefix
  const name = varName.replace(/^--/, '').replace(/:.*$/, '');
  const segments = name.split('-');

  // Check for repeated consecutive segments
  for (let i = 1; i < segments.length; i++) {
    if (segments[i] === segments[i - 1] && segments[i].length > 1) {
      issues.push(`Repeated segment: "${segments[i]}"`);
    }
  }

  // Valid single-char segments (common abbreviations)
  const validSingleChar = ['z', 'v', 'h', 'x', 'y', 'r', 'g', 'b'];
  // Valid two-char segments (common abbreviations)
  const validTwoChar = ['xs', 'sm', 'md', 'lg', 'xl', 'bg', 'on', 'fw', '2x', '3x'];
  // Valid three-char abbreviations that are NOT partial words
  const validThreeChar = ['btn', 'nav', 'drp', 'col', 'row', 'min', 'max', 'top', 'mid', 'end'];

  // Check for very short segments that look like truncation (except known valid ones)
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.length === 1 && !/^\d$/.test(seg) && !validSingleChar.includes(seg)) {
      issues.push(`Single-char segment: "${seg}" (possible truncation)`);
    }
    if (seg.length === 2 && !/^\d+$/.test(seg) && !validTwoChar.includes(seg)) {
      issues.push(`Very short segment: "${seg}" (possible truncation)`);
    }
  }

  // Check for segments that look like partial/truncated words (not valid abbreviations)
  const partialWords = ['txt', 'bord', 'hov', 'act', 'dis', 'inv', 'prim', 'sec', 'tert'];
  for (const seg of segments) {
    if (partialWords.includes(seg)) {
      issues.push(`Partial word: "${seg}"`);
    }
  }

  return issues;
}

// Find all CSS variable declarations and usages in a file
function extractVariables(content, filePath) {
  const variables = new Map(); // varName -> { declarations: [], usages: [], line: number }
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Match variable declarations: --var-name: value
    const declMatches = line.matchAll(/(--([\w-]+)):\s*[^;]+/g);
    for (const match of declMatches) {
      const varName = match[1];
      // Skip SCSS interpolation patterns
      if (varName.includes('#{') || varName.endsWith('-')) continue;
      if (!variables.has(varName)) {
        variables.set(varName, { declarations: [], usages: [], file: filePath });
      }
      variables.get(varName).declarations.push({ line: lineNum, text: line.trim() });
    }

    // Match variable usages: var(--var-name)
    const useMatches = line.matchAll(/var\((--([\w-]+))/g);
    for (const match of useMatches) {
      const varName = match[1];
      // Skip SCSS interpolation patterns
      if (varName.includes('#{') || varName.endsWith('-')) continue;
      if (!variables.has(varName)) {
        variables.set(varName, { declarations: [], usages: [], file: filePath });
      }
      variables.get(varName).usages.push({ line: lineNum, text: line.trim() });
    }
  });

  return variables;
}

// Recursively find all CSS/SCSS files
function findCssFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and dist
      if (!['node_modules', 'dist', '.git'].includes(entry.name)) {
        findCssFiles(fullPath, files);
      }
    } else if (/\.(css|scss|sass)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

// Check if a file is a core variables file (defines canonical variables)
function isCoreVariablesFile(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.includes('/core/') &&
         (normalized.includes('_base-css-variables.scss') ||
          normalized.includes('/variables/'));
}

// Check if a file is a core component file (uses variables)
function isCoreComponentFile(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.includes('/core/') &&
         normalized.includes('/core-components/');
}

// Check if a file is any core file
function isCoreFile(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.includes('/core/');
}

// Check if a file is a theme file
function isThemeFile(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.includes('/theme-') && normalized.endsWith('.scss');
}

// Main analysis function
function analyzeFiles(searchPath, options = {}) {
  const { strict = false } = options;
  const files = findCssFiles(searchPath);
  const allVariables = new Map();
  const coreVariables = new Set(); // Variables defined in core variables files
  const issues = [];

  console.log(`Scanning ${files.length} CSS/SCSS files...\n`);

  // Extract variables from all files
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const vars = extractVariables(content, file);
    const isVarsFile = isCoreVariablesFile(file);
    const isComponentFile = isCoreComponentFile(file);
    const isCore = isCoreFile(file);

    for (const [name, data] of vars) {
      // Track core variable definitions (only from variables files)
      if (isVarsFile && data.declarations.length > 0 && name.startsWith('--pa-')) {
        coreVariables.add(name);
      }

      if (!allVariables.has(name)) {
        allVariables.set(name, {
          ...data,
          files: [file],
          definedInCoreVars: isVarsFile && data.declarations.length > 0,
          usedInCoreComponents: isComponentFile && data.usages.length > 0,
          coreComponentFiles: isComponentFile ? [file] : [],
        });
      } else {
        const existing = allVariables.get(name);
        existing.declarations.push(...data.declarations);
        existing.usages.push(...data.usages);
        if (!existing.files.includes(file)) {
          existing.files.push(file);
        }
        if (isVarsFile && data.declarations.length > 0) {
          existing.definedInCoreVars = true;
        }
        if (isComponentFile && data.usages.length > 0) {
          existing.usedInCoreComponents = true;
          if (!existing.coreComponentFiles.includes(file)) {
            existing.coreComponentFiles.push(file);
          }
        }
      }
    }
  }

  console.log(`Found ${allVariables.size} unique CSS variables.`);
  console.log(`Found ${coreVariables.size} --pa-* variables defined in core.\n`);

  // Analyze each variable
  for (const [name, data] of allVariables) {
    const varIssues = [];

    // Check suspicious patterns
    if (isSuspicious(name)) {
      varIssues.push('Matches suspicious pattern');
    }

    // Structural analysis
    const structuralIssues = analyzeVariable(name);
    varIssues.push(...structuralIssues);

    // Check for --pa-* variables not defined in core variables
    // Skip --pa-local-* variables (intentionally component-scoped runtime state)
    if (name.startsWith('--pa-') && !name.startsWith('--pa-local-') && !coreVariables.has(name)) {
      // Check if declared in core component files (locally scoped)
      const isDeclaredInCoreComponent = data.declarations.length > 0 &&
        data.files.some(f => isCoreComponentFile(f));

      // Check if it's declared somewhere (themes can override, that's fine)
      const isDeclaredInTheme = data.declarations.length > 0 &&
        data.files.some(f => isThemeFile(f));

      // If it's used via var() but never declared anywhere, flag it (always an error)
      if (data.usages.length > 0 && data.declarations.length === 0) {
        varIssues.push('ERROR: Used but never declared (typo or missing definition)');
      }
      // If declared in component but not in central variables (strict mode only)
      else if (strict && isDeclaredInCoreComponent && !data.definedInCoreVars) {
        const componentFiles = data.coreComponentFiles.map(f => path.relative(searchPath, f));
        varIssues.push(`INFO: Declared in component file, not in central variables (_base-css-variables.scss)`);
      }
      // Theme declares a --pa-* variable that core doesn't know about
      else if (isDeclaredInTheme && !data.definedInCoreVars && !isDeclaredInCoreComponent) {
        varIssues.push('WARNING: Declared in theme but not in core (theme-specific or typo?)');
      }
    }

    if (varIssues.length > 0) {
      issues.push({
        variable: name,
        issues: varIssues,
        files: data.files.map(f => path.relative(searchPath, f)),
        declarations: data.declarations.slice(0, 3), // Show first 3
        usages: data.usages.slice(0, 3),
      });
    }
  }

  return { issues, totalVariables: allVariables.size, allVariables, coreVariables };
}

// Format and print results
function printResults(results, verbose = false) {
  const { issues, totalVariables, allVariables } = results;

  if (verbose && allVariables) {
    console.log('All CSS variables found:');
    const varNames = Array.from(allVariables.keys()).sort();
    for (const name of varNames) {
      console.log(`  ${name}`);
    }
    console.log();
  }

  if (issues.length === 0) {
    console.log(`Scanned ${totalVariables} CSS variables.`);
    console.log('No suspicious CSS variables found.');
    return;
  }

  console.log(`Found ${issues.length} potentially problematic variables:\n`);
  console.log('='.repeat(80));

  // Sort by severity (more issues = higher priority)
  issues.sort((a, b) => b.issues.length - a.issues.length);

  for (const issue of issues) {
    console.log(`\nVariable: ${issue.variable}`);
    console.log(`Issues: ${issue.issues.join(', ')}`);
    console.log(`Files: ${issue.files.join(', ')}`);

    if (issue.declarations.length > 0) {
      console.log('Declarations:');
      for (const decl of issue.declarations) {
        console.log(`  Line ${decl.line}: ${decl.text.substring(0, 80)}${decl.text.length > 80 ? '...' : ''}`);
      }
    }

    if (issue.usages.length > 0) {
      console.log('Usages:');
      for (const use of issue.usages) {
        console.log(`  Line ${use.line}: ${use.text.substring(0, 80)}${use.text.length > 80 ? '...' : ''}`);
      }
    }

    console.log('-'.repeat(80));
  }

  console.log(`\nSummary: ${issues.length} suspicious variables out of ${totalVariables} total`);
}

// Run the script
const args = process.argv.slice(2);
const showHelp = args.includes('--help') || args.includes('-h');
const verbose = args.includes('--verbose') || args.includes('-v');
const strict = args.includes('--strict') || args.includes('-s');
const testMode = args.includes('--test');
const searchPath = args.find(a => !a.startsWith('-')) || path.join(__dirname, '..', 'packages');

if (showHelp) {
  console.log(`CSS Variable Validator

Scans CSS/SCSS files for potentially corrupted or nonsensical variable names.

Usage: node scripts/check-css-variables.js [options] [path]

Options:
  -h, --help     Show this help message
  -v, --verbose  Show all variables found
  -s, --strict   Also report component-scoped variables not in central definitions
  --test         Run self-test to verify detection patterns

Arguments:
  path           Directory to scan (default: packages/)

Examples:
  node scripts/check-css-variables.js
  node scripts/check-css-variables.js --verbose
  node scripts/check-css-variables.js --strict
  node scripts/check-css-variables.js packages/core
  node scripts/check-css-variables.js --test

Detection patterns:
  - Repeated segments (e.g., --pa-bg-bg, --pa-text-text)
  - Partial/truncated words (e.g., --pa-txt-color, --pa-bord)
  - Very short unrecognized segments
  - Double hyphens in middle
  - --pa-* variables used but not declared
  - --pa-* variables declared in themes but not in core
  - [strict] --pa-* variables declared in components but not in central variables

Note: --pa-local-* variables are intentionally skipped (runtime state managed by JS)
`);
  process.exit(0);
}

console.log(`CSS Variable Validator`);
console.log(`Scanning: ${searchPath}`);
if (verbose) console.log(`Mode: verbose`);
if (strict) console.log(`Mode: strict (also reporting component-scoped variables)`);
console.log();

// Test mode: verify detection of known bad patterns
if (testMode) {
  console.log('Running self-test...\n');
  const testCases = [
    { name: '--pa-bg-bg', shouldFail: true, reason: 'Repeated segment' },
    { name: '--pa-text-text', shouldFail: true, reason: 'Repeated segment' },
    { name: '--pa-color-color', shouldFail: true, reason: 'Repeated segment' },
    { name: '--pa-txt-color', shouldFail: true, reason: 'Partial word' },
    { name: '--pa-bord-color', shouldFail: true, reason: 'Partial word' },
    { name: '--pa-main-bg', shouldFail: false, reason: 'Valid variable' },
    { name: '--pa-btn-primary-bg', shouldFail: false, reason: 'Valid button variable' },
    { name: '--pa-text-color-1', shouldFail: false, reason: 'Valid text variable' },
    { name: '--base-hover-bg', shouldFail: false, reason: 'Valid base variable' },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    const issues = analyzeVariable(test.name);
    const hasSuspiciousPattern = isSuspicious(test.name);
    const hasIssues = issues.length > 0 || hasSuspiciousPattern;

    if (hasIssues === test.shouldFail) {
      console.log(`  PASS: ${test.name} - ${test.reason}`);
      passed++;
    } else {
      console.log(`  FAIL: ${test.name} - expected ${test.shouldFail ? 'issues' : 'no issues'}, got ${hasIssues ? 'issues' : 'none'}`);
      if (issues.length > 0) console.log(`        Issues: ${issues.join(', ')}`);
      failed++;
    }
  }

  console.log(`\nTest results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

try {
  const results = analyzeFiles(searchPath, { strict });
  printResults(results, verbose);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
