import { MutationTree } from 'vuex';
import { ConnectionType, GeneralStateInterface as State } from './state';
import type { InjectedExtension } from '@polkadot/extension-inject/types';
import { ApiPromise } from '@polkadot/api';

export interface GeneralMutations<S = State> {
  setInitialized(state: S): void;
  setLoading(state: S, isLoading: boolean): void;
  setShowAlertMsg(state: S, showAlert: boolean): void;
  setAlertMsg(state: S, msg: string): void;
  setAlertType(state: S, type: string): void;
  setApi(state: S, type: ApiPromise): void;
  setExtensions(state: S, type: InjectedExtension[]): void;
  setCurrentNetworkStatus(
    state: S,
    networkStatus: ConnectionType
  ): void;
  setCurrentNetworkIdx(state: S, networkIdx: number): void;
  setCurrentAccountIdx(state: S, accountIdx: number): void;
  setCurrentCustomEndpoint(state: S, endpoint: string): void;
}

const mutation: MutationTree<State> & GeneralMutations = {
  setInitialized(state) {
    state.initialized = true;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  setShowAlertMsg(state, msg) {
    state.alertBox.showAlertMsg = msg;
  },
  setAlertMsg(state, msg) {
    state.alertBox.alertMsg = msg;
  }, 
  setAlertType(state, type) {
    state.alertBox.alertType = type;
  },
  setApi(state, api) {
    state.api = api;
  },
  setExtensions(state, extensions) {
    state.extensions = extensions;
  },
  setCurrentNetworkStatus(state, networkStatus) {
    state.currentNetworkStatus = networkStatus;
  },
  setCurrentNetworkIdx(state, networkIdx) {
    state.currentNetworkIdx = networkIdx;
  },
  setCurrentAccountIdx(state, accountIdx) {
    state.currentAccountIdx = accountIdx;
  },
  setCurrentCustomEndpoint(state, endpoint) {
    state.currentCustomEndpoint = endpoint;
  },
  setTheme(state, theme) {
    const htmlClasses = document.documentElement.classList;
    if (theme == 'DARK') {
      htmlClasses.add('dark');
    } else {
      htmlClasses.remove('dark');
    }
    state.currentTheme = theme;
  }
};

export default mutation;
