// Docs: https://cbridge-docs.celer.network/developer/api-reference/gateway-gettransferconfigs

export {
  getTransferConfigs,
  getChainName,
  sortChainName,
  formatDecimals,
  getTokenBalCbridge,
  getPeggedTokenInfo,
  pushToSelectableChains,
  approve,
  mintOrBurn,
  getTokenInfo,
  getSelectedToken,
  getMinimalMaxSlippage,
  poolTransfer,
  getIcon,
  getHistory,
  getTxStatus,
  detectRemoveNetwork,
  castToPortalNetworkId,
  getDestTokenInfo,
  getMinAndMaxAmount,
  fetchEstimation,
} from './utils';

export enum EvmChain {
  Ethereum = 1,
  BSC = 56,
  Astar = 592,
  Shiden = 336,
  Polygon = 137,
}

export const astarSupportChains = [
  EvmChain.Ethereum,
  EvmChain.BSC,
  EvmChain.Astar,
  EvmChain.Shiden,
  EvmChain.Polygon,
];

export const shidenSupportChains = [EvmChain.Astar, EvmChain.Shiden];

export const cBridgeBaseEndpoint = 'https://cbridge-prod2.celer.network/v1';

export const cBridgeEndpoint = {
  Configs: cBridgeBaseEndpoint + '/getTransferConfigsForAll',
  Quotation: cBridgeBaseEndpoint + '/estimateAmt',
  History: cBridgeBaseEndpoint + '/transferHistory',
};

export interface TransferConfigs {
  err: null;
  chains: Chain[];
  chain_token: { [key: string]: ChainToken };
  farming_reward_contract_addr: string;
  pegged_pair_configs: PeggedPairConfig[];
}

export interface ChainToken {
  token: Token[];
}

export interface Token {
  token: TokenDetail;
  name: string;
  icon: string;
  poolContract?: string;
  chain?: EvmChain;
}

export interface TokenDetail {
  symbol: string;
  address: string;
  decimal: number;
  xfer_disabled: boolean;
}

export interface TokenInfo {
  contractAddress: string;
  tokenAddress: string;
  symbol: string;
  decimals: number;
}

export interface Chain {
  id: number;
  name: string;
  icon: string;
  block_delay: number;
  gas_token_symbol: string;
  explore_url: string;
  contract_addr: string;
  drop_gas_amt: string;
  drop_gas_cost_amt: string;
  drop_gas_balance_alert: string;
  suggested_gas_cost: string;
}

export enum BridgeMethod {
  pool = 'pool',
  canonical = 'canonical',
}

export interface CbridgeToken {
  bridgeMethod: BridgeMethod;
  canonical: PeggedPairConfig | null;
  pool: PoolConfig | null;
}

export type PoolConfig = {
  [key: number]: Token;
};

export interface PeggedPairConfig {
  org_chain_id: number;
  org_token: Token;
  pegged_chain_id: number;
  pegged_token: Token;
  pegged_deposit_contract_addr: string;
  pegged_burn_contract_addr: string;
  canonical_token_contract_addr: string;
}

export interface SelectedToken {
  bridgeMethod: BridgeMethod;
  canonicalConfig: PeggedPairConfig | null;
  poolConfig: PoolConfig | null;
  name: string;
  symbol: string;
  address: string;
  icon: string;
  decimal: number;
  userBalance: string;
}

export interface Quotation {
  err: null;
  eq_value_token_amt: string;
  bridge_rate: number;
  perc_fee: string;
  base_fee: string;
  slippage_tolerance: number;
  max_slippage: number;
  estimated_receive_amt: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface History {
  transfer_id: string;
  src_send_info: HistoryInfo;
  dst_received_info: HistoryInfo;
  ts: string;
  src_block_tx_link: string;
  dst_block_tx_link: string;
  status: number;
  refund_reason: number;
}

export interface HistoryInfo {
  chain: Chain;
  token: Token;
  amount: string;
}

export const pendingStatus = [0, 1, 2, 3, 4];
