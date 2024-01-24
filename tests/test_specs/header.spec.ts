import { test, expect } from '@playwright/test';
import { clickDisclaimerButton } from 'src/modules/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/astar/assets');
});

test.describe('init screen', () => {
  test('has connection trouble', async ({ page }) => {
    await clickDisclaimerButton(page);
    const connectionTroubleButton = page.locator('.btn--help');
    await connectionTroubleButton.click();
    const connectionTroubleModal = page.locator('.wrapper--modal-connection-trouble');
    await expect(connectionTroubleModal).toBeVisible();
  });
  test('has wallet installation UI', async ({ page }) => {
    await clickDisclaimerButton(page);
    const walletTab = page.getByTestId('select-wallet-tab');
    await walletTab.click();
    const clover = page.locator('text=Clover');
    await clover.click();
    const boxNoExtension = page.locator('.box--no-extension');
    await expect(boxNoExtension).toBeVisible();
  });
});
