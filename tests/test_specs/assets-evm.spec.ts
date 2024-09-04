import { expect } from '@playwright/test';
import { clickDisclaimerButton } from 'src/modules/playwright';
import {
  changeNetworkOnEVM,
  connectWithEVM,
  createMetamaskAccount,
  signInMetamask,
} from '../common';
import { test } from '../fixtures';

test.describe('account panel', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.goto('/astar/assets');

    // memo Metamask tabs gots focus, switch to the portal tab
    page.bringToFront();

    await clickDisclaimerButton(page);
    await createMetamaskAccount(
      page,
      'bottom drive obey lake curtain smoke basket hold race lonely fit walk',
      'Test'
    );
    await signInMetamask(page, context);
    await page.goto('/astar/assets');
    await page.locator('.btn--connect').click();
    await page.getByText('MetaMask').click();
    const metamaskWindow = await connectWithEVM(page, context);
    await changeNetworkOnEVM(page, context, metamaskWindow);

    await page.waitForSelector('.modal-close', { state: 'hidden' });
    await expect(page.getByText('Select a Wallet')).toBeHidden();
  });

  test('Display EVM native token', async ({ page, context }) => {
    const ui = page.getByTestId('evm-native-token');
    await expect(ui).toBeVisible();
  });
  test('Search XC20 and ERC20 tokens by the same search input', async ({ page, context }) => {
    await page.getByPlaceholder('Search').click();
    await page.getByPlaceholder('Search').fill('USD');
    const usdt = page.getByTestId('USDT');
    await expect(usdt).toBeVisible();
    const ceUsdt = page.getByTestId('ceUSDT');
    await expect(ceUsdt).toBeVisible();
    const dot = page.getByTestId('DOT');
    await expect(dot).not.toBeVisible();
  });
});
