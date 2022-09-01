// Docs: https://cbridge-docs.celer.network/developer/api-reference/gateway-gettransferconfigs

import { Erc20Token } from 'src/modules/token';

export { getTransferConfigs, getSelectedToken, getIcon, checkIsCbridgeToken } from './utils';

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
};

export const cbridgeAppLink = 'https://cbridge.celer.network/#/transfer';

export interface TransferConfigs {
  err: null;
  chains: Chain[];
  chain_token: { [key: string]: ChainToken };
  farming_reward_contract_addr: string;
  pegged_pair_configs: PeggedPairConfig[];
}

interface ChainToken {
  token: Token[];
}

export interface Token {
  token: TokenDetail;
  name: string;
  icon: string;
  poolContract?: string;
  chain?: EvmChain;
}

interface TokenDetail {
  symbol: string;
  address: string;
  decimal: number;
  xfer_disabled: boolean;
}

interface Chain {
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

type PoolConfig = {
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
  userBalanceUsd: string;
}

type CbridgeCurrency = SelectedToken;
export type EvmAsset = CbridgeCurrency | Erc20Token;
