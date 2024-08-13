import { web3EnablePromise } from '@polkadot/extension-dapp';
import type { InjectedMetamaskExtension } from '@astar-network/metamask-astar-adapter/src/types';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import { SnapInstallationParamNames } from '@astar-network/metamask-astar-adapter';
import type { MetamaskPolkadotSnap } from '@astar-network/metamask-astar-adapter/build/snap';
import {
  isMetamaskSnapsSupported,
  isPolkadotSnapInstalled,
} from '@astar-network/metamask-astar-adapter/build/utils';
import type { UnitConfiguration } from '@astar-network/metamask-astar-types';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { getNetworkName } from 'src/config/chainEndpoints';

// Todo: move to Astar.js

export type SnapNetworks = 'astar' | 'shiden' | 'shibuya';
export interface SnapConfig {
  networkName: SnapNetworks;
  wsRpcUrl?: string;
  addressPrefix?: number;
  unit?: UnitConfiguration;
}

export const snapId = 'npm:@astar-network/snap';

export async function enablePolkadotSnap(
  config: SnapConfig = { networkName: 'astar' },
  snapOrigin?: string,
  snapInstallationParams: Record<SnapInstallationParamNames, unknown> = {}
): Promise<MetamaskPolkadotSnap> {
  // check all conditions
  if (!window.ethereum) {
    throw new Error('Metamask is not installed');
  }
  if (!(await isMetamaskSnapsSupported())) {
    throw new Error("Current Metamask version doesn't support snaps");
  }
  if (!config.networkName) {
    config.networkName = 'astar';
  }

  const isInstalled = await isPolkadotSnapInstalled(snapId);
  console.info('isPolkadotSnapInstalled', isInstalled);

  if (!isInstalled) {
    // // enable snap
    await window.ethereum.request({
      method: 'wallet_requestSnaps',
      params: {
        [snapId]: { ...snapInstallationParams },
      },
    });
  }

  // Return a value of type MetamaskPolkadotSnap
  return {} as MetamaskPolkadotSnap;
}

export async function installPolkadotSnap(): Promise<boolean> {
  try {
    await enablePolkadotSnap({ networkName: 'astar' }, snapId);
    console.info('Snap installed!!');
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function getInjectedMetamaskExtension(): Promise<InjectedMetamaskExtension | null> {
  const extensions = await web3EnablePromise;
  return getMetamaskExtension(extensions || []) || null;
}

function getMetamaskExtension(
  extensions: InjectedExtension[]
): InjectedMetamaskExtension | undefined {
  return extensions.find((item) => item.name === 'metamask-astar-snap') as unknown as
    | InjectedMetamaskExtension
    | undefined;
}

export interface SnapInitializationResponse {
  isSnapInstalled: boolean;
  snap?: MetamaskPolkadotSnap;
}

export async function initiatePolkdatodSnap(): Promise<SnapInitializationResponse> {
  try {
    console.info('Attempting to connect to snap...');
    const { NETWORK_IDX } = LOCAL_STORAGE;
    const networkIdx = localStorage.getItem(NETWORK_IDX);
    const network = getNetworkName(Number(networkIdx));
    const networkName = (
      network === 'astar' || network === 'shiden' ? network : 'shibuya'
    ) as SnapNetworks;
    const metamaskPolkadotSnap = await enablePolkadotSnap({ networkName }, snapId);
    console.info('Snap installed!');
    return { isSnapInstalled: true, snap: metamaskPolkadotSnap };
  } catch (e) {
    console.error(e);
    return { isSnapInstalled: false };
  }
}
