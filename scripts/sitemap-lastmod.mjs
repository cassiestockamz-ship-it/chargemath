// Writes src/data/sitemap-lastmod.json: the date of the last commit touching each route's
// page folder, so the sitemap carries true lastmod values instead of the build time.
// Run before committing a content change: node scripts/sitemap-lastmod.mjs
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const appDir = process.argv[2] || "src/app/(site)";
const out = {};
const date = (p) => execSync(`git log -1 --format=%cs -- ${JSON.stringify(p)}`, { encoding: "utf8" }).trim();
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const full = path.join(dir, e.name);
    if (fs.existsSync(path.join(full, "page.tsx"))) {
      const route = "/" + path.relative(appDir, full).split(path.sep).filter((s) => !s.startsWith("(")).join("/");
      const d = date(full);
      if (d) out[route] = d;
    }
    walk(full);
  }
};
walk(appDir);
const home = date(path.join(appDir, "page.tsx"));
if (home) out["/"] = home;
out["*"] = date("src/app");
fs.writeFileSync("src/data/sitemap-lastmod.json", JSON.stringify(out, null, 2) + "\n");
console.log(`${Object.keys(out).length} routes`);
