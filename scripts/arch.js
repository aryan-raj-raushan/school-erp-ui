#!/usr/bin/env node
/**
 * arch.js — Architecture enforcement for school-erp-ui
 *
 * Layer contract:
 *   src/app/**           → only hooks + ui components (no className, no services, no raw HTML)
 *   src/hooks/**         → only services + stores
 *   src/components/ui/** → styling lives here (cn, className ALLOWED — EXEMPT)
 *   src/components/**    → no services, no className
 *
 * Escape hatch: add  // arch-ignore  on a line to skip that line only.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Rules ───────────────────────────────────────────────────────────────────

const RULES = [
  // R1–R6: styling rules — apply everywhere outside src/components/ui/
  {
    id:    'R1',
    scope: 'non-ui',
    re:    /className\s*=/,
    msg:   'className prop forbidden — use ui component props (<Div>, <P>, <H1>, etc.)',
  },
  {
    id:    'R2',
    scope: 'non-ui',
    re:    /\bcn\s*\(/,
    msg:   'cn() call forbidden outside ui/ — move class logic into a ui component',
  },
  {
    id:    'R3',
    scope: 'non-ui',
    re:    /\bclsx\s*\(/,
    msg:   'clsx() call forbidden outside ui/',
  },
  {
    id:    'R4',
    scope: 'non-ui',
    re:    /\bcompute\s*\(/,
    msg:   'compute() call forbidden outside ui/',
  },
  {
    id:    'R5',
    scope: 'non-ui',
    re:    /import\s+.*['"]clsx['"]/,
    msg:   'clsx import forbidden outside ui/',
  },
  {
    id:    'R6',
    scope: 'non-ui',
    re:    /import\s+[^t{][^;]*\bcn\b[^;]*from\s+['"].*utils['"]/,
    msg:   'cn import forbidden outside ui/ — cn belongs only in the ui layer',
  },

  // R7: pages must not import services directly (use a hook)
  {
    id:    'R7',
    scope: 'pages',
    re:    /^\s*import\s+(?!type[\s{])[^;]+from\s+['"]@\/services/,
    msg:   'Service import in page — wrap in a hook (src/hooks/) instead',
  },

  // R8: page-route files must not use raw HTML elements — use ui primitives
  {
    id:    'R8',
    scope: 'page-routes',
    re:    /<(div|span|button|h1|h2|h3|h4|h5|h6|p)\b(?![^>]*\/>)/,
    msg:   'Raw HTML element — use <Div>, <P>, <H1> etc. from @/components/ui',
  },

  // R9: layout/feature components must not import services (use a hook)
  {
    id:    'R9',
    scope: 'components',
    re:    /^\s*import\s+(?!type[\s{])[^;]+from\s+['"]@\/services/,
    msg:   'Service import in component — wrap in a hook (src/hooks/) instead',
  },
];

// ─── Scope classification ─────────────────────────────────────────────────────

/**
 * Returns the scope tag for a file path.
 * 'ui'           → exempt entirely
 * 'root-layout'  → exempt entirely
 * 'page-routes'  → R1–R8 apply
 * 'pages'        → R1–R7 apply (but NOT R8 — root-level app/ pages may vary)
 * 'components'   → R1–R6, R9 apply
 * 'hooks'        → R1–R6 apply
 * 'non-ui'       → R1–R6 apply
 */
function classify(filePath) {
  const rel = filePath.replace(/\\/g, '/');

  // Always exempt: the ui component library itself
  if (rel.includes('/components/ui/')) return 'ui';

  // Exempt: root layout needs <html>, <body>
  if (/\/app\/layout\.tsx$/.test(rel)) return 'root-layout';

  // Auth + main route groups — strictest rules including raw HTML check
  if (/\/app\/\((auth|main)\)\//.test(rel)) return 'page-routes';

  // Other app/ files (root page.tsx, error.tsx, etc.)
  if (rel.includes('/app/')) return 'pages';

  // Components outside ui/
  if (rel.includes('/components/')) return 'components';

  // Everything else (hooks/, lib/, services/) — styling rules only
  return 'non-ui';
}

// Which scopes each rule's scope tag applies to
const SCOPE_APPLIES = {
  'non-ui':      new Set(['non-ui', 'pages', 'page-routes', 'components', 'hooks']),
  'pages':       new Set(['pages', 'page-routes']),
  'page-routes': new Set(['page-routes']),
  'components':  new Set(['components']),
};

function ruleApplies(rule, scope) {
  const set = SCOPE_APPLIES[rule.scope];
  return set ? set.has(scope) : false;
}

// ─── File scanner ─────────────────────────────────────────────────────────────

function scanFile(filePath) {
  const scope = classify(filePath);
  if (scope === 'ui' || scope === 'root-layout') return [];

  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const violations = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // honour escape hatch
    if (/\/\/\s*arch-ignore/.test(line)) continue;

    // skip pure comment lines and empty lines
    if (/^\s*(\/\/|\/\*|\*|$)/.test(line)) continue;

    for (const rule of RULES) {
      if (!ruleApplies(rule, scope)) continue;
      if (rule.re.test(line)) {
        violations.push({
          file:    filePath,
          line:    i + 1,
          rule:    rule.id,
          msg:     rule.msg,
          snippet: line.trim().slice(0, 120),
        });
      }
    }
  }

  return violations;
}

const EXCLUDED_FILES = new Set([
  'src/app/layout.tsx',               // root layout — needs <html>, <body>
  'src/components/Particles.jsx',     // third-party animation component
  'src/components/Particles.css',     // CSS file, not checked anyway
  'src/components/reactbits/background.tsx', // third-party reactbits wrapper
]);

// ─── Directory walker ─────────────────────────────────────────────────────────

function walkTsx(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walkTsx(full, results);
    } else if (entry.isFile() && /\.(tsx|jsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

// ─── Staged files resolver ────────────────────────────────────────────────────

function getStagedFiles() {
  const { execSync } = require('child_process');
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    const cwd = process.cwd();
    return out
      .trim()
      .split('\n')
      .filter(f => /\.(tsx|jsx)$/.test(f) && f.startsWith('src/'))
      .map(f => path.join(cwd, f))
      .filter(f => fs.existsSync(f));
  } catch {
    return null; // fallback to full walk if git unavailable
  }
}

// ─── Reporter ─────────────────────────────────────────────────────────────────

const BOLD  = '\x1b[1m';
const RED   = '\x1b[31m';
const YELLOW = '\x1b[33m';
const DIM   = '\x1b[2m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const CYAN  = '\x1b[36m';

function report(allViolations, totalFiles) {
  const SEP = '━'.repeat(64);

  if (allViolations.length === 0) {
    console.log(`\n${GREEN}${BOLD}✔ arch: 0 violations in ${totalFiles} files. Clean.${RESET}\n`);
    return;
  }

  // Group by file
  const byFile = new Map();
  for (const v of allViolations) {
    if (!byFile.has(v.file)) byFile.set(v.file, []);
    byFile.get(v.file).push(v);
  }

  console.log(`\n${RED}${BOLD}${SEP}`);
  console.log(` ARCH VIOLATIONS — school-erp-ui`);
  console.log(`${SEP}${RESET}\n`);

  const srcRoot = path.join(process.cwd(), 'src');

  for (const [file, vs] of byFile) {
    const rel = path.relative(process.cwd(), file);
    console.log(`${BOLD}${CYAN}${rel}${RESET}`);
    for (const v of vs) {
      const lineStr = String(v.line).padStart(4);
      console.log(
        `  ${DIM}Line ${lineStr}${RESET}  ${YELLOW}[${v.rule}]${RESET}  ${v.msg}`,
      );
      console.log(`           ${DIM}↳  ${v.snippet}${RESET}`);
    }
    console.log('');
  }

  const fileCount = byFile.size;
  console.log(`${RED}${BOLD}${SEP}`);
  console.log(
    ` ${allViolations.length} violation${allViolations.length === 1 ? '' : 's'} in ${fileCount} file${fileCount === 1 ? '' : 's'}. Commit BLOCKED.`,
  );
  console.log(`${SEP}${RESET}\n`);

  console.log(`${DIM}Fix guide:`);
  console.log(`  R1      → replace className={"..."} with ui component props`);
  console.log(`  R2/R3   → move cn()/clsx() logic into a new or existing ui component`);
  console.log(`  R4      → remove compute() class construction`);
  console.log(`  R5/R6   → remove clsx/cn import; it belongs only in ui/`);
  console.log(`  R7/R9   → move service call into src/hooks/useYourFeature.ts`);
  console.log(`  R8      → replace <div> with <Div>, <p> with <P>, <button> with <Button>, etc.`);
  console.log(`  escape  → add  // arch-ignore  to skip ONE line (use sparingly)${RESET}\n`);
}

// ─── Baseline ────────────────────────────────────────────────────────────────
// Files listed in arch-baseline.json are grandfathered (existing violations).
// They are skipped until you remove them from the baseline after fixing them.
// To regenerate: node scripts/arch-baseline-gen.js

function loadBaseline() {
  const p = path.join(process.cwd(), 'scripts', 'arch-baseline.json');
  if (!fs.existsSync(p)) return new Set();
  try {
    return new Set(JSON.parse(fs.readFileSync(p, 'utf8')));
  } catch {
    return new Set();
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const cwd      = process.cwd();
  const srcDir   = path.join(cwd, 'src');
  const baseline = loadBaseline();

  const staged = getStagedFiles();
  const files  = staged ?? walkTsx(srcDir);

  if (staged) {
    console.log(`${DIM}arch: checking ${files.length} staged file${files.length === 1 ? '' : 's'}${RESET}`);
  }

  const skipped = [];
  const allViolations = [];

  for (const f of files) {
    const rel = path.relative(cwd, f).replace(/\\/g, '/');

    if (EXCLUDED_FILES.has(rel)) {
      console.log(`${DIM}arch: excluded  ${rel}${RESET}`);
      continue;
    }
    if (baseline.has(rel)) {
      skipped.push(rel);
      continue;
    }
    allViolations.push(...scanFile(f));
  }

  if (skipped.length > 0) {
    console.log(
      `${DIM}arch: skipping ${skipped.length} baselined file${skipped.length === 1 ? '' : 's'} (see scripts/arch-baseline.json)${RESET}`,
    );
  }

  report(allViolations, files.length);

  if (allViolations.length > 0) process.exit(1);
}

main();
