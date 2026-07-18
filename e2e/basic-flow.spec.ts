import { test, expect } from '@playwright/test';

test.describe('Basic Flow', () => {
  test('homepage loads and displays listings section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PropertyHub/);
    await expect(page.getByRole('heading', { name: 'Featured Properties' })).toBeVisible();
  });

  test('navigation to admin works', async ({ page }) => {
    await page.goto('/');
    await page.goto('/admin/login');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});