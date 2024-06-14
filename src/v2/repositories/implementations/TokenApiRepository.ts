import axios from 'axios';
import { injectable } from 'inversify';
import { ITokenApiRepository, PeriodData } from '../ITokenApiRepository';

@injectable()
export class TokenApiRepository implements ITokenApiRepository {
  public static BaseUrl = 'https://api.astar.network/api';

  public async getUsdPrice(symbol: string): Promise<number> {
    try {
      const url = `${TokenApiRepository.BaseUrl}/v1/token/price/${symbol}`;
      const response = await axios.get<number>(url);
      return response.data;
    } catch (error) {
      return 0;
    }
  }

  public async getStakingPeriodStatistics(network: string, period: number): Promise<PeriodData[]> {
    try {
      const url = `${TokenApiRepository.BaseUrl}/v3/${network}/dapps-staking/period-aggregated/${period}`;
      const response = await axios.get<PeriodData[]>(url);
      return response.data.map((data) => {
        return {
          dappAddress: data.dappAddress,
          stakeAmount: BigInt(data.stakeAmount),
          rewardAmount: BigInt(data.rewardAmount),
        };
      });
    } catch (error) {
      return [];
    }
  }
}
