#!/usr/bin/env node
/**
 * Strip affiliate imports + JSX blocks from ChargeMath calculator pages.
 * Run once during Phase 1 realignment.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");
const APP_DIR = path.join(ROOT, "src", "app");

const IMPORT_PATTERNS = [
  /^import\s+AffiliateCard\s+from\s+["']@\/components\/AffiliateCard["'];?\s*\r?\n/gm,
  /^import\s+EcoFlowCard,\s*\{[^}]*\}\s+from\s+["']@\/components\/EcoFlowCard["'];?\s*\r?\n/gm,
  /^import\s+EcoFlowCard\s+from\s+["']@\/components\/EcoFlowCard["'];?\s*\r?\n/gm,
  /^import\s+\{[^}]*ECOFLOW_PRODUCTS[^}]*\}\s+from\s+["']@\/components\/EcoFlowCard["'];?\s*\r?\n/gm,
];

const AMAZON_TAG_PATTERN = /^const\s+AMAZON_TAG\s*=\s*["'][^"']*["'];?\s*\r?\n/gm;

/**
 * Cut the JSX block starting at the index of `{/* Affiliate ... or Recommended
 * or Premium EcoFlow section marker. We walk forward, counting JSX div depth
 * from the first <div ... > we encounter, and cut through its matching </div>.
 *
 * Also handles the "EcoFlow" / "Premium Products" / "Recommended Products"
 * sections, which share the same wrapper shape.
 */
function cutAffiliateBlocks(source) {
  // Markers we know wrap affiliate sections in the ChargeMath calc pages
  const blockStartRegex =
    /^[ \t]*\{\/\*\s*(Affiliate Cards?|EcoFlow[^*]*|Recommended Products|Premium[^*]*)\s*\*\/\}\s*\r?\n/m;

  let out = source;
  let safety = 0;
  while (safety++ < 20) {
    const m = out.match(blockStartRegex);
    if (!m) break;
    const startCommentIdx = m.index;
    // Find the opening <div after the comment
    const afterComment = startCommentIdx + m[0].length;
    const divOpenIdx = out.indexOf("<div", afterComment);
    if (divOpenIdx === -1) break;
    // Walk forward through <div/</div> tracking depth
    let depth = 0;
    let i = divOpenIdx;
    let closedAt = -1;
    while (i < out.length) {
      if (out.startsWith("<div", i)) {
        depth++;
        i += 4;
      } else if (out.startsWith("</div>", i)) {
        depth--;
        if (depth === 0) {
          closedAt = i + "</div>".length;
          break;
        }
        i += 6;
      } else {
        i++;
      }
    }
    if (closedAt === -1) break;
    // Also consume trailing newline if present
    let end = closedAt;
    if (out[end] === "\r") end++;
    if (out[end] === "\n") end++;
    out = out.slice(0, startCommentIdx) + out.slice(end);
  }
  return out;
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  if (
    !/AffiliateCard|EcoFlowCard|ECOFLOW_PRODUCTS|AMAZON_TAG/.test(original)
  ) {
    return { filePath, changed: false };
  }
  let next = original;
  for (const re of IMPORT_PATTERNS) next = next.replace(re, "");
  next = next.replace(AMAZON_TAG_PATTERN, "");
  next = cutAffiliateBlocks(next);
  // Collapse 3+ consecutive blank lines to 2
  next = next.replace(/\n{3,}/g, "\n\n");
  if (next !== original) {
    fs.writeFileSync(filePath, next);
    return { filePath, changed: true };
  }
  return { filePath, changed: false };
}

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walk(full));
    else if (entry.isFile() && entry.name === "page.tsx") results.push(full);
  }
  return results;
}

const files = walk(APP_DIR);
const results = files.map(processFile);
const changed = results.filter((r) => r.changed);
console.log(`Scanned ${results.length} page.tsx files.`);
console.log(`Modified ${changed.length} files:`);
for (const r of changed) {
  console.log("  " + path.relative(ROOT, r.filePath));
}
