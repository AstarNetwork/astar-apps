import { test, expect } from '@playwright/test';
import { clickDisclaimerButton, checkInjectedWeb3 } from 'src/modules/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/astar/dapp-staking/discover');
});

test.describe('init screen', () => {
  test('should wallet is opened', async ({ page }) => {
    const walletWrapper = page.getByText('Select a Wallet');
    await expect(walletWrapper).toBeVisible();
  });
  test('should wallet is closed', async ({ page }) => {
    const walletWrapper = page.getByText('Select a Wallet');
    const closeButton = page.locator('.modal-close');
    await closeButton.click();
    await expect(walletWrapper).toBeHidden();
  });

  test('should display the connect button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'box icon Connect' })).toBeVisible();
  });

  test('should display the Astar button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Astar' })).toBeVisible();
  });

  test('should display install extension popup when click Talisman button', async ({ page }) => {
    await checkInjectedWeb3(page);
    const button = page.locator('div').filter({ hasText: 'Talisman' }).first();
    await expect(button).toBeVisible();
    await button.click();
  });
});

test.describe('on dapp staking screen', () => {
  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/Discover dApps/);
  });

  test('should clickable the banner after loading is complete', async ({ page }) => {
    await clickDisclaimerButton(page);
    const closeButton = page.locator('.modal-close');
    await closeButton.click();
    const bannerCard = page.locator('.wrapper--banners .card:first-child');
    await expect(bannerCard).toBeVisible();
    await page.waitForSelector('.loader', { state: 'hidden' });
    await bannerCard.click();
  });

  test('should redirect to dapp page when click the dapp card', async ({ page }) => {
    await clickDisclaimerButton(page);
    const closeButton = page.locator('.modal-close');
    await closeButton.click();
    await page.waitForSelector('.loader', { state: 'hidden' });
    const dappCard = page.locator('.wrapper--list .card:first-child').first();
    await expect(dappCard).toBeVisible();
    await dappCard.click();
    await page.waitForURL('**/astar/dapp-staking/dapp?dapp=*');
  });

  test('should display staking button when over the dapp card', async ({ page }) => {
    await clickDisclaimerButton(page);
    const closeButton = page.locator('.modal-close');
    await closeButton.click();
    await page.waitForSelector('.loader', { state: 'hidden' });
    const dappCard = page.locator('.wrapper--list .card:first-child').first();
    await expect(dappCard).toBeVisible();
    await dappCard.hover();
    const stakeButton = page.getByRole('button', { name: 'Stake Now' });
    await expect(stakeButton).toBeVisible();
  });

  test('should clickable item on the on chain data after loading is complete', async ({ page }) => {
    await clickDisclaimerButton(page);
    const closeButton = page.locator('.modal-close');
    await closeButton.click();
    await page.waitForSelector('.loader', { state: 'hidden' });
    const onChainCard = page
      .locator('.wrapper--onchain-data .column--dapp-name:first-child')
      .first();
    await expect(onChainCard).toBeVisible();
    await onChainCard.click();
  });
});
