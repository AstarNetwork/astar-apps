//@ts-ignore
import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:8080/#/astar/dapp-staking/discover');
});

test.describe('init screen', () => {
  test('should wallet is opened', async ({ page }) => {
    const walletWrapper = page.getByText('Select a Wallet');
    await expect(walletWrapper).toBeVisible();
  });
  test('should private policy is opened unless accept the policy', async ({ page }) => {
    await checkPolicyInLocalStorage(page);
    
    const privatePolicy = page.getByRole('alert').getByText('privacy policy page.');
    await expect(privatePolicy).toBeVisible();
  });
  test('should hide the private policy after accept the policy', async ({ page }) => {
    await checkPolicyInLocalStorage(page);
    
    const privatePolicy = page.getByRole('alert').getByText('privacy policy page.');
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
});

async function checkPolicyInLocalStorage(page: Page) {
  return await page.waitForFunction(e => {
    return localStorage['confirmCookiePolicy'] === e;
  }, undefined);
}