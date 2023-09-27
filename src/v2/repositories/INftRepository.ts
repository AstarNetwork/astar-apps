import { NftMetadata } from 'src/v2/models';

export interface INftRepository {
  getOwnedTokens(network: string, ownerAddress: string): Promise<NftMetadata[]>;
  getNftMetadata(
    network: string,
    contractAddress: string,
    tokenId: string
  ): Promise<NftMetadata | undefined>;
}
