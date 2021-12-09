import { RouteRecordRaw } from 'vue-router';

import Balance from 'pages/Balance.vue';
import DApps from 'pages/DApps.vue';
import Store from 'pages/Store.vue';
import BalancePlasm from 'components/balance/BalancePlasm.vue';
import CreateDappsTab from 'components/dapps/CreateDappsTab.vue';
import DiscoverDappsTab from 'components/store/DiscoverDappsTab.vue';
import ManageDappsTab from 'components/store/ManageDappsTab.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/balance',
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
        path: 'wallet',
        component: BalancePlasm,
      },
    ],
  },
  {
    path: '/contracts',
    name: 'Contracts',
    component: DApps,
    children: [
      {
        path: '',
        redirect: '/contracts/create-contract',
      },
      {
        path: 'create-contract',
        component: CreateDappsTab,
      },
    ],
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

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
