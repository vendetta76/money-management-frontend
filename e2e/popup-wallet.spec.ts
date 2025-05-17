import { test, expect } from '@playwright/test';

test('klik kartu wallet menampilkan popup transaksi', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill('admin@mail.com');
  await page.locator('#password').fill('password123');
  await page.getByRole('button', { name: /login/i }).click();

  await page.goto('/wallet');
  await page.locator('.font-semibold').first().click();
  await expect(page.getByText(/Riwayat|Pemasukan|Pengeluaran/)).toBeVisible();
});
