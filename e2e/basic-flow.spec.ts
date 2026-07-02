import { test, expect } from '@playwright/test';

test.describe('Basic Flow', () => {
  test('homepage loads and displays listings section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Himalayan Crest Realty/);
    await expect(page.locator('h2')).toContainText('Properties');
  });

  test('search filter works', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('select[name="location"]', 'Mall Road');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('select[name="location"]')).toHaveValue('Mall Road');
  });

  test('listing detail page loads', async ({ page }) => {
    await page.goto('/');
    const listingCard = page.locator('a[href^="/listings/"]').first();
    if (await listingCard.count() > 0) {
      await listingCard.click();
      await expect(page).toHaveURL(/\/listings\/.+/);
    }
  });
});