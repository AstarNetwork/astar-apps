import { inject, injectable } from 'inversify-props';
import { IMetadataRepository } from '../';
import { ChainMetadata } from '../../models';
import { IApi } from 'src/v2/integration';
import { Guard } from 'src/v2/common';

@injectable()
export class MetadataRepository implements IMetadataRepository {
  private metadata!: ChainMetadata;

  constructor(@inject() private api: IApi) {
    Guard.ThrowIfUndefined('api', api);
  }

  public async getChainMetadata(): Promise<ChainMetadata> {
    if (!this.metadata) {
      const api = await this.api.getApi();
      const decimals = api.registry.chainDecimals[0];
      const token = api.registry.chainTokens[0];
      const chain = await api.rpc.system.chain();

      this.metadata = new ChainMetadata(decimals, token, chain.toString());
    }

    return this.metadata;
  }
}
