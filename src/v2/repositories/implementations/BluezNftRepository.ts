// TODO move to Token API
import axios from 'axios';
import { injectable } from 'inversify';
import { NftMetadata } from 'src/v2/models';
import { INftRepository } from 'src/v2/repositories';

@injectable()
export class BluezNftRepository implements INftRepository {
  private readonly baseUrl = 'https://api.bluez.app/api/nft/v3/API_KEY';

  public async getOwnedTokens(ownerAddress: string): Promise<NftMetadata[]> {
    const ownedTokensUrl = `${this.baseUrl}/getNFTsForOwner?owner=${ownerAddress}&pageKey=1&pageSize=100`;
    const result = await axios.get(ownedTokensUrl);
    // memo we are not handling pagination atm. 100 tokens should be enough for now.

    return result.data.items;
  }

  public async getNftMetadata(
    contractAddress: string,
    tokenId: string
  ): Promise<NftMetadata | undefined> {
    const metadataUri = `${this.baseUrl}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}`;
    const result = await axios.get(metadataUri);

    return result.data ?? undefined;
  }
}
