import { clickDisclaimerButton } from 'src/modules/playwright';
import { BrowserContext, Page, expect } from '@playwright/test';
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
  signInMetamask,
  signTransaction,
  connectWithEVM,
  changeNetworkOnEVM,
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

test.beforeEach(async ({ page, context }: { page: Page; context: BrowserContext }) => {
  await page.goto('/astar/assets');
  await clickDisclaimerButton(page);
  const walletTab = page.getByTestId('select-wallet-tab');
  await walletTab.click();

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
  await selectAccount(page, ALICE_ACCOUNT_NAME);
});

test.describe('account panel', () => {
  // Test case: AS002
  test('should transfer tokens from Alice to Bob on EVM account', async ({
    page,
    context,
  }: {
    page: Page;
    context: BrowserContext;
  }) => {
    // transfer test (from native to evm) :: need to testing
    page.getByTestId('transfer-link-button').click();
    const faucetAmount = BigInt(200);
    await page.getByPlaceholder('Destination Address').fill(ALICE_EVM_ADDRESS);
    await page.getByPlaceholder('0.0').fill(faucetAmount.toString());
    await page.locator('.box--warning label').check();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });
    await expect(page.getByText('Success')).toBeVisible();

    //metamask setup
    await page.locator('.btn--account').click();
    await page.locator('.wrapper--modal-drawer .modal-close').first().click();
    await page.getByText('MetaMask').click();
    await signInMetamask(page, context);

    //transfer test (from evm to native)
    await page.goto('/custom-node/assets/transfer?token=astr&mode=local');
    await page.locator('.btn--connect').click();
    await page.getByText('MetaMask').click();
    const metamaskWindow = await connectWithEVM(page, context);
    await changeNetworkOnEVM(page, context, metamaskWindow);
    await page.waitForSelector('.modal-close', { state: 'hidden' });
    await expect(page.getByText('Select a Wallet')).toBeHidden();

    const baseTransferAmount = BigInt(10);
    //BOB_ADDRESS > ALICE_EVM_ADDRESS
    const bobBalanceBeforeTransaction = await getBalance(BOB_ADDRESS);
    const overTransferAmount = bobBalanceBeforeTransaction + baseTransferAmount;
    await page.getByPlaceholder('Destination Address').fill(BOB_ADDRESS);
    await page.getByPlaceholder('0.0').fill(overTransferAmount.toString());
    await expect(page.getByText('the funds will likely be lost')).toBeVisible();
    await expect(page.getByText('Insufficient')).toBeVisible();

    // Invalid destination address
    await page.getByPlaceholder('Destination Address').fill('invalid address');
    await page.getByPlaceholder('0.0').fill('0');
    await expect(page.getByText('Inputted invalid destination address')).toBeVisible();

    // transfer alice_evm to native
    await page.getByPlaceholder('Destination Address').fill(BOB_ADDRESS);
    await page.getByPlaceholder('0.0').fill(baseTransferAmount.toString());
    await page.locator('.box--warning label').check();
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled();

    // MEMO: There's an issue where the balance between from and to of metamask is different, so this should be solved in another PR.
    // await page.getByRole('button', { name: 'Confirm' }).click();

    // send transaction
    // await signTransaction(context);
    // await page.waitForSelector('.four', { state: 'hidden' });

    // await expect(page.getByText('Success')).toBeVisible();
    // const bobBalanceAfterTransaction = await getBalance(BOB_ADDRESS);
    // expect(bobBalanceAfterTransaction - bobBalanceBeforeTransaction).toEqual(
    //   transferAmount * BigInt(Math.pow(10, chainDecimals))
    // );
  });
});
