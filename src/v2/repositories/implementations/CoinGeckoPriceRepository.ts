import axios from 'axios';
import { Guard } from 'src/v2//common';
import { IPriceRepository } from 'src/v2/repositories';
import { injectable } from 'inversify-props';

@injectable()
export class CoinGeckoPriceRepository implements IPriceRepository {
  public async getUsdPrice(tokenSymbol: string): Promise<number> {
    Guard.ThrowIfUndefined('tokenSymbol', tokenSymbol);

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbol}&vs_currencies=usd`;
    const result = await axios.get(url);
    const price = result.data[tokenSymbol].usd;
    return Number(price);
  }
}
