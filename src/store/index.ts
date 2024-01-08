import { store } from 'quasar/wrappers';
import { InjectionKey } from 'vue';
import { createStore, Store as VuexStore, useStore as vuexUseStore } from 'vuex';

import { GeneralStateInterface } from './general/state';
import { ContractsStateInterface } from './contracts/state';
import { DappStateInterface } from './dapp-staking/state';
import { AssetsStateInterface } from './assets/state';

import general from './general';
import contracts from './contracts';
import dapps from './dapp-staking';
import assets from './assets';
import stakingV3 from '../staking-v3/store';
import { DappStakingState } from 'src/staking-v3/store/state';

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export interface StateInterface {
  // Define your own store structure, using submodules if needed
  // example: ExampleStateInterface;
  // Declared as unknown to avoid linting issue. Best to strongly type as per the line above.
  general: GeneralStateInterface;
  contracts: ContractsStateInterface;
  dapps: DappStateInterface;
  assets: AssetsStateInterface;
  stakingV3: DappStakingState;
}

// provide typings for `this.$store`
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: VuexStore<StateInterface>;
  }
}

// provide typings for `useStore` helper
export const storeKey: InjectionKey<VuexStore<StateInterface>> = Symbol('vuex-key');

export default store(function (/* { ssrContext } */) {
  const Store = createStore<StateInterface>({
    modules: {
      general,
      contracts,
      dapps,
      assets,
      stakingV3,
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: !!process.env.DEBUGGING,
  });

  return Store;
});

export function useStore() {
  return vuexUseStore(storeKey);
}
