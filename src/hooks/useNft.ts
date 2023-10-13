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
      ownedNfts.value = await nftRepository.getOwnedTokens(
        currentNetworkName.value.toLowerCase(),
        ownerAddress
      );
    } finally {
      isBusy.value = false;
    }
  };

  return { ownedNfts, isBusy, getOwnedNfts };
}
