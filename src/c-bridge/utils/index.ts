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
} from './cbridgeAPI';

export {
  getSelectedToken,
  getPeggedTokenInfo,
  getTokenBalCbridge,
  getTokenInfo,
} from './token-detail';

export const formatDecimals = ({ amount, decimals }: { amount: string; decimals: number }) => {
  return Number(Number(amount).toFixed(decimals));
};
