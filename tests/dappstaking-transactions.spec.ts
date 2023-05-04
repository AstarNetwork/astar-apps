import { expect } from '@playwright/test';
import {
  ALICE_ACCOUNT_NAME,
  ALICE_ACCOUNT_SEED,
  ALICE_ADDRESS,
  closePolkadotWelcomePopup,
  connectToNetwork,
  createAccount,
  selectAccount,
  signTransaction,
} from './common';
import { test } from './fixtures';
import { chainDecimals, getBalance, getStakedAmount } from './common-api';

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
  // Test case: DS001, DS002
  test('should be able to stake on test dApp', async ({ page, context }) => {
    const stakeAmount = BigInt(1000);
    await page.goto(`/custom-node/dapp-staking/stake?dapp=${TEST_DAPP_ADDRESS}`);
    await selectAccount(page, ALICE_ACCOUNT_NAME);
    const balance = await getBalance(ALICE_ADDRESS) / BigInt(Math.pow(10, chainDecimals));

    // Test edge cases
    await page.getByPlaceholder('0.0').fill((balance - BigInt(5)).toString());
    await expect(
      page
        .locator('div')
        .filter({
          hasText: /^Account must hold greater than 10ASTR in transferrable when you stake\.$/,
        })
        .locator('span')
    ).toBeVisible();
    await page.getByPlaceholder('0.0').fill((balance + BigInt(10)).toString());
    await expect(page.getByText('Insufficient ASTR balance')).toBeVisible();
    await page.getByPlaceholder('0.0').fill('100');
    await expect(
      page.getByText('The amount of token to be staking must be greater than 500 ASTR')
    ).toBeVisible();

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
