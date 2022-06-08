import { injectable } from 'inversify-props';
import { ChainMetadata } from 'src/v2/models';
import { IMetadataRepository } from 'src/v2/repositories';

@injectable()
export class MetadataRepositoryMock implements IMetadataRepository {
  getChainMetadata(): Promise<ChainMetadata> {
    return Promise.resolve(new ChainMetadata(8, 'ASTR', 'Astar', 5));
  }
}
