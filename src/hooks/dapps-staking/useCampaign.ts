import { computed } from 'vue';
import { useStore } from 'src/store';
import { Campaign, DappCombinedInfo } from 'src/v2/models';
import dappPromotions from 'src/data/dapp_promotions.json';

export function useCampaign() {
  const dappsInCampaign = 5;
  const store = useStore();

  // Latest registered dApps.
  const newListings = computed<Campaign[]>(() =>
    (<DappCombinedInfo[]>store.getters['dapps/getAllDapps'])
      .filter((x) => !!x.dapp)
      .sort((x, y) => Number(y.dapp?.creationTime ?? 0) - Number(x.dapp?.creationTime ?? 0))
      .splice(0, dappsInCampaign)
      .map(
        (x) =>
          <Campaign>{
            name: x.dapp?.name,
            shortDescription: x.dapp?.shortDescription,
            link: x.dapp?.url,
            img: x.dapp?.imagesUrl ? x.dapp.imagesUrl[0] : 'images/noimage.png',
            address: x.contract.address,
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
