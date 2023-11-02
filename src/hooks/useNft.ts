import { ref } from 'vue';
import { NftMetadata } from 'src/v2/models';
import { useNetworkInfo } from './useNetworkInfo';
import { container } from 'src/v2/common';
import { INftRepository } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';

export function useNft() {
  const { currentNetworkName } = useNetworkInfo();
  const ownedNfts = ref<NftMetadata[]>([]);
  const isBusy = ref<boolean>(false);

  const getOwnedNfts = async (ownerAddress: string): Promise<void> => {
    const nftRepository = container.get<INftRepository>(Symbols.NftRepository);

    try {
      isBusy.value = true;
      const nfts = await nftRepository.getOwnedTokens(
        currentNetworkName.value.toLowerCase(),
        ownerAddress
      );

      // Update image uri to use IPFS gateway
      ownedNfts.value = nfts.map((nft) => {
        nft.image = getProxiedUrl(nft.image);
        return nft;
      });
    } finally {
      isBusy.value = false;
    }
  };

  const getProxiedUrl = (ipfsUri: string): string => {
    return ipfsUri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
  };

  return { ownedNfts, isBusy, getOwnedNfts, getProxiedUrl };
}
