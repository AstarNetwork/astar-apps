import { NftMetadata } from 'src/v2/models';

export interface INftRepository {
  getOwnedTokens(ownerAddress: string): Promise<NftMetadata[]>;
  getNftMetadata(contractAddress: string, tokenId: string): Promise<NftMetadata | undefined>;
}
