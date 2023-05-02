import { expect } from '@playwright/test';
import {
  ALICE_ACCOUNT_NAME,
  ALICE_ACCOUNT_SEED,
  closePolkadotWelcomePopup,
  connectToNetwork,
  createAccount,
  selectAccount,
  signTransaction,
} from './common';
import { test } from './fixtures';
import { chainDecimals, getStakedAmount } from './common-api';

const TEST_DAPP_ADDRESS = '0x0000000000000000000000000000000000000001';

test.beforeEach(async ({ page, context }) => {
  await page.goto('/astar/dapp-staking/discover');

  // Close cookies popup
  await page.getByRole('button', { name: 'Accept' }).click();

  const closeButton = page.getByText('Polkadot.js');
  await closeButton.click();

  await closePolkadotWelcomePopup(context);
  await createAccount(page, ALICE_ACCOUNT_SEED, ALICE_ACCOUNT_NAME);
  await page.goto('/astar/dapp-staking/discover');
  await connectToNetwork(page);
});

test.describe('dApp staking transactions', () => {
  test('should be able to stake on test dApp', async ({ page, context }) => {
    const stakeAmount = BigInt(1000);
    await page.goto(`/custom-node/dapp-staking/stake?dapp=${TEST_DAPP_ADDRESS}`);
    await selectAccount(page, ALICE_ACCOUNT_NAME);
    await page.getByPlaceholder('0.0').fill(stakeAmount.toString());
    await page.getByRole('button', { name: 'Confirm' }).click();

    const stakedAmountBefore = await getStakedAmount(TEST_DAPP_ADDRESS);
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success', { exact: true })).toBeVisible();
    const stakedAmountAfter = await getStakedAmount(TEST_DAPP_ADDRESS);
    expect(stakedAmountAfter - stakedAmountBefore).toEqual(
      stakeAmount * BigInt(Math.pow(10, chainDecimals))
    );
  });
});
