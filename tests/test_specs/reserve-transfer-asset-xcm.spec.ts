import { clickPolicyButton } from 'src/modules/playwright';
import { expect } from '@playwright/test';
import { test } from '../fixtures';
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
import { ApiPromise } from '@polkadot/api';
import { chainDecimals, getApi, getBalance, roundUpAndTruncateBigInt } from '../common-api';

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
  await page.goto('/astar/assets');
  await connectToNetwork(page);
  await selectAccount(page, ALICE_ACCOUNT_NAME);
});

test.describe('Test case: XCM006', () => {
  test('should transfer Alice ASTR tokens from Astar to Acala', async ({ page, context }) => {
    const transferAmount = BigInt(1000);
    await page.locator('.icon--expand').first().click();
    await page.locator('#asset-expand').getByRole('button', { name: 'Transfer' }).click();
    await page.getByText('Cross-chain Transfer').click();
    await page.getByRole('main').getByRole('button').first().click();
    await page.locator('#amount').fill(transferAmount.toString());
    await page.getByRole('button', { name: 'Confirm' }).click();

    const aliceBalanceBeforeTransaction = await getBalance(ALICE_ADDRESS);
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success')).toBeVisible();
    const aliceBalanceAfterTransaction = await getBalance(ALICE_ADDRESS);
    const difference = await roundUpAndTruncateBigInt(
      aliceBalanceBeforeTransaction - aliceBalanceAfterTransaction,
      chainDecimals
    );
    expect(difference).toEqual(transferAmount);
  });
});

test.describe('Test case: XCM003', () => {
  test('should transfer Alice ASTR tokens from Acala to Astar', async ({ page, context }) => {
    const transferAmount = BigInt(900);
    await page.locator('.icon--expand').first().click();
    await page.locator('#asset-expand').getByRole('button', { name: 'Transfer' }).click();
    await page.getByText('Cross-chain Transfer').click();

    await page.locator('#amount').fill(transferAmount.toString());
    await page.getByRole('button', { name: 'Confirm' }).click();

    const aliceBalanceBeforeTransaction = await getBalance(ALICE_ADDRESS);
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success')).toBeVisible();
    const aliceBalanceAfterTransaction = await getBalance(ALICE_ADDRESS);
    const difference = await roundUpAndTruncateBigInt(
      aliceBalanceAfterTransaction - aliceBalanceBeforeTransaction,
      chainDecimals
    );
    expect(difference).toEqual(transferAmount);
  });
});

test.describe('Test case: XCM004', () => {
  test('should transfer Alice ACA tokens from Astar to Acala', async ({ page, context }) => {
    const assetId = '18446744073709551616';
    const transferAmount = BigInt(1000);
    await page.locator('.icon--expand').first().click();
    await page.locator('#asset-expand').getByRole('button', { name: 'Transfer' }).click();
    await page.getByText('Cross-chain Transfer').click();

    await page.getByRole('main').getByRole('button').first().click();
    await page
      .locator('div')
      .filter({ hasText: /^ASTR$/ })
      .nth(1)
      .click();
    await page.locator('div').filter({ hasText: /^ACA$/ }).click();
    await page.locator('#amount').fill(transferAmount.toString());
    await page.getByRole('button', { name: 'Confirm' }).click();

    const aliceBalanceBeforeTransaction = await getBalance(ALICE_ADDRESS, assetId);
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success')).toBeVisible();
    const aliceBalanceAfterTransaction = await getBalance(ALICE_ADDRESS, assetId);
    const difference = await roundUpAndTruncateBigInt(
      aliceBalanceBeforeTransaction - aliceBalanceAfterTransaction,
      12
    );
    expect(difference).toEqual(transferAmount);
  });
});

test.describe('Test case: XCM001', () => {
  test('should transfer Alice ACA tokens from Acala to Astar', async ({ page, context }) => {
    const assetId = '18446744073709551616';
    const transferAmount = BigInt(900);
    await page.locator('.icon--expand').first().click();
    await page.locator('#asset-expand').getByRole('button', { name: 'Transfer' }).click();
    await page.getByText('Cross-chain Transfer').click();

    await page
      .locator('div')
      .filter({ hasText: /^ASTR$/ })
      .nth(1)
      .click();
    await page.locator('div').filter({ hasText: /^ACA$/ }).click();
    await page.locator('#amount').fill(transferAmount.toString());
    await page.getByRole('button', { name: 'Confirm' }).click();

    const aliceBalanceBeforeTransaction = await getBalance(ALICE_ADDRESS, assetId);
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success')).toBeVisible();
    const aliceBalanceAfterTransaction = await getBalance(ALICE_ADDRESS, assetId);
    const difference = await roundUpAndTruncateBigInt(
      aliceBalanceAfterTransaction - aliceBalanceBeforeTransaction,
      12
    );
    expect(difference).toEqual(transferAmount);
  });
});

test.describe('Test case: XCM001-1', () => {
  test('should transfer Alice DOT tokens from Polkadot to Astar', async ({ page, context }) => {
    const assetId = '340282366920938463463374607431768211455';
    const transferAmount = BigInt(100);
    await page.locator('.icon--expand').first().click();
    await page.locator('#asset-expand').getByRole('button', { name: 'Transfer' }).click();
    await page.getByText('Cross-chain Transfer').click();

    await page.locator('div:nth-child(3) > .wrapper--select-chain').click();
    await page
      .locator('div')
      .filter({ hasText: /^Polkadot$/ })
      .nth(1)
      .click();
    await page.locator('#amount').fill(transferAmount.toString());
    await page.getByRole('button', { name: 'Confirm' }).click();

    const aliceBalanceBeforeTransaction = await getBalance(ALICE_ADDRESS, assetId);
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success')).toBeVisible();
    const aliceBalanceAfterTransaction = await getBalance(ALICE_ADDRESS, assetId);
    const difference = await roundUpAndTruncateBigInt(
      aliceBalanceBeforeTransaction - aliceBalanceAfterTransaction,
      10
    );
    expect(difference).toEqual(transferAmount);
  });
});

test.describe('Test case: XCM004-1', () => {
  test('should transfer Alice DOT tokens from Astar to Polkadot', async ({ page, context }) => {
    const assetId = '340282366920938463463374607431768211455';
    const transferAmount = BigInt(100);
    await page.locator('.icon--expand').first().click();
    await page.locator('#asset-expand').getByRole('button', { name: 'Transfer' }).click();
    await page.getByText('Cross-chain Transfer').click();
    await page.getByRole('main').getByRole('button').first().click();

    await page.locator('div:nth-child(3) > .wrapper--select-chain').click();
    await page
      .locator('div')
      .filter({ hasText: /^Polkadot$/ })
      .nth(1)
      .click();
    await page.locator('#amount').fill(transferAmount.toString());
    await page.getByRole('button', { name: 'Confirm' }).click();

    const aliceBalanceBeforeTransaction = await getBalance(ALICE_ADDRESS, assetId);
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success')).toBeVisible();
    const aliceBalanceAfterTransaction = await getBalance(ALICE_ADDRESS, assetId);
    const difference = await roundUpAndTruncateBigInt(
      aliceBalanceBeforeTransaction - aliceBalanceAfterTransaction,
      10
    );
    expect(difference).toEqual(transferAmount);
  });
});

test.describe('Test case: XCM001-2', () => {
  test('should transfer Alice USDT tokens from Statemint to Astar', async ({ page, context }) => {
    const assetId = '4294969280';
    const transferAmount = BigInt(10000);
    await page.locator('.icon--expand').first().click();
    await page.locator('#asset-expand').getByRole('button', { name: 'Transfer' }).click();
    await page.getByText('Cross-chain Transfer').click();

    await page.locator('div:nth-child(3) > .wrapper--select-chain').click();
    await page
      .locator('div')
      .filter({ hasText: /^Statemint$/ })
      .nth(1)
      .click();
    await page.locator('#amount').fill(transferAmount.toString());
    await page.getByRole('button', { name: 'Confirm' }).click();

    const aliceBalanceBeforeTransaction = await getBalance(ALICE_ADDRESS, assetId);
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success')).toBeVisible();
    const aliceBalanceAfterTransaction = await getBalance(ALICE_ADDRESS, assetId);
    const difference = await roundUpAndTruncateBigInt(
      aliceBalanceBeforeTransaction - aliceBalanceAfterTransaction,
      6
    );
    expect(difference).toEqual(transferAmount);
  });
});

test.describe('Test case: XCM004-2', () => {
  test('should transfer Alice USDT tokens from Astar to Statemint', async ({ page, context }) => {
    const assetId = '4294969280';
    const transferAmount = BigInt(10000);
    await page.locator('.icon--expand').first().click();
    await page.locator('#asset-expand').getByRole('button', { name: 'Transfer' }).click();
    await page.getByText('Cross-chain Transfer').click();
    await page.getByRole('main').getByRole('button').first().click();

    await page.locator('div:nth-child(3) > .wrapper--select-chain').click();
    await page
      .locator('div')
      .filter({ hasText: /^Statemint$/ })
      .nth(1)
      .click();
    await page.locator('#amount').fill(transferAmount.toString());
    await page.getByRole('button', { name: 'Confirm' }).click();

    const aliceBalanceBeforeTransaction = await getBalance(ALICE_ADDRESS, assetId);
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success')).toBeVisible();
    const aliceBalanceAfterTransaction = await getBalance(ALICE_ADDRESS, assetId);
    const difference = await roundUpAndTruncateBigInt(
      aliceBalanceBeforeTransaction - aliceBalanceAfterTransaction,
      6
    );
    expect(difference).toEqual(transferAmount);
  });
});
