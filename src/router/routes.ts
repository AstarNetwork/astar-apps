import { endpointKey, getNetworkName } from 'src/config/chainEndpoints';
import DiscoverDappsTab from 'components/dapp-staking/DiscoverDappsTab.vue';
import DappsHome from 'src/v2/components/dapp-staking/DappsHome.vue';
import ManageDappsTab from 'components/dapp-staking/ManageDappsTab.vue';
import AssetsPage from 'pages/AssetsPage.vue';
import Assets from 'components/assets/Assets.vue';
import Transfer from 'pages/Transfer.vue';
import Store from 'src/pages/DappStaking.vue';
import Dashboard from 'src/pages/Dashboard.vue';
import { RouteRecordRaw } from 'vue-router';
import { LOCAL_STORAGE } from 'src/config/localStorage';

export { getHeaderName, buildTransferPageLink } from 'src/router/utils';

const networkIdxStore = localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX);

export const networkParam =
  '/' +
  getNetworkName(networkIdxStore ? (Number(networkIdxStore) as endpointKey) : endpointKey.ASTAR);

export enum Path {
  Assets = '/assets',
  Dashboard = '/dashboard',
  DappStaking = '/dapp-staking',
  Discover = '/discover',
  Transfer = '/transfer',
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
        component: DappsHome,
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
    redirect: '/',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
