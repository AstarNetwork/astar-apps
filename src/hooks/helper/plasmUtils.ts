// const { decodeAddress, encodeAddress } = require('@polkadot/keyring');
// const { hexToU8a, isHex } = require('@polkadot/util');
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import { hexToU8a, isHex } from '@polkadot/util';
import BN from 'bn.js';

/**
 * A helper function to convert the given node balance value into the given chain token decimal point as a string.
 * EX: `femto` -> `PLM`
 * @param bal the account balance in the minimum denominator
 * @param decimal the decimal point it should convert to
 * @returns the reduced value in string number
 */
export const reduceBalanceToDenom = (bal: BN, decimal: number) => {
  const decPoint = new BN(10).pow(new BN(decimal));
  const formatted = bal.div(decPoint);
  return formatted.toString();
};

export const reduceDenomToBalance = (
  bal: BN,
  unit: number,
  decimal: number
) => {
  const unit_decimal = unit + decimal;
  const decPoint = new BN(10).pow(new BN(unit_decimal));
  const formatted = decPoint.mul(new BN(bal));
  return formatted;
};

export const isValidAddressPolkadotAddress = (address: string) => {
  try {
    encodeAddress(isHex(address) ? hexToU8a(address) : decodeAddress(address));

    return true;
  } catch (error) {
    return false;
  }
};
