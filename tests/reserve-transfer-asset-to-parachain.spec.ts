import { clickPolicyButton } from 'src/modules/playwright';
import { expect } from '@playwright/test';
import { test } from './fixtures';
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
    await page.getByPlaceholder('0.0').fill(transferAmount.toString());
    await page.getByRole('button', { name: 'Confirm' }).click();

    const aliceBalanceBeforeTransaction = await getBalance(ALICE_ADDRESS);
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success')).toBeVisible();
    const aliceBalanceAfterTransaction = await getBalance(ALICE_ADDRESS);
    expect(aliceBalanceAfterTransaction - aliceBalanceBeforeTransaction).toEqual(
      transferAmount * BigInt(Math.pow(10, chainDecimals))
    );
  });
});

test.describe('Test case: XCM003', () => {
  test('should transfer Alice ASTR tokens from Acala to Astar', async ({ page, context }) => {
    const transferAmount = BigInt(900);
    await page.locator('.icon--expand').first().click();
    await page.locator('#asset-expand').getByRole('button', { name: 'Transfer' }).click();
    await page.getByText('Cross-chain Transfer').click();

    await page.getByPlaceholder('0.0').fill(transferAmount.toString());
    await page.getByRole('button', { name: 'Confirm' }).click();

    const aliceBalanceBeforeTransaction = await getBalance(ALICE_ADDRESS);
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success')).toBeVisible();
    const aliceBalanceAfterTransaction = await getBalance(ALICE_ADDRESS);
    expect(aliceBalanceAfterTransaction - aliceBalanceBeforeTransaction).toEqual(
      transferAmount * BigInt(Math.pow(10, chainDecimals))
    );
  });
});

test.describe('Test case: XCM004', () => {
  test('should transfer Alice ACA tokens from Astar to Acala', async ({ page, context }) => {
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
    await page.locator('div').filter({ hasText: /^ACA$/ }).nth(2).click();
    await page.getByPlaceholder('0.0').fill(transferAmount.toString());
    await page.getByRole('button', { name: 'Confirm' }).click();

    const aliceBalanceBeforeTransaction = await getBalance(ALICE_ADDRESS);
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success')).toBeVisible();
    const aliceBalanceAfterTransaction = await getBalance(ALICE_ADDRESS);
    expect(aliceBalanceAfterTransaction - aliceBalanceBeforeTransaction).toEqual(
      transferAmount * BigInt(Math.pow(10, chainDecimals))
    );
  });
});

test.describe('Test case: XCM001', () => {
  test('should transfer Alice ACA tokens from Acala to Astar', async ({ page, context }) => {
    const transferAmount = BigInt(900);
    await page.locator('.icon--expand').first().click();
    await page.locator('#asset-expand').getByRole('button', { name: 'Transfer' }).click();
    await page.getByText('Cross-chain Transfer').click();

    await page.getByPlaceholder('0.0').fill(transferAmount.toString());
    await page.getByRole('button', { name: 'Confirm' }).click();

    const aliceBalanceBeforeTransaction = await getBalance(ALICE_ADDRESS);
    await signTransaction(context);
    await page.waitForSelector('.four', { state: 'hidden' });

    await expect(page.getByText('Success')).toBeVisible();
    const aliceBalanceAfterTransaction = await getBalance(ALICE_ADDRESS);
    expect(aliceBalanceAfterTransaction - aliceBalanceBeforeTransaction).toEqual(
      transferAmount * BigInt(Math.pow(10, chainDecimals))
    );
  });
});
