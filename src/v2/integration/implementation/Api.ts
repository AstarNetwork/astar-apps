import { ApiPromise } from '@polkadot/api';
import { injectable } from 'inversify';
import { $api } from 'src/boot/api';
import { IApi } from '../';

/**
 * Wrapper arrount Polkadot ApiPromise
 * Wrapper already created by the portal to be used
 * TODO refactor later to create ApiPromise instance here.
 */
@injectable()
export class Api implements IApi {
  private _api: ApiPromise;

  // constructor(_endpoint: string) {
  //   if (!_endpoint) {
  //     throw new Error('endpoint parameter not provided')
  //   }

  constructor() {
    if ($api) {
      this._api = $api;
    } else {
      throw new Error('$api not defined.');
    }
  }

  //   const provider = new WsProvider(_endpoint);
  //   this._api = new ApiPromise({ provider });
  // }

  public async getApi(): Promise<ApiPromise> {
    return this._api;
  }

  // private async connect (): Promise<ApiPromise> {
  //   return await this._api?.isReady
  // }
}
