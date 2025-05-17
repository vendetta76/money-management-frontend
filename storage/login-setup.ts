import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login');

  await page.locator('#email').fill('diorvendetta76@gmail.com');
  await page.locator('#password').fill('Testing123');
  await page.getByRole('button', { name: /login|masuk/i }).click();

  await page.waitForURL(/dashboard|wallet|income/, { timeout: 10000 });
  await page.waitForTimeout(1000);

  await page.context().storageState({ path: 'storage/admin-auth.json' });
  console.log('✅ Login sukses! Session disimpan.');
  await browser.close();
})();
