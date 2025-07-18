import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { blockExplorerUrls } from 'src/config/web3';
import type Web3 from 'web3';

export const docsUrl = {
  topPage: 'https://docs.astar.network',
  evmDeposit:
    'https://docs.astar.network/docs/use/manage-assets/transfer-tokens#sending-astrsdn-to-astar-native-accounts-from-astar-evm',
  troubleShooting: 'https://docs.astar.network/docs/use/troubleshooting/',
  createPromotion: 'https://docs.astar.network/docs/use/dapp-staking/for-devs/create-promotion/',
  tokenomics2: 'https://docs.astar.network/docs/learn/tokenomics2/',
  inflation: 'https://docs.astar.network/docs/learn/tokenomics2/Inflation/',
  faqLedger:
    'https://docs.astar.network/docs/learn/dapp-staking/dapp-staking-faq/#q-i-am-a-leger-astar-native-app-user-what-do-i-need-to-do',
  learnDappStaking: 'https://docs.astar.network/docs/learn/dapp-staking/',
  dappStakingForStakers: 'https://docs.astar.network/docs/use/dapp-staking/for-stakers/',
  dappStakingStaked16Dapps:
    'https://docs.astar.network/docs/learn/dapp-staking/dapp-staking-faq/#q-ive-staked-16-dapps-and-now-i-cant-add-or-move-tokens-and-im-getting-an-error-what-should-i-do',
  availableWallets: 'https://docs.astar.network/docs/use/get-started/',
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

export const faucetSethLink = 'https://sepoliafaucet.com/';

export const deepLink = {
  metamask: `https://metamask.app.link/dapp/${window.location.host}/${deepLinkPath.metamask}`,
};

export const stagingOrigin = 'https://staging.portal.astar.network';
export const productionOrigin = 'https://portal.astar.network';
// Memo: for debugging
// export const productionOrigin = 'http://localhost:8080';

export const polkasafeUrl = 'https://app.polkasafe.xyz';

export const polkadotJsUrl = {
  settings: {
    astar: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.astar.network#',
    shiden: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.shiden.astar.network#',
    shibuya: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.shibuya.astar.network#',
  },
};

export const ccipExplorerUrl = 'https://ccip.chain.link';

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

export const getEvmExplorerUrl = async (hash: string, web3: Web3): Promise<string> => {
  const connectedChainId = await web3.eth.net.getId();
  const blockExplorerUrl = blockExplorerUrls[connectedChainId];
  return `${blockExplorerUrl}/tx/${hash}`;
};

export const vastrBridgeLink =
  'https://stargate.finance/bridge?srcChain=astar&srcToken=0xfffFffff00000000000000010000000000000010&dstChain=soneium&dstToken=0x60336f9296C79dA4294A19153eC87F8E52158e5F';

export const stargateBridgeLink = 'https://stargate.finance/bridge';
