/**
 * Definition of repository for access token price.
 */
export interface IPriceRepository {
  /**
   * Gets current token price in USD.
   * @param tokenInfo Token information.
   */
  getUsdPrice(symbol: string): Promise<number>;
}
