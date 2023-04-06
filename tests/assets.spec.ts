import { expect } from '@playwright/test';
import { test, getWindow } from './fixtures';

test.beforeEach(async ({ page, context }) => {
  await page.goto('/astar/assets');
  const closeButton = page.getByText('Polkadot.js');
  await closeButton.click();

  const extensionWindow = await getWindow('polkadot{.js}', context);
  const extensionAcceptButton = extensionWindow.getByText('Understood, let me continue');
  await extensionAcceptButton.click();
  const extensionAcceptButton2 = extensionWindow.getByText('Yes, allow this application access');
  await extensionAcceptButton2.click();

  // Creates a new account with a random seed.
  await page.goto('chrome-extension://mopnmbcafieddcagagdcbnhejhlodfdd/index.html#/account/create');
  await page
    .locator('label')
    .filter({ hasText: 'I have saved my mnemonic seed safely.' })
    .locator('span')
    .click();
  await page.getByRole('button', { name: 'Next step' }).click();
  await page.locator('input[type="text"]').fill('Test');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('Test1234');
  page.getByRole('textbox').nth(2).fill('Test1234');
  await page.getByRole('button', { name: 'Add the account with the generated seed' }).click();

  // Select account in Astar UI
  await page.goto('/astar/assets');
  await page.getByText('×').click();
  await page.getByRole('button', { name: 'box icon Connect' }).click();
  await page.getByText('Polkadot.js').click();
  await page.getByText('Test (extension)').click();
  await page.getByRole('button', { name: 'Connect', exact: true }).click();

  // Close popups
  await page.getByRole('button', { name: 'Accept' }).click();
});

test.describe('account panel', () => {
  test('should copy wallet address', async ({ page }) => {
    await page.locator('#copyAddress').click();
    await expect(page.locator('.noti-content')).toBeVisible();
  });

  test('token folded info is visible until closed', async ({ page }) => {
    const baloonNativeToken = await page
      .getByText('NEW cancel All utilities for ASTR token are now folded - open up here!')
      .first();
    expect(baloonNativeToken).toBeVisible();
    await page.getByRole('button', { name: 'cancel' }).click();
    await expect(baloonNativeToken).not.toBeVisible();
  });

  test('account expander works', async ({ page }) => {
    await page.locator('.icon--expand').first().click();
    const transferButton = page.locator('#asset-expand').getByRole('button', { name: 'Transfer' });
    await expect(transferButton).toBeVisible();

    await page.locator('.icon--expand').first().click();
    await expect(transferButton).not.toBeVisible();
  });
});
