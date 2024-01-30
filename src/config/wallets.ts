import { objToArray } from '@astar-network/astar-sdk-core';

// Memo: enum value comes from:
//    const extensions = await getInjectedExtensions();
//    console.log('extensions', extensions); -> extensions[index] -> name
// Memo: Mobile wallets such as Math and Nova returns 'polkadot-js' as the wallet name

export enum SupportWallet {
  PolkadotJs = 'polkadot-js',
  MetaMask = 'metamask',
  Clover = 'clover',
  Gridlock = 'gridlock',
  GridlockEvm = 'gridlockEvm',
  Math = 'mathwallet',
  Nova = 'nova',
  NovaEvm = 'novaEvm',
  TalismanEvm = 'talismanEth',
  TalismanNative = 'talisman',
  SubWalletNative = 'subwallet-js',
  SubWalletEvm = 'SubWallet',
  Metadot = 'metadot',
  Wallet3 = 'wallet3',
  HanaNative = 'hana',
  HanaEvm = 'hanaEvm',
  OneKeyEvm = 'OneKeyEvm',
  OneKeyNative = 'OneKey',
  Snap = 'Snap',
  EnkryptEvm = 'enkryptEvm',
  EnkryptNative = 'enkrypt',
  WalletConnect = 'wallet-connect',
}

export enum SupportMultisig {
  Polkasafe = 'polkasafe',
}

export const WalletModalOption = {
  SelectWallet: 'SelectWallet',
  SelectSubstrateAccount: 'SelectSubstrateAccount',
  NoExtension: 'NoExtension',
  OutdatedWallet: 'OutdatedWallet',
  AccountUnification: 'AccountUnification',
  Polkasafe: SupportMultisig.Polkasafe,
  PolkadotJs: SupportWallet.PolkadotJs,
  Clover: SupportWallet.Clover,
  Gridlock: SupportWallet.Gridlock,
  MetaMask: SupportWallet.MetaMask,
  Math: SupportWallet.Math,
  Nova: SupportWallet.Nova,
  TalismanEvm: SupportWallet.TalismanEvm,
  TalismanNative: SupportWallet.TalismanNative,
  SubWallet: SupportWallet.SubWalletNative,
  SubWalletEvm: SupportWallet.SubWalletEvm,
  Metadot: SupportWallet.Metadot,
  Wallet3: SupportWallet.Wallet3,
  HanaNative: SupportWallet.HanaNative,
  HanaEvm: SupportWallet.HanaEvm,
  OneKey: SupportWallet.OneKeyNative,
  OneKeyEvm: SupportWallet.OneKeyEvm,
  Snap: SupportWallet.Snap,
  EnkryptEvm: SupportWallet.EnkryptEvm,
  EnkryptNative: SupportWallet.EnkryptNative,
};

export const SubstrateWallets = [
  SupportWallet.PolkadotJs,
  SupportWallet.Clover,
  SupportWallet.Gridlock,
  SupportWallet.Math,
  SupportWallet.Nova,
  SupportWallet.TalismanNative,
  SupportWallet.SubWalletNative,
  SupportWallet.Metadot,
  SupportWallet.Wallet3,
  SupportWallet.HanaNative,
  SupportWallet.OneKeyNative,
  SupportWallet.Snap,
  SupportWallet.EnkryptNative,
];

export interface Wallet {
  img: any;
  name: string;
  source: SupportWallet;
  walletUrl: string;
  guideUrl: string;
  isSupportBrowserExtension: boolean;
  isSupportMobileApp: boolean;
  // Memo: access to the wallet extension like `window['ethereum']`
  ethExtension?: string;
}

export const supportWalletObj = {
  [SupportWallet.PolkadotJs]: {
    img: require('/src/assets/img/logo-polkadot-js.png'),
    name: 'Polkadot.js',
    source: SupportWallet.PolkadotJs,
    walletUrl: 'https://polkadot.js.org/extension/',
    guideUrl: 'https://docs.astar.network/docs/use/user-guides/create-wallet',
    isSupportBrowserExtension: true,
    isSupportMobileApp: false,
  },
  [SupportWallet.Snap]: {
    img: require('/src/assets/img/metamask.png'),
    name: 'Astar Snap',
    source: SupportWallet.Snap,
    walletUrl: 'https://snaps.metamask.io/snap/npm/astar-network/snap/',
    guideUrl:
      'https://docs.astar.network/docs/use/manage-wallets/wallet-providers/metamask-astar-snap/',
    isSupportBrowserExtension: true,
    isSupportMobileApp: false,
  },
  [SupportWallet.TalismanNative]: {
    img: require('/src/assets/img/logo-talisman.svg'),
    name: 'Talisman (Native)',
    source: SupportWallet.TalismanNative,
    walletUrl: 'https://app.talisman.xyz/',
    guideUrl: 'https://app.talisman.xyz/',
    isSupportBrowserExtension: true,
    isSupportMobileApp: false,
  },
  [SupportWallet.Gridlock]: {
    img: require('/src/assets/img/logo-gridlock.png'),
    name: 'Gridlock Wallet',
    source: SupportWallet.Gridlock,
    walletUrl: 'https://gridlock.network/',
    guideUrl: 'https://gridlock.network/',
    isSupportBrowserExtension: false,
    isSupportMobileApp: true,
  },
  [SupportWallet.SubWalletNative]: {
    img: require('/src/assets/img/logo-subwallet.webp'),
    name: 'SubWallet (Native)',
    source: SupportWallet.SubWalletNative,
    walletUrl: 'https://subwallet.app/download.html',
    guideUrl: 'https://docs.subwallet.app/user-guide/install-subwallet',
    isSupportBrowserExtension: true,
    isSupportMobileApp: true,
  },
  [SupportWallet.Clover]: {
    img: require('/src/assets/img/logo-clover.png'),
    name: 'Clover',
    source: SupportWallet.Clover,
    walletUrl: 'https://clover.finance/',
    guideUrl: 'https://docs.clover.finance/quick-start/about-clover',
    isSupportBrowserExtension: true,
    isSupportMobileApp: false,
  },
  [SupportWallet.Math]: {
    img: require('/src/assets/img/logo-mathwallet.png'),
    name: 'Math Wallet',
    source: SupportWallet.Math,
    walletUrl: 'https://mathwallet.org/en-us/',
    guideUrl: 'https://blog.mathwallet.org/?p=540',
    isSupportBrowserExtension: true,
    isSupportMobileApp: true,
  },
  [SupportWallet.Nova]: {
    img: require('/src/assets/img/logo-nova.png'),
    name: 'Nova Wallet',
    source: SupportWallet.Nova,
    walletUrl: 'https://novawallet.io/',
    guideUrl: 'https://novawallet.io/',
    isSupportBrowserExtension: false,
    isSupportMobileApp: true,
  },
  [SupportWallet.Metadot]: {
    img: require('/src/assets/img/logo-metadot.png'),
    name: 'Metadot',
    source: SupportWallet.Metadot,
    walletUrl: 'https://metadot.app/',
    guideUrl: 'https://docs.metadot.app/install-metadot-on-chrome-and-firefox',
    isSupportBrowserExtension: true,
    isSupportMobileApp: false,
  },
  [SupportWallet.HanaNative]: {
    img: require('/src/assets/img/logo-hana.png'),
    name: 'Hana Wallet (Native)',
    source: SupportWallet.HanaNative,
    walletUrl: 'https://hanawallet.io/',
    guideUrl: 'https://hanawallet.io/',
    isSupportBrowserExtension: true,
    isSupportMobileApp: false,
  },
  [SupportWallet.OneKeyNative]: {
    img: require('/src/assets/img/onekey.png'),
    name: 'OneKey',
    source: SupportWallet.OneKeyNative,
    walletUrl: 'https://onekey.so/download',
    guideUrl: 'https://help.onekey.so/',
    isSupportBrowserExtension: true,
    isSupportMobileApp: true,
  },
  [SupportWallet.EnkryptNative]: {
    img: require('/src/assets/img/logo-enkrypt.svg'),
    name: 'Enkrypt (Native)',
    source: SupportWallet.EnkryptNative,
    walletUrl: 'https://www.enkrypt.com',
    guideUrl: 'https://myetherwallet.gitbook.io/enkrypt-documentation/',
    isSupportBrowserExtension: true,
    isSupportMobileApp: false,
  },
};

export const supportEvmWalletObj = {
  [SupportWallet.GridlockEvm]: {
    img: require('/src/assets/img/logo-gridlock.png'),
    name: 'Gridlock Wallet (EVM)',
    source: SupportWallet.GridlockEvm,
    walletUrl: 'https://gridlock.network/',
    guideUrl: 'https://gridlock.network/',
    isSupportBrowserExtension: false,
    isSupportMobileApp: true,
    ethExtension: 'ethereum',
  },
  [SupportWallet.MetaMask]: {
    img: require('/src/assets/img/metamask.png'),
    name: 'MetaMask',
    source: SupportWallet.MetaMask,
    walletUrl: 'https://metamask.io/',
    guideUrl: 'https://metamask.io/',
    isSupportBrowserExtension: true,
    isSupportMobileApp: true,
    ethExtension: 'ethereum',
  },
  [SupportWallet.OneKeyEvm]: {
    img: require('/src/assets/img/onekey.png'),
    name: 'OneKey (EVM)',
    source: SupportWallet.OneKeyEvm,
    walletUrl: 'https://onekey.so/download',
    guideUrl: 'https://help.onekey.so/',
    isSupportBrowserExtension: true,
    isSupportMobileApp: true,
    ethExtension: '$onekey.ethereum',
  },
  [SupportWallet.TalismanEvm]: {
    img: require('/src/assets/img/logo-talisman.svg'),
    name: 'Talisman (EVM)',
    source: SupportWallet.TalismanEvm,
    walletUrl: 'https://app.talisman.xyz/',
    guideUrl: 'https://app.talisman.xyz/',
    isSupportBrowserExtension: true,
    isSupportMobileApp: false,
    ethExtension: 'talismanEth',
  },
  [SupportWallet.SubWalletEvm]: {
    img: require('/src/assets/img/logo-subwallet.webp'),
    name: 'SubWallet (EVM)',
    source: SupportWallet.SubWalletEvm,
    walletUrl: 'https://subwallet.app/download.html',
    guideUrl: 'https://docs.subwallet.app/user-guide/install-subwallet',
    isSupportBrowserExtension: true,
    isSupportMobileApp: true,
    ethExtension: 'SubWallet',
  },
  [SupportWallet.Wallet3]: {
    img: require('/src/assets/img/logo-wallet3.svg'),
    name: 'Wallet 3',
    source: SupportWallet.Wallet3,
    walletUrl: 'https://wallet3.io',
    guideUrl: 'https://docs.wallet3.io',
    isSupportBrowserExtension: false,
    isSupportMobileApp: true,
    ethExtension: 'ethereum',
  },
  [SupportWallet.NovaEvm]: {
    img: require('/src/assets/img/logo-nova.png'),
    name: 'Nova Wallet (EVM)',
    source: SupportWallet.NovaEvm,
    walletUrl: 'https://novawallet.io/',
    guideUrl: 'https://novawallet.io/',
    isSupportBrowserExtension: false,
    isSupportMobileApp: true,
    ethExtension: 'ethereum',
  },
  [SupportWallet.HanaEvm]: {
    img: require('/src/assets/img/logo-hana.png'),
    name: 'Hana Wallet (EVM)',
    source: SupportWallet.HanaEvm,
    walletUrl: 'https://hanawallet.io/',
    guideUrl: 'https://hanawallet.io/',
    isSupportBrowserExtension: true,
    isSupportMobileApp: false,
    ethExtension: 'hanaWalletEth',
  },
  [SupportWallet.EnkryptEvm]: {
    img: require('/src/assets/img/logo-enkrypt.svg'),
    name: 'Enkrypt (EVM)',
    source: SupportWallet.EnkryptEvm,
    walletUrl: 'https://www.enkrypt.com',
    guideUrl: 'https://myetherwallet.gitbook.io/enkrypt-documentation/',
    isSupportBrowserExtension: true,
    isSupportMobileApp: false,
    ethExtension: 'enkrypt.providers.ethereum',
  },
  [SupportWallet.WalletConnect]: {
    img: require('/src/assets/img/wallet-connect.png'),
    name: 'WalletConnect',
    source: SupportWallet.WalletConnect,
    walletUrl: 'https://walletconnect.com/',
    guideUrl: 'https://walletconnect.com/',
    isSupportBrowserExtension: true,
    isSupportMobileApp: false,
    ethExtension: SupportWallet.WalletConnect,
  },
};

export const supportAllWalletsObj = {
  ...supportEvmWalletObj,
  ...supportWalletObj,
};

export const supportEvmWallets = objToArray(supportEvmWalletObj) as Wallet[];
export const supportWallets = objToArray(supportWalletObj) as Wallet[];
export const supportAllWallets = objToArray(supportAllWalletsObj) as Wallet[];
