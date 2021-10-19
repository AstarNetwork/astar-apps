import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { GeneralStateInterface as State, Theme, AlertBox, EcdsaAccount } from './state';
import type { ChainInfo } from 'src/hooks/useChainInfo';
import type { Extensions } from 'src/hooks/useMetaExtensions';

export interface GeneralGetters {
  initialized(state: State): boolean;
  isLoading(state: State): boolean;
  showAlert(state: State): AlertBox;
  chainInfo(state: State): ChainInfo;
  metaExtensions(state: State): Extensions;
  extensionCount(state: State): number;
  allAccounts(state: State): string[];
  allAccountNames(state: State): string[];
  networkStatus(state: State): string;
  networkIdx(state: State): number;
  isCheckMetamask(state: State): boolean;
  isH160Formatted(state: State): boolean;
  currentEcdsaAccount(state: State): EcdsaAccount;
  accountIdx(state: State): number;
  customEndpoint(state: State): string;
  theme(state: State): Theme;
  selectedAccountAddress(state: State): string;
}

const getters: GetterTree<State, StateInterface> & GeneralGetters = {
  initialized: (state) => state.initialized,
  isLoading: (state) => state.isLoading,
  showAlert: (state) => state.alertBox,
  chainInfo: (state) => state.chainInfo,
  metaExtensions: (state) => state.metaExtensions,
  extensionCount: (state) => state.extensionCount,
  allAccounts: (state) => state.allAccounts,
  allAccountNames: (state) => state.allAccountNames,
  networkStatus: (state) => state.currentNetworkStatus,
  networkIdx: (state) => state.currentNetworkIdx,
  isCheckMetamask: (state) => state.isCheckMetamask,
  isH160Formatted: (state) => state.isH160Formatted,
  currentEcdsaAccount: (state) => state.currentEcdsaAccount,
  accountIdx: (state) => state.currentAccountIdx,
  customEndpoint: (state) => state.currentCustomEndpoint,
  theme: (state: State) => state.currentTheme,
  selectedAccountAddress: (state: State) => {
    if (state.isCheckMetamask) {
      return state.currentEcdsaAccount.ss58;
    } else if (state.isH160Formatted) {
      return state.currentEcdsaAccount.h160;
    } else {
      return state.allAccounts[state.currentAccountIdx];
    }
  },
};

export default getters;
