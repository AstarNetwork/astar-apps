import { AssetDetails, AssetMetadata } from '@polkadot/types/interfaces';
import { $api } from 'boot/api';
import { fetchXcmBalance } from 'src/modules/xcm';
import { useStore } from 'src/store';
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue';
import Web3 from 'web3';
import { useAccount } from '../useAccount';

export interface ChainAsset extends AssetDetails {
  id: string;
  mappedERC20Addr: string;
  metadata: AssetMetadata;
  userBalance: string;
  userBalanceUsd: string;
}

export function useXcmAssets() {
  const xcmAssets = ref<ChainAsset[]>([]);
  const store = useStore();
  const { currentAccount } = useAccount();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const ttlNativeXcmUsdAmount = ref<number>(0);

  const filterTokens = (): void => {
    xcmAssets.value.sort((a: ChainAsset, b: ChainAsset) => {
      return a.metadata.symbol.toString().localeCompare(b.metadata.symbol.toString());
    });

    xcmAssets.value.sort((a: ChainAsset, b: ChainAsset) => {
      return Number(b.userBalanceUsd) - Number(a.userBalanceUsd);
    });
  };

  const updateTokenBalances = async ({ userAddress }: { userAddress: string }): Promise<void> => {
    if (isH160.value) return;

    ttlNativeXcmUsdAmount.value = 0;
    xcmAssets.value = await Promise.all(
      xcmAssets.value.map(async (token: ChainAsset) => {
        const { userBalance, userBalanceUsd } = await fetchXcmBalance({
          token,
          userAddress: userAddress,
          api: $api!,
        });
        ttlNativeXcmUsdAmount.value = ttlNativeXcmUsdAmount.value + Number(userBalanceUsd);
        const tokenWithBalance = { ...token, userBalance, userBalanceUsd };
        return tokenWithBalance as ChainAsset;
      })
    );

    filterTokens();
  };

  const handleUpdateTokenBalances = async (): Promise<void> => {
    try {
      await updateTokenBalances({ userAddress: currentAccount.value });
    } catch (error) {
      console.error(error);
    }
  };

  const mappedXC20Asset = (assetId: string) => `0xffffffff${Web3.utils.toHex(assetId).slice(2)}`;

  const fetchAssets = async () => {
    try {
      // note: The asset ID will have different meanings depending on the range
      // 1 ~ 2^32-1 = User-defined assets. Anyone can register this assets on chain.
      // 2^32 ~ 2^64-1 = Statemine/Statemint assets map. This is a direct map of all the assets stored in the common-goods state chain.
      // 2^64 ~ 2^128-1 = Ecosystem assets like native assets on another parachain or other valuable tokens.
      // 2^128 ~ 1 = Relaychain native token (DOT or KSM).

      const assetsListRaw = await $api?.query.assets.asset.entries();
      const assetMetadataListRaw = await $api?.query.assets.metadata.entries();

      //const assetIds = assetIdsRaw.map((i) => i.toHuman() as string).flat().map((i) => i.replaceAll(',', ''));
      if (assetsListRaw && assetMetadataListRaw) {
        xcmAssets.value = await Promise.all(
          assetsListRaw
            // .filter((i) => {
            //   //@ts-ignore
            //   const assetId = (i[0].toHuman() as string[])[0].replaceAll(',', '');
            //   //the ID is between 2^64 ~ 2^128-1,
            //   return (
            //     new BN(assetId).gte(new BN(Math.pow(2, 64))) &&
            //     new BN(assetId).lt(new BN(Math.pow(2, 128)))
            //   );
            // })
            .map(async (i, index) => {
              //@ts-ignore
              const assetId = (i[0].toHuman() as string[])[0].replaceAll(',', '');
              const mappedXC20 = mappedXC20Asset(assetId);
              console.log('mapped', mappedXC20);
              //const assetId = i[0].toHuman() as any as AssetId;
              const assetInfo = i[1].toHuman() as any as AssetDetails;
              const metadata = assetMetadataListRaw[index][1].toHuman() as any as AssetMetadata;
              const token = {
                id: assetId,
                ...assetInfo,
                metadata,
                userBalance: '0',
                userBalanceUsd: '0',
              } as ChainAsset;

              if (currentAccount.value) {
                const { userBalance, userBalanceUsd } = await fetchXcmBalance({
                  token,
                  userAddress: currentAccount.value,
                  api: $api!,
                });
                ttlNativeXcmUsdAmount.value = ttlNativeXcmUsdAmount.value + Number(userBalanceUsd);
                return { ...token, userBalance, userBalanceUsd } as ChainAsset;
              } else {
                return token;
              }
            })
        );
      }
      // convert the list into a string array of numbers without the comma and no nested entries
    } catch (e) {
      console.warn(e);
    }
  };

  watchEffect(async () => {
    await fetchAssets();
  });

  const secsUpdateBal = 60 * 1000;
  const tokenBalUpdate = setInterval(() => {
    if (xcmAssets.value) {
      handleUpdateTokenBalances();
    }
  }, secsUpdateBal);

  watch(
    [currentAccount],
    () => {
      handleUpdateTokenBalances();
    },
    { immediate: true }
  );

  onUnmounted(() => {
    clearInterval(tokenBalUpdate);
  });

  return {
    xcmAssets,
    mappedXC20Asset,
    handleUpdateTokenBalances,
    ttlNativeXcmUsdAmount,
  };
}
