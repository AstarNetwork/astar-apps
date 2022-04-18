import { RouteRecordRaw } from 'vue-router';

import Assets from 'pages/Assets.vue';
import Store from 'src/pages/DappStaking.vue';
import Dashboard from 'src/pages/Dashboard.vue';
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
    path: '/assets',
    name: 'Assets',
    component: Assets,
    children: [
      {
        path: 'deeplink-metamask',
        component: Assets,
      },
    ],
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
  },
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

export const getHeaderName = (path: string) => {
  if (path === 'dashboard') {
    return 'Dashboard';
  } else if (path === 'assets') {
    return 'Assets';
  } else if (path === 'dapp-staking') {
    return 'dApp Staking';
  } else if (path === 'bridge') {
    return 'Bridge';
  }
  return '';
};

export default routes;
