import { test, expect } from '@playwright/test';
import { clickDisclaimerButton, checkInjectedWeb3 } from 'src/modules/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/astar/dapp-staking/discover');
});

test.describe('init screen', () => {
  test.beforeEach(async ({ page }) => {
    await clickDisclaimerButton(page);
  });

  test('check if wallet modal is opened', async ({ page }) => {
    await page.getByRole('button', { name: 'Select Wallet' }).click();
    const walletWrapper = page.getByTestId('wallet-select');
    await expect(walletWrapper).toBeVisible();
  });

  test('check if wallet modal is closed after close button is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Select Wallet' }).click();
    const walletWrapper = page.getByTestId('wallet-select');
    const closeButton = page.locator('.modal-close');
    await closeButton.click();
    await expect(walletWrapper).toBeHidden();
  });

  // test('should display the connect button', async ({ page }) => {
  //   await expect(page.getByRole('button', { name: 'box icon Connect' })).toBeVisible();
  // });

  // test('should display the Astar button', async ({ page }) => {
  //   await expect(page.getByRole('button', { name: 'Astar' })).toBeVisible();
  // });

  test('should display install extension popup when click Talisman button', async ({ page }) => {
    await checkInjectedWeb3(page);
    const button = page.locator('div').filter({ hasText: 'Talisman' }).first();
    await expect(button).toBeVisible();
    await button.click();
  });
});

test.describe('on dapp staking screen', () => {
  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/Astar Portal - Astar & Shiden Network/);
  });

  test('should have a clickable banner after loading is complete', async ({ page }) => {
    await clickDisclaimerButton(page);
    const closeButton = page.locator('.modal-close');
    await closeButton.click();
    const bannerCard = page.getByTestId('staking-banner-card').first();
    await expect(bannerCard).toBeVisible();
    await page.waitForSelector('.loader', { state: 'hidden' });
    await bannerCard.click();
  });

  test('should redirect to dapp page when click the dapp card', async ({ page }) => {
    await clickDisclaimerButton(page);
    const closeButton = page.locator('.modal-close');
    await closeButton.click();
    await page.waitForSelector('.loader', { state: 'hidden' });
    const dappCard = page.getByTestId('single-dapp').first();
    await expect(dappCard).toBeVisible();
    await dappCard.click();
    await page.waitForURL('**/astar/dapp-staking/dapp?dapp=*');
  });
});
