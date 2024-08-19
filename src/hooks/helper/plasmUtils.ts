import {
  ASTAR_DECIMALS,
  defaultAmountWithDecimals,
  nFormatter,
} from '@astar-network/astar-sdk-core';
import { BN, isString } from '@polkadot/util';
import { LOCAL_STORAGE } from 'src/config/localStorage';

/**
 * Format unit number(K M B) with default currency.
 * info: Balance.toHuman() -> 243.5087 mSDN (lower readability)
 * @param value eg: value.toString() -> '243508700000000000'
 * @param decimal eg: 18
 * @returns '0.244 SDN'
 */
export const balanceFormatter = (
  bal: BN | string,
  decimal = ASTAR_DECIMALS,
  includeCurrency = true
): string => {
  let amount;
  amount = defaultAmountWithDecimals(bal.toString(), decimal);

  const defaultCurrency = localStorage.getItem(LOCAL_STORAGE.DEFAULT_CURRENCY);
  return `${nFormatter(Number(amount))} ${includeCurrency ? defaultCurrency : ''}`;
};
