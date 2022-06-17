import {
  CbridgeToken,
  checkIsCbridgeToken,
  EvmChain,
  getSelectedToken,
  getTransferConfigs,
  SelectedToken,
} from 'src/c-bridge';
import { endpointKey, getProviderIndex, providerEndpoints } from 'src/config/chainEndpoints';
import { getTokenBal } from 'src/config/web3';
import { objToArray } from 'src/hooks/helper/common';
import { checkIsWrappedToken, Erc20Token } from 'src/modules/token';
import { useStore } from 'src/store';
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue';
import { useAccount } from '../useAccount';
import { LOCAL_STORAGE } from './../../config/localStorage';
import { getRegisteredERC20Token } from './../../modules/token/utils/index';
import { calUsdAmount } from './../helper/price';

type CbridgeCurrency = SelectedToken;
type Token = CbridgeCurrency | Erc20Token;

export function useCbridgeV2() {
  const tokens = ref<Token[] | null>(null);
  const ttlErc20Amount = ref<number>(0);
  const isCalculated = ref<boolean>(false);
  const startCalculation = ref<boolean>(false);

  const store = useStore();
  const isH160 = computed(() => store.getters['general/isH160Formatted']);
  const { currentAccount } = useAccount();
  const isLoadingErc20Amount = ref<boolean>(false);

  const nativeTokenSymbol = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    return chainInfo ? chainInfo.tokenSymbol : '';
  });

  const currentNetworkIdx = computed(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    return getProviderIndex(chain);
  });

  const evmNetworkIdx = computed<number>(() => {
    const chainInfo = store.getters['general/chainInfo'];
    const chain = chainInfo ? chainInfo.chain : '';
    const networkIdx = getProviderIndex(chain);
    return Number(providerEndpoints[networkIdx].evmChainId);
  });

  const evmNetworkId = computed(() => {
    return Number(providerEndpoints[currentNetworkIdx.value].evmChainId);
  });

  const filterTokens = (): void => {
    if (!tokens.value) return;
    tokens.value.sort((a: Token, b: Token) => {
      return a.symbol.localeCompare(b.symbol);
    });

    tokens.value.sort((a: Token, b: Token) => {
      return Number(b.userBalanceUsd) - Number(a.userBalanceUsd);
    });
  };

  const updateTokenBalanceHandler = async ({
    userAddress,
    token,
  }: {
    userAddress: string;
    token: Erc20Token | CbridgeCurrency;
  }): Promise<{
    balUsd: number;
    userBalance: string;
  }> => {
    let balUsd = 0;
    const userBalance = await getTokenBal({
      srcChainId: evmNetworkId.value,
      address: userAddress,
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
    });
    if (Number(userBalance) > 0) {
      try {
        const isCbridgetoken = checkIsCbridgeToken(token);
        let symbol = '';

        if (isCbridgetoken) {
          symbol = token.symbol;
        } else {
          const isWrappedToken = checkIsWrappedToken({
            srcChainId: evmNetworkId.value,
            tokenAddress: token.address,
          });
          symbol = isWrappedToken ? nativeTokenSymbol.value : token.symbol;
        }

        balUsd = await calUsdAmount({
          amount: Number(userBalance),
          symbol,
        });
      } catch (error) {
        console.error(error);
        balUsd = 0;
      }
    }
    return { balUsd, userBalance };
  };

  const updateTokenBalances = async ({ userAddress }: { userAddress: string }): Promise<void> => {
    if (!tokens.value) return;
    isLoadingErc20Amount.value = true;
    tokens.value = await Promise.all(
      tokens.value.map(async (token: Token) => {
        const { balUsd, userBalance } = await updateTokenBalanceHandler({
          userAddress,
          token,
        });
        ttlErc20Amount.value += balUsd;
        const tokenWithBalance = { ...token, userBalance, userBalanceUsd: String(balUsd) };
        return tokenWithBalance;
      })
    );

    filterTokens();
    isLoadingErc20Amount.value = false;
  };

  const updateBridgeConfig = async ({
    userAddress,
  }: {
    userAddress: string;
  }): Promise<CbridgeCurrency[]> => {
    const srcChainId = evmNetworkId.value as EvmChain;
    const data = await getTransferConfigs(currentNetworkIdx.value);
    if (!data || !data.tokens) {
      throw Error('Cannot fetch from cBridge API');
    }
    const seen = new Set();
    // Todo: use srcChain and destChainID to re-define token information for bridging (ex: PKEX)
    ttlErc20Amount.value = 0;
    const cbridgeTokens = (await Promise.all(
      objToArray(data.tokens[srcChainId])
        .flat()
        .map(async (token: CbridgeToken) => {
          const t = getSelectedToken({ srcChainId, token });
          if (!t) return undefined;
          const isDuplicated = seen.has(t.address);
          seen.add(t.address);
          // Memo: Remove the duplicated contract address (ex: PKEX)
          if (isDuplicated) return undefined;

          const { balUsd, userBalance } = await updateTokenBalanceHandler({
            userAddress,
            token: t,
          });
          const tokenWithBalance = { ...t, userBalance, userBalanceUsd: String(balUsd) };
          return tokenWithBalance;
        })
    )) as CbridgeCurrency[];

    return cbridgeTokens.filter((token) => {
      return token !== undefined;
    });
  };

  const updateRegisteredToken = async ({ userAddress }: { userAddress: string }) => {
    const tokens = getRegisteredERC20Token();
    const registeredTokens = await Promise.all(
      tokens.map(async (token: Erc20Token) => {
        if (token.srcChainId === evmNetworkId.value) {
          const { balUsd, userBalance } = await updateTokenBalanceHandler({
            userAddress,
            token,
          });
          const tokenWithBalance = { ...token, userBalance, userBalanceUsd: String(balUsd) };
          return tokenWithBalance;
        } else {
          return undefined;
        }
      })
    );
    return registeredTokens.filter((it) => it !== undefined);
  };

  const handleCbridgeConfiguration = async (): Promise<void> => {
    ttlErc20Amount.value = 0;
    const networkIdxStore = localStorage.getItem(LOCAL_STORAGE.NETWORK_IDX);
    const isShibuya =
      currentNetworkIdx.value === endpointKey.SHIBUYA ||
      networkIdxStore === String(endpointKey.SHIBUYA);
    if (!currentAccount.value || isShibuya || !isH160.value) {
      tokens.value = null;
      return;
    }
    console.log('handleCbridgeConfiguration');

    try {
      store.commit('general/setLoading', true);
      const [cbridgeTokens, registeredTokens] = await Promise.all([
        updateBridgeConfig({ userAddress: currentAccount.value }),
        updateRegisteredToken({ userAddress: currentAccount.value }),
      ]);
      tokens.value = cbridgeTokens.concat(registeredTokens as any);
      filterTokens();
    } catch (error) {
      console.error(error);
    } finally {
      store.commit('general/setLoading', false);
    }
  };

  const handleUpdateTokenBalances = async (): Promise<void> => {
    ttlErc20Amount.value = 0;
    if (!currentAccount.value || currentNetworkIdx.value === endpointKey.SHIBUYA || !isH160.value) {
      tokens.value = null;
      return;
    }
    try {
      await updateTokenBalances({ userAddress: currentAccount.value });
    } catch (error) {
      console.error(error);
    } finally {
      isCalculated.value = true;
    }
  };

  const handleImportingCustomToken = async (): Promise<void> => {
    window.addEventListener(LOCAL_STORAGE.EVM_TOKEN_IMPORTS, async () => {
      await handleCbridgeConfiguration();
      await handleUpdateTokenBalances();
    });
  };

  watchEffect(async () => {
    await handleCbridgeConfiguration();
  });

  watchEffect(async () => {
    await handleImportingCustomToken();
  });

  // Memo: Calculate the `ttlErc20Amount` after fetching `tokens` data
  watch(
    [tokens],
    async () => {
      const isInitialErc20Amount =
        tokens.value && tokens.value.length > 0 && !isCalculated.value && !startCalculation.value;
      if (isInitialErc20Amount) {
        // Memo: to avoid calling this function twice
        startCalculation.value = true;
        await handleUpdateTokenBalances();
      }
    },
    { immediate: false }
  );

  const secsUpdateBal = 60 * 1000;
  const tokenBalUpdate = setInterval(async () => {
    if (tokens.value) {
      await handleUpdateTokenBalances();
    }
  }, secsUpdateBal);

  onUnmounted(() => {
    clearInterval(tokenBalUpdate);
  });

  return { tokens, isLoadingErc20Amount, ttlErc20Amount, handleUpdateTokenBalances };
}
