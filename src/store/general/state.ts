import { GasTip } from '@astar-network/astar-sdk-core';
import type { Extensions } from 'src/hooks/useMetaExtensions';
import { endpointKey } from 'src/config/chainEndpoints';

export type SubstrateAccount = {
  address: string;
  name: string;
  source: string;
  balance?: string;
};

export enum AlertType {
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Copied = 'copied',
}

export type AlertBox = {
  alertMsg: string;
  alertType: AlertType;
  explorerUrl: string;
};

export type EcdsaAccount = {
  ethereum: string;
  ss58: string;
  h160: string;
};

export type ConnectionType = 'connected' | 'connecting' | 'offline';

export type Theme = 'LIGHT' | 'DARK';

export interface GeneralStateInterface {
  initialized: boolean;
  isLoading: boolean;
  alertBoxStack: AlertBox[];
  alertBox: AlertBox;
  chainInfo: any;
  metaExtensions: Extensions;
  extensionCount: number;
  substrateAccounts: SubstrateAccount[];
  currentNetworkStatus: ConnectionType;
  currentNetworkIdx: number;
  isEthWallet: boolean;
  isH160Formatted: boolean;
  currentEcdsaAccount: EcdsaAccount;
  currentAddress: string;
  currentCustomEndpoint: string;
  currentTheme: Theme;
  headerName: string;
  currentWallet: string;
  gas: GasTip | undefined;
  currentBlock: number;
}

function state(): GeneralStateInterface {
  return {
    initialized: false,
    isLoading: false,
    alertBoxStack: [],
    alertBox: {
      alertMsg: '',
      alertType: AlertType.Success,
      explorerUrl: '',
    },
    chainInfo: undefined,
    metaExtensions: {
      count: 0,
      extensions: [],
    },
    extensionCount: 0,
    substrateAccounts: [],
    currentNetworkStatus: 'connecting',
    currentNetworkIdx: endpointKey.ASTAR,
    isEthWallet: false,
    isH160Formatted: false,
    currentEcdsaAccount: {
      ethereum: '',
      ss58: '',
      h160: '',
    },
    currentAddress: '',
    currentCustomEndpoint: '',

    currentTheme:
      //this queries the media setting
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'DARK'
        : 'LIGHT',
    headerName: '',

    currentWallet: '',
    gas: undefined,
    currentBlock: 0,
  };
}

export default state;
