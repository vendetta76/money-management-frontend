import { test, expect } from '@playwright/test';

test('flow: login → tambah income → cek saldo', async ({ page }) => {
  await page.goto('/login');

  await page.locator('#email').fill('admin@mail.com');
  await page.locator('#password').fill('password123');
  await page.getByRole('button', { name: /login/i }).click();

  await expect(page).toHaveURL(/.*dashboard/);

  await page.goto('/income');
  await page.selectOption('select[name=wallet]', { index: 0 });
  await page.getByLabel('Deskripsi').fill('Gaji Bulanan');
  await page.getByLabel('Nominal').fill('1.000,25');
  await page.getByRole('button', { name: /simpan/i }).click();

  await expect(page.getByText('Gaji Bulanan')).toBeVisible();
  await expect(page.getByText(/Rp?1.000/)).toBeVisible();
});
