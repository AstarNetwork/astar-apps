import Assets from 'components/assets/Assets.vue';
import L1 from 'components/bridge/ethereum/L1.vue';
import AssetsPage from 'pages/AssetsPage.vue';
import Transfer from 'pages/Transfer.vue';
import BridgePage from 'pages/BridgePage.vue';
import BridgeSelection from 'src/components/bridge/BridgeSelection.vue';
import XvmTransfer from 'pages/XvmTransfer.vue';
import { endpointKey, getNetworkName } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import Store from 'src/pages/DappStaking.vue';
import StakingTop from 'components/dapp-staking/StakingTop.vue';
import Dashboard from 'src/pages/Dashboard.vue';
import RegisterDapp from 'src/pages/RegisterDapp.vue';
import StakeManage from 'src/pages/StakeManage.vue';
import DappPage from 'src/pages/DappPage.vue';
import DappStakingV3Page from 'src/pages/DappStakingV3.vue';
import DiscoverV3 from 'src/staking-v3/components/DiscoverV3.vue';
import { RouteRecordRaw } from 'vue-router';

export {
  buildTransferPageLink,
  getHeaderName,
  buildXvmTransferPageLink,
  buildEthereumBridgePageLink,
} from 'src/router/utils';

const networkIdxStore = localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX);

export const networkParam =
  '/' +
  getNetworkName(networkIdxStore ? (Number(networkIdxStore) as endpointKey) : endpointKey.ASTAR);

export enum Path {
  Assets = '/assets',
  Bridge = '/bridge',
  Ethereum = '/ethereum',
  Dashboard = '/dashboard',
  DappStaking = '/dapp-staking',
  Discover = '/discover',
  Stake = '/stake',
  Dapp = '/dapp',
  Transfer = '/transfer',
  XvmTransfer = '/xvm-transfer',
  Register = '/register',
  DappStakingV3 = '/dapp-staking-v3',
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
    path: Path.Bridge,
    redirect: networkParam + Path.Bridge,
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
    path: Path.DappStakingV3,
    redirect: networkParam + Path.DappStakingV3 + Path.Discover,
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
      {
        path: 'xvm-transfer',
        component: XvmTransfer,
      },
    ],
  },
  {
    path: '/:network' + Path.Bridge,
    name: 'Bridge',
    component: BridgePage,
    children: [
      {
        path: '',
        component: BridgeSelection,
      },
      {
        path: 'ethereum',
        component: L1,
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
  {
    path: '/:network' + Path.DappStakingV3,
    name: 'dApp Staking v3',
    component: DappStakingV3Page,
    children: [
      {
        path: '',
        redirect: Path.DappStaking + networkParam + Path.Discover,
      },
      {
        path: 'discover',
        component: DiscoverV3,
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
