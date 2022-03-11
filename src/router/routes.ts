import { RouteRecordRaw } from 'vue-router';

import Balance from 'pages/Balance.vue';
import Assets from 'pages/Assets.vue';
// import DApps from 'src/pages/Contract.vue';
import Store from 'src/pages/DappStaking.vue';
import ConnectWallet from 'src/components/balance/ConnectWallet.vue';
// import CreateDappsTab from 'components/contracts/CreateDappsTab.vue';
import DiscoverDappsTab from 'components/dapp-staking/DiscoverDappsTab.vue';
import ManageDappsTab from 'components/dapp-staking/ManageDappsTab.vue';
import EvmWidget from 'components/bridge/evm/EvmWidget.vue';
import Bridge from 'src/pages/Bridge.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/assets',
  },
  {
    path: '/store/discover-dapps',
    redirect: '/dapp-staking/discover',
  },
  {
    path: '/balance',
    name: 'Balance',
    component: Balance,
    children: [
      {
        path: '',
        redirect: '/balance/wallet',
      },
      {
        path: 'balance-plasm',
        redirect: '/balance/wallet',
      },
      {
        path: 'wallet',
        component: ConnectWallet,
        children: [
          {
            path: 'deeplink-metamask',
            component: ConnectWallet,
          },
        ],
      },
    ],
  },
  {
    path: '/assets',
    name: 'Assets',
    component: Assets,
    children: [
      // {
      //   path: '',
      //   redirect: '/assets',
      // },
      // {
      //   path: 'wallet',
      //   component: ConnectWallet,
      // },
    ],
  },
  // {
  //   path: '/contracts',
  //   name: 'Contracts',
  //   component: DApps,
  //   children: [
  //     {
  //       path: '',
  //       redirect: '/contracts/create-contract',
  //     },
  //     {
  //       path: 'create-dapps',
  //       redirect: '/contracts/create-contract',
  //     },
  //     {
  //       path: 'create-contract',
  //       component: CreateDappsTab,
  //     },
  //   ],
  // },
  {
    path: '/dapp-staking',
    name: 'dApp Staking',
    component: Store,
    children: [
      {
        path: '',
        redirect: '/dapp-staking/discover',
      },
      {
        path: 'discover',
        component: DiscoverDappsTab,
      },
      {
        path: 'manage',
        component: ManageDappsTab,
      },
    ],
  },
  {
    path: '/bridge',
    name: 'Bridge',
    component: Bridge,
    children: [
      {
        path: '',
        redirect: '/bridge/evm',
      },
      {
        path: 'evm',
        component: EvmWidget,
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
