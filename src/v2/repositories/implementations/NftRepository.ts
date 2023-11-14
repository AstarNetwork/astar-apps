// TODO move to Token API
import axios from 'axios';
import { injectable } from 'inversify';
import { NftMetadata } from 'src/v2/models';
import { INftRepository } from 'src/v2/repositories';
import { TOKEN_API_URL } from '@astar-network/astar-sdk-core';

@injectable()
export class NftRepository implements INftRepository {
  public async getOwnedTokens(network: string, ownerAddress: string): Promise<NftMetadata[]> {
    const ownedTokensUrl = `${TOKEN_API_URL}/v1/${network}/nft/owned/${ownerAddress}?pageKey=1&pageSize=100`;
    const result = await axios.get(ownedTokensUrl);
    // memo we are not handling pagination atm. 100 tokens should be enough for now.

    return result.data.items;
  }

  public async getNftMetadata(
    network: string,
    contractAddress: string,
    tokenId: string
  ): Promise<NftMetadata | undefined> {
    const metadataUri = `${TOKEN_API_URL}/v1/${network}/nft/metadata/${contractAddress}/${tokenId}`;
    const result = await axios.get<NftMetadata>(metadataUri);

    return result.data ?? undefined;
  }
}
