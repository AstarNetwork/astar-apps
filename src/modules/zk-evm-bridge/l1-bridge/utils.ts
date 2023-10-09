import { ZkNetworkId } from 'src/modules/zk-evm-bridge';

export const checkIsL1 = (zkNetwork: number): boolean => {
  return ZkNetworkId.L1 === zkNetwork;
};
