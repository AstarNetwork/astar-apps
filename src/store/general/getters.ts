import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import {
  GeneralStateInterface as State,
  Theme,
  AlertBox,
  EcdsaAccount,
  SubstrateAccount,
} from './state';
import type { ChainInfo } from 'src/hooks/useChainInfo';
import type { Extensions } from 'src/hooks/useMetaExtensions';

export interface GeneralGetters {
  initialized(state: State): boolean;
  isLoading(state: State): boolean;
  showAlert(state: State): AlertBox;
  chainInfo(state: State): ChainInfo;
  metaExtensions(state: State): Extensions;
  extensionCount(state: State): number;
  substrateAccounts(state: State): SubstrateAccount[];
  allAccounts(state: State): string[];
  allAccountNames(state: State): string[];
  networkStatus(state: State): string;
  networkIdx(state: State): number;
  isCheckEthWallet(state: State): boolean;
  isH160Formatted(state: State): boolean;
  currentEcdsaAccount(state: State): EcdsaAccount;
  selectedAddress(state: State): string;
  customEndpoint(state: State): string;
  theme(state: State): Theme;
}

const getters: GetterTree<State, StateInterface> & GeneralGetters = {
  initialized: (state) => state.initialized,
  isLoading: (state) => state.isLoading,
  showAlert: (state) => state.alertBox,
  chainInfo: (state) => state.chainInfo,
  metaExtensions: (state) => state.metaExtensions,
  extensionCount: (state) => state.extensionCount,
  substrateAccounts: (state) => state.substrateAccounts,
  allAccounts: (state) => state.allAccounts,
  allAccountNames: (state) => state.allAccountNames,
  networkStatus: (state) => state.currentNetworkStatus,
  networkIdx: (state) => state.currentNetworkIdx,
  isCheckEthWallet: (state) => state.isCheckEthWallet,
  isH160Formatted: (state) => state.isH160Formatted,
  currentEcdsaAccount: (state) => state.currentEcdsaAccount,
  customEndpoint: (state) => state.currentCustomEndpoint,
  theme: (state: State) => state.currentTheme,
  selectedAddress: (state: State) => {
    if (state.isCheckEthWallet) {
      return state.currentEcdsaAccount.ss58;
    } else if (state.isH160Formatted) {
      return state.currentEcdsaAccount.h160;
    } else {
      return state.currentAddress;
    }
  },
};

export default getters;
