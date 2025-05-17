# Test info

- Name: render wallet dengan mata uang USDT tanpa crash
- Location: C:\Users\User\money-management\frontend\e2e\usdt-wallet.spec.ts:3:1

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('.font-semibold:has-text("USDT")')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('.font-semibold:has-text("USDT")')

    at C:\Users\User\money-management\frontend\e2e\usdt-wallet.spec.ts:10:65
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('render wallet dengan mata uang USDT tanpa crash', async ({ page }) => {
   4 |   await page.goto('/login');
   5 |   await page.locator('#email').fill('admin@mail.com');
   6 |   await page.locator('#password').fill('password123');
   7 |   await page.getByRole('button', { name: /login/i }).click();
   8 |
   9 |   await page.goto('/wallet');
> 10 |   await expect(page.locator('.font-semibold:has-text("USDT")')).toBeVisible();
     |                                                                 ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  11 | });
  12 |
```