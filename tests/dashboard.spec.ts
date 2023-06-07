import { expect, test } from '@playwright/test';
import { checkIsLightClient } from 'src/config/api/polkadot/connectApi';
import { endpointKey } from 'src/config/chainEndpoints';
import { providerEndpoints } from 'src/config/chainEndpoints';

test.beforeEach(async ({ page }) => {
  await page.goto('/astar/dashboard');
});

test.describe('on dashboard screen', () => {
  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/Dashboard/);
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
});
