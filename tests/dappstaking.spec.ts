import { test, expect } from '@playwright/test';
import { checkPolicyInLocalStorage, checkInjectedWeb3 } from 'src/modules/playwright';

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
  test('should private policy is opened unless accept the policy', async ({ page }) => {
    await checkPolicyInLocalStorage(page);

    const privatePolicy = page
      .getByRole('alert')
      .getByRole('link', { name: 'privacy policy page.' });
    await expect(privatePolicy).toBeVisible();
  });

  test('should hide the private policy after accept the policy', async ({ page }) => {
    await checkPolicyInLocalStorage(page);

    const privatePolicy = page
      .getByRole('alert')
      .getByRole('link', { name: 'privacy policy page.' });
    await expect(privatePolicy).toBeVisible();
    await page.click('button:has-text("Accept")');
    await expect(privatePolicy).not.toBeVisible();
  });

  test('should display the connect button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'box icon Connect' })).toBeVisible();
  });

  test('should display the Astar Network button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Astar Network' })).toBeVisible();
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
    const closeButton = page.locator('.modal-close');
    await closeButton.click();
    const bannerCard = page.locator('.wrapper--banners .card:first-child');
    await expect(bannerCard).toBeVisible();
    await page.waitForSelector('.loader', { state: 'hidden' });
    await bannerCard.click();
  });

  test('should redirect to dapp page when click the dapp card', async ({ page }) => {
    const closeButton = page.locator('.modal-close');
    await closeButton.click();
    await page.waitForSelector('.loader', { state: 'hidden' });
    const dappCard = page.locator('.wrapper--list .card:first-child').first();
    await expect(dappCard).toBeVisible();
    await dappCard.click();
    await page.waitForURL('**/astar/dapp-staking/dapp?dapp=*');
  });

  test('should display staking button when over the dapp card', async ({ page }) => {
    const closeButton = page.locator('.modal-close');
    await closeButton.click();
    await page.waitForSelector('.loader', { state: 'hidden' });
    const dappCard = page.locator('.wrapper--list .card:first-child').first();
    await expect(dappCard).toBeVisible();
    await dappCard.hover();
    const stakeButton = page.getByRole('button', { name: 'Stake Now' });
    await expect(stakeButton).toBeVisible();
  });
});

//https://api.astar.network/api/v1/astar/dapps-staking/dapps
// test.describe('api testing', () => {
//   test('should get dapps list', async ({ request }) => {
//     const dapps = await request.get('https://api.astar.network/api/v1/astar/dapps-staking/dapps');
//     expect(dapps.ok()).toBeTruthy();
//     expect(await dapps.json()).toContainEqual(
//       expect.objectContaining({
//         name: 'AstridDAO',
//       })
//     );
//   });
// });
