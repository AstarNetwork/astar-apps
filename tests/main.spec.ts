import { test, expect } from '@playwright/test';
import { checkPolicyInLocalStorage } from 'src/modules/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('init screen', () => {
  test('should disclaimer is opened unless agreed', async ({ page }) => {
    await checkPolicyInLocalStorage(page);

    const disclaimer = page.getByText('Disclaimer');
    await expect(disclaimer).toBeVisible();
  });

  test('should hide the disclaimer after agreed', async ({ page }) => {
    await checkPolicyInLocalStorage(page);

    const disclaimer = page.getByText('Disclaimer');
    await expect(disclaimer).toBeVisible();
    await page.click('button:has-text("Agree")');
    await expect(disclaimer).not.toBeVisible();
  });
});
