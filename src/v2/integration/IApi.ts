import { ApiPromise } from '@polkadot/api';

export interface IApi {
  getApi(): Promise<ApiPromise>;
}
