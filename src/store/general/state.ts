import { ApiPromise } from '@polkadot/api';
import type { InjectedExtension } from '@polkadot/extension-inject/types';

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
  api: ApiPromise | undefined;
  extensions: InjectedExtension[];
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
    api: undefined,
    extensions: [],
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
