import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';

export const docsUrl = {
  topPage: 'https://docs.astar.network',
  evmDeposit:
    'https://docs.astar.network/tutorial/how-to-send-astr-sdn-from-metamask-to-polkadot.js',
  troubleShooting: 'https://docs.astar.network/docs/user-guides/troubleshooting',
};

export const socialUrl = {
  twitter: 'https://twitter.com/AstarNetwork',
  telegram: 'https://t.me/PlasmOfficial',
  discord: 'https://discord.gg/astarnetwork',
  github: 'https://github.com/AstarNetwork',
  reddit: 'https://www.reddit.com/r/AstarNetwork/',
  forum: 'https://forum.astar.network/',
  youtube: 'https://www.youtube.com/c/AstarNetwork',
};

export const deepLinkPath = {
  metamask: '#/assets/deeplink-metamask',
};

export const deepLink = {
  metamask: `https://metamask.app.link/dapp/${window.location.host}/${deepLinkPath.metamask}`,
};

// Memo: use for debugging
// export const devOrigin = 'http://localhost:8080';
export const stagingOrigin = 'https://staging.portal.astar.network';
export const productionOrigin = 'https://portal.astar.network';
export const decentralizedOrigin = 'https://decentralized.portal.astar.network';

export const polkadotJsUrl = {
  settings: {
    astar: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.astar.network#/settings',
    shiden: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.shiden.astar.network#/settings',
    shibuya: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.shibuya.astar.network#/settings',
  },
};

export const getSubscanExtrinsic = ({
  subscanBase,
  hash,
}: {
  subscanBase?: string;
  hash: string;
}): string => {
  if (subscanBase) {
    return `${subscanBase}/extrinsic/${hash}`;
  } else {
    const pathname = window.location.pathname;
    let network = pathname.split('/')[1];
    if (network === providerEndpoints[endpointKey.SHIBUYA].networkAlias) {
      network = 'shibuya';
    }
    return `https://${network}.subscan.io/extrinsic/${hash}`;
  }
};

export const getBlockscoutTx = (hash: string): string => {
  const pathname = window.location.pathname;
  let network = pathname.split('/')[1];
  if (network === providerEndpoints[endpointKey.SHIBUYA].networkAlias) {
    network = 'shibuya';
  }
  return `https://blockscout.com/${network}/tx/${hash}`;
};
