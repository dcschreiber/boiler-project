import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    await expect(page.getByPlaceholder('Email')).toBeVisible()
    await expect(page.getByPlaceholder('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })

  test('should display signup page', async ({ page }) => {
    await page.goto('/signup')
    
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByLabel('Confirm password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
  })

  test('should navigate between login and signup', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByText("Don't have an account?").click()
    await expect(page).toHaveURL('/signup')
    
    await page.getByText('Already have an account?').click()
    await expect(page).toHaveURL('/login')
  })

  test('should show validation errors', async ({ page }) => {
    await page.goto('/signup')
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Create account' }).click()
    
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
    
    // Invalid email
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByText('Invalid email address')).toBeVisible()
    
    // Password mismatch
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByLabel('Confirm password').fill('different123')
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })
})