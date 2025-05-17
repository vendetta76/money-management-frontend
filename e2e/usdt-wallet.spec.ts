import { test, expect } from '@playwright/test';

test('render wallet dengan mata uang USDT tanpa crash', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('admin@mail.com');
  await page.locator('#password').fill('password123');
  await page.getByRole('button', { name: /login/i }).click();

  await page.goto('/wallet');
  await expect(page.locator('.font-semibold:has-text("USDT")')).toBeVisible();
});
