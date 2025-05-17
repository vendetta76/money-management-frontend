# Test info

- Name: form outcome: input pengeluaran dan tampilkan hasil
- Location: C:\Users\User\money-management\frontend\e2e\outcome-form.spec.ts:3:1

# Error details

```
Error: page.selectOption: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('select[name=wallet]')

    at C:\Users\User\money-management\frontend\e2e\outcome-form.spec.ts:10:14
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('form outcome: input pengeluaran dan tampilkan hasil', async ({ page }) => {
   4 |   await page.goto('/login');
   5 |   await page.locator('#email').fill('admin@mail.com');
   6 |   await page.locator('#password').fill('password123');
   7 |   await page.getByRole('button', { name: /login/i }).click();
   8 |   await page.goto('/outcome');
   9 |
> 10 |   await page.selectOption('select[name=wallet]', { index: 0 });
     |              ^ Error: page.selectOption: Test timeout of 30000ms exceeded.
  11 |   await page.getByLabel('Deskripsi').fill('Makan Siang');
  12 |   await page.getByLabel('Nominal').fill('75,50');
  13 |   await page.getByRole('button', { name: /simpan/i }).click();
  14 |
  15 |   await expect(page.getByText('Makan Siang')).toBeVisible();
  16 | });
  17 |
```