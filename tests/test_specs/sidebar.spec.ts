import { test, expect } from '@playwright/test';
import { clickDisclaimerButton } from 'src/modules/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/astar/assets');
});

test.describe('init screen', () => {
  test('click the dapp staking page', async ({ page }) => {
    const dappStakingButton = page.getByTestId('dapp-staking');
    await dappStakingButton.click();
    await expect(page).toHaveURL('astar/dapp-staking/discover');
  });

  test('Selected language should be stored in localStorage', async ({ page }) => {
    await clickDisclaimerButton(page);
    await page.getByText('box icon Settings').click();
    await page.getByText('English').click();
    await page.getByText('日本語').click();
    const selectedLanguage = await page.evaluate(() => {
      return localStorage.getItem('selectedLanguage');
    });
    expect(selectedLanguage).toBe('ja');
  });
});
