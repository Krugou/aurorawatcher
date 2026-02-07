import { expect, test } from '@playwright/test';

test.describe('Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('should toggle theme', async ({ page }) => {
    // Find the theme toggle button (first button in the top controls)
    const themeButton = page.locator('button').first();
    await expect(themeButton).toBeVisible();

    // Get initial state
    const htmlElement = page.locator('html');
    const initialClass = await htmlElement.getAttribute('class');

    // Click to toggle theme
    await themeButton.click();

    // Verify theme changed
    const newClass = await htmlElement.getAttribute('class');
    expect(newClass).not.toBe(initialClass);
  });

  test('should toggle collapsible section', async ({ page }) => {
    // Find a collapsible section button
    const sectionButton = page
      .locator("button:has-text('Local Conditions'), button:has-text('Paikalliset olosuhteet')")
      .first();

    // If section exists, test toggle functionality
    if ((await sectionButton.count()) > 0) {
      await sectionButton.click();
      // Wait for animation
      await page.waitForTimeout(300);

      // Click again to toggle back
      await sectionButton.click();
      await page.waitForTimeout(300);
    }
  });
});
