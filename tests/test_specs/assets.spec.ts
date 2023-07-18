import { expect } from '@playwright/test';
import { ApiPromise } from '@polkadot/api';
import { clickPolicyButton } from 'src/modules/playwright';
import {
  ALICE_ACCOUNT_NAME,
  ALICE_ACCOUNT_SEED,
  BOB_ACCOUNT_NAME,
  BOB_ACCOUNT_SEED,
  closePolkadotWelcomePopup,
  connectToNetwork,
  createAccount,
  createMetamaskAccount,
  selectAccount,
  selectMultisigAccount,
} from '../common';
import { getApi } from '../common-api';
import { test } from '../fixtures';

let api: ApiPromise;
test.beforeAll(async () => {
  api = await getApi();
});

test.afterAll(async () => {
  await api.disconnect();
});

test.beforeEach(async ({ page, context }) => {
  // TODO consider moving this into beforeAll
  await page.goto('/astar/assets');
  await clickPolicyButton(page);
  const closeButton = page.getByText('Polkadot.js');
  await closeButton.click();

  await closePolkadotWelcomePopup(context);
  await createAccount(page, ALICE_ACCOUNT_SEED, ALICE_ACCOUNT_NAME);
  await createAccount(page, BOB_ACCOUNT_SEED, BOB_ACCOUNT_NAME);
  await page.goto('/astar/assets');
  await connectToNetwork(page);
  await selectAccount(page, ALICE_ACCOUNT_NAME);
});

test.describe('account panel', () => {
  test('should copy wallet address', async ({ page }) => {
    await page.locator('#copyAddress').click();
    await expect(page.locator('.noti-content')).toBeVisible();
  });

  test('should copy multisig wallet address', async ({ page, context }) => {
    await selectMultisigAccount(page, context, false);
    await page.locator('#copyAddress').click();
    await expect(page.locator('.noti-content')).toBeVisible();
  });

  test('should copy multisig proxy wallet address', async ({ page, context }) => {
    await selectMultisigAccount(page, context, true);
    await page.locator('#copyAddress').click();
    await expect(page.locator('.noti-content')).toBeVisible();
  });

  test('account expander works', async ({ page }) => {
    await page.locator('.icon--expand').first().click();
    const transferButton = page.locator('#asset-expand').getByRole('button', { name: 'Transfer' });
    await expect(transferButton).toBeVisible();

    await page.locator('.icon--expand').first().click();
    await expect(transferButton).not.toBeVisible();
  });

  test('EVM sample', async ({ page }) => {
    await createMetamaskAccount(
      page,
      'bottom drive obey lake curtain smoke basket hold race lonely fit walk',
      'Test'
    );
    await page.goto('/astar/assets');
  });
});
