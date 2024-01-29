import { test, expect } from '@playwright/test';
import { clickDisclaimerButton, checkInjectedWeb3 } from 'src/modules/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/astar/dapp-staking/discover');
});

test.describe('init screen', () => {
  test('should wallet is opened', async ({ page }) => {
    await clickDisclaimerButton(page);
    await page.getByRole('button', { name: 'Select Wallet' }).click();
    await expect(page.getByTestId('Polkadot.js')).toBeVisible();
  });
  test('should wallet is closed', async ({ page }) => {
    const walletWrapper = page.getByText('Select a Wallet');
    const closeButton = page.locator('.modal-close');
    await closeButton.click();
    await expect(walletWrapper).toBeHidden();
  });

  test('should display the connect button', async ({ page }) => {
    await clickDisclaimerButton(page);
    await expect(page.getByRole('button', { name: 'Select Wallet' })).toBeEnabled();
  });

  test('should display install extension message when click Talisman button', async ({ page }) => {
    await clickDisclaimerButton(page);
    await page.getByRole('button', { name: 'Select Wallet' }).click();
    await page.getByTestId('Talisman (Native)').click();
    await expect(
      page.getByText(
        "Haven’t got Talisman (Native) yet?You'll need to install Talisman (Native) to"
      )
    ).toBeVisible();
  });
});

test.describe('on dapp staking screen', () => {
  test('has title', async ({ page }) => {
    await clickDisclaimerButton(page);
    await expect(page).toHaveTitle(/Discover dApps/);
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
