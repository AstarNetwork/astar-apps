import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { StateInterface } from 'src/store';
import routes, { Path } from 'src/router/routes';
import { $api } from '../boot/api';
import { endpointKey } from '../config/chainEndpoints';
export { Path } from 'src/router/routes';
export { getHeaderName, buildTransferPageLink } from 'src/router/utils';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route<StateInterface>(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    // Memo: scrollBehavior is not working
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, from, next) => {
    // Prevent accessing to dApp staking pages if v3 is deployed to a node, but not supported by UI
    const networksSupportV3 = ['development'];
    const isStakingV3 = $api?.query.hasOwnProperty('dappStaking');
    const dontNavigateToDappStaking =
      to.path.includes('/dapp-staking') &&
      !to.path.includes('/maintenance') &&
      !networksSupportV3.includes(to.params?.network?.toString());

    if (isStakingV3 && dontNavigateToDappStaking) {
      next({ path: Path.DappStaking + Path.Maintenance });
    } else {
      next();
    }
  });

  return Router;
});
