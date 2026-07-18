import { test, expect } from '@playwright/test';

test.describe('Basic Flow', () => {
  test('homepage loads and displays site title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PropertyHub/);
  });

  test('navigation to admin works', async ({ page }) => {
    await page.goto('/');
    await page.goto('/admin/login');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});