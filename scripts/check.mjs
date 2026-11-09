// npm run check — abre la página en Chrome headless (el Chrome instalado, sin descargar
// navegadores), guarda una captura y lista los errores de consola.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const URL = process.env.CHECK_URL || 'http://localhost:5173/';
const OUT = 'screenshots/check.png';

mkdirSync('screenshots', { recursive: true });

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

const problems = [];
page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    problems.push(`[console.${msg.type()}] ${msg.text()}`);
  }
});
page.on('pageerror', (err) => problems.push(`[pageerror] ${err.message}`));
page.on('requestfailed', (req) => problems.push(`[requestfailed] ${req.url()} — ${req.failure()?.errorText}`));

try {
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
} catch (e) {
  console.error(`No se pudo abrir ${URL}. ¿Está corriendo "npm run dev"?\n${e.message}`);
  await browser.close();
  process.exit(2);
}

// Espera a que la escena marque que ya renderizó varios cuadros.
await page.waitForFunction(() => window.__frames > 5, null, { timeout: 30000 }).catch(() => {
  problems.push('[check] La escena no llegó a renderizar (window.__frames <= 5)');
});
await page.waitForTimeout(1000);
await page.screenshot({ path: OUT });
await browser.close();

console.log(`Captura guardada en ${OUT}`);
// Avisos de rendimiento del renderizador por software (headless) no son errores de la app.
const relevant = problems.filter((p) => !/GPU stall|ReadPixels|swiftshader|WebGL-.*performance/i.test(p));
if (relevant.length) {
  console.log(`\n${relevant.length} problema(s) en consola:`);
  for (const p of relevant) console.log('  - ' + p);
  process.exit(1);
}
console.log('Sin errores de consola. ✔');
