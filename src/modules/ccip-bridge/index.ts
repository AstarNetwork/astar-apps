export enum CCIP_NETWORK_NAME {
  'ShibuyaEvm' = 'Shibuya EVM',
  'AstarEvm' = 'Astar EVM',
  'SoneiumMinato' = 'Soneium Minato',
  'Soneium' = 'Soneium',
}

export enum CCIP_CHAIN_ID {
  'ShibuyaEvm' = 81,
  'AstarEvm' = 592,
  'SoneiumMinato' = 1946,
  // Todo: update
  'Soneium' = 9999,
}

export const CCIP_BRIDGE_CHAIN_ID = {
  [CCIP_NETWORK_NAME.ShibuyaEvm]: CCIP_CHAIN_ID.ShibuyaEvm,
  [CCIP_NETWORK_NAME.AstarEvm]: CCIP_CHAIN_ID.AstarEvm,
  [CCIP_NETWORK_NAME.SoneiumMinato]: CCIP_CHAIN_ID.SoneiumMinato,
  [CCIP_NETWORK_NAME.Soneium]: CCIP_CHAIN_ID.Soneium,
};

export const CCIP_BRIDGE_ICON = {
  [CCIP_NETWORK_NAME.ShibuyaEvm]: require('src/assets/img/chain/astar.png'),
  [CCIP_NETWORK_NAME.AstarEvm]: require('src/assets/img/chain/astar.png'),
  [CCIP_NETWORK_NAME.SoneiumMinato]: require('src/assets/img/chain/astar.png'),
  [CCIP_NETWORK_NAME.Soneium]: require('src/assets/img/chain/astar.png'),
} as any;
