import { container, Guard } from 'src/v2/common';
import { Chain, Endpoint } from 'src/v2/config/types';
import { XcmConfiguration } from 'src/v2/config/xcm/XcmConfiguration';
import { IApiFactory } from 'src/v2/integration';
import { Symbols } from 'src/v2/symbols';

/**
 * Base class for XCM repositories
 */
export abstract class XcmRepositoryBase {
  protected endpoint: Endpoint;
  protected apiFactory: IApiFactory;

  constructor(chain: Chain) {
    this.endpoint = XcmRepositoryBase.getEndpoint(chain.toString());
    this.apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
  }

  private static getEndpoint(networkAlias: string): Endpoint {
    const endpoint = XcmConfiguration.find((x) => x.networkAlias === networkAlias);

    if (endpoint) {
      return endpoint;
    }

    throw new Error(
      `Endpoint for networkAlias: ${networkAlias} can not be found in XcmConfiguration`
    );
  }
}
