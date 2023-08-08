import { expect, test } from '@playwright/test';
import { endpointKey } from 'src/config/chainEndpoints';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { checkIsLightClient } from '../common-api';
import { clickPolicyButton } from 'src/modules/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/astar/dashboard');
  await clickPolicyButton(page);
  const closeButton = page.getByText('Polkadot.js');
  await closeButton.click();
});

test.describe('on dashboard screen', () => {
  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/Dashboard/);
  });
  test('DocsBot AI answers inputted questions', async ({ page }) => {
    const widget = page.locator('.docsbot-chat-container');
    const botButton = page.locator('.floating-button');
    await botButton.click();
    await page.getByPlaceholder('Send a message...').fill('What is the decimals of ASTR token?');
    await page.locator('.docsbot-chat-btn-send').click();
    await expect(widget.getByText('18')).toBeVisible();
  });
  test('Endpoint has been selected randomly', async ({ page }) => {
    const isAppliedRandomEndpoint = await page.evaluate(() => {
      return localStorage.getItem('isAppliedRandomEndpoint');
    });
    const selectedEndpointObj: string = (await page.evaluate(() => {
      return localStorage.getItem('selectedEndpoint');
    })) as string;
    const selectedEndpoint = JSON.parse(selectedEndpointObj)[0];
    const isSomeOfAstarEndpoints = providerEndpoints[endpointKey.ASTAR].endpoints.some(
      (it) => it.endpoint === selectedEndpoint
    );
    const isLightClient = checkIsLightClient(selectedEndpoint);

    expect(isAppliedRandomEndpoint).toBe('true');
    expect(isSomeOfAstarEndpoints).toBe(true);
    expect(isLightClient).toBe(false);
  });

  test('display network statuses panel', async ({ page }) => {
    const ui = page.getByTestId('network-statuses');
    await expect(ui).toBeVisible();
  });

  test('display collators panel', async ({ page }) => {
    const ui = page.getByTestId('collators-panel');
    await expect(ui).toBeVisible();
  });
});
