import { chromium } from 'playwright'

const OUT = 'C:/Users/ahmed/AppData/Local/Temp/opencode/shots';
const errors = [];

const browser = await chromium.launch({
  args: ['--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e.message).slice(0, 300)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 200));
});

await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' });
await page.waitForTimeout(7000);
await page.screenshot({ path: `${OUT}/shot-intro.png` });

const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
console.log('scrollable:', max);
for (const [name, frac] of [['ahmed', 1 / 6], ['croc', 2 / 6], ['voltedge', 3 / 6], ['arm', 4 / 6], ['end', 1]]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(max * frac));
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${OUT}/shot-${name}.png` });
}
console.log(JSON.stringify({ errors: errors.slice(0, 15) }, null, 1));
await browser.close();
