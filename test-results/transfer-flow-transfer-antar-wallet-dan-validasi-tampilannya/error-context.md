# Test info

- Name: transfer antar wallet dan validasi tampilannya
- Location: C:\Users\User\money-management\frontend\e2e\transfer-flow.spec.ts:3:1

# Error details

```
Error: page.selectOption: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('select')

    at C:\Users\User\money-management\frontend\e2e\transfer-flow.spec.ts:10:14
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('transfer antar wallet dan validasi tampilannya', async ({ page }) => {
   4 |   await page.goto('/login');
   5 |   await page.locator('#email').fill('admin@mail.com');
   6 |   await page.locator('#password').fill('password123');
   7 |   await page.getByRole('button', { name: /login/i }).click();
   8 |   await page.goto('/transfer');
   9 |
> 10 |   await page.selectOption('select', { index: 0 });
     |              ^ Error: page.selectOption: Test timeout of 30000ms exceeded.
  11 |   await page.selectOption('select', { index: 1 });
  12 |   await page.getByLabel('Jumlah').fill('1.000,00');
  13 |   await page.getByLabel(/Deskripsi/i).fill('Pindah Dana');
  14 |   await page.getByRole('button', { name: /transfer/i }).click();
  15 |
  16 |   await expect(page.getByText('Pindah Dana')).toBeVisible();
  17 | });
  18 |
```