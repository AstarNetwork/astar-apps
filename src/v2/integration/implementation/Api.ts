import { ApiPromise, WsProvider } from '@polkadot/api';
import { injectable } from 'inversify';
import { Guard } from 'src/v2/common';
import { IApi } from 'src/v2/integration';

@injectable()
export class Api implements IApi {
  private _api: ApiPromise;

  constructor(endpoint: string) {
    Guard.ThrowIfUndefined('endpoint', endpoint);

    const provider = new WsProvider(endpoint);
    this._api = new ApiPromise({ provider });
  }

  public async getApi(): Promise<ApiPromise> {
    return await this.connect();
  }

  private async connect(): Promise<ApiPromise> {
    return await this._api?.isReady;
  }
}
