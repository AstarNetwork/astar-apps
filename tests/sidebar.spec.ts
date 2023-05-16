import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/astar/assets');
});

test.describe('init screen', () => {
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
