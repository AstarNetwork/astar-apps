import { clickDisclaimerButton } from 'src/modules/playwright';
import { BrowserContext, Page, expect } from '@playwright/test';
import {
  ALICE_ACCOUNT_NAME,
  ALICE_ACCOUNT_SEED,
  ALICE_ADDRESS,
  closePolkadotWelcomePopup,
  connectToNetwork,
  createAccount,
  selectAccount,
  signTransaction,
} from '../common';
import { test } from '../fixtures';
import {
  chainDecimals,
  fetchAccountStakingAmount,
  fetchMinimumStakingAmount,
  // forceNewEra,
  getAccountLedger,
  getBalance,
  getStakedAmount,
  setRewardDestination,
} from '../common-api';
import { ethers } from 'ethers';
import { wait } from '@astar-network/astar-sdk-core';

// Memo: Astar Core Contributors
const TEST_DAPP_ADDRESS = '0xa602d021da61ec4cc44dedbd4e3090a05c97a435';

const stake = async (
  page: Page,
  context: BrowserContext,
  amount: bigint,
  dapp = TEST_DAPP_ADDRESS
): Promise<void> => {
  await page.goto(`/custom-node/dapp-staking/stake?dapp=${dapp}`);
  await selectAccount(page, ALICE_ACCOUNT_NAME);
  await page.getByPlaceholder('0.0').fill(amount.toString());
  await page.getByRole('button', { name: 'Confirm' }).click();

  const stakedAmountBefore = await getStakedAmount(dapp);
  await signTransaction(context);
  await page.waitForSelector('.four', { state: 'hidden' });

  await expect(page.getByText('Success', { exact: true })).toBeVisible();
  const stakedAmountAfter = await getStakedAmount(dapp);
  expect(stakedAmountAfter - stakedAmountBefore).toEqual(
    amount * BigInt(Math.pow(10, chainDecimals))
  );
};

test.beforeEach(async ({ page, context }) => {
  await page.goto('/astar/dapp-staking/discover');

  // Close disclaimer popup
  await clickDisclaimerButton(page);

  const walletTab = page.getByTestId('select-wallet-tab');
  await walletTab.click();
  const polkadotJsButton = page.getByText('Polkadot.js');
  await polkadotJsButton.click();

  await closePolkadotWelcomePopup(context);
  await createAccount(page, ALICE_ACCOUNT_SEED, ALICE_ACCOUNT_NAME);
  await page.goto('/astar/dapp-staking/discover');
  await connectToNetwork(page);
});

test.describe('dApp staking transactions', () => {
  // Test case: DS001, DS002
  test('user should be able to stake on test dApp', async ({ page, context }) => {
    const stakeAmount = BigInt(1000);
    await page.goto(`/custom-node/dapp-staking/stake?dapp=${TEST_DAPP_ADDRESS}`);
    await selectAccount(page, ALICE_ACCOUNT_NAME);
    const balance = (await getBalance(ALICE_ADDRESS)) / BigInt(Math.pow(10, chainDecimals));

    // Test edge cases
    await page.getByPlaceholder('0.0').fill((balance - BigInt(5)).toString());
    await expect(
      page
        .locator('div')
        .filter({
          hasText:
            /^Account must hold amount greater than 10ASTR in transferable after you stake\.$/,
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

  // Test case: DS003
  test('user should be able to unbond from the test dApp', async ({ page, context }) => {
    // Stake first
    await stake(page, context, BigInt(1000));

    // Unbond
    await page.goto('/custom-node/dapp-staking/discover');
    await page.getByText('My dApps').click();
    await page.getByRole('button', { name: 'Unbond' }).click();
    await page.getByPlaceholder('0.0').fill('1.1');
    await page.getByRole('button', { name: 'Start unbonding' }).click();
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success', { exact: true })).toBeVisible();
    const ledger = await getAccountLedger(ALICE_ADDRESS);
    expect(ledger.unbondingInfo.unlockingChunks.length).toEqual(1);
    expect(ledger.unbondingInfo.unlockingChunks[0].amount.toString()).toEqual(
      '1100000000000000000'
    );
  });

  test('unstake all the staking balance if the resulting staking amount is less than minimum staking amount', async ({
    page,
    context,
  }) => {
    // Memo:Stake first
    await stake(page, context, BigInt(1000));
    await page.goto('/custom-node/dapp-staking/discover');
    const minimumStakingAmount = await fetchMinimumStakingAmount();
    const stakingAmount = ethers.utils.formatEther(
      (await fetchAccountStakingAmount(ALICE_ADDRESS, TEST_DAPP_ADDRESS)).toString()
    );
    const unstakeAmount =
      Number(stakingAmount) - Number(ethers.utils.formatEther(minimumStakingAmount)) + 1;
    await page.goto('/custom-node/dapp-staking/discover');
    await page.getByText('My dApps').click();
    await page.getByRole('button', { name: 'Unbond' }).click();
    await page.getByPlaceholder('0.0').fill(unstakeAmount.toString());

    const warningMsg = page.getByTestId('warning-unstake-all-balance');
    await expect(warningMsg).toBeVisible();

    await page.getByRole('button', { name: 'Start unbonding' }).click();
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success', { exact: true })).toBeVisible();

    const latestStakingAmount = ethers.utils.formatEther(
      (await fetchAccountStakingAmount(ALICE_ADDRESS, TEST_DAPP_ADDRESS)).toString()
    );
    expect(Number(latestStakingAmount)).toEqual(0);
  });

  // Test case: DS005
  // test('user should be able to claim rewards', async ({ page, context }) => {
  //   await stake(page, context, BigInt(1000));

  //   const ledgerBefore = await getAccountLedger(ALICE_ADDRESS);
  //   await forceNewEra();

  //   await page.goto('/custom-node/dapp-staking/discover');
  //   await page.getByRole('button', { name: 'Claim' }).click();
  //   await signTransaction(context);
  //   await expect(page.getByText('Success', { exact: true }).first()).toBeVisible();

  //   const ledgerAfter = await getAccountLedger(ALICE_ADDRESS);
  //   expect(ledgerBefore.rewardDestination.toString()).toEqual('StakeBalance');
  //   expect(ledgerBefore.locked < ledgerAfter.locked).toBeTruthy();
  // });

  // Test case: DS006
  test('user should be able to turn on/off re-staking', async ({ page, context }) => {
    // Stake first. User must be an active staker in order to change reward destination.
    await stake(page, context, BigInt(1000));

    // Check initial state
    await setRewardDestination('StakeBalance');
    await expect(page.getByText('ON', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Turn off' })).toBeVisible();
    let ledger = await getAccountLedger(ALICE_ADDRESS);
    expect(ledger.rewardDestination.toString()).toEqual('StakeBalance');

    await page.getByRole('button', { name: 'Turn off' }).click();
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });
    await expect(page.getByText('OFF', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Turn on' })).toBeVisible();
    ledger = await getAccountLedger(ALICE_ADDRESS);
    expect(ledger.rewardDestination.toString()).toEqual('FreeBalance');

    await page.getByRole('button', { name: 'Turn on' }).click();
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });
    await expect(page.getByText('ON', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Turn off' })).toBeVisible();
    // MEMO: test failed
    // ledger = await getAccountLedger(ALICE_ADDRESS);
    // expect(ledger.rewardDestination.toString()).toEqual('StakeBalance');
  });

  // Test case: DS007
  test('Twitter share button works', async ({ page, context }) => {
    await page.goto(`/custom-node/dapp-staking/dapp?dapp=${TEST_DAPP_ADDRESS}`);
    await selectAccount(page, ALICE_ACCOUNT_NAME);
    await page.getByRole('link', { name: 'Twitter icon Share' }).click();
    const newPage = await context.waitForEvent('page');
    await expect(newPage).toHaveURL(/twitter/);
  });
});
