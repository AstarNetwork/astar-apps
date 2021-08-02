import { MutationTree } from 'vuex';
import { ConnectionType, GeneralStateInterface as State } from './state';
import type { ChainInfo } from 'src/hooks/useChainInfo';
import type { Extensions } from 'src/hooks/useMetaExtensions';

export interface GeneralMutations<S = State> {
  setInitialized(state: S): void;
  setLoading(state: S, isLoading: boolean): void;
  setShowAlertMsg(state: S, showAlert: boolean): void;
  setAlertMsg(state: S, msg: string): void;
  setAlertType(state: S, type: string): void;
  setChainInfo(state: S, type: ChainInfo): void;
  setMetaExtensions(state: S, type: Extensions): void;
  setExtensionCount(state: S, type: number): void;
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
  setChainInfo(state, chainInfo) {
    state.chainInfo = chainInfo;
  },
  setMetaExtensions(state, extensions) {
    state.metaExtensions = extensions;
  },
  setExtensionCount(state, count) {
    state.extensionCount = count;
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
