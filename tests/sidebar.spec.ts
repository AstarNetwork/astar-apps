import { test, expect } from '@playwright/test';
import { clickPolicyButton } from 'src/modules/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/astar/assets');
});

test.describe('init screen', () => {
  test('has connection trouble', async ({ page }) => {
    await clickPolicyButton(page);
    const connectionTroubleButton = page.getByText('Connection Trouble');
    await connectionTroubleButton.click();
    const connectionTroubleModal = page.locator('.wrapper--modal-connection-trouble');
    await expect(connectionTroubleModal).toBeVisible();
  });

  test('click the dapp staking page', async ({ page }) => {
    const dappStakingButton = page.locator('a:has-text("dApp Staking")');
    await dappStakingButton.click();
    await expect(page).toHaveURL('astar/dapp-staking/discover');
  });

  test('Selected language should be stored in localStorage', async ({ page }) => {
    await page.selectOption('.select-language', { value: 'ja' });
    const selectedLanguage = await page.evaluate(() => {
      return localStorage.getItem('selectedLanguage');
    });
    expect(selectedLanguage).toBe('ja');
  });
});
