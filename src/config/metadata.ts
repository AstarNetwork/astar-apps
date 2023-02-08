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
  },
  description: {
    assets:
      'Astar Portal is the hub of multi-chain, one-stop platform for managing assets and dApp Staking - build2earn protocol. Asset page provides seem less cross-chain transfers using Polkadot unique technology XCM as well as newly invented Cross Virtual Machine technology XVM.',
    dappsStaking:
      'Astar dApp Staking is a unique protocol that designed to support builders by providing basic income. Build2Earn program sustains the early stage of builders as well as rewarding the successful projects',
    dashboard:
      'Astar Portal is the hub of multi-chain, one-stop platform for managing assets and dApp Staking - build2earn protocol. Dashboard page provides statics of ASTR, blocks of the Astar Network and TVL.',
  },
};
