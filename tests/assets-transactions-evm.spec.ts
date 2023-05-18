import { clickPolicyButton } from 'src/modules/playwright';
import { expect } from '@playwright/test';
import { test } from './fixtures';
import {
  ALICE_ACCOUNT_NAME,
  ALICE_ACCOUNT_SEED,
  ALICE_ADDRESS,
  BOB_ACCOUNT_NAME,
  BOB_ACCOUNT_SEED,
  BOB_ADDRESS,
  closePolkadotWelcomePopup,
  connectToNetwork,
  createAccount,
  createMetamaskAccount,
  selectAccount,
  signTransaction,
  signTransactionWithEVM,
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
  await page.goto('/astar/assets');
  await clickPolicyButton(page);
  const closeButton = page.getByText('Polkadot.js');
  await closeButton.click();

  await closePolkadotWelcomePopup(context);
  await createAccount(page, ALICE_ACCOUNT_SEED, ALICE_ACCOUNT_NAME);
  await createAccount(page, BOB_ACCOUNT_SEED, BOB_ACCOUNT_NAME);
  await createMetamaskAccount(
    page,
    'bottom drive obey lake curtain smoke basket hold race lonely fit walk',
    'Test'
  );
  await page.goto('/astar/assets');
  await connectToNetwork(page);
});

test.describe('account panel', () => {
  // Test case: AS002
  test('should transfer tokens from Alice to Bob on EVM account', async ({ page, context }) => {
    //metamask setup
    await page.getByText('MetaMask').click();
    // await page.goto(
    //   'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html#onboarding/welcome'
    // );
    // await page.locator('data-test-id=unlock-password').fill('Test1234');
    // await page.getByRole('button').click();
    // await page.getByRole('button').click();
    // await page.getByRole('button').click();

    signTransactionWithEVM(context);

    //transfer test
    await page.waitForSelector('.modal-close', { state: 'hidden' });
    await expect(page.getByText('Select a Wallet')).toBeHidden();

    const transferAmount = BigInt(1000);
    await page.goto('/custom-node/assets/transfer?token=astr&mode=local');

    await page.getByPlaceholder('Destination Address').fill(BOB_ADDRESS);
    await page.getByPlaceholder('0.0').fill(transferAmount.toString());
    await expect(page.getByText('the funds will likely be lost')).toBeVisible();
    await expect(page.getByText('Insufficient')).toBeVisible();
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Invalid destination address
    await page.getByPlaceholder('Destination Address').fill('invalid address');
    await page.getByPlaceholder('0.0').fill(transferAmount.toString());
    await expect(page.getByText('Inputted invalid destination address')).toBeVisible();

    // Send to evm account
    const TEST_EVM_ADDRESS = '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B';
    await page.getByPlaceholder('Destination Address').fill(TEST_EVM_ADDRESS);
    await page.getByPlaceholder('0.0').fill(transferAmount.toString());
    await expect(page.getByText('the funds will likely be lost')).toBeHidden();

    // send transaction
    // const bobBalanceBeforeTransaction = await getBalance(BOB_ADDRESS);
    // await signTransaction(context);
    // await page.waitForSelector('.four', { state: 'hidden' });

    // await expect(page.getByText('Success')).toBeVisible();
    // const bobBalanceAfterTransaction = await getBalance(BOB_ADDRESS);
    // expect(bobBalanceAfterTransaction - bobBalanceBeforeTransaction).toEqual(
    //   transferAmount * BigInt(Math.pow(10, chainDecimals))
    // );
  });
});
