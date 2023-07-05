import { BrowserContext, Page } from '@playwright/test';
import { test } from '../fixtures';
import {
  BOB_ACCOUNT_NAME,
  BOB_ACCOUNT_SEED,
  closePolkadotWelcomePopup,
  connectToNetwork,
  createAccount,
  selectAccount,
} from '../common';
import { ApiPromise } from '@polkadot/api';
import { getApi } from '../common-api';

let api: ApiPromise;
test.beforeAll(async () => {
  api = await getApi();
});

test.afterAll(async () => {
  await api.disconnect();
});

test.beforeEach(async ({ page, context }: { page: Page; context: BrowserContext }) => {
  await page.goto('/astar/dapp-staking/discover');

  // Close cookies popup
  await page.getByRole('button', { name: 'Accept' }).click();

  const polkadotButton = page.getByText('Polkadot.js');
  await polkadotButton.click();

  await closePolkadotWelcomePopup(context);
  await createAccount(page, BOB_ACCOUNT_SEED, BOB_ACCOUNT_NAME);
  await page.goto('/astar/dapp-staking/discover');
  await connectToNetwork(page);
  await page.waitForSelector('.four', { state: 'hidden' }); // Wait for the page to load
  await selectAccount(page, BOB_ACCOUNT_NAME);
});

test.describe('register dApp page', () => {
  test('validate builder image size', async ({ page }) => {
    // await page.goto('/custom-node/dapp-staking/discover');
    // await selectAccount(page, BOB_ACCOUNT_NAME);
    await page.getByRole('link', { name: '🎉 Congrats!! your contract is approved. Please submit the details Register now' }).click();
    await page.locator('.builders--container > .card > .card--image > .slot > .card-new-item').click();
    await page.getByLabel('Builder\'s image (maximum upload file size: 30KB)').isVisible();
  });
});
