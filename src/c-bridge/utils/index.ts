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
  getSelectedToken,
  getPeggedTokenInfo,
  getTokenBalCbridge,
  getTokenInfo,
} from './cbridgeAPI';

export const formatDecimals = ({ amount, decimals }: { amount: string; decimals: number }) => {
  return Number(Number(amount).toFixed(decimals));
};
