import { objToArray } from 'src/hooks/helper/common';
import { XcmChain } from 'src/v2/models';
import axios from 'axios';

export {
  astarNativeTokenErcAddr,
  generateAssetFromEvmToken,
  xcmToken,
} from 'src/modules/xcm/tokens';
export {
  addXcmTxHistories,
  castChainName,
  checkIsAstarNativeToken,
  checkIsDeposit,
  checkIsSupportAstarNativeToken,
  fetchExistentialDeposit,
  fetchXcmBalance,
  getXcmToken,
  monitorBalanceIncreasing,
} from 'src/modules/xcm/utils';

export interface XcmTokenInformation {
  symbol: string;
  astarAssetId: string;
  icon: string;
  isNativeToken: boolean;
  isXcmCompatible: boolean;
  originAssetId: string;
  originChain: string;
  targetChain: string[];
  minBridgeAmount: string;
}

export interface ExistentialDeposit {
  amount: string;
  chain: string;
  symbol: string;
  // Memo: minimum balance keeps in relaychain
  originChainMinBal: number;
}

// Memo: give it 0 ide for convenience in checking para/relay chain logic
export const relaychainParaId = 0;

interface XcmChainObj {
  [key: string]: XcmChain;
}

let xcmChainObj: XcmChainObj = {};
export { xcmChainObj };

let xcmChains: any[];
export { xcmChains };

export let kusamaParachains: any[];
export let polkadotParachains: any[];

// get the list of networks we can support
export const getXcmChainObj = async (): Promise<XcmChainObj> => {
  const url = 'https://token-resources-chi.vercel.app/api/networks';
  const result = await axios.get<XcmChainObj>(url);

  xcmChainObj = result.data;
  xcmChains = objToArray(xcmChainObj);

  kusamaParachains = xcmChains.filter((it) => it.relayChain === 'kusama' && it.name !== 'kusama');
  polkadotParachains = xcmChains.filter(
    (it) => it.relayChain === 'polkadot' && it.name !== 'polkadot'
  );

  return xcmChainObj;
};
