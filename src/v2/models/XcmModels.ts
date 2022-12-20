// Ref: RPC calls -> system -> chain()
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
