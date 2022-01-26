import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/balance',
  },
  {
    path: '/store/discover-dapps',
    redirect: '/dapp-staking/discover',
  },
  {
    path: '/balance',
    name: 'Balance',
    component: () => import('pages/Balance.vue'),
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
        component: () => import('components/balance/ConnectWallet.vue'),
      },
    ],
  },
  {
    path: '/contracts',
    name: 'Contracts',
    component: () => import('pages/Contract.vue'),
    children: [
      {
        path: '',
        redirect: '/contracts/create-contract',
      },
      {
        path: 'create-dapps',
        redirect: '/contracts/create-contract',
      },
      {
        path: 'create-contract',
        component: () => import('components/contracts/CreateDappsTab.vue'),
      },
    ],
  },
  {
    path: '/dapp-staking',
    name: 'dApp Staking',
    component: () => import('pages/DappStaking.vue'),
    children: [
      {
        path: '',
        redirect: '/dapp-staking/discover',
      },
      {
        path: 'discover',
        component: () => import('components/dapp-staking/DiscoverDappsTab.vue'),
      },
      {
        path: 'manage',
        component: () => import('components/dapp-staking/ManageDappsTab.vue'),
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
