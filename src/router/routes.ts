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
        redirect: '/balance/balance-plasm',
      },
      {
        path: 'balance-plasm',
        component: BalancePlasm,
      },
    ],
  },
  {
    path: '/dapps',
    name: 'dApps',
    component: DApps,
    children: [
      {
        path: '',
        redirect: '/dapps/create-dapps',
      },
      {
        path: 'create-dapps',
        component: CreateDappsTab,
      },
    ],
  },
  {
    path: '/store',
    name: 'Store',
    component: Store,
    children: [
      {
        path: '',
        redirect: '/store/discover-dapps',
      },
      {
        path: 'discover-dapps',
        component: DiscoverDappsTab,
      },
      {
        path: 'manage-dapps',
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
