/**
 * Definition of repository for access token price.
 */
export interface IPriceRepository {
  /**
   * Gets current token price in USD.
   * @param tokenSymbol Token symbol.
   */
  getUsdPrice(tokenSymbol: string): Promise<number>;
}
