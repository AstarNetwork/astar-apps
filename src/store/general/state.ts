import { GasTip } from '@astar-network/astar-sdk-core';
import type { Extensions } from 'src/hooks/useMetaExtensions';
import { endpointKey } from 'src/config/chainEndpoints';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { InflationConfiguration, NftMetadata } from 'src/v2/models';

export type SubstrateAccount = {
  address: string;
  name: string;
  source: string;
  balance?: string;
  evmAddress?: string;
  avatarUrl?: string;
};

export enum AlertType {
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Copied = 'copied',
  Info = 'info',
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

export type UnifiedAccount = {
  nativeAddress: string;
  evmAddress: string;
  name: string;
  avatarUrl?: string;
  avatarMetadata?: NftMetadata;
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
  isLedger: boolean;
  currentEcdsaAccount: EcdsaAccount;
  currentAddress: string;
  currentTheme: Theme;
  headerName: string;
  currentWallet: string;
  gas: GasTip | undefined;
  currentBlock: number;
  unifiedAccount?: UnifiedAccount;
  activeInflationConfiguration: InflationConfiguration | undefined;
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
    isLedger: localStorage.getItem(LOCAL_STORAGE.IS_LEDGER) === 'true',
    currentEcdsaAccount: {
      ethereum: '',
      ss58: '',
      h160: '',
    },
    currentAddress: '',

    currentTheme:
      //this queries the media setting
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'DARK'
        : 'LIGHT',
    headerName: '',

    currentWallet: '',
    gas: undefined,
    currentBlock: 0,
    activeInflationConfiguration: undefined,
  };
}

export default state;
