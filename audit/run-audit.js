// ChargeMath audit — fresh isolated Chromium context (no profile)
const { chromium } = require('playwright');
const path = require('path');

const OUT = path.resolve(__dirname, 'screenshots');

const PAGES = [
  { slug: 'home',         url: 'https://chargemath.com/' },
  { slug: 'ev-cost',      url: 'https://chargemath.com/ev-charging-cost' },
  { slug: 'gas-vs-ev',    url: 'https://chargemath.com/gas-vs-electric' },
  { slug: 'charging-time',url: 'https://chargemath.com/charging-time' },
  { slug: 'range',        url: 'https://chargemath.com/range' },
  { slug: 'solar-ev',     url: 'https://chargemath.com/solar-ev' },
  { slug: 'tax-credits',  url: 'https://chargemath.com/tax-credits' },
  { slug: 'guides',       url: 'https://chargemath.com/guides' },
];

async function shoot(page, file, fullPage = false) {
  await page.screenshot({ path: path.join(OUT, file), fullPage });
  console.log('  saved', file);
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // MOBILE pass
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const mPage = await mobileCtx.newPage();
  for (const p of PAGES) {
    console.log('[mobile]', p.url);
    try {
      await mPage.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      await mPage.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    }
    await mPage.waitForTimeout(800);
    await shoot(mPage, `mobile-${p.slug}.png`, false);
  }
  // Full-scroll shot on representative calculator (ev-cost)
  await mPage.goto('https://chargemath.com/ev-charging-cost', { waitUntil: 'domcontentloaded' });
  await mPage.waitForTimeout(1000);
  await shoot(mPage, 'mobile-ev-cost-FULL.png', true);

  // Try guides subpages (any links)
  await mPage.goto('https://chargemath.com/guides', { waitUntil: 'domcontentloaded' });
  await mPage.waitForTimeout(800);
  const guideLinks = await mPage.$$eval('a[href*="/guides/"]', (as) =>
    Array.from(new Set(as.map((a) => a.href))).filter((h) => !h.endsWith('/guides') && !h.endsWith('/guides/')).slice(0, 6)
  );
  console.log('  guide links:', guideLinks);
  let gi = 0;
  for (const href of guideLinks.slice(0, 2)) {
    try {
      await mPage.goto(href, { waitUntil: 'domcontentloaded' });
      await mPage.waitForTimeout(600);
      await shoot(mPage, `mobile-guide-${gi++}.png`, false);
    } catch (e) { console.log('  guide fail', href, e.message); }
  }

  // State guides — try a couple of probable paths
  const stateTries = [
    'https://chargemath.com/guides/california',
    'https://chargemath.com/guides/texas',
    'https://chargemath.com/california',
    'https://chargemath.com/texas',
    'https://chargemath.com/states/california',
  ];
  let stateHits = 0;
  for (const u of stateTries) {
    try {
      const resp = await mPage.goto(u, { waitUntil: 'domcontentloaded', timeout: 15000 });
      if (resp && resp.status() === 200) {
        await mPage.waitForTimeout(500);
        await shoot(mPage, `mobile-state-${stateHits++}.png`, false);
        console.log('  state OK:', u);
        if (stateHits >= 2) break;
      } else {
        console.log('  state miss:', u, resp && resp.status());
      }
    } catch (e) { console.log('  state fail', u, e.message); }
  }

  await mobileCtx.close();

  // DESKTOP pass
  const desktopCtx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const dPage = await desktopCtx.newPage();
  for (const p of PAGES) {
    console.log('[desktop]', p.url);
    try {
      await dPage.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (e) {
      await dPage.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    }
    await dPage.waitForTimeout(800);
    await shoot(dPage, `desktop-${p.slug}.png`, false);
  }
  // Grab a desktop full-scroll for ev-cost too
  await dPage.goto('https://chargemath.com/ev-charging-cost', { waitUntil: 'domcontentloaded' });
  await dPage.waitForTimeout(1000);
  await shoot(dPage, 'desktop-ev-cost-FULL.png', true);

  // Dump the main-nav structure from the homepage
  await dPage.goto('https://chargemath.com/', { waitUntil: 'domcontentloaded' });
  await dPage.waitForTimeout(500);
  const nav = await dPage.$$eval('header a, nav a', (as) =>
    Array.from(new Set(as.map((a) => (a.textContent || '').trim() + ' -> ' + a.getAttribute('href'))))
  );
  console.log('NAV:', JSON.stringify(nav, null, 2));

  await desktopCtx.close();
  await browser.close();
  console.log('DONE');
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
