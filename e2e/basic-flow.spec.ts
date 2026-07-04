import { test, expect } from '@playwright/test';

test.describe('Basic Flow', () => {
  test('homepage loads and displays listings section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Himalayan Crest Realty/);
    await expect(page.getByRole('heading', { name: /Properties/i })).toBeVisible();
  });

  test('search filter works', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('select[name="location"]', 'Mall Road');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('select[name="location"]')).toHaveValue('Mall Road');
  });

  test('navigation to admin works', async ({ page }) => {
    await page.goto('/');
    await page.goto('/admin/login');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});