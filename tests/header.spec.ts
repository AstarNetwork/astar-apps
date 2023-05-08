import { test, expect } from '@playwright/test';
import { clickPolicyButton } from 'src/modules/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/astar/assets');
});

test.describe('init screen', () => {
  test('has connection trouble', async ({ page }) => {
    await clickPolicyButton(page);
    const connectionTroubleButton = page.locator('.btn--help');
    await connectionTroubleButton.click();
    const connectionTroubleModal = page.locator('.wrapper--modal-connection-trouble');
    await expect(connectionTroubleModal).toBeVisible();
  });
});
