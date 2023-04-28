import { BrowserContext, Page } from '@playwright/test';
import { getWindow } from './fixtures';
import { NODE_ENDPOINT } from './common-api';

export const ALICE_ACCOUNT_SEED =
  'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice';
export const ALICE_ACCOUNT_NAME = 'Alice';
export const BOB_ACCOUNT_SEED =
  'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Bob';
export const BOB_ACCOUNT_NAME = 'Bob';
export const BOB_ADDRESS = 'ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR';

export const createAccount = async (page: Page, seed: string, name: string): Promise<void> => {
  await page.goto(
    'chrome-extension://mopnmbcafieddcagagdcbnhejhlodfdd/index.html#/account/import-seed'
  );
  await page.getByRole('textbox').fill(seed);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('input[type="text"]').fill(name);
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('Test1234');
  await page.getByRole('textbox').nth(2).fill('Test1234');
  await page.getByRole('button', { name: 'Add the account with the supplied seed' }).click();
};

export const connectToNetwork = async (page: Page): Promise<void> => {
  await page.locator('.btn--network').click();
  await page.getByText('Custom Network').click();
  await page.getByPlaceholder('IP Address / Domain').click();
  await page.getByPlaceholder('IP Address / Domain').fill(NODE_ENDPOINT);
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
};

export const selectAccount = async (page: Page, accountName: string): Promise<void> => {
  await page.getByText('Polkadot.js').click();
  await page.getByText(`${accountName} (extension)`).click();
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
};

export const signTransaction = async (context: BrowserContext): Promise<void> => {
  const extensionWindow = await getWindow('polkadot{.js}', context);
  await extensionWindow.getByRole('textbox').fill('Test1234');
  await extensionWindow.getByRole('button', { name: 'Sign the transaction' }).click();
};

export const closePolkadotWelcomePopup = async (context: BrowserContext): Promise<void> => {
  const extensionWindow = await getWindow('polkadot{.js}', context);
  const extensionAcceptButton = extensionWindow.getByText('Understood, let me continue');
  await extensionAcceptButton.click();
  const extensionAcceptButton2 = extensionWindow.getByText('Yes, allow this application access');
  await extensionAcceptButton2.click();
};
