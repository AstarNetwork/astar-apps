// Ref: RPC calls -> system -> chain()
export enum ChainOld {
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
  KINTSUGI = 'Kintsugi',
  INTERLAY = 'Interlay',
  KHALA = 'Khala',
}

export enum parachainIdsOld {
  ASTAR = 2006,
  SHIDEN = 2007,
  KARURA = 2000,
  ACALA = 2000,
  MOONRIVER = 2023,
  MOONBEAM = 2004,
  STATEMINE = 1000,
  STATEMINT = 1000,
  KINTSUGI = 2092,
  INTERLAY = 2032,
  KHALA = 2004,
}

export interface XcmChain {
  name: string;
  relayChain: string;
  icon: string;
  parachainId: number;
  endpoint: string;
  subscan: string;
  // Note: true if ASTR/SDN is listed on the parachain
  isEVMChain: boolean;
  isAstarNativeToken: boolean;
}

export const isParachain = (network: XcmChain): boolean => !!network.parachainId;
export const isRelayChain = (network: XcmChain): boolean => !isParachain(network);

// Memo: Chain.STATEMINE -> Bug related to https://github.com/polkadot-js/apps/issues/7812
export const chainsNotSupportWithdrawal = ['statemine', 'statemint'];
export const astarChains = ['astar', 'shiden'];
export const ethWalletChains = ['moonbeam', 'moonriver'];

export const checkIsDeposit = (fromChain: string): boolean => {
  return !astarChains.includes(fromChain);
};
