import { ApiPromise } from '@polkadot/api';
import { Guard } from 'src/v2/common';
import { IApiFactory, IApi } from 'src/v2/integration';
import { Api } from 'src/v2/integration/implementation';

export class ApiFactory implements IApiFactory {
  private _instances = new Map<string, IApi>();

  public async get(endpoint: string): Promise<ApiPromise> {
    Guard.ThrowIfUndefined('endpoint', endpoint);

    let api = this._instances.get(endpoint);

    if (api) {
      return await api.getApi();
    }

    api = new Api(endpoint);
    this._instances.set(endpoint, api);

    return await api.getApi();
  }
}
