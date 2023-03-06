import { Page, chromium, test, expect } from '@playwright/test';
import path from 'path';
// import { test, expect } from './fixtures';

// test.beforeEach(async ({ page }) => {
//   await page.goto('http://localhost:8080/#/astar/dapp-staking/discover');
// });

test.describe('extension test', () => {
  test('example test', async ({ page }) => {
    await page.goto('http://localhost:8080/#/astar/dapp-staking/discover');
    const pathToExtension = path.join(__dirname, 'hello-world');
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        '--headless=new', // the new headless arg for chrome v109+. Use '--headless=chrome' as arg for browsers v94-108.
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });

    await context.close();
  });

  // test('popup page', async ({ page, extensionId }) => {
  //   console.log('extensionId', extensionId);
  //   await page.goto(`chrome-extension://${extensionId}/popup.html`);

  //   // Your tests with the Metamask extension here
  //   await expect(page.locator('body')).toHaveText('Hello Extensions');
  // })
});
