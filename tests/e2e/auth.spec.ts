import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env['E2E_TEST_EMAIL'] ?? 'test@example.com'
const TEST_PASSWORD = process.env['E2E_TEST_PASSWORD'] ?? 'testpassword123'

test.describe('Authentication', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('invalid@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByRole('alert').or(page.locator('[class*="error"]'))).toBeVisible({
      timeout: 8000,
    })
  })

  test('unauthenticated user is redirected to login from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })

  test('unauthenticated user is redirected to login from favorites', async ({ page }) => {
    await page.goto('/favorites')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(TEST_EMAIL)
    await page.getByLabel(/password/i).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('signup page renders correctly', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i).first()).toBeVisible()
  })

  test('signup page shows password strength indicator', async ({ page }) => {
    await page.goto('/signup')
    const passwordInput = page.getByLabel(/password/i).first()
    await passwordInput.fill('weak')
    // Password strength indicator should appear
    await expect(page.locator('[class*="strength"], [class*="password"]')).toBeVisible()
  })
})
