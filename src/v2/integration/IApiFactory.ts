import { ApiPromise } from '@polkadot/api';

/**
 * Definition of factory to handle multiple ApiPromise instances.
 */
export interface IApiFactory {
  get(endpoint: string): Promise<ApiPromise>;
}
