import { EvmChain } from './../index';
import { endpointKey } from 'src/config/chainEndpoints';
export {
  approve,
  getMinAndMaxAmount,
  mintOrBurn,
  getMinimalMaxSlippage,
  poolTransfer,
} from './contract';

export {
  getChainName,
  getTransferConfigs,
  pushToSelectableChains,
  sortChainName,
  getIcon,
  getHistory,
  getTxStatus,
  fetchEstimation,
} from './cbridgeAPI';

export {
  getSelectedToken,
  getPeggedTokenInfo,
  getTokenBalCbridge,
  getTokenInfo,
  getDestTokenInfo,
} from './token-detail';

export const formatDecimals = ({ amount, decimals }: { amount: string; decimals: number }) => {
  return Number(Number(amount).toFixed(decimals));
};

export const detectRemoveNetwork = (portalNetworkId: endpointKey) => {
  switch (portalNetworkId) {
    case endpointKey.ASTAR:
      return EvmChain.Shiden;

    case endpointKey.SHIDEN:
      return EvmChain.Astar;

    default:
      return EvmChain.Shiden;
  }
};

export const checkIsCbridgeToken = (token: any): boolean => {
  return token.hasOwnProperty('bridgeMethod');
};
