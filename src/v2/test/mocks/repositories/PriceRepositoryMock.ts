import { IPriceRepository } from 'src/v2/repositories';
import { injectable } from 'inversify';
import { TokenInfo } from 'src/v2/models';

@injectable()
export class PriceRepositoryMock implements IPriceRepository {
  public async getUsdPrice(tokenInfo: TokenInfo): Promise<number> {
    return 100;
  }
}
