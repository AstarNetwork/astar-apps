import Assets from 'components/assets/Assets.vue';
import AssetsPage from 'pages/AssetsPage.vue';
import Transfer from 'pages/Transfer.vue';
import { endpointKey, getNetworkName } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import Store from 'src/pages/DappStaking.vue';
import StakingTop from 'components/dapp-staking-v2/StakingTop.vue';
import Dashboard from 'src/pages/Dashboard.vue';
import RegisterDapp from 'src/pages/RegisterDapp.vue';
import StakeManage from 'src/pages/StakeManage.vue';
import DappPage from 'src/pages/DappPage.vue';
import { RouteRecordRaw } from 'vue-router';

export { buildTransferPageLink, getHeaderName } from 'src/router/utils';

const networkIdxStore = localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX);

export const networkParam =
  '/' +
  getNetworkName(networkIdxStore ? (Number(networkIdxStore) as endpointKey) : endpointKey.ASTAR);

export enum Path {
  Assets = '/assets',
  Dashboard = '/dashboard',
  DappStaking = '/dapp-staking',
  Discover = '/discover',
  Stake = '/stake',
  Dapp = '/dapp',
  Transfer = '/transfer',
  Register = '/register',
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: networkParam + Path.Assets,
  },
  {
    path: Path.Assets,
    redirect: networkParam + Path.Assets,
  },
  {
    path: Path.Dashboard,
    redirect: networkParam + Path.Dashboard,
  },
  {
    path: Path.DappStaking,
    redirect: networkParam + Path.DappStaking + Path.Discover,
  },
  {
    path: Path.DappStaking + Path.Discover,
    redirect: networkParam + Path.DappStaking + Path.Discover,
  },
  {
    path: '/store/discover-dapps',
    redirect: networkParam + Path.DappStaking + Path.Discover,
  },
  {
    path: '/:network' + Path.Assets,
    name: 'Assets',
    component: AssetsPage,
    children: [
      {
        path: 'deeplink-metamask',
        component: Assets,
      },
      {
        path: '',
        component: Assets,
      },
      {
        path: 'transfer',
        component: Transfer,
      },
    ],
  },

  {
    path: '/balance',
    name: 'Balance',
    redirect: networkParam + Path.Assets,
    children: [
      {
        path: '',
        redirect: Path.Assets,
      },
      {
        path: 'wallet',
        redirect: Path.Assets,
      },
    ],
  },
  {
    path: '/:network' + Path.Dashboard,
    name: 'Dashboard',
    component: Dashboard,
  },
  {
    path: '/:network' + Path.DappStaking,
    name: 'dApp Staking',
    component: Store,
    children: [
      {
        path: '',
        redirect: Path.DappStaking + networkParam + Path.Discover,
      },
      {
        path: 'discover',
        component: StakingTop,
      },
      {
        path: 'stake',
        component: StakeManage,
      },
      {
        path: 'dapp',
        component: DappPage,
      },
      {
        path: 'register',
        component: RegisterDapp,
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    redirect: '/',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
