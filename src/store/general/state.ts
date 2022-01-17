import type { Extensions } from 'src/hooks/useMetaExtensions';

export type AlertBox = {
  showAlertMsg: boolean;
  alertMsg: string;
  alertType: string;
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
  alertBox: AlertBox;
  chainInfo: any;
  metaExtensions: Extensions;
  extensionCount: number;
  allAccounts: string[];
  allAccountNames: string[];
  currentNetworkStatus: ConnectionType;
  currentNetworkIdx: number;
  isCheckMetamask: boolean;
  isH160Formatted: boolean;
  currentEcdsaAccount: EcdsaAccount;
  currentAccountIdx: number;
  currentCustomEndpoint: string;
  currentTheme: Theme;
}

function state(): GeneralStateInterface {
  return {
    initialized: false,
    isLoading: false,
    alertBox: {
      showAlertMsg: false,
      alertMsg: '',
      alertType: 'success',
    },
    chainInfo: undefined,
    metaExtensions: {
      count: 0,
      extensions: [],
    },
    extensionCount: 0,
    allAccounts: [],
    allAccountNames: [],
    currentNetworkStatus: 'connecting',
    currentNetworkIdx: 0,
    isCheckMetamask: false,
    isH160Formatted: false,
    currentEcdsaAccount: {
      ethereum: '',
      ss58: '',
      h160: '',
    },
    currentAccountIdx: 0,
    currentCustomEndpoint: '',

    currentTheme:
      //this queries the media setting
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'DARK'
        : 'LIGHT',
  };
}

export default state;
