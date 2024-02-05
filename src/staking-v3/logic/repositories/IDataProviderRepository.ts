import { ProviderDappData } from '../models';

/**
 * Interface for provider to fetch dapp staking v3 data from other sources
 */
export interface IDataProviderRepository {
  getDapps(network: string): Promise<ProviderDappData[]>;
  getNumberOfParticipants(network: string): Promise<number>;
}
