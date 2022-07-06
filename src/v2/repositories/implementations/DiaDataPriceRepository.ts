import axios from 'axios';
import { Guard } from 'src/v2//common';
import { IPriceRepository } from 'src/v2/repositories';
import { injectable } from 'inversify';
import { TokenInfo } from 'src/v2/models';

@injectable()
export class DiaDataPriceRepository implements IPriceRepository {
  public static BaseUrl = 'https://api.diadata.org/v1/quotation';

  public async getUsdPrice(tokenInfo: TokenInfo): Promise<number> {
    Guard.ThrowIfUndefined('tokenInfo', tokenInfo);

    const url = `${DiaDataPriceRepository.BaseUrl}/${tokenInfo.symbol}`;
    const result = await axios.get(url);

    if (result.data && result.data.Price) {
      return Number(result.data.Price);
    }

    return 0;
  }
}
