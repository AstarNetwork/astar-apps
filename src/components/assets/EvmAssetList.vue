<template>
  <div v-if="isListReady" class="container--assets">
    <div class="container">
      <div class="row">
        <div>
          <span class="text--title">{{ $t('assets.xcmAssets') }}</span>
        </div>
        <div />
      </div>

      <div v-for="t in filteredTokens" :key="t.symbol">
        <Erc20Currency
          v-if="!checkIsCbridgeToken(t) && t.isXC20"
          :token="t"
          :handle-modal-transfer="handleModalTransfer"
          :is-xcm="true"
          :handle-modal-xcm-bridge="handleModalXcmBridge"
        />
      </div>
    </div>

    <div class="container">
      <div class="row">
        <div>
          <span class="text--title">{{ $t('assets.assets') }}</span>
        </div>

        <div class="row--search-option">
          <div :class="isSearch && 'search--active'">
            <div class="box--search">
              <table class="table--search">
                <tr class="tr--search">
                  <td>
                    <input
                      v-model="search"
                      type="text"
                      placeholder="Search"
                      class="input--search"
                      @focus="setIsSearch(true)"
                      @blur="setIsSearch(false)"
                    />
                  </td>
                  <td>
                    <div class="icon--search">
                      <astar-icon-search />
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </div>
          <EvmAssetOptions
            :toggle-is-hide-small-balances="toggleIsHideSmallBalances"
            :is-hide-small-balances="isHideSmallBalances"
            :tokens="tokens"
          />
        </div>
      </div>

      <div class="border--separator" />

      <div v-if="isDisplayNativeToken" class="rows">
        <div class="row row--details">
          <div class="row__left">
            <div class="column--currency">
              <img class="token-logo" :src="nativeTokenImg" :alt="nativeTokenSymbol" />
              <div v-if="nativeTokenSymbol && currentNetworkName" class="column--ticker">
                <span class="text--title">{{ nativeTokenSymbol }}</span>
                <span class="text--label">{{ currentNetworkName }}</span>
              </div>
              <div v-else>
                <q-skeleton animation="fade" class="skeleton--md" />
              </div>
            </div>
          </div>
          <div class="row__right row__right--evm">
            <div class="column column--balance">
              <div class="column__box">
                <div class="text--accent">
                  <span>{{ $n(truncate(bal)) }} {{ nativeTokenSymbol }}</span>
                </div>
                <div class="text--label">
                  <span>{{ $n(balUsd) }} {{ $t('usd') }}</span>
                </div>
              </div>
            </div>
            <div class="column--asset-buttons column--buttons--native-token">
              <button
                class="btn btn--sm"
                @click="handleModalTransfer({ isOpen: true, currency: nativeTokenSymbol })"
              >
                {{ $t('assets.transfer') }}
              </button>
              <!-- Only SDN is able to bridge via cBridge at this moment -->
              <a
                v-if="nativeTokenSymbol === 'SDN'"
                :href="cbridgeAppLink"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button class="btn btn--sm">
                  {{ $t('assets.bridge') }}
                </button>
              </a>

              <button
                v-if="isFaucet"
                class="btn btn--sm"
                @click="handleModalFaucet({ isOpen: true })"
              >
                {{ $t('assets.faucet') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-for="t in filteredTokens" :key="t.symbol">
        <div v-if="checkIsCbridgeToken(t)">
          <EvmCbridgeToken
            v-if="t.symbol !== nativeTokenSymbol"
            :token="t"
            :handle-modal-transfer="handleModalTransfer"
          />
        </div>
        <div v-else>
          <Erc20Currency v-if="!t.isXC20" :token="t" :handle-modal-transfer="handleModalTransfer" />
        </div>
      </div>
      <div v-if="!filteredTokens && !isDisplayNativeToken" class="box--no-result">
        <span class="text--xl">{{ $t('assets.noResults') }}</span>
      </div>
    </div>

    <Teleport to="#app--main">
      <ModalTransfer
        :is-modal-transfer="isModalTransfer"
        :handle-modal-transfer="handleModalTransfer"
        :symbol="symbol"
        :account-data="null"
        :token="token"
        :handle-update-token-balances="handleUpdateTokenBalances"
      />
      <ModalFaucet :is-modal-faucet="isModalFaucet" :handle-modal-faucet="handleModalFaucet" />
      <ModalXcmBridge
        :is-modal-xcm-bridge="isModalXcmBridge"
        :handle-modal-xcm-bridge="handleModalXcmBridge"
        :account-data="accountData"
        :token="xcmToken"
        :handle-update-xcm-token-balances="handleUpdateXcmTokenBalances"
      />
    </Teleport>
  </div>
</template>
<script lang="ts">
import { ethers } from 'ethers';
import { $web3 } from 'src/boot/api';
import { checkIsCbridgeToken, SelectedToken } from 'src/c-bridge';
import Erc20Currency from 'src/components/assets/Erc20Currency.vue';
import EvmAssetOptions from 'src/components/assets/EvmAssetOptions.vue';
import EvmCbridgeToken from 'src/components/assets/EvmCbridgeToken.vue';
import { getBalance } from 'src/config/web3';
import { ChainAsset, useAccount, useBalance, useNetworkInfo, usePrice } from 'src/hooks';
import { Erc20Token, getTokenImage } from 'src/modules/token';
import { cbridgeAppLink } from 'src/c-bridge';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType, ref, watchEffect } from 'vue';
import ModalFaucet from './modals/ModalFaucet.vue';
import ModalTransfer from './modals/ModalTransfer.vue';
import { truncate } from 'src/hooks/helper/common';
import ModalXcmBridge from './modals/ModalXcmBridge.vue';

export default defineComponent({
  components: {
    EvmCbridgeToken,
    ModalTransfer,
    ModalFaucet,
    Erc20Currency,
    ModalXcmBridge,
    EvmAssetOptions,
  },
  props: {
    tokens: {
      type: Object as PropType<SelectedToken[]>,
      required: false,
      default: null,
    },
    handleUpdateTokenBalances: {
      type: Function,
      required: true,
    },
    handleUpdateXcmTokenBalances: {
      type: Function,
      required: true,
    },
    xcmAssets: {
      type: Array as PropType<ChainAsset[]>,
      required: true,
    },
  },
  setup(props) {
    const isModalTransfer = ref<boolean>(false);
    const isModalFaucet = ref<boolean>(false);
    const isModalXcmBridge = ref<boolean>(false);
    const xcmToken = ref<ChainAsset | null>(null);
    const isHideSmallBalances = ref<boolean>(false);
    const token = ref<SelectedToken | Erc20Token | string | null>(null);
    const symbol = ref<string>('');
    const bal = ref<number>(0);
    const balUsd = ref<number>(0);
    const isShibuya = ref<boolean>(false);
    const isFaucet = ref<boolean>(false);
    const isSearch = ref<boolean>(false);
    const search = ref<string>('');
    // Memo: defined by hard-coding to avoid sending too many requests to faucet API server
    const mainnetFaucetAmount = 0.002;

    const { currentAccount } = useAccount();
    const { nativeTokenUsd } = usePrice();
    const { accountData } = useBalance(currentAccount);

    const store = useStore();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);

    const { currentNetworkName, nativeTokenSymbol } = useNetworkInfo();

    const nativeTokenImg = computed<string>(() =>
      getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
    );
    const isListReady = computed<boolean>(() => !!(isShibuya.value || props.tokens));

    const isDisplayNativeToken = computed<boolean>(() => {
      return (
        !search.value || nativeTokenSymbol.value.toLowerCase().includes(search.value.toLowerCase())
      );
    });

    const filteredTokens = computed<SelectedToken[] | null>(() => {
      if (!search.value) return props.tokens;
      if (!props.tokens) return null;
      const tokens = isHideSmallBalances.value
        ? props.tokens.filter((it) => Number(it.userBalance) > 0)
        : props.tokens;

      if (!search.value) return tokens;

      const value = search.value.toLowerCase();
      const result = tokens
        .map((token: SelectedToken) => {
          const isFoundToken =
            value === token.address.toLowerCase() ||
            token.symbol.toLowerCase().includes(value) ||
            token.name.toLowerCase().includes(value);
          return isFoundToken ? token : undefined;
        })
        .filter((it) => it !== undefined) as SelectedToken[];
      return result.length > 0 ? result : null;
    });

    const handleModalXcmBridge = ({
      isOpen,
      currency,
    }: {
      isOpen: boolean;
      currency: Erc20Token | null;
    }): void => {
      isModalXcmBridge.value = isOpen;
      if (currency === null) {
        xcmToken.value = currency;
      } else {
        const t = props.xcmAssets.find((it) => String(it.metadata.symbol) === currency.symbol);
        if (t) {
          xcmToken.value = t;
        }
      }
    };
    const toggleIsHideSmallBalances = (): void => {
      isHideSmallBalances.value = !isHideSmallBalances.value;
    };

    const handleModalTransfer = ({
      currency,
      isOpen,
    }: {
      isOpen: boolean;
      currency: SelectedToken | Erc20Token | string;
    }): void => {
      token.value = currency;
      isModalTransfer.value = isOpen;
      if (!isOpen) {
        symbol.value = '';
      } else if (currency === nativeTokenSymbol.value) {
        symbol.value = nativeTokenSymbol.value;
      } else {
        const c = currency as SelectedToken | Erc20Token;
        symbol.value = c.symbol;
      }
    };

    const handleModalFaucet = ({ isOpen }: { isOpen: boolean }): void => {
      isModalFaucet.value = isOpen;
    };

    const setIsSearch = (isTyping: boolean): void => {
      isSearch.value = isTyping;
    };

    const updateStates = async (): Promise<void> => {
      if (isLoading.value || !nativeTokenSymbol.value || !isH160.value) return;
      try {
        const balWei = await getBalance($web3.value!, currentAccount.value);
        bal.value = Number(ethers.utils.formatEther(balWei));
        isShibuya.value = nativeTokenSymbol.value === 'SBY';
        isFaucet.value = isShibuya.value || mainnetFaucetAmount > bal.value;
        if (nativeTokenUsd.value) {
          balUsd.value = nativeTokenUsd.value * bal.value;
        }
      } catch (error: any) {
        console.error(error.message);
      }
    };

    watchEffect(async () => {
      await updateStates();
    });

    return {
      bal,
      nativeTokenSymbol,
      balUsd,
      currentNetworkName,
      mainnetFaucetAmount,
      isFaucet,
      isModalTransfer,
      symbol,
      token,
      nativeTokenImg,
      isListReady,
      isModalFaucet,
      isSearch,
      search,
      filteredTokens,
      isDisplayNativeToken,
      isModalXcmBridge,
      accountData,
      xcmToken,
      handleModalXcmBridge,
      cbridgeAppLink,
      isHideSmallBalances,
      setIsSearch,
      handleModalTransfer,
      handleModalFaucet,
      checkIsCbridgeToken,
      truncate,
      toggleIsHideSmallBalances,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
