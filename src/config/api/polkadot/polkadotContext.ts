import { provide, inject, reactive, toRefs, readonly } from 'vue';
import { ApiPromise } from '@polkadot/api';
import { keyring } from '@polkadot/ui-keyring';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { InjectedExtension } from '@polkadot/extension-inject/types';
import { UnsubscribePromise } from '@polkadot/api/types';
import BN from 'bn.js';
// note: this is a simplified Redux-like state management pattern using the Vue composition API.
// unlike Vuex; this method is not very strict, meaning that if someone really wanted to,
// they could just directly inject the raw state symbol and mutate it

interface ProviderState {
  api?: ApiPromise;
  extensions?: InjectedExtension[];
  currentAccount?: KeyringPair;
  currentBalance?: BN;
  unsubscribeAccountInfo?: UnsubscribePromise;
}

// global state that holds the reference to the API instance. This will be exposed as a readonly reference
const state = reactive<ProviderState>({
  api: undefined,
  extensions: undefined,
  currentAccount: undefined,
  currentBalance: undefined,
  unsubscribeAccountInfo: undefined,
});

// methods that can mutate the global state
const mutations = {
  setApi: (apiInst: ApiPromise) => {
    state.api = apiInst;
  },
  setExtensions: (extensions: InjectedExtension[]) => {
    state.extensions = extensions;
  },
  setCurrentAccount: (accountIndex: number) => {
    const api = state.api;
    if (!api) {
      return;
    }

    const accounts = keyring.getPairs();
    const accountsLength = accounts.length;
    if (accountsLength === 0 || accountIndex > accountsLength || accountIndex < 0) {
      return;
    }
    // unsubscribe previous AccountInfo
    const unsub = state.unsubscribeAccountInfo;
    if (unsub) {
      (async function () {
        (await unsub)();
      })();
    }

    const currentAccount = accounts[accountIndex];
    state.currentAccount = currentAccount;

    // subscribe current AccountInfo
    state.unsubscribeAccountInfo = api.query.system.account(currentAccount.address, (result) => {
      state.currentBalance = result.data.free.toBn();
    });
  },
};

type StateMutations = typeof mutations;

// define a unique key to access the value
const STATE_SYMBOL = Symbol('polkadot API read state');
const MUTATION_SYMBOL = Symbol('polkadot API state mutation');

export const providePolkadotContainer = (initApi: ApiPromise, extensions: InjectedExtension[]) => {
  mutations.setApi(initApi);
  mutations.setExtensions(extensions);

  // provide a readonly reference of the current state and mutation methods
  provide(STATE_SYMBOL, toRefs(readonly(state)));
  provide(MUTATION_SYMBOL, mutations);
};

export const usePolkadotContainerContext = () => {
  // allow access to the readonly state provided by the container
  return {
    ...toRefs(reactive({ ...inject<ProviderState>(STATE_SYMBOL) })),
    ...inject<StateMutations>(MUTATION_SYMBOL),
  };
};
