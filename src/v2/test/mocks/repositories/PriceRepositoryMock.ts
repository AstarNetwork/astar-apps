import { IPriceRepository } from 'src/v2/repositories';
import { injectable } from 'inversify-props';

@injectable()
export class PriceRepositoryMock implements IPriceRepository {
  public async getUsdPrice(tokenSymbol: string): Promise<number> {
    return 100;
  }
}
