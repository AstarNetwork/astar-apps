import axios from 'axios';
import { injectable } from 'inversify';
import { IPriceRepository } from '../IPriceRepository';

@injectable()
export class TokenApiRepository implements IPriceRepository {
  public static BaseUrl = 'http://localhost:5001/astar-token-api/us-central1/app/api';

  public async getUsdPrice(symbol: string): Promise<number> {
    const url = `${TokenApiRepository.BaseUrl}/v1/token/price/${symbol}`;
    const response = await axios.get<number>(url);

    return response.data;
  }
}
