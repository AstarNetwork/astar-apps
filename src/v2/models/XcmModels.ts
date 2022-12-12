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
  STATEMINE = 'Statemine',
  STATEMINT = 'Statemint',
  // KINTSUGI = 'Kintsugi',
  INTERLAY = 'Interlay',
  CRUST_SHADOW = 'Crust-shadow',
  KHALA = 'Khala',
  PHALA = 'Phala',
}

export enum parachainIds {
  ASTAR = 2006,
  SHIDEN = 2007,
  KARURA = 2000,
  ACALA = 2000,
  MOONRIVER = 2023,
  MOONBEAM = 2004,
  STATEMINE = 1000,
  STATEMINT = 1000,
  // KINTSUGI = 2092,
  INTERLAY = 2032,
  CRUST_SHADOW = 2012,
  KHALA = 2004,
  PHALA = 2035,
}

export interface XcmChain {
  name: Chain;
  relayChain: Chain;
  img: string;
  parachainId: parachainIds;
  endpoint: string;
  subscan: string;
  // Note: true if ASTR/SDN is listed on the parachain
  isAstarNativeToken: boolean;
}

export const isParachain = (network: XcmChain): boolean => !!network.parachainId;
export const isRelayChain = (network: XcmChain): boolean => !isParachain(network);

// Memo: Chain.STATEMINE -> Bug related to https://github.com/polkadot-js/apps/issues/7812
export const chainsNotSupportWithdrawal = [Chain.STATEMINT];
export const astarChains = [Chain.ASTAR, Chain.SHIDEN, Chain.ASTAR_EVM, Chain.SHIDEN_EVM];
export const ethWalletChains = [Chain.MOONBEAM, Chain.MOONRIVER];

export const checkIsDeposit = (fromChain: Chain): boolean => {
  return !astarChains.includes(fromChain);
};
