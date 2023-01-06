import { defaultAmountWithDecimals } from '@astar-network/astar-sdk-core';
import { BN, hexToU8a, isHex, isString } from '@polkadot/util';
import { checkAddress, decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { nFormatter } from '@astar-network/astar-sdk-core';

export const ASTAR_SS58_FORMAT = 5;
export const SUBSTRATE_SS58_FORMAT = 42;
export const ASTAR_DECIMALS = 18;

/**
 * Format unit number(K M B) with default currency.
 * info: Balance.toHuman() -> 243.5087 mSDN (lower readability)
 * @param value eg: value.toString() -> '243508700000000000'
 * @param decimal eg: 18
 * @returns '0.244 SDN'
 */
export const balanceFormatter = (bal: BN | string, decimal = ASTAR_DECIMALS): string => {
  let amount;
  if (isString(bal)) {
    amount = defaultAmountWithDecimals(new BN(bal), decimal);
  } else {
    amount = defaultAmountWithDecimals(bal, decimal);
  }

  const defaultCurrency = localStorage.getItem(LOCAL_STORAGE.DEFAULT_CURRENCY);
  return `${nFormatter(Number(amount))} ${defaultCurrency}`;
};

export const isValidAddressPolkadotAddress = (address: string, prefix?: number): boolean => {
  try {
    if (prefix) {
      return checkAddress(address, prefix)[0];
    } else {
      encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));
      return true;
    }
  } catch (error) {
    return false;
  }
};
