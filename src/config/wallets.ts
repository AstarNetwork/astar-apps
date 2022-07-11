import { EthereumProvider } from 'src/hooks/types/CustomSignature';
import { objToArray } from 'src/hooks/helper/common';

// Memo: enum value comes from:
//    const extensions = await getInjectedExtensions();
//    console.log('extensions', extensions); -> extensions[index] -> name
// Memo: Mobile wallets such as Math and Nova returns 'polkadot-js' as the wallet name

export enum SupportWallet {
  PolkadotJs = 'polkadot-js',
  MetaMask = 'metamask',
  Clover = 'clover',
  Math = 'mathwallet',
  Nova = 'nova',
  TalismanEvm = 'talismanEth',
  TalismanNative = 'talisman',
  SubWalletNative = 'subwallet-js',
  SubWalletEvm = 'SubWallet',
  Metadot = 'metadot',
  Wallet3 = 'wallet3',
}

export const WalletModalOption = {
  SelectWallet: 'SelectWallet',
  SelectSubstrateAccount: 'SelectSubstrateAccount',
  NoExtension: 'NoExtension',
  OutdatedWallet: 'OutdatedWallet',
  PolkadotJs: SupportWallet.PolkadotJs,
  Clover: SupportWallet.Clover,
  MetaMask: SupportWallet.MetaMask,
  Math: SupportWallet.Math,
  Nova: SupportWallet.Nova,
  TalismanEvm: SupportWallet.TalismanEvm,
  TalismanNative: SupportWallet.TalismanNative,
  SubWallet: SupportWallet.SubWalletNative,
  SubWalletEvm: SupportWallet.SubWalletEvm,
  Metadot: SupportWallet.Metadot,
  Wallet3: SupportWallet.Wallet3,
};

export const SubstrateWallets = [
  SupportWallet.PolkadotJs,
  SupportWallet.Clover,
  SupportWallet.Math,
  SupportWallet.Nova,
  SupportWallet.TalismanNative,
  SupportWallet.SubWalletNative,
  SupportWallet.Metadot,
  SupportWallet.Wallet3,
];

export interface Wallet {
  img: any;
  name: string;
  source: SupportWallet;
  walletUrl: string;
  guideUrl: string;
  isSupportBrowserExtension: boolean;
  isSupportMobileApp: boolean;
  ethExtension?: EthereumProvider;
}

export const supportWalletObj = {
  [SupportWallet.PolkadotJs]: {
    img: require('/src/assets/img/logo-polkadot-js.png'),
    name: 'Polkadot.js',
    source: SupportWallet.PolkadotJs,
    walletUrl: 'https://polkadot.js.org/extension/',
    guideUrl: 'https://www.youtube.com/watch?v=r-fAy7Ta_vY',
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
  [SupportWallet.SubWalletNative]: {
    img: require('/src/assets/img/logo-subwallet.svg'),
    name: 'SubWallet (Native)',
    source: SupportWallet.SubWalletNative,
    walletUrl: 'https://subwallet.app/',
    guideUrl: 'https://docs.subwallet.app/user-guide/how-to-install-subwallet',
    isSupportBrowserExtension: true,
    isSupportMobileApp: false,
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
};

export const supportEvmWalletObj = {
  [SupportWallet.MetaMask]: {
    img: require('/src/assets/img/metamask.png'),
    name: 'MetaMask',
    source: SupportWallet.MetaMask,
    walletUrl: 'https://metamask.io/',
    guideUrl: 'https://metamask.io/',
    isSupportBrowserExtension: true,
    isSupportMobileApp: true,
    ethExtension: window.ethereum,
  },
  [SupportWallet.TalismanEvm]: {
    img: require('/src/assets/img/logo-talisman.svg'),
    name: 'Talisman (EVM)',
    source: SupportWallet.TalismanEvm,
    walletUrl: 'https://app.talisman.xyz/',
    guideUrl: 'https://app.talisman.xyz/',
    isSupportBrowserExtension: true,
    isSupportMobileApp: false,
    ethExtension: window.talismanEth,
  },
  [SupportWallet.SubWalletEvm]: {
    img: require('/src/assets/img/logo-subwallet.svg'),
    name: 'SubWallet (EVM)',
    source: SupportWallet.SubWalletEvm,
    walletUrl: 'https://subwallet.app/',
    guideUrl: 'https://docs.subwallet.app/user-guide/how-to-install-subwallet/',
    isSupportBrowserExtension: true,
    isSupportMobileApp: false,
    ethExtension: window.SubWallet,
  },
  [SupportWallet.Wallet3]: {
    img: require('/src/assets/img/logo-wallet3.svg'),
    name: 'Wallet 3',
    source: SupportWallet.Wallet3,
    walletUrl: 'https://wallet3.io',
    guideUrl: 'https://docs.wallet3.io',
    isSupportBrowserExtension: false,
    isSupportMobileApp: true,
    ethExtension: window.ethereum,
  },
};

export const supportAllWalletsObj = {
  ...supportEvmWalletObj,
  ...supportWalletObj,
};

export const supportEvmWallets = objToArray(supportEvmWalletObj) as Wallet[];
export const supportWallets = objToArray(supportWalletObj) as Wallet[];
export const supportAllWallets = objToArray(supportAllWalletsObj) as Wallet[];
