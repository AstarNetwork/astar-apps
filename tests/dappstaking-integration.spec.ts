import { test, expect } from '@playwright/test';
import {
  ALICE_ACCOUNT_NAME,
  ALICE_ACCOUNT_SEED,
  BOB_ACCOUNT_NAME,
  BOB_ACCOUNT_SEED,
  BOB_ADDRESS,
  closePolkadotWelcomePopup,
  connectToNetwork,
  createAccount,
  selectAccount,
  signTransaction,
} from './common';
import { ApiPromise } from '@polkadot/api';
import { chainDecimals, getApi, getBalance } from './common-api';

let api: ApiPromise;
test.beforeAll(async () => {
  api = await getApi();
});

test.afterAll(async () => {
  await api.disconnect();
});

test.beforeEach(async ({ page, context }) => {
  await page.goto('/astar/dapp-staking/discover');

  const closeButton = page.getByText('Polkadot.js');
  await closeButton.click();

  await closePolkadotWelcomePopup(context);
  await createAccount(page, ALICE_ACCOUNT_SEED, ALICE_ACCOUNT_NAME);
  await createAccount(page, BOB_ACCOUNT_SEED, BOB_ACCOUNT_NAME);
  await selectAccount(page, ALICE_ACCOUNT_NAME);
  await connectToNetwork(page);

  // Close cookies popup
  await page.getByRole('button', { name: 'Accept' }).click();
});

test.describe('on dapp staking screen', () => {
  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/Discover dApps/);
  });

  test('should clickable the banner after loading is complete', async ({ page }) => {
    const closeButton = page.getByText('×');
    await closeButton.click();
    const bannerCard = page.locator('.wrapper--banners .card:first-child');
    await expect(bannerCard).toBeVisible();
    await page.waitForSelector('.loader', { state: 'hidden' });
    await bannerCard.click();
  });

  test('should redirect to dapp page when click the dapp card', async ({ page }) => {
    const closeButton = page.getByText('×');
    await closeButton.click();
    await page.waitForSelector('.loader', { state: 'hidden' });
    const dappCard = page.locator('.wrapper--list .card:first-child').first();
    await expect(dappCard).toBeVisible();
    await dappCard.click();
    await page.waitForURL('**/astar/dapp-staking/dapp?dapp=*');
  });
});
