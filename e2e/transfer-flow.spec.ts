import { test, expect } from '@playwright/test';

test('transfer antar wallet dan validasi tampilannya', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('admin@mail.com');
  await page.locator('#password').fill('password123');
  await page.getByRole('button', { name: /login/i }).click();
  await page.goto('/transfer');

  await page.selectOption('select', { index: 0 });
  await page.selectOption('select', { index: 1 });
  await page.getByLabel('Jumlah').fill('1.000,00');
  await page.getByLabel(/Deskripsi/i).fill('Pindah Dana');
  await page.getByRole('button', { name: /transfer/i }).click();

  await expect(page.getByText('Pindah Dana')).toBeVisible();
});
