import { ApiPromise, WsProvider } from '@polkadot/api';
import { XcmNetworkSettings } from 'src/hooks/xcm/networks';

export class ApiFactory {
  private static apiInstances = new Map<string, ApiPromise>();

  public static async getApiInstance(networkSettings: XcmNetworkSettings): Promise<ApiPromise> {
    let apiInstance = ApiFactory.apiInstances.get(networkSettings.name);
    if (apiInstance) {
      return apiInstance;
    }

    apiInstance = await ApiFactory.createInstance(networkSettings);
    ApiFactory.apiInstances.set(networkSettings.name, apiInstance);

    return apiInstance;
  }

  private static async createInstance(networkSettings: XcmNetworkSettings): Promise<ApiPromise> {
    // TODO: Maybe to use connectApi here later. Some refactoring required there.
    const provider = new WsProvider(networkSettings.rpcUrl);
    const api = new ApiPromise({ provider });
    const apiInstance = await api.isReadyOrError;

    return apiInstance;
  }
}
