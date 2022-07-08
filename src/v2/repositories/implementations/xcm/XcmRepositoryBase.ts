import { decodeAddress } from '@polkadot/util-crypto';
import { container } from 'src/v2/common';
import { Chain, Network } from 'src/v2/config/types';
import { XcmConfiguration } from 'src/v2/config/xcm/XcmConfiguration';
import { ExtrinsicPayload, IApiFactory } from 'src/v2/integration';
import { Asset } from 'src/v2/models';
import { Symbols } from 'src/v2/symbols';

/**
 * Base class for XCM repositories
 */
export abstract class XcmRepositoryBase {
  protected endpoint: Network;
  protected apiFactory: IApiFactory;

  constructor(chain: Chain) {
    this.endpoint = XcmRepositoryBase.getEndpoint(chain);
    this.apiFactory = container.get<IApiFactory>(Symbols.ApiFactory);
  }

  public abstract transferToParachain(
    recipientAccountId: string,
    amount: string,
    token: Asset
  ): Promise<ExtrinsicPayload>;

  protected async buildTxCall(
    extrinsic: string,
    method: string,
    ...args: unknown[]
  ): Promise<ExtrinsicPayload> {
    const api = await this.apiFactory.get(this.endpoint.endpoint);
    const ext = api.tx[extrinsic][method](...args);
    if (ext) {
      return ext;
    }

    throw `Undefined extrinsic call ${extrinsic} with method ${method}`;
  }

  protected decodeAddress(address: string): Uint8Array {
    return decodeAddress(address);
  }

  private static getEndpoint(chain: Chain): Network {
    const endpoint = XcmConfiguration.find((x) => x.chain === chain);

    if (endpoint) {
      return endpoint;
    }

    throw new Error(`Endpoint for chain: ${chain} can not be found in XcmConfiguration`);
  }
}
