import { ApiPromise } from '@polkadot/api';

export interface IApi {
  getApi(block?: number): Promise<ApiPromise>;
}
