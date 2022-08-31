import { GasTip } from './../../modules/gas-api/index';
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
  networkStatus(state: State): string;
  networkIdx(state: State): number;
  isEthWallet(state: State): boolean;
  isH160Formatted(state: State): boolean;
  currentEcdsaAccount(state: State): EcdsaAccount;
  selectedAddress(state: State): string;
  customEndpoint(state: State): string;
  theme(state: State): Theme;
  headerName(state: State): string;
  currentWallet(state: State): string;
  getGas(state: State): GasTip | undefined;
  getCurrentBlock(state: State): number;
}

const getters: GetterTree<State, StateInterface> & GeneralGetters = {
  initialized: (state) => state.initialized,
  isLoading: (state) => state.isLoading,
  showAlert: (state) => state.alertBox,
  chainInfo: (state) => state.chainInfo,
  metaExtensions: (state) => state.metaExtensions,
  extensionCount: (state) => state.extensionCount,
  substrateAccounts: (state) => state.substrateAccounts,
  networkStatus: (state) => state.currentNetworkStatus,
  networkIdx: (state) => state.currentNetworkIdx,
  isEthWallet: (state) => state.isEthWallet,
  isH160Formatted: (state) => state.isH160Formatted,
  currentEcdsaAccount: (state) => state.currentEcdsaAccount,
  customEndpoint: (state) => state.currentCustomEndpoint,
  theme: (state: State) => state.currentTheme,
  selectedAddress: (state: State) => {
    return state.currentAddress;
  },
  headerName: (state: State) => state.headerName,
  currentWallet: (state: State) => state.currentWallet,
  getGas: (state: State) => state.gas,
  getCurrentBlock: (state: State) => state.currentBlock,
};

export default getters;
