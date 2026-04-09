#!/usr/bin/env node
/**
 * Recorre *.html (excl. _archivo/, node_modules/), respalda en _backup_design/
 * y aplica correcciones de diseño acordadas.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKUP_DIR = path.join(ROOT, '_backup_design');

const SKIP_DIR_NAMES = new Set(['_archivo', 'node_modules', '_backup_design']);

/** @param {string} absDir */
function collectHtmlFiles(absDir, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(absDir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const ent of entries) {
    const full = path.join(absDir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIR_NAMES.has(ent.name)) continue;
      collectHtmlFiles(full, acc);
    } else if (ent.isFile() && ent.name.endsWith('.html')) {
      acc.push(full);
    }
  }
  return acc;
}

/** @param {string} absPath file under ROOT */
function backupPathFor(absPath) {
  const rel = path.relative(ROOT, absPath);
  return path.join(BACKUP_DIR, rel);
}

/** @param {string} absPath */
function ensureBackup(absPath) {
  const dest = backupPathFor(absPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(absPath, dest);
}

/**
 * @param {string} content
 * @param {string[]} log
 */
function stripStarsDiv(content, log) {
  const re =
    /<div\b[^>]*\bid\s*=\s*(["'])stars-bg\1[^>]*>\s*<\/div>\s*/gi;
  const next = content.replace(re, '');
  if (next !== content) log.push('eliminado <div id="stars-bg" …>');
  return next;
}

const STAR_SCRIPT_RE =
  /<script\b[^>]*>[\s\S]*?<\/script>/gi;

/**
 * @param {string} content
 * @param {string[]} log
 */
function stripStarScripts(content, log) {
  const innerProbe =
    /stars-bg|class\s*=\s*['"]star['"]|className\s*=\s*['"]star['"]/;
  return content.replace(STAR_SCRIPT_RE, (block) => {
    if (!innerProbe.test(block)) return block;
    log.push('eliminado <script> de estrellas');
    return '';
  });
}

/**
 * @param {string} css
 * @param {string[]} log
 */
function transformStyleBlock(css, log) {
  let radialNoted = false;
  const lines = css.split('\n');
  const out = lines.map((line) => {
    if (/radial-gradient/i.test(line)) {
      if (!radialNoted) {
        log.push('radial-gradient → background: var(--dc-bg) en <style>');
        radialNoted = true;
      }
      const indent = /^(\s*)/.exec(line)?.[1] ?? '';
      return `${indent}background: var(--dc-bg);`;
    }
    return line;
  });
  let next = out.join('\n');

  const beforeGold = next;
  next = next.replace(/#d4af37/gi, 'var(--dc-gold)');
  if (next !== beforeGold) log.push('#d4af37 → var(--dc-gold) en <style>');

  const beforeFont = next;
  next = next.replace(/Arial\s+Black/gi, 'var(--dc-font-body)');
  if (next !== beforeFont) log.push('Arial Black → var(--dc-font-body) en <style>');

  return next;
}

/**
 * @param {string} content
 * @param {string[]} log
 */
function processStyleTags(content, log) {
  return content.replace(
    /<style(\b[^>]*)>([\s\S]*?)<\/style>/gi,
    (full, attrs, inner) => {
      const styleLog = [];
      const nextInner = transformStyleBlock(inner, styleLog);
      if (nextInner === inner) return full;
      styleLog.forEach((m) => log.push(m));
      return `<style${attrs}>${nextInner}</style>`;
    }
  );
}

function main() {
  const files = collectHtmlFiles(ROOT);
  /** @type {Array<{ rel: string, changes: string[] }>} */
  const report = [];

  for (const abs of files) {
    const rel = path.relative(ROOT, abs);
    let raw;
    try {
      raw = fs.readFileSync(abs, 'utf8');
    } catch {
      continue;
    }

    const log = [];
    let next = raw;
    next = stripStarsDiv(next, log);
    next = stripStarScripts(next, log);
    next = processStyleTags(next, log);

    // Quitar líneas vacías extra tras eliminar bloques (ligero)
    if (log.some((m) => m.includes('eliminado'))) {
      next = next.replace(/\n{3,}/g, '\n\n');
    }

    if (log.length === 0) continue;

    ensureBackup(abs);
    fs.writeFileSync(abs, next, 'utf8');
    report.push({ rel, changes: [...new Set(log)] });
  }

  if (report.length === 0) {
    console.log('Ningún archivo requirió cambios.');
    return;
  }

  console.log(`Archivos modificados: ${report.length}\n`);
  for (const { rel, changes } of report) {
    console.log(rel);
    for (const c of changes) console.log(`  · ${c}`);
    console.log('');
  }
}

main();
