import { ethers } from 'ethers';

export const weiToToken = (wei: bigint): number => {
  return Number(ethers.utils.formatEther(String(wei)));
};
