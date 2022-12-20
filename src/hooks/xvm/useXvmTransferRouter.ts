import { ethers } from 'ethers';
import { useAccount, useBalance } from 'src/hooks';
import { Erc20Token } from 'src/modules/token';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export function useXvmTransferRouter() {
  const store = useStore();
  const router = useRouter();
  const route = useRoute();

  const { currentAccount } = useAccount();
  const nativeTokenBalance = ref<number>(0);
  const { useableBalance } = useBalance(currentAccount);
  const tokens = computed<Erc20Token[]>(() => {
    const assets = store.getters['assets/getAllXvmAssets'];
    return assets.xvmAssets;
  });

  const tokenSymbol = computed<string>(() => route.query.token as string);
  const network = computed<string>(() => route.params.network as string);
  const isXvmTransferPage = computed<boolean>(() => route.fullPath.includes('xvm-transfer'));

  const token = computed<Erc20Token | null>(() => {
    try {
      return (
        tokens.value.find((it) => it.symbol.toLowerCase() === tokenSymbol.value.toLowerCase()) ||
        null
      );
    } catch (error) {
      return null;
    }
  });

  const setNativeTokenBalance = (): void => {
    nativeTokenBalance.value = Number(ethers.utils.formatEther(useableBalance.value));
  };

  const redirect = (): void => {
    const token = tokens.value[0].symbol;
    router.push({
      path: `/${network.value}/assets/xcv-transfer`,
      query: { token },
    });
  };

  const setToken = (t: Erc20Token): void => {
    const token = t.symbol.toLowerCase();
    router.replace({
      path: `/${network.value}/assets/xvm-transfer`,
      query: { token },
    });
  };

  watchEffect(setNativeTokenBalance);

  return {
    tokenSymbol,
    network,
    isXvmTransferPage,
    router,
    route,
    token,
    tokens,
    redirect,
    setToken,
  };
}
