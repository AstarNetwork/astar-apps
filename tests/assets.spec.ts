import { test, expect, Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/astar/assets');
});

test('should wallet is opened', async ({ page }) => {
  const walletWrapper = page.getByText('Select a Wallet');
  await expect(walletWrapper).toBeVisible();
});

// test.describe('init screen', () => {
//   //@TODO
// });
