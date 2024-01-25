import { clickDisclaimerButton } from 'src/modules/playwright';
import { BrowserContext, Page, expect } from '@playwright/test';
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
import { wait } from '@astar-network/astar-sdk-core';

let api: ApiPromise;
test.beforeAll(async () => {
  api = await getApi();
});

test.afterAll(async () => {
  await api.disconnect();
});

test.beforeEach(async ({ page, context }: { page: Page; context: BrowserContext }) => {
  await page.goto('/astar/dapp-staking/discover');

  // Close disclaimer popup
  await clickDisclaimerButton(page);
  const walletTab = page.getByTestId('select-wallet-tab');
  await walletTab.click();
  const polkadotJsButton = page.getByText('Polkadot.js');
  await polkadotJsButton.click();

  await closePolkadotWelcomePopup(context);
  await createAccount(page, BOB_ACCOUNT_SEED, BOB_ACCOUNT_NAME);
  await page.goto('/astar/dapp-staking/discover');
  await connectToNetwork(page);
  await page.waitForSelector('.four', { state: 'hidden' }); // Wait for the page to load
  await selectAccount(page, BOB_ACCOUNT_NAME);
});

test.describe('register dApp page', () => {
  test('validate builder image size', async ({ page }) => {
    await page
      .getByRole('link', {
        name: '🎉 Congrats!! your contract is approved. Please submit the details Register now',
      })
      .click();
    await page
      .locator('.builders--container > .card > .card--image > .slot > .card-new-item')
      .click();
    await page.getByLabel("Builder's image (maximum upload file size: 30KB)").isVisible();
    // Upload an image that is too large.
    await page
      .getByLabel("Builder's image (maximum upload file size: 30KB)")
      .setInputFiles('./tests/assets/invalid_developer_image.jpeg');
    // Image didn't show up on UI since it is too big. Add image button should be displayed.
    await expect(
      page.locator('.builders--container > .card > .card--image > .slot > .image')
    ).toBeHidden();
    // Upload a valid image.
    await page
      .getByLabel("Builder's image (maximum upload file size: 30KB)")
      .setInputFiles('./tests/assets/valid_developer_image.jpeg');
    // Check if image is displayed.
    await expect(
      page.locator('.builders--container > .card > .card--image > .image')
    ).toBeVisible();
  });
});
