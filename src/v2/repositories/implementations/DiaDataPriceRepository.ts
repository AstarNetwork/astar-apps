import axios from 'axios';
import { Guard } from 'src/v2//common';
import { IPriceRepository } from 'src/v2/repositories';
import { injectable } from 'inversify';
import { TokenInfo } from 'src/v2/models';

@injectable()
export class DiaDataPriceRepository implements IPriceRepository {
  public async getUsdPrice(tokenInfo: TokenInfo): Promise<number> {
    Guard.ThrowIfUndefined('tokenInfo', tokenInfo);

    const url = `https://api.diadata.org/v1/quotation/${tokenInfo.symbol}`;
    const result = await axios.get(url);

    if (result.data) {
      return Number(result.data.Price);
    }

    return 0;
  }
}
