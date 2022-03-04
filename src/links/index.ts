export const docsUrl = {
  topPage: 'https://docs.astar.network',
  evmDeposit:
    'https://docs.astar.network/tutorial/how-to-send-astr-sdn-from-metamask-to-polkadot.js',
};

export const socialUrl = {
  twitter: 'https://twitter.com/AstarNetwork',
  telegram: 'https://t.me/PlasmOfficial',
  discord: 'https://discord.gg/Z3nC9U4',
  github: 'https://github.com/AstarNetwork',
};

export const deepLinkPath = {
  metamask: '#/balance/wallet/deeplink-metamask',
  mathwallet: '#/balance/wallet/deeplink-mathwallet',
};

export const deepLink = {
  metamask: `https://metamask.app.link/dapp/${window.location.host}/${deepLinkPath.metamask}`,
  mathwallet: `mathwallet://mathwallet.org?action=link&value=${window.location.host}/${deepLinkPath.mathwallet}
  `,
};
