import { expect, test } from '@playwright/test';

const solarWind = [
  ['time_tag', 'speed', 'density', 'bx', 'by', 'bz', 'bt'],
  ['2026-10-31 16:00:00.000', '600', '5', '0', '0', '-8', '9'],
];
const kpIndex = [{ time_tag: '2026-10-31T16:00:00', kp_index: 6, estimated_kp: 6.0 }];

test.describe('Whole site', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/services.swpc.noaa.gov/**', (route) =>
      route.fulfill({
        json: route.request().url().includes('planetary_k_index') ? kpIndex : solarWind,
      }),
    );
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('renders the main title, verdict card and all sections', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#aurora-verdict-title')).toBeVisible();
    expect(await page.locator('section, [id]').count()).toBeGreaterThan(5);
    await expect(page.locator('button[aria-expanded]').first()).toBeVisible();
  });

  test('every collapsible section toggles aria-expanded', async ({ page }) => {
    const buttons = page.locator('button[aria-expanded][aria-controls]');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(5);
    for (let i = 0; i < count; i += 1) {
      const button = buttons.nth(i);
      const before = await button.getAttribute('aria-expanded');
      await button.click();
      await expect(button).not.toHaveAttribute('aria-expanded', before ?? '');
    }
  });

  test('language switch changes the visible language', async ({ page }) => {
    const before = await page.locator('h1').innerText();
    await page.locator('.language-button').click();
    await expect(page.locator('h1')).not.toHaveText(before);
  });

  test('verdict card reflects storm conditions and buttons navigate', async ({ page }) => {
    await expect(page.locator('#aurora-verdict-title')).toHaveText(/go|mene/i);
    await page
      .getByRole('button', { name: /graphs|kuvaajat/i })
      .first()
      .click();
    await expect(page.locator('#graphs')).toBeVisible();
  });

  test('has no uncaught page errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.reload();
    await page.waitForTimeout(1500);
    expect(errors).toEqual([]);
  });
});
