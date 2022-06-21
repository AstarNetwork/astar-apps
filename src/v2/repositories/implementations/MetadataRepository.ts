import { inject, injectable } from 'inversify';
import { defaults as addressDefaults } from '@polkadot/util-crypto/address/defaults';
import { TypeRegistry } from '@polkadot/types/create';
import { IMetadataRepository } from 'src/v2/repositories';
import { ChainMetadata } from 'src/v2/models';
import { IApi } from 'src/v2/integration';
import { Symbols } from 'src/v2/symbols';

@injectable()
export class MetadataRepository implements IMetadataRepository {
  private metadata!: ChainMetadata;

  constructor(@inject(Symbols.Api) private api: IApi) {}

  public async getChainMetadata(): Promise<ChainMetadata> {
    if (!this.metadata) {
      const api = await this.api.getApi();
      const decimals = api.registry.chainDecimals[0];
      const token = api.registry.chainTokens[0];
      const chain = await api.rpc.system.chain();
      console.log('metadata', api.registry.metadata.toHuman());

      const registry = new TypeRegistry();
      const defaultSS58Format = registry.createType('u32', addressDefaults.prefix);
      const ss58format = api.registry.chainSS58 ?? defaultSS58Format.toNumber();

      this.metadata = new ChainMetadata(decimals, token, chain.toString(), ss58format);
    }

    return this.metadata;
  }
}
