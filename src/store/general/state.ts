import type { Extensions } from 'src/hooks/useMetaExtensions';

export type AlertBox = {
  showAlertMsg: boolean;
  alertMsg: string;
  alertType: string;
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
  currentNetworkStatus: ConnectionType;
  currentNetworkIdx: number;
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
      extensions: []
    },
    extensionCount: 0,
    currentNetworkStatus: 'connecting',
    currentNetworkIdx: 0,
    currentAccountIdx: 0,
    currentCustomEndpoint: '',

    currentTheme:
      //this queries the media setting
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'DARK'
        : 'LIGHT',
  }
}

export default state;
