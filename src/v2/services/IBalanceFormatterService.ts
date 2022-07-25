import { BN } from '@polkadot/util';

/**
 * Interface for service used to format asset balances
 */
export interface IBalanceFormatterService {
  /**
   * Formats asset balance
   * @param balance Balance
   * @param decimals Number of decimals
   */
  format(balance: BN, decimals: number): string;
}
