import axios from 'axios';
import { Guard } from 'src/v2//common';
import { IPriceRepository } from 'src/v2/repositories';
import { injectable } from 'inversify';
import { TokenInfo } from 'src/v2/models';

@injectable()
export class CoinGeckoPriceRepository implements IPriceRepository {
  public async getUsdPrice(tokenInfo: TokenInfo): Promise<number> {
    Guard.ThrowIfUndefined('tokenInfo', tokenInfo);

    const tokenSymbol = tokenInfo.name.toLowerCase();
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbol}&vs_currencies=usd`;
    const result = await axios.get(url);

    if (result.data[tokenSymbol]) {
      const price = result.data[tokenSymbol].usd;
      return Number(price);
    }

    return 0;
  }
}
