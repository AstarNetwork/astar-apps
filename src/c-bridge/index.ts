// Docs: https://cbridge-docs.celer.network/developer/api-reference/gateway-gettransferconfigs

export { getTransferConfigs, getChainName, isAstarOrShiden, sortChainName } from './utils';

export enum EvmChain {
  Ethereum = 1,
  BSC = 56,
  Astar = 592,
  Shiden = 336,
  Polygon = 137,
}

export const supportChains = [
  EvmChain.Ethereum,
  EvmChain.BSC,
  EvmChain.Astar,
  EvmChain.Shiden,
  EvmChain.Polygon,
];

export const cBridgeEndpoint = 'https://cbridge-prod2.celer.network/v1';

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
}

export interface TokenDetail {
  symbol: string;
  address: string;
  decimal: number;
  xfer_disabled: boolean;
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

export interface PeggedPairConfig {
  org_chain_id: number;
  org_token: Token;
  pegged_chain_id: number;
  pegged_token: Token;
  pegged_deposit_contract_addr: string;
  pegged_burn_contract_addr: string;
  canonical_token_contract_addr: string;
}

export const cbridgeInitialState = {
  [EvmChain.Ethereum]: {
    block_delay: 8,
    contract_addr: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    drop_gas_amt: '0',
    drop_gas_balance_alert: '0',
    drop_gas_cost_amt: '0',
    explore_url: 'https://etherscan.io/',
    gas_token_symbol: 'ETH',
    icon: 'https://get.celer.app/cbridge-icons/chain-icon/ETH.png',
    id: 1,
    name: 'Ethereum Mainnet',
    suggested_gas_cost: '0',
  },
  [EvmChain.Astar]: {
    block_delay: 6,
    contract_addr: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    drop_gas_amt: '2000000000000000',
    drop_gas_balance_alert: '500000000000000000',
    drop_gas_cost_amt: '21000000000000',
    explore_url: 'https://blockscout.com/astar/',
    gas_token_symbol: 'ASTR',
    icon: 'https://get.celer.app/cbridge-icons/chain-icon/Astar.png',
    id: 592,
    name: 'Astar',
    suggested_gas_cost: '129568',
  },
};
