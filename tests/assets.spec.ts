import { expect, BrowserContext, Page } from '@playwright/test';
import { test } from '../tests-examples/fixtures';

test.beforeEach(async ({ page, context }) => {
  await page.goto('/astar/assets');
  const closeButton = page.getByText('Polkadot.js');
  await closeButton.click();

  const extensionWindow = await getWindow('polkadot{.js}', context);
  const extensionAcceptButton = extensionWindow.getByText('Understood, let me continue');
  await extensionAcceptButton.click();
  const extensionAcceptButton2 = extensionWindow.getByText('Yes, allow this application access');
  await extensionAcceptButton2.click();

  // Create test Polkadot account.
  await page.goto('chrome-extension://mopnmbcafieddcagagdcbnhejhlodfdd/index.html#/account/create');
  await page.locator('label').filter({ hasText: 'I have saved my mnemonic seed safely.' }).locator('span').click();
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
});

test.describe('wallet info', () => {
  test('should copy wallet address', async ({ page }) => {
    const copyAddressButton = page.locator('.column_icons:first-child');
    await copyAddressButton.click();
    await expect(page).toContain('Copied!');
  });
});

const getWindow = async (title: string, context: BrowserContext): Promise<Page> => {
  return new Promise((resolve) => {
    context.on('page', async (target) => {
      const pageTitle = await target.title();
      if (pageTitle === title) {
        resolve(target);
      }
    });
  });
};