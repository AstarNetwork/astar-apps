import { objToArray } from 'src/hooks/helper/common';

// Memo: enum value comes from:
// keyring.accounts.subject.subscribe -> account[address].json.meta.source
export enum SupportWallet {
  PolkadotJs = 'polkadot-js',
  Clover = 'clover',
  MetaMask = 'metamask',
}

export const supportWalletObj = {
  [SupportWallet.PolkadotJs]: {
    img: require('/src/assets/img/logo-polkadot-js.png'),
    name: 'Polkadot.js',
    source: SupportWallet.PolkadotJs,
    walletUrl: 'https://polkadot.js.org/extension/',
    guideUrl: 'https://www.youtube.com/watch?v=r-fAy7Ta_vY',
  },
  [SupportWallet.MetaMask]: {
    img: require('/src/assets/img/metamask.png'),
    name: 'MetaMask',
    source: SupportWallet.MetaMask,
    walletUrl: 'https://metamask.io/',
    guideUrl: 'https://metamask.io/',
  },
  [SupportWallet.Clover]: {
    img: require('/src/assets/img/logo-clover.png'),
    name: 'Clover',
    source: SupportWallet.Clover,
    walletUrl: 'https://clover.finance/',
    guideUrl: 'https://docs.clover.finance/quick-start/about-clover',
  },
};

export const supportWallets = objToArray(supportWalletObj);
