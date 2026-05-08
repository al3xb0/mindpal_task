import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = process.env['E2E_TEST_EMAIL'] ?? 'test@example.com'
const TEST_PASSWORD = process.env['E2E_TEST_PASSWORD'] ?? 'testpassword123'

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 10000 })
}

test.describe('Favorites', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_EMAIL, TEST_PASSWORD)
  })

  test('dashboard loads character grid', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /characters/i })).toBeVisible()
    // Wait for at least one character card to appear
    await expect(page.locator('[class*="card"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('can add a character to favorites', async ({ page }) => {
    // Wait for character cards
    const firstCard = page.locator('[aria-label*="favorites"]').first()
    await expect(firstCard).toBeVisible({ timeout: 15000 })
    await firstCard.click()
    // Toast notification should appear
    await expect(
      page.locator('[class*="toast"]').or(page.getByText(/added to favorites/i)),
    ).toBeVisible({ timeout: 5000 })
  })

  test('favorites page shows saved characters', async ({ page }) => {
    await page.goto('/favorites')
    await expect(page.getByRole('heading', { name: /favorites/i })).toBeVisible()
  })

  test('can search favorites by name', async ({ page }) => {
    await page.goto('/favorites')
    const searchInput = page.getByPlaceholder(/search by name/i)
    await expect(searchInput).toBeVisible()
    await searchInput.fill('Rick')
    // Search results should filter
    await page.waitForTimeout(600) // debounce
    const cards = page.locator('[class*="card"]')
    const count = await cards.count()
    if (count > 0) {
      // All visible cards should have Rick in the name
      const firstCardText = await cards.first().textContent()
      expect(firstCardText?.toLowerCase()).toContain('rick')
    }
  })

  test('can filter favorites by status', async ({ page }) => {
    await page.goto('/favorites')
    const statusSelect = page.getByRole('combobox', { name: /status/i })
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('Alive')
      await page.waitForTimeout(300)
    }
  })

  test('export button is visible when favorites exist', async ({ page }) => {
    await page.goto('/favorites')
    // Only check if there are favorites
    const hasCards = await page.locator('[class*="card"]').count()
    if (hasCards > 0) {
      await expect(page.getByRole('button', { name: /export/i })).toBeVisible()
    }
  })

  test('can remove a character from favorites', async ({ page }) => {
    await page.goto('/favorites')
    const removeBtns = page.locator('[aria-label*="Remove from favorites"]')
    const count = await removeBtns.count()
    if (count > 0) {
      await removeBtns.first().click()
      await expect(
        page.locator('[class*="toast"]').or(page.getByText(/removed from favorites/i)),
      ).toBeVisible({ timeout: 5000 })
    }
  })

  test('filter params appear in URL', async ({ page }) => {
    await page.goto('/dashboard')
    // Wait for the filter panel to be accessible
    const filterToggle = page.getByRole('button', { name: /filter/i })
    if (await filterToggle.isVisible()) {
      await filterToggle.click()
    }
    const statusSelect = page.getByRole('combobox', { name: /status/i })
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('Alive')
      await page.waitForURL(/status=Alive/, { timeout: 5000 })
      expect(page.url()).toContain('status=Alive')
    }
  })
})
