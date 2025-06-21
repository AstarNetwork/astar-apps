import { clickDisclaimerButton } from 'src/modules/playwright';
import { BrowserContext, Page, expect } from '@playwright/test';
import { test } from '../fixtures';
import {
  ALICE_ACCOUNT_NAME,
  ALICE_ACCOUNT_SEED,
  BOB_ACCOUNT_NAME,
  BOB_ACCOUNT_SEED,
  closePolkadotWelcomePopup,
  connectToNetwork,
  createAccount,
  selectAccount,
} from '../common';

test.beforeEach(async ({ page, context }: { page: Page; context: BrowserContext }) => {
  await page.goto('/astar/dapp-staking/discover');

  // Close disclaimer popup
  await clickDisclaimerButton(page);
  const walletTab = page.getByTestId('select-wallet-tab');
  await walletTab.click();
  const polkadotJsButton = page.getByText('Polkadot.js');
  await polkadotJsButton.click();

  await closePolkadotWelcomePopup(context);
  await createAccount(page, ALICE_ACCOUNT_SEED, ALICE_ACCOUNT_NAME);
  await createAccount(page, BOB_ACCOUNT_SEED, BOB_ACCOUNT_NAME);
  await page.goto('/astar/assets');
  await connectToNetwork(page);
  await page.waitForSelector('.four', { state: 'hidden' }); // Wait for the page to load
  await selectAccount(page, BOB_ACCOUNT_NAME, context);
});

test.describe('register dApp page', () => {
  test('validate builder image size', async ({ page }) => {
    await page.getByTestId('register-dapp-banner').click();
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
