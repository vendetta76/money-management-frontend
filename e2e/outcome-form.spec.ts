import { test, expect } from '@playwright/test';

test('form outcome: input pengeluaran dan tampilkan hasil', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('admin@mail.com');
  await page.locator('#password').fill('password123');
  await page.getByRole('button', { name: /login/i }).click();
  await page.goto('/outcome');

  await page.selectOption('select[name=wallet]', { index: 0 });
  await page.getByLabel('Deskripsi').fill('Makan Siang');
  await page.getByLabel('Nominal').fill('75,50');
  await page.getByRole('button', { name: /simpan/i }).click();

  await expect(page.getByText('Makan Siang')).toBeVisible();
});
