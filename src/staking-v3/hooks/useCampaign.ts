import { computed } from 'vue';
import { useStore } from 'src/store';
import { Campaign } from 'src/v2/models';
import { CombinedDappInfo } from '../logic';
import dappPromotions from 'src/data/dapp_promotions.json';

export function useCampaign() {
  const dappsInCampaign = 5;
  const store = useStore();

  // Latest registered dApps.
  const newListings = computed<Campaign[]>(() =>
    (<CombinedDappInfo[]>store.getters['stakingV3/getRegisteredDapps'])
      .filter((x) => !!x.basic)
      .sort((x, y) => Number(y.basic?.creationTime ?? 0) - Number(x.basic?.creationTime ?? 0))
      .splice(0, dappsInCampaign)
      .map(
        (x) =>
          <Campaign>{
            name: x.basic?.name,
            shortDescription: x.basic?.shortDescription,
            link: x.basic?.url,
            img: x.basic?.imagesUrl ? x.basic?.imagesUrl[0] : 'images/noimage.png',
            address: x.chain.address,
          }
      )
  );

  // Combine latest dApps with dApp promotions.
  const combinedCampaigns = computed<Campaign[]>(() => {
    const result: Campaign[] = [];
    const minLen = Math.min(newListings.value.length, dappPromotions.length);

    for (let i = 0; i < minLen; i++) {
      result.push(newListings.value[i], dappPromotions[i]);
    }
    result.push(...newListings.value.slice(minLen), ...dappPromotions.slice(minLen));

    return result;
  });

  return {
    newListings,
    combinedCampaigns,
  };
}
