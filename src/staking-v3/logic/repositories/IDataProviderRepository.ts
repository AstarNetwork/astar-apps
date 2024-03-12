import { ProviderDappData, NumberOfStakersAndLockers } from '../models';

/**
 * Interface for provider to fetch dapp staking v3 data from other sources
 */
export interface IDataProviderRepository {
  getDapps(network: string): Promise<ProviderDappData[]>;
  getNumberOfStakersAndLockers(network: string): Promise<NumberOfStakersAndLockers>;
}
