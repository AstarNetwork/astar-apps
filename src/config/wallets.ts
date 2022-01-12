// Memo: enum value comes from:
// keyring.accounts.subject.subscribe -> account[address].json.meta.source
export enum SupportWallets {
  PolkadotJs = 'polkadot-js',
  Clover = 'clover',
  MetaMask = 'metamask',
}

export const supportWallets = [
  {
    img: require('/src/assets/img/logo-polkadot-js.png'),
    name: 'Polkadot.js',
    source: SupportWallets.PolkadotJs,
  },
  {
    img: require('/src/assets/img/metamask.png'),
    name: 'MetaMask',
    source: SupportWallets.MetaMask,
  },
  {
    img: require('/src/assets/img/logo-clover.png'),
    name: 'Clover',
    source: SupportWallets.Clover,
  },
];
