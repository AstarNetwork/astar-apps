import { IPriceRepository } from 'src/v2/repositories';
import { injectable } from 'inversify';

@injectable()
export class PriceRepositoryMock implements IPriceRepository {
  public async getUsdPrice(symbol: string): Promise<number> {
    return 100;
  }
}
