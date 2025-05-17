# Test info

- Name: klik kartu wallet menampilkan popup transaksi
- Location: C:\Users\User\money-management\frontend\e2e\popup-wallet.spec.ts:3:1

# Error details

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.font-semibold').first()

    at C:\Users\User\money-management\frontend\e2e\popup-wallet.spec.ts:10:48
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('klik kartu wallet menampilkan popup transaksi', async ({ page }) => {
   4 |   await page.goto('/login');
   5 |   await page.locator('#email').fill('admin@mail.com');
   6 |   await page.locator('#password').fill('password123');
   7 |   await page.getByRole('button', { name: /login/i }).click();
   8 |
   9 |   await page.goto('/wallet');
> 10 |   await page.locator('.font-semibold').first().click();
     |                                                ^ Error: locator.click: Test timeout of 30000ms exceeded.
  11 |   await expect(page.getByText(/Riwayat|Pemasukan|Pengeluaran/)).toBeVisible();
  12 | });
  13 |
```