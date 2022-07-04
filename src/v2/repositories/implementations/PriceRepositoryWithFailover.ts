import { injectable } from 'inversify';
import { container } from 'src/v2/common';
import { TokenInfo } from 'src/v2/models';
import { IPriceRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';

/**
 * Uses available price repositories to fetch token price.
 */
@injectable()
export class PriceRepositoryWithFailover implements IPriceRepository {
  /**
   * Fetches all registered price repositories and tries to fetch data from a first one.
   * If call fails it moves to second price repository and so on.
   * @param tokenInfo Token information.
   * @returns Token price or 0 if unable to fetch price.
   */
  public async getUsdPrice(tokenInfo: TokenInfo): Promise<number> {
    const providers = container.getAll<IPriceRepository>(Symbols.PriceRepository);

    for (const provider of providers) {
      try {
        return await provider.getUsdPrice(tokenInfo);
      } catch (error) {
        console.log(error);
      }
    }

    return 0;
  }
}
