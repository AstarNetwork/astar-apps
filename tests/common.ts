import { BrowserContext, Page } from '@playwright/test';
import { getWindow } from './fixtures';
import { NODE_ENDPOINT } from './common-api';
import { wait } from '@astar-network/astar-sdk-core';

export const ALICE_ACCOUNT_SEED =
  'bottom drive obey lake curtain smoke basket hold race lonely fit walk//Alice';
export const ALICE_ACCOUNT_NAME = 'Alice';
export const ALICE_ADDRESS = 'ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8';
export const ALICE_EVM_ADDRESS = '0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac';
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
  await page.locator('.icon--expand').click();
  await page.getByText('Custom Network').click();
  await page.locator('.ip-input').click();
  await page.locator('.ip-input').fill(NODE_ENDPOINT);
  await page.getByRole('button', { name: 'Change Network', exact: true }).click();
  // Memo: to wait for page reloading
  await page.waitForNavigation();
};

export const selectAccount = async (page: Page, accountName: string): Promise<void> => {
  const walletTab = page.getByTestId('select-wallet-tab');
  await walletTab.click();
  await page.getByTestId('Polkadot.js').click();
  await page.getByText(`${accountName} (extension)`).click();
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
};

export const signTransaction = async (context: BrowserContext): Promise<void> => {
  const extensionWindow = await getWindow('polkadot{.js}', context);
  await extensionWindow.getByRole('textbox').fill('Test1234');
  await extensionWindow.getByRole('button', { name: 'Sign the transaction' }).click();
};

export const signMessage = async (context: BrowserContext): Promise<void> => {
  const extensionWindow = await getWindow('polkadot{.js}', context);
  await extensionWindow.getByRole('textbox').fill('Test1234');
  await extensionWindow.getByRole('button', { name: 'Sign the message' }).click();
};

export const selectMultisigAccount = async (
  page: Page,
  context: BrowserContext,
  isProxyAccount: boolean
): Promise<void> => {
  // Memo: wallet name is defined in PolkaSafe portal
  const walletName = 'Test multisig';
  await page.getByTestId('btn-account').click();
  const walletTab = page.getByTestId('select-wallet-tab');
  await walletTab.click();
  await page.getByText('PolkaSafe').click();
  await page.locator('.row--input').click();
  await page.getByText('Bob').click();
  await signMessage(context);
  await page
    .getByTestId(isProxyAccount ? 'proxy-account' : 'not-proxy-account')
    .getByLabel(walletName)
    .check();
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
};

// Memo: We won't actually send the transaction because the PolkaSafe SDK will send the transaction via an actual WSS endpoint (such as OnFinality)
export const checkIsMultisigTxSignButtonVisible = async (
  context: BrowserContext
): Promise<boolean> => {
  const extensionWindow = await getWindow('polkadot{.js}', context);
  await extensionWindow.getByRole('textbox').fill('Test1234');
  return extensionWindow.getByRole('button', { name: 'Sign the transaction' }) ? true : false;
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
  await page.locator('.dropdown__select').selectOption('en');
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

export const signInMetamask = async (page: Page, context: BrowserContext): Promise<void> => {
  await page.goto(
    'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html#onboarding/unlock'
  );
  // const extensionWindow = await getWindow('MetaMask', context);
  await page.waitForLoadState('load');
  await page.locator('data-testid=unlock-password').fill('Test1234');
  await page.locator('data-testid=unlock-submit').click();
  await page.locator('data-testid=onboarding-complete-done').click();
  await page.locator('data-testid=pin-extension-next').click();
  await page.locator('data-testid=pin-extension-done').click();
  await page.locator('data-testid=popover-close').click();
};

export const connectWithEVM = async (page: Page, context: BrowserContext): Promise<Page> => {
  const extensionWindow = await getWindow('MetaMask Notification', context);
  await extensionWindow.waitForLoadState('load');
  await extensionWindow.waitForSelector('.permissions-connect-header__title', { state: 'visible' });

  await extensionWindow
    .locator('.permissions-connect-choose-account__bottom-buttons')
    .getByRole('button', { name: 'Next' })
    .click();

  await extensionWindow.locator('data-testid=page-container-footer-next').click();

  return extensionWindow;
};

export const changeNetworkOnEVM = async (
  page: Page,
  context: BrowserContext,
  extensionWindow?: Page
): Promise<void> => {
  if (!extensionWindow) {
    extensionWindow = await getWindow('MetaMask Notification', context);
  }

  await extensionWindow.waitForLoadState('load');
  await extensionWindow.waitForSelector('.confirmation-page__content', { state: 'visible' });
  await extensionWindow
    .locator('.confirmation-footer__actions')
    .getByRole('button', { name: 'Approve' })
    .click();
  await extensionWindow
    .locator('.confirmation-footer__actions')
    .getByRole('button', { name: 'Switch network' })
    .click();
};

// Memo: importing this function from 'connectApi.ts' makes error in the test.
export const checkIsLightClient = (endpoint: string): boolean => endpoint.startsWith('light://');
