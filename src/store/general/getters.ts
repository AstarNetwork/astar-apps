import { GasTip } from '@astar-network/astar-sdk-core';
import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import {
  GeneralStateInterface as State,
  Theme,
  AlertBox,
  EcdsaAccount,
  SubstrateAccount,
  UnifiedAccount,
} from './state';
import type { ChainInfo } from 'src/hooks/useChainInfo';
import type { Extensions } from 'src/hooks/useMetaExtensions';
import { InflationConfiguration } from 'src/v2/models';

export interface GeneralGetters {
  initialized(state: State): boolean;
  isLoading(state: State): boolean;
  alertStack(state: State): AlertBox[];
  showAlert(state: State): AlertBox;
  chainInfo(state: State): ChainInfo;
  metaExtensions(state: State): Extensions;
  extensionCount(state: State): number;
  substrateAccounts(state: State): SubstrateAccount[];
  networkStatus(state: State): string;
  networkIdx(state: State): number;
  isEthWallet(state: State): boolean;
  isH160Formatted(state: State): boolean;
  isLedger(state: State): boolean;
  currentEcdsaAccount(state: State): EcdsaAccount;
  selectedAddress(state: State): string;
  theme(state: State): Theme;
  headerName(state: State): string;
  currentWallet(state: State): string;
  getGas(state: State): GasTip | undefined;
  getCurrentBlock(state: State): number;
  getUnifiedAccount(state: State): UnifiedAccount | undefined;
  getActiveInflationConfiguration(state: State): InflationConfiguration | undefined;
}

const getters: GetterTree<State, StateInterface> & GeneralGetters = {
  initialized: (state) => state.initialized,
  isLoading: (state) => state.isLoading,
  alertStack: (state) => state.alertBoxStack,
  showAlert: (state) => state.alertBox,
  chainInfo: (state) => state.chainInfo,
  metaExtensions: (state) => state.metaExtensions,
  extensionCount: (state) => state.extensionCount,
  substrateAccounts: (state) => state.substrateAccounts,
  networkStatus: (state) => state.currentNetworkStatus,
  networkIdx: (state) => state.currentNetworkIdx,
  isEthWallet: (state) => state.isEthWallet,
  isH160Formatted: (state) => state.isH160Formatted,
  isLedger: (state) => state.isLedger,
  currentEcdsaAccount: (state) => state.currentEcdsaAccount,
  theme: (state: State) => state.currentTheme,
  selectedAddress: (state: State) => {
    return state.currentAddress;
  },
  headerName: (state: State) => state.headerName,
  currentWallet: (state: State) => state.currentWallet,
  getGas: (state: State) => state.gas,
  getCurrentBlock: (state: State) => state.currentBlock,
  getUnifiedAccount: (state: State) => state.unifiedAccount,
  getActiveInflationConfiguration: (state: State) => state.activeInflationConfiguration,
};

export default getters;
