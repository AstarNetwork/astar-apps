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

export const reduceDenomToBalance = (bal: number, unit: number, decimal: number) => {
  const unit_decimal = unit + decimal;
  const decPoint = new BN(10).pow(new BN(unit_decimal));
  // console.log('d', decPoint.toString())

  const strBal = bal.toString();
  // console.log('b', bal.toString())

  let formatted = new BN(0);

  const arrDecimalBal = strBal.split('.');
  if (arrDecimalBal.length === 2) {
    const intBal = arrDecimalBal[0];
    const minorityBal = arrDecimalBal[1];
    const remainNum = parseInt(`${intBal}${minorityBal}`);
    const decimalLength = minorityBal.length;
    // console.log('intBal', intBal)
    // console.log('minorityBal', minorityBal)
    // console.log('decimalLength', decimalLength)
    const divPoint = new BN(10).pow(new BN(decimalLength));
    formatted = decPoint.mul(new BN(remainNum)).div(divPoint);
  } else {
    formatted = decPoint.mul(new BN(bal));
  }
  // console.log('f', formatted.toString())
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
