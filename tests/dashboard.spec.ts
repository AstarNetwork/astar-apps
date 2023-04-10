import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/astar/dashboard');
});

test.describe('on dashboard screen', () => {
  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/Dashboard/);
  });
});
