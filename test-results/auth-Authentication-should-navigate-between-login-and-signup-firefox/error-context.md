# Test info

- Name: Authentication >> should navigate between login and signup
- Location: /Users/daniel/personal-code/boiler-project/e2e/auth.spec.ts:23:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected string: "http://localhost:5173/signup"
Received string: "http://localhost:5173/login"
Call log:
  - expect.toHaveURL with timeout 5000ms
  - waiting for locator(':root')
    9 × locator resolved to <html lang="en">…</html>
      - unexpected value "http://localhost:5173/login"

    at /Users/daniel/personal-code/boiler-project/e2e/auth.spec.ts:27:24
```

# Page snapshot

```yaml
- navigation:
  - link "SaaS Boilerplate":
    - /url: /
  - link "Login":
    - /url: /login
  - link "Sign up":
    - /url: /signup
- main:
  - heading "Welcome back" [level=2]
  - paragraph:
    - text: Don't have an account?
    - link "Sign up":
      - /url: /signup
  - text: Email
  - textbox "Email"
  - text: Password
  - textbox "Password"
  - checkbox "Remember me"
  - text: Remember me
  - link "Forgot password?":
    - /url: /forgot-password
  - button "Sign in"
  - button "Continue with Google":
    - img
    - text: Continue with Google
- contentinfo:
  - link "Privacy Policy":
    - /url: /privacy
  - link "Terms of Service":
    - /url: /terms
  - link "Contact Us":
    - /url: mailto:support@example.com
  - paragraph: © 2025 SaaS Boilerplate. All rights reserved.
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test'
   2 |
   3 | test.describe('Authentication', () => {
   4 |   test('should display login page', async ({ page }) => {
   5 |     await page.goto('/login')
   6 |     
   7 |     await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
   8 |     await expect(page.getByPlaceholder('Email')).toBeVisible()
   9 |     await expect(page.getByPlaceholder('Password')).toBeVisible()
  10 |     await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  11 |   })
  12 |
  13 |   test('should display signup page', async ({ page }) => {
  14 |     await page.goto('/signup')
  15 |     
  16 |     await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
  17 |     await expect(page.getByLabel('Email')).toBeVisible()
  18 |     await expect(page.getByLabel('Password')).toBeVisible()
  19 |     await expect(page.getByLabel('Confirm password')).toBeVisible()
  20 |     await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
  21 |   })
  22 |
  23 |   test('should navigate between login and signup', async ({ page }) => {
  24 |     await page.goto('/login')
  25 |     
  26 |     await page.getByText("Don't have an account?").click()
> 27 |     await expect(page).toHaveURL('/signup')
     |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)
  28 |     
  29 |     await page.getByText('Already have an account?').click()
  30 |     await expect(page).toHaveURL('/login')
  31 |   })
  32 |
  33 |   test('should show validation errors', async ({ page }) => {
  34 |     await page.goto('/signup')
  35 |     
  36 |     // Try to submit empty form
  37 |     await page.getByRole('button', { name: 'Create account' }).click()
  38 |     
  39 |     await expect(page.getByText('Email is required')).toBeVisible()
  40 |     await expect(page.getByText('Password is required')).toBeVisible()
  41 |     
  42 |     // Invalid email
  43 |     await page.getByLabel('Email').fill('invalid-email')
  44 |     await page.getByRole('button', { name: 'Create account' }).click()
  45 |     await expect(page.getByText('Invalid email address')).toBeVisible()
  46 |     
  47 |     // Password mismatch
  48 |     await page.getByLabel('Email').fill('test@example.com')
  49 |     await page.getByLabel('Password').fill('password123')
  50 |     await page.getByLabel('Confirm password').fill('different123')
  51 |     await page.getByRole('button', { name: 'Create account' }).click()
  52 |     await expect(page.getByText('Passwords do not match')).toBeVisible()
  53 |   })
  54 | })
```