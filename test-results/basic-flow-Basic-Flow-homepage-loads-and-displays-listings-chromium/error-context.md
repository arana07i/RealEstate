# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: basic-flow.spec.ts >> Basic Flow >> homepage loads and displays listings
- Location: e2e\basic-flow.spec.ts:4:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Properties"
Received string:    "Where Mountain Living Meets Timeless Elegance"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    13 × locator resolved to <h1 class="max-w-2xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">Where Mountain Living Meets Timeless Elegance</h1>
       - unexpected value "Where Mountain Living Meets Timeless Elegance"

```

```yaml
- heading "Where Mountain Living Meets Timeless Elegance" [level=1]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Basic Flow', () => {
  4  |   test('homepage loads and displays listings', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await expect(page).toHaveTitle(/Himalayan Crest Realty/);
> 7  |     await expect(page.locator('h1')).toContainText('Properties');
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  8  |   });
  9  | 
  10 |   test('search filter works', async ({ page }) => {
  11 |     await page.goto('/');
  12 |     await page.selectOption('select[name="location"]', 'Mall Road');
  13 |     await page.click('button[type="submit"]');
  14 |     await page.waitForLoadState('networkidle');
  15 |     await expect(page.locator('select[name="location"]')).toHaveValue('Mall Road');
  16 |   });
  17 | 
  18 |   test('listing detail page loads', async ({ page }) => {
  19 |     await page.goto('/');
  20 |     const listingCard = page.locator('a[href^="/listings/"]').first();
  21 |     if (await listingCard.count() > 0) {
  22 |       await listingCard.click();
  23 |       await expect(page).toHaveURL(/\/listings\/.+/);
  24 |     }
  25 |   });
  26 | });
```