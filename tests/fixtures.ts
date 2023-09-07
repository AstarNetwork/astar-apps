import { test as base, chromium, BrowserContext, Page } from '@playwright/test';
import path from 'path';

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, 'polkadot_wallet');
    const pathToMetamask = path.join(__dirname, 'metamask_wallet');
    const args = [
      `--disable-extensions-except=${pathToExtension},${pathToMetamask}`,
      `--load-extension=${pathToExtension},${pathToMetamask}`,
    ];

    if (process.env.HEADLESS) {
      args.push('--headless=new');
    }

    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args,
    });

    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    // for manifest v2:
    let [background] = context.backgroundPages();
    if (!background) background = await context.waitForEvent('backgroundpage');

    // for manifest v3:
    // let [background] = context.serviceWorkers();
    // if (!background) background = await context.waitForEvent('serviceworker');

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});
export const expect = test.expect;

export const getWindow = async (title: string, context: BrowserContext): Promise<Page> => {
  return new Promise((resolve, reject) => {
    // Fixme: doesn't work with `changeNetworkOnEVM`
    const timer = setTimeout(() => {
      reject(`${title} window not found.`);
    }, 25000);

    context.addListener('page', async (target) => {
      const pageTitle = await target.title();
      context.removeListener('page', () => {});
      clearTimeout(timer);
      if (pageTitle === title) {
        resolve(target);
      }
    });
  });
};
