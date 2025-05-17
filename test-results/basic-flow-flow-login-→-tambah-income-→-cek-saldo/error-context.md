# Test info

- Name: flow: login → tambah income → cek saldo
- Location: C:\Users\User\money-management\frontend\e2e\basic-flow.spec.ts:3:1

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected pattern: /.*dashboard/
Received string:  "http://localhost:3000/login"
Call log:
  - expect.toHaveURL with timeout 5000ms
  - waiting for locator(':root')
    9 × locator resolved to <html lang="en">…</html>
      - unexpected value "http://localhost:3000/login"

    at C:\Users\User\money-management\frontend\e2e\basic-flow.spec.ts:10:22
```

# Page snapshot

```yaml
- button "Kembali ke Beranda"
- heading "Login ke MoniQ" [level=1]
- text: Email
- textbox "Email": admin@mail.com
- text: Password
- textbox "Password": password123
- paragraph: "Firebase: Error (auth/invalid-credential)."
- button "Login"
- paragraph:
  - text: Belum punya akun?
  - link "Daftar sekarang":
    - /url: /register
- paragraph:
  - link "Lupa password?":
    - /url: /forgot-password
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test('flow: login → tambah income → cek saldo', async ({ page }) => {
   4 |   await page.goto('/login');
   5 |
   6 |   await page.locator('#email').fill('admin@mail.com');
   7 |   await page.locator('#password').fill('password123');
   8 |   await page.getByRole('button', { name: /login/i }).click();
   9 |
> 10 |   await expect(page).toHaveURL(/.*dashboard/);
     |                      ^ Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)
  11 |
  12 |   await page.goto('/income');
  13 |   await page.selectOption('select[name=wallet]', { index: 0 });
  14 |   await page.getByLabel('Deskripsi').fill('Gaji Bulanan');
  15 |   await page.getByLabel('Nominal').fill('1.000,25');
  16 |   await page.getByRole('button', { name: /simpan/i }).click();
  17 |
  18 |   await expect(page.getByText('Gaji Bulanan')).toBeVisible();
  19 |   await expect(page.getByText(/Rp?1.000/)).toBeVisible();
  20 | });
  21 |
```