import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    try {
      await page.waitForLoadState('networkidle');
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
