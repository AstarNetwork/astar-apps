import { injectable } from 'inversify';
import { IDataProviderRepository } from './IDataProviderRepository';
import { ProviderDappData, NumberOfStakersAndLockers } from '../models';
import { TOKEN_API_URL } from '@astar-network/astar-sdk-core';
import { Guard } from 'src/v2/common';
import axios from 'axios';

@injectable()
export class TokenApiProviderRepository implements IDataProviderRepository {
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

  async getNumberOfStakersAndLockers(network: string): Promise<NumberOfStakersAndLockers> {
    // Modify the return type to remove the possibility of undefined
    Guard.ThrowIfUndefined(network, 'network');

    const numberOfStakersAndLockersUrl = `${TOKEN_API_URL}/v3/${network.toLowerCase()}/dapps-staking/lockers-and-stakers-total/1 day`;
    try {
      const numberOfStakersAndLockers = await axios.get<Array<NumberOfStakersAndLockers>>(
        numberOfStakersAndLockersUrl
      );

      return numberOfStakersAndLockers.data[0];
    } catch (error) {
      console.error(error);
      throw error; // Throw the error instead of returning undefined
    }
  }
}
