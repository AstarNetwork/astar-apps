import {
  CbridgeToken,
  EvmChain,
  getSelectedToken,
  getTransferConfigs,
  SelectedToken,
} from 'src/c-bridge';
import { endpointKey, getProviderIndex } from 'src/config/chainEndpoints';
import { getTokenBal } from 'src/config/web3';
import { objToArray } from 'src/hooks/helper/common';
import { useStore } from 'src/store';
import { computed, ref, watch } from 'vue';
import { useAccount } from '../useAccount';
import { calUsdAmount } from './../helper/price';

const { Astar, Shiden } = EvmChain;

export function useCbridgeV2() {
  const tokens = ref<SelectedToken[] | null>(null);
  const isLoading = ref<boolean | null>(true);
  const ttlErc20Amount = ref<number>(0);
  const store = useStore();
  const { currentAccount } = useAccount();
  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });

  const updateBridgeConfig = async ({
    srcChainId,
    userAddress,
  }: {
    srcChainId: EvmChain;
    userAddress: string;
  }): Promise<void> => {
    isLoading.value = true;
    const data = await getTransferConfigs(currentNetworkIdx.value);
    if (!data || !data.tokens) {
      throw Error('Cannot fetch from cBridge API');
    }
    tokens.value = (await Promise.all(
      objToArray(data.tokens[srcChainId])
        .flat()
        .map(async (token: CbridgeToken) => {
          let balUsd = 0;
          const t = getSelectedToken({ srcChainId, token });
          if (!t) return;
          const userBalance = await getTokenBal({
            srcChainId,
            address: userAddress,
            tokenAddress: t.address,
            tokenSymbol: t.symbol,
          });
          if (Number(userBalance) > 0) {
            balUsd = await calUsdAmount({
              amount: Number(userBalance),
              symbol: t.symbol,
            });
            ttlErc20Amount.value += balUsd;
          }
          const tokenWithBalance = { ...t, userBalance, userBalanceUsd: String(balUsd) };
          return tokenWithBalance;
        })
    )) as SelectedToken[];

    tokens.value.sort((a: SelectedToken, b: SelectedToken) => {
      return Number(b.userBalance) - Number(a.userBalance);
    });
  };

  watch(
    [currentAccount, currentNetworkIdx],
    async () => {
      ttlErc20Amount.value = 0;
      if (!currentAccount.value || currentNetworkIdx.value === endpointKey.SHIBUYA) {
        return;
      }

      const srcChainId = currentNetworkIdx.value === endpointKey.ASTAR ? Astar : Shiden;
      try {
        isLoading.value = true;
        await updateBridgeConfig({ srcChainId, userAddress: currentAccount.value });
      } catch (error: any) {
        console.error(error.message);
      } finally {
        isLoading.value = false;
      }
    },
    { immediate: false }
  );

  return { tokens, isLoading, ttlErc20Amount };
}
