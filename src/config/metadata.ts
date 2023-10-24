import { providerEndpoints } from 'src/config/chainEndpoints';
import { capitalize } from '@astar-network/astar-sdk-core';
import { LOCAL_STORAGE } from './localStorage';
import { Path } from 'src/router';

interface MetaData {
  title: string;
  meta: {
    description: {
      name: string;
      content: string;
    };
  };
}

export const opengraphMeta = (displayName: string, networkName: string) => {
  return {
    ogTitle: {
      property: 'og:title',
      template() {
        return `${networkName} Portal - ${displayName}`;
      },
    },
    ogDescription: {
      property: 'og:description',
      template() {
        return `Your one-stop platform for the ${networkName} ecosystem - Wallet / Staking / Bridging`;
      },
    },
    ogSiteName: {
      property: 'og:site_name',
      template() {
        return `${networkName} Portal`;
      },
    },
  };
};

const networkIdx = localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX);
const currency = localStorage.getItem(LOCAL_STORAGE.DEFAULT_CURRENCY);

const networkName = capitalize(providerEndpoints[Number(networkIdx)].networkAlias);

export const meta = {
  title: {
    assets: {
      assets: 'Assets',
      transfer: 'Transfer',
      xvmTransfer: 'XVM Transfer',
    },
    dashboard: 'Dashboard',
    dappsStaking: {
      dappStaking: 'Dapp Staking',
      discoverDapps: 'Discover dApps',
      registerDapp: 'Register dApp',
      stake: 'Stake',
    },
    bridge: 'Bridge assets',
  },
  description: {
    assets: `${networkName} Portal is the hub of multi-chain, one-stop platform for managing assets and dApp Staking - build2earn protocol. Asset page provides seem less cross-chain transfers using Polkadot unique technology XCM as well as newly invented Cross Virtual Machine technology XVM.`,
    dappsStaking: `${networkName} dApp Staking is a unique protocol that designed to support builders by providing basic income. Build2Earn program sustains the early stage of builders as well as rewarding the successful projects`,
    dashboard: `${networkName} Portal is the hub of multi-chain, one-stop platform for managing assets and dApp Staking - build2earn protocol. Dashboard page provides statics of ${currency}, blocks of the ${networkName} Network and TVL.`,
  },
};

const buildMeta = ({
  title,
  content,
  ogImageUrl,
}: {
  title: string;
  content: string;
  ogImageUrl?: string;
}) => {
  return {
    title,
    meta: {
      description: {
        name: 'description',
        content,
      },
      twitterImage: {
        property: 'twitter:image',
        content: ogImageUrl ? ogImageUrl : 'https://portal.astar.network/images/card-img.jpg',
      },
      ogImage: {
        property: 'og:image',
        content: ogImageUrl ? ogImageUrl : 'https://portal.astar.network/images/card-img.jpg',
      },
    },
  };
};

export const generateMeta = (path: Path, ogImageUrl?: string): MetaData => {
  switch (path) {
    case Path.Assets:
      return buildMeta({
        title: meta.title.assets.assets,
        content: meta.description.assets,
      });

    case Path.Transfer:
      return buildMeta({
        title: meta.title.assets.transfer,
        content: meta.description.assets,
      });

    case Path.Bridge:
      return buildMeta({
        title: meta.title.bridge,
        content: meta.description.assets,
      });

    case Path.XvmTransfer:
      return buildMeta({
        title: meta.title.assets.xvmTransfer,
        content: meta.description.assets,
      });

    case Path.Discover:
      return buildMeta({
        title: meta.title.dappsStaking.discoverDapps,
        content: meta.description.dappsStaking,
      });

    case Path.Dapp:
      return buildMeta({
        title: meta.title.dappsStaking.dappStaking,
        content: meta.description.dappsStaking,
        ogImageUrl,
      });

    case Path.Dashboard:
      return buildMeta({
        title: meta.title.dashboard,
        content: meta.description.dashboard,
      });

    case Path.Register:
      return buildMeta({
        title: meta.title.dappsStaking.registerDapp,
        content: meta.description.dappsStaking,
      });

    case Path.Stake:
      return buildMeta({
        title: meta.title.dappsStaking.stake,
        content: meta.description.dappsStaking,
      });

    default:
      return buildMeta({
        title: meta.title.assets.assets,
        content: meta.description.assets,
      });
  }
};
