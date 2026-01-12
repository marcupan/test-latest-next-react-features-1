import { expect, test } from '@playwright/test'

test('should allow a user to log in', async ({ page }) => {
  await page.goto('/login')

  await page.fill('input[name="email"]', 'admin@example.com')
  await page.fill('input[name="password"]', 'Admin123!@#')

  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
})
