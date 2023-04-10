import { Page } from '@playwright/test';

export const checkPolicyInLocalStorage = async (page: Page) => {
  return await page.waitForFunction((e) => {
    return localStorage['confirmCookiePolicy'] === e;
  }, undefined);
};

export const checkInjectedWeb3 = async (page: Page) => {
  return await page.waitForFunction((e) => {
    const wallets = Object.keys(window.injectedWeb3);
    const isInstalledExtension = wallets.find((it) => 'polkadot-js' === it);
    return isInstalledExtension === undefined;
  }, undefined);
};
