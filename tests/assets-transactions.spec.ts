import { clickDisclaimerButton } from 'src/modules/playwright';
import { expect } from '@playwright/test';
import { test } from './fixtures';
import {
  ALICE_ACCOUNT_NAME,
  ALICE_ACCOUNT_SEED,
  ALICE_ADDRESS,
  ALICE_EVM_ADDRESS,
  BOB_ACCOUNT_NAME,
  BOB_ACCOUNT_SEED,
  BOB_ADDRESS,
  closePolkadotWelcomePopup,
  connectToNetwork,
  createAccount,
  createMetamaskAccount,
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
  // TODO consider moving this into beforeAll
  await page.goto('/astar/assets');
  await clickDisclaimerButton(page);
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
  // Test case: AS001
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

  // Test case: AS004
  test('should perform validation when tokens from Alice to Bob', async ({ page }) => {
    const baseTransferAmount = BigInt(1000);
    await page.locator('.icon--expand').first().click();
    await page.locator('#asset-expand').getByRole('button', { name: 'Transfer' }).click();

    const aliceBalanceBeforeTransaction = await getBalance(ALICE_ADDRESS);
    await page.getByPlaceholder('Destination Address').fill(BOB_ADDRESS);

    // Insufficient balance
    const transferAmount = aliceBalanceBeforeTransaction + baseTransferAmount;
    await page.getByPlaceholder('0.0').fill(transferAmount.toString());
    await expect(page.getByText('Insufficient')).toBeVisible();

    // Invalid destination address
    await page.getByPlaceholder('Destination Address').fill('invalid address');
    await page.getByPlaceholder('0.0').fill(baseTransferAmount.toString());
    await expect(page.getByText('Inputted invalid destination address')).toBeVisible();

    // Send to exchanges warning is shown on Native
    const TEST_EVM_ADDRESS = '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B';
    await page.getByPlaceholder('Destination Address').fill(TEST_EVM_ADDRESS);
    await page.getByPlaceholder('0.0').fill(baseTransferAmount.toString());
    await expect(page.getByText('the funds will likely be lost')).toBeVisible();
  });

  // Test case: AS004
  test('should transfer tokens when tokens from Alice to Alice EVM account', async ({
    page,
    context,
  }) => {
    await page.locator('.icon--expand').first().click();
    await page.locator('#asset-expand').getByRole('button', { name: 'Transfer' }).click();
    const faucetAmount = BigInt(200);
    await page.getByPlaceholder('Destination Address').fill(ALICE_EVM_ADDRESS);
    await page.getByPlaceholder('0.0').fill(faucetAmount.toString());
    await page.locator('.box--warning label').check();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });
    await expect(page.getByText('Success')).toBeVisible();
  });

  // Test case: XCM007
  test('should perform validation when xcm transfer from Alice to Bob', async ({ page }) => {
    await page.goto('/astar/assets/transfer?token=astr&from=astar&to=acala&mode=xcm');
    await connectToNetwork(page);
    await selectAccount(page, ALICE_ACCOUNT_NAME);

    const baseTransferAmount = BigInt(5);
    const lowerTransferAmount = BigInt(3);
    const aliceBalanceBeforeTransaction = await getBalance(ALICE_ADDRESS);

    // Insufficient balance
    const transferAmount = aliceBalanceBeforeTransaction + baseTransferAmount;
    await page.getByPlaceholder('0.0').fill(transferAmount.toString());
    await expect(page.getByText('Insufficient')).toBeVisible();

    // Invalid minimum transfer amount
    await page.getByPlaceholder('0.0').fill(lowerTransferAmount.toString());
    await expect(page.getByText('Minimum transfer amount')).toBeVisible();
  });
});
