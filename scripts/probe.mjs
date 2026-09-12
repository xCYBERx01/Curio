import { chromium } from 'playwright'

const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' });
await page.waitForTimeout(5000);
const probe = await page.evaluate(() => {
  const el = document.querySelector('.curio-index-toggle');
  if (!el) return { found: false };
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    found: true,
    bg: cs.background,
    color: cs.color,
    border: cs.border,
    radius: cs.borderRadius,
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    heroOverflow: (() => {
      const h = document.querySelector('.curio-hero-title');
      if (!h) return null;
      const hr = h.getBoundingClientRect();
      return { w: Math.round(hr.width), vw: window.innerWidth };
    })(),
  };
});
console.log(JSON.stringify(probe, null, 1));
await browser.close();
