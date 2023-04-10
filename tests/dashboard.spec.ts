import { test, expect } from '@playwright/test';
import { checkPolicyInLocalStorage, checkInjectedWeb3 } from 'src/modules/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/astar/dashboard');
});

test.describe('init screen', () => {
  test('should wallet is opened', async ({ page }) => {
    const walletWrapper = page.getByText('Select a Wallet');
    await expect(walletWrapper).toBeVisible();
  });
  test('should wallet is closed', async ({ page }) => {
    const walletWrapper = page.getByText('Select a Wallet');
    const closeButton = page.getByText('×');
    await closeButton.click();
    await expect(walletWrapper).toBeHidden();
  });
  test('should private policy is opened unless accept the policy', async ({ page }) => {
    await checkPolicyInLocalStorage(page);

    const privatePolicy = page
      .getByRole('alert')
      .getByRole('link', { name: 'privacy policy page.' });
    await expect(privatePolicy).toBeVisible();
  });
  test('should hide the private policy after accept the policy', async ({ page }) => {
    await checkPolicyInLocalStorage(page);

    const privatePolicy = page
      .getByRole('alert')
      .getByRole('link', { name: 'privacy policy page.' });
    await expect(privatePolicy).toBeVisible();
    await page.click('button:has-text("Accept")');
    await expect(privatePolicy).not.toBeVisible();
  });
  test('should display the connect button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'box icon Connect' })).toBeVisible();
  });
  test('should display the Astar Network button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Astar Network' })).toBeVisible();
  });

  test('should display install extension popup when click Talisman button', async ({ page }) => {
    await checkInjectedWeb3(page);
    const button = page.locator('div').filter({ hasText: 'Talisman (Native)' }).first();
    await expect(button).toBeVisible();
    await button.click();
  });
});
