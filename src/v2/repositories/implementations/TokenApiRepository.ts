import axios from 'axios';
import { injectable } from 'inversify';
import { BurnEvent, ITokenApiRepository, PeriodData, TokenIssuance } from '../ITokenApiRepository';

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

  public async getBurnEvents(network: string): Promise<BurnEvent[]> {
    try {
      const url = `${TokenApiRepository.BaseUrl}/v1/${network}/burn/events`;
      const response = await axios.get<BurnEvent[]>(url);
      return response.data.map((data) => {
        return {
          blockNumber: data.blockNumber,
          timestamp: data.timestamp,
          amount: BigInt(data.amount),
          user: data.user,
        };
      });
    } catch (error) {
      return [];
    }
  }

  public async getTokeIssuanceHistory(network: string): Promise<TokenIssuance[]> {
    try {
      const url = `${TokenApiRepository.BaseUrl}/v1/${network}/token/supply-history`;
      const response = await axios.get<TokenIssuance[]>(url);
      return response.data;
    } catch (error) {
      return [];
    }
  }
}
