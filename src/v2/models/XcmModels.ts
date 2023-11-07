// Ref: RPC calls -> system -> chain()
export enum Chain {
  POLKADOT = 'Polkadot',
  ASTAR = 'Astar',
  ASTAR_EVM = 'Astar-evm',
  KUSAMA = 'Kusama',
  SHIDEN = 'Shiden',
  SHIDEN_EVM = 'Shiden-evm',
  KARURA = 'Karura',
  ACALA = 'Acala',
  MOONRIVER = 'Moonriver',
  MOONBEAM = 'Moonbeam',
  ASSET_HUB = 'Asset-hub',
  ASSET_HUB_KUSAMA = 'Asset-hub-kusama',
  KINTSUGI = 'Kintsugi',
  INTERLAY = 'Interlay',
  CRUST_SHADOW = 'Crust-shadow',
  KHALA = 'Khala',
  PHALA = 'Phala',
  BIFROST_POLKADOT = 'Bifrost-polkadot',
  BIFROST_KUSAMA = 'Bifrost',
  EQUILIBRIUM = 'Equilibrium',
  UNIQUE = 'Unique',
}

export enum parachainIds {
  ASTAR = 2006,
  SHIDEN = 2007,
  KARURA = 2000,
  ACALA = 2000,
  MOONRIVER = 2023,
  MOONBEAM = 2004,
  ASSET_HUB = 1000,
  ASSET_HUB_KUSAMA = 1000,
  KINTSUGI = 2092,
  INTERLAY = 2032,
  CRUST_SHADOW = 2012,
  KHALA = 2004,
  PHALA = 2035,
  BIFROST_POLKADOT = 2030,
  BIFROST_KUSAMA = 2001,
  EQUILIBRIUM = 2011,
  UNIQUE = 2037,
}

export interface XcmChain {
  name: Chain;
  relayChain: Chain;
  img: string;
  parachainId: parachainIds;
  endpoints: string[];
  chopsticksEndpoint?: string;
  subscan: string;
  // Note: true if ASTR/SDN is listed on the parachain
  isAstarNativeToken: boolean;
}

export const isParachain = (network: XcmChain): boolean => !!network.parachainId;
export const isRelayChain = (network: XcmChain): boolean => !isParachain(network);

export const chainsNotSupportWithdrawal: Chain[] = [];
export const astarChains = [Chain.ASTAR, Chain.SHIDEN, Chain.ASTAR_EVM, Chain.SHIDEN_EVM];
export const ethWalletChains = [Chain.MOONBEAM, Chain.MOONRIVER];

export const checkIsDeposit = (fromChain: Chain): boolean => {
  return !astarChains.includes(fromChain);
};
