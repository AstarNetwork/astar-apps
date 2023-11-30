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
  config: SnapConfig = { networkName: 'shibuya' },
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
    config.networkName = 'shibuya';
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
    await enablePolkadotSnap({ networkName: 'shibuya' }, snapId);
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
    // Todo: update network params
    const metamaskPolkadotSnap = await enablePolkadotSnap({ networkName: 'shibuya' }, snapId);
    console.info('Snap installed!');
    return { isSnapInstalled: true, snap: metamaskPolkadotSnap };
  } catch (e) {
    console.error(e);
    return { isSnapInstalled: false };
  }
}
