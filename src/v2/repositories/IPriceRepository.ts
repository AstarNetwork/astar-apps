import { TokenInfo } from 'src/v2/models';

/**
 * Definition of repository for access token price.
 */
export interface IPriceRepository {
  /**
   * Gets current token price in USD.
   * @param tokenInfo Token information.
   */
  getUsdPrice(TokenInfo: TokenInfo): Promise<number>;
}
