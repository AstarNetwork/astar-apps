import { Dark } from 'quasar';
import type { ChainInfo } from 'src/hooks/useChainInfo';
import type { Extensions } from 'src/hooks/useMetaExtensions';
import { GasTip } from '@astar-network/astar-sdk-core';
import { MutationTree } from 'vuex';
import {
  AlertBox,
  AlertType,
  ConnectionType,
  GeneralStateInterface as State,
  SubstrateAccount,
  UnifiedAccount,
} from './state';
import { InflationConfiguration } from 'src/v2/models';

export interface GeneralMutations<S = State> {
  setInitialized(state: S): void;
  setLoading(state: S, isLoading: boolean): void;
  pushAlertMsg(state: S, alert: AlertBox): void;
  removeAlertMsg(state: S, index: number): void;
  setAlertMsg(state: S, msg: string): void;
  setAlertType(state: S, type: AlertType): void;
  setChainInfo(state: S, type: ChainInfo): void;
  setMetaExtensions(state: S, type: Extensions): void;
  setExtensionCount(state: S, type: number): void;
  setSubstrateAccounts(state: S, type: SubstrateAccount[]): void;
  setCurrentNetworkStatus(state: S, networkStatus: ConnectionType): void;
  setCurrentNetworkIdx(state: S, networkIdx: number): void;
  setCurrentAddress(state: S, address: string): void;
  setHeaderName(state: S, name: string): void;
  setCurrentWallet(state: S, wallet: string): void;
  setGas(state: S, gas: GasTip): void;
  setCurrentBlock(state: S, blockNumber: number): void;
  setUnifiedAccount(state: S, unifiedAccount: UnifiedAccount): void;
  setActiveInflationConfiguration(state: S, inflationConfiguration: InflationConfiguration): void;
}

const mutation: MutationTree<State> & GeneralMutations = {
  setInitialized(state) {
    state.initialized = true;
  },
  setLoading(state, isLoading) {
    state.isLoading = isLoading;
  },
  pushAlertMsg(state, alert) {
    state.alertBoxStack.push(alert);
  },
  removeAlertMsg(state, index) {
    state.alertBoxStack = state.alertBoxStack.filter((el, idx) => idx !== index);
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
  setSubstrateAccounts(state, accounts) {
    state.substrateAccounts = accounts;
  },
  setCurrentNetworkStatus(state, networkStatus) {
    state.currentNetworkStatus = networkStatus;
  },
  setCurrentNetworkIdx(state, networkIdx) {
    state.currentNetworkIdx = networkIdx;
  },
  setIsEthWallet(state, isEthWallet) {
    state.isEthWallet = isEthWallet;
  },
  setIsH160Formatted(state, isH160Formatted) {
    state.isH160Formatted = isH160Formatted;
  },
  setIsLedger(state, isLedger) {
    state.isLedger = isLedger;
  },
  setCurrentEcdsaAccount(state, ecdsa) {
    state.currentEcdsaAccount = ecdsa;
  },
  setCurrentAddress(state, address) {
    state.currentAddress = address;
  },
  setTheme(state, theme) {
    if (theme == 'DARK') {
      Dark.set(true);
      document.documentElement.classList.add('dark');
    } else {
      Dark.set(false);
      document.documentElement.classList.remove('dark');
    }

    state.currentTheme = theme;
  },
  setHeaderName(state, name) {
    state.headerName = name;
  },
  setCurrentWallet(state, wallet: string) {
    state.currentWallet = wallet;
  },
  setGas(state, gas: GasTip) {
    state.gas = gas;
  },
  setCurrentBlock(state, blockNumber) {
    state.currentBlock = blockNumber;
  },
  setUnifiedAccount(state, unifiedAccount) {
    state.unifiedAccount = unifiedAccount;
  },
  setActiveInflationConfiguration(state, inflationConfiguration) {
    state.activeInflationConfiguration = inflationConfiguration;
  },
};

export default mutation;
