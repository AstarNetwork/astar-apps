import * as ethUtils from 'ethereumjs-util';

export function getShortenAddress(address: string): string {
  return address ? `${address.slice(0, 6)}${'.'.repeat(6)}${address.slice(-6)}` : '';
}

export const isH160Address = (address: string): boolean => {
  return ethUtils.isValidAddress(address);
};
