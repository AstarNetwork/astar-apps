import { ApiPromise } from '@polkadot/api';
import { injectable } from 'inversify';
import { castXcmEndpoint } from 'src/modules/xcm/utils';
import { Guard } from 'src/v2/common';
import { IApiFactory, IApi } from 'src/v2/integration';
import { Api } from 'src/v2/integration/implementation';

@injectable()
export class ApiFactory implements IApiFactory {
  private _instances = new Map<string, IApi>();

  public async get(endpoint: string): Promise<ApiPromise> {
    Guard.ThrowIfUndefined('endpoint', endpoint);

    const castedEndpoint = castXcmEndpoint(endpoint);
    let api = this._instances.get(castedEndpoint);

    if (api) {
      return await api.getApi();
    }

    api = new Api(castedEndpoint);
    this._instances.set(castedEndpoint, api);

    return await api.getApi();
  }
}
