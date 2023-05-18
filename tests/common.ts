import { BrowserContext, Page } from '@playwright/test';
import { getWindow } from './fixtures';
import { NODE_ENDPOINT } from './common-api';

export const ALICE_ACCOUNT_SEED =
  'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice';
export const ALICE_ACCOUNT_NAME = 'Alice';
export const ALICE_ADDRESS = 'ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8';
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

// metamask
export const createMetamaskAccount = async (
  page: Page,
  seed: string,
  name: string
): Promise<void> => {
  await page.goto(
    'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html#onboarding/welcome'
  );
  const words = seed.split(' ');
  await page.getByText('Import an existing wallet').click();
  await page.getByText('I agree').click();
  await page.getByRole('textbox').first().fill(words[0]);
  await page.getByRole('textbox').nth(1).fill(words[1]);
  await page.getByRole('textbox').nth(2).fill(words[2]);
  await page.getByRole('textbox').nth(3).fill(words[3]);
  await page.getByRole('textbox').nth(4).fill(words[4]);
  await page.getByRole('textbox').nth(5).fill(words[5]);
  await page.getByRole('textbox').nth(6).fill(words[6]);
  await page.getByRole('textbox').nth(7).fill(words[7]);
  await page.getByRole('textbox').nth(8).fill(words[8]);
  await page.getByRole('textbox').nth(9).fill(words[9]);
  await page.getByRole('textbox').nth(10).fill(words[10]);
  await page.getByRole('textbox').nth(11).fill(words[11]);
  await page.getByRole('button').click();
  await page.getByRole('textbox').first().fill('Test1234');
  await page.getByRole('textbox').nth(1).fill('Test1234');
  await page.getByRole('checkbox').click();
  await page.getByRole('button').click();
  await page.getByRole('button').nth(1).click();
};

export const signInMetamask = async (context: BrowserContext): Promise<void> => {
  const extensionWindow = await getWindow('MetaMask', context);
  await extensionWindow.locator('data-testid=unlock-password').fill('Test1234');
  await extensionWindow.locator('data-testid=unlock-submit').click();
  await extensionWindow.locator('data-testid=onboarding-complete-done').click();
  await extensionWindow.locator('data-testid=pin-extension-next').click();
  await extensionWindow.locator('data-testid=pin-extension-done').click();
  await extensionWindow.locator('data-testid=popover-close').click();
};

export const connectWithEVM = async (context: BrowserContext): Promise<void> => {
  const extensionWindow = await getWindow('MetaMask Notification', context);
  await extensionWindow
    .locator('.permissions-connect-choose-account__bottom-buttons')
    .getByRole('button', { name: 'Next' })
    .click();
  await extensionWindow.locator('data-testid=page-container-footer-next').click();
  await extensionWindow
    .locator('.confirmation-footer__actions')
    .getByRole('button', { name: 'Approve' })
    .click();
  await extensionWindow
    .locator('.confirmation-footer__actions')
    .getByRole('button', { name: 'Switch network' })
    .click();
};
