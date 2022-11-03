import { isEthereumAddress } from '@polkadot/util-crypto';
import { isValidAddressPolkadotAddress } from 'src/hooks/helper/plasmUtils';

// TODO move to common lib
const wait = (ms: number): Promise<number> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// export const getDappAddressEnum = (address: string) => {
//   if (isEthereumAddress(address)) {
//     return { Evm: address };
//   } else if (isValidAddressPolkadotAddress(address)) {
//     return { Wasm: address };
//   } else {
//     throw new Error(
//       `Invalid contract address ${address}. The address should be in EVM or WASM format.`
//     );
//   }
// };

export { wait };
