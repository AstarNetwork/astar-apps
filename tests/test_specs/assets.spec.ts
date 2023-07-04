import { clickPolicyButton } from 'src/modules/playwright';
import { expect } from '@playwright/test';
import { test } from '../fixtures';
import {
  ALICE_ACCOUNT_NAME,
  ALICE_ACCOUNT_SEED,
  BOB_ACCOUNT_NAME,
  BOB_ACCOUNT_SEED,
  BOB_ADDRESS,
  closePolkadotWelcomePopup,
  connectToNetwork,
  createAccount,
  createMetamaskAccount,
  selectAccount,
  signTransaction,
} from '../common';
import { ApiPromise } from '@polkadot/api';
import { chainDecimals, getApi, getBalance } from '../common-api';

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

  test('account expander works', async ({ page }) => {
    await page.locator('.icon--expand').first().click();
    const transferButton = page.locator('#asset-expand').getByRole('button', { name: 'Transfer' });
    await expect(transferButton).toBeVisible();

    await page.locator('.icon--expand').first().click();
    await expect(transferButton).not.toBeVisible();
  });

  //AS001
  test('should transfer tokens from Alice to Bob', async ({ page, context }) => {
    const transferAmount = BigInt(1000);
    await page.locator('.icon--expand').first().click();
    await page.locator('#asset-expand').getByRole('button', { name: 'Transfer' }).click();

    await page.getByPlaceholder('Destination Address').fill(BOB_ADDRESS);
    await page.getByPlaceholder('0.0').fill(transferAmount.toString());
    await page.getByRole('button', { name: 'Confirm' }).click();

    const bobBalanceBeforeTransaction = await getBalance(BOB_ADDRESS);
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success')).toBeVisible();
    const bobBalanceAfterTransaction = await getBalance(BOB_ADDRESS);
    expect(bobBalanceAfterTransaction - bobBalanceBeforeTransaction).toEqual(
      transferAmount * BigInt(Math.pow(10, chainDecimals))
    );
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
