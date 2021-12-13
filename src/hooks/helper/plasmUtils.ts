import { BigNumber, formatFixed } from '@ethersproject/bignumber';
import { hexToU8a, isHex, isString, u8aToHex } from '@polkadot/util';
import { addressToEvm, decodeAddress, encodeAddress, evmToAddress } from '@polkadot/util-crypto';
import BN from 'bn.js';
import Web3 from 'web3';
import { LOCAL_STORAGE } from './../../config/localStorage';
import { nFormatter } from './units';

export const ASTAR_SS58_FORMAT = 5;
export const ASTAR_DECIMALS = 18;

/**
 * A helper function to convert the given node balance value into the given chain token decimal point as a string.
 * EX: `femto` -> `PLM`
 * @param bal the account balance in the minimum denominator
 * @param decimal the decimal point it should convert to
 * @returns the reduced value in string number
 */
export const reduceBalanceToDenom = (bal: BN, decimal: number): string => {
  const decPoint = new BN(10).pow(new BN(decimal));
  const formatted = bal.div(decPoint);
  return formatted.toString();
};

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

/**
 * Convert the given value into the given token decimal point WITHOUT losing decimals.
 * @param value eg: value.toString() -> '12999999999999000000'
 * @param decimal eg: 18
 * @returns '12.999999999999'
 */
export const defaultAmountWithDecimals = (
  value: BN | BigNumber | string,
  decimal: number
): string => {
  const strToBig = (str: string) => BigNumber.from(str.toString());

  if (isString(value)) {
    const hexValue = strToBig(value);
    return formatFixed(hexValue, decimal);
  }

  try {
    const hexValue = value.toJSON();
    return formatFixed(hexValue, decimal);
  } catch (error) {
    const bigValue = strToBig(value.toString());
    const hexValue = bigValue.toJSON();
    return formatFixed(hexValue, decimal);
  }
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

/**
 * Remove the unnecessary decimals such as '.000' that comes from `<Balance>.toHuman()`
 * @param amountWithUnit eg: '100.0000 SDN'
 * @returns '100 SDN'
 */
export const formatUnitAmount = (amountWithUnit: string): string => {
  const words = amountWithUnit.split(' ');
  const value = Number(words[0]);
  const unit = words[1] || '';
  const formattedAmount = `${value} ${unit}`;
  return formattedAmount;
};

// Memo: The EVM address won't be same as the address shown in MetaMask imported from the same private key of the SS58
// Ref: https://github.com/polkadot-js/common/issues/931
export const toEvmAddress = (ss58Address: string) => {
  return u8aToHex(addressToEvm(ss58Address));
};

export const checkSumEvmAddress = (evmAddress: string): string => {
  const web3 = new Web3();
  return web3.utils.toChecksumAddress(evmAddress);
};

export const isValidEvmAddress = (evmAddress: string): boolean => {
  if (!evmAddress) return false;

  try {
    const web3 = new Web3();
    // Memo: returns `false` if evmAddress was converted from SS58
    const isEvmAddress = web3.utils.checkAddressChecksum(evmAddress);

    // Memo: check if the given evmAddress is convertible
    const ss58Address = toSS58Address(evmAddress);

    return ss58Address.length > 0 || isEvmAddress;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const toSS58Address = (h160Address: string) => {
  const address = checkSumEvmAddress(h160Address);
  return evmToAddress(address, ASTAR_SS58_FORMAT);
};
