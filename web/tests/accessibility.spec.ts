import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    test.setTimeout(60_000);
    await page.route('**/*', async (route) => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.hostname === 'localhost') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: {
          'access-control-allow-origin': 'http://localhost:3005',
          'access-control-allow-credentials': 'true',
        },
        body: '{}',
      });
    });
    await page.goto('/');
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {
      console.log('Network idle timeout');
    }

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (results.violations.length > 0) {
      fs.writeFileSync(
        path.resolve(process.cwd(), 'violations.json'),
        JSON.stringify(results.violations, null, 2),
      );
    }
    expect(results.violations).toEqual([]);
  });
});
