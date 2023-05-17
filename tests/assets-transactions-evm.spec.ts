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
  test('should transfer tokens from Alice to Bob on EVM account', async ({ page }) => {
    await page.getByText('MetaMask').click();
  });
});
