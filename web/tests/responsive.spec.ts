import { expect, test } from '@playwright/test';

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForLoadState('domcontentloaded');
  });

  test('should display key elements on desktop', async ({ page, isMobile }) => {
    if (isMobile) test.skip();
    // Check header is visible
    await expect(page.locator('header')).toBeVisible();
    // Check h1 title exists
    await expect(page.locator('h1')).toBeVisible();
    // Check theme toggle button exists
    await expect(page.locator('button').first()).toBeVisible();
  });

  test('should adapt layout for mobile', async ({ page, isMobile }) => {
    if (!isMobile) test.skip();
    // Check header is visible on mobile
    await expect(page.locator('header')).toBeVisible();
    // Check content container is visible
    await expect(page.locator('h1')).toBeVisible();
  });
});
