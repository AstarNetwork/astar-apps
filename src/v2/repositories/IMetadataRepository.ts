import { ChainMetadata } from 'src/v2/models';

/**
 * Definition of repository for accessing chain metadata.
 */
export interface IMetadataRepository {
  /**
   * Gets chain metadata.
   */
  getChainMetadata(): Promise<ChainMetadata>;
}
