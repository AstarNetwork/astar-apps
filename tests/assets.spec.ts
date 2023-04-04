import { expect, BrowserContext, Page } from '@playwright/test';
import { test } from '../tests-examples/fixtures';

test.beforeEach(async ({ page, context }) => {
  // Create account
  const account = {
    derivation: '/1',
    expectedAddress: '5GNg7RWeAAJuya4wTxb8aZf19bCWJroKuJNrhk4N3iYHNqTm',
    expectedAddressWithDerivation: '5DV3x9zgaXREUMTX7GgkP3ETeW4DQAznWTxg4kx2WivGuQLQ',
    name: 'My Polkadot Account',
    password: 'somePassword',
    seed: 'upgrade multiply predict hip multiply march leg devote social outer oppose debris'
  };
  
  // TODO interact with wallet and create account.


  await page.goto('/astar/assets');
  const closeButton = page.getByText('Polkadot.js');
  await closeButton.click();

  // Get Polkadot extension window and accept permissions.
  const window = await getWindow('polkadot{.js}', context);
  const extensionAcceptButton = window.getByText('Understood, let me continue');
  await extensionAcceptButton.click();
  const extensionAcceptButton2 = window.getByText('Yes, allow this application access');
  await extensionAcceptButton2.click();

  // Close wallet selection drawer
  const connectButton = page.getByRole('button', { name: 'Connect', exact: true });
  await connectButton.click();
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
      console.log(pageTitle);
      if (pageTitle === title) {
        resolve(target);
      }
    });
  });
};