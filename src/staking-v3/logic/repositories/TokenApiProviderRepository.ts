import { injectable } from 'inversify';
import { IDataProviderRepository } from './IDataProviderRepository';
import { ProviderDappData, NumberOfParticipantsData } from '../models';
import { TOKEN_API_URL } from '@astar-network/astar-sdk-core';
import { Guard } from 'src/v2/common';
import axios from 'axios';

@injectable()
export class TokenApiProviderRepository implements IDataProviderRepository {
  private readonly _baseUrl: string;

  constructor() {
    this._baseUrl = 'https://api.astar.network/api/v3/shibuya/dapps-staking/';
  }
  async getDapps(network: string): Promise<ProviderDappData[]> {
    Guard.ThrowIfUndefined(network, 'network');

    const dappsUrl = `${TOKEN_API_URL}/v3/${network.toLowerCase()}/dapps-staking/chaindapps`;
    try {
      const dapps = await axios.get<ProviderDappData[]>(dappsUrl);
      return dapps.data;
    } catch (error) {
      console.error(error);
    }

    return [];
  }

  async getNumberOfParticipants(network: string): Promise<number> {
    Guard.ThrowIfUndefined(network, 'network');

    const numberOfParticipantsUrl = `${TOKEN_API_URL}/v3/${network.toLowerCase()}/dapps-staking/stakerscount-total/1 day`;
    try {
      const numberOfParticipants = await axios.get<Array<Array<string | number>>>(
        numberOfParticipantsUrl
      );

      const transformedData: NumberOfParticipantsData[] = numberOfParticipants.data.map((item) => {
        return {
          timestamp: item[0] as string,
          participants: item[1] as number,
        };
      });

      return transformedData.length > 0 ? transformedData[0].participants : 0;
    } catch (error) {
      console.error(error);
    }

    return 0;
  }
}
