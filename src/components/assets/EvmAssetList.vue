<template>
  <div>
    <div v-if="isListReady" class="container container--evm-assets-list">
      <div class="row">
        <div>
          <span class="text--title">{{ $t('assets.assets') }}</span>
        </div>

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
                    <IconSearch />
                  </div>
                </td>
              </tr>
            </table>
          </div>
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
          <div class="row__right">
            <div class="column column--balance">
              <div class="column__box">
                <div class="text--accent">
                  <span>{{ $n(bal) }} {{ nativeTokenSymbol }}</span>
                </div>
                <div class="text--label">
                  <span>{{ $n(balUsd) }} {{ $t('usd') }}</span>
                </div>
              </div>
            </div>
            <div class="column--asset-buttons column--buttons--multi">
              <button
                class="btn btn--sm"
                @click="handleModalTransfer({ isOpen: true, currency: nativeTokenSymbol })"
              >
                {{ $t('assets.transfer') }}
              </button>
              <!-- Only SDN is able to bridge via cBridge at this moment -->
              <router-link v-if="nativeTokenSymbol === 'SDN'" to="/bridge">
                <button class="btn btn--sm">
                  {{ $t('assets.bridge') }}
                </button>
              </router-link>
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
          <Erc20Currency :token="t" :handle-modal-transfer="handleModalTransfer" />
        </div>
      </div>
      <div v-if="!filteredTokens && !isDisplayNativeToken" class="box--no-result">
        <span class="text--xl">{{ $t('assets.noResults') }}</span>
      </div>
    </div>

    <ModalTransfer
      :is-modal-transfer="isModalTransfer"
      :handle-modal-transfer="handleModalTransfer"
      :symbol="symbol"
      :account-data="null"
      :token="token"
    />
    <ModalFaucet :is-modal-faucet="isModalFaucet" :handle-modal-faucet="handleModalFaucet" />
  </div>
</template>
<script lang="ts">
import { ethers } from 'ethers';
import { checkIsCbridgeToken, SelectedToken } from 'src/c-bridge';
import Erc20Currency from 'src/components/assets/Erc20Currency.vue';
import EvmCbridgeToken from 'src/components/assets/EvmCbridgeToken.vue';
import IconSearch from 'src/components/icons/IconSearch.vue';
import { useBalance, usePrice } from 'src/hooks';
import { Erc20Token, getTokenImage } from 'src/modules/token';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType, ref, watchEffect } from 'vue';
import ModalFaucet from './modals/ModalFaucet.vue';
import ModalTransfer from './modals/ModalTransfer.vue';

export default defineComponent({
  components: {
    EvmCbridgeToken,
    ModalTransfer,
    ModalFaucet,
    IconSearch,
    Erc20Currency,
  },
  props: {
    tokens: {
      type: Object as PropType<SelectedToken[]>,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const isModalTransfer = ref<boolean>(false);
    const isModalFaucet = ref<boolean>(false);
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

    const store = useStore();
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const { balance } = useBalance(selectedAddress);
    const { nativeTokenUsd } = usePrice();

    const nativeTokenSymbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : '';
    });

    const currentNetworkName = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      return chain === 'Shibuya Testnet' ? 'Shibuya' : chain;
    });

    const nativeTokenImg = computed(() =>
      getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
    );
    const isListReady = computed(() => isShibuya.value || props.tokens);

    const isDisplayNativeToken = computed(() => {
      return (
        !search.value || nativeTokenSymbol.value.toLowerCase().includes(search.value.toLowerCase())
      );
    });

    const filteredTokens = computed(() => {
      if (!search.value) return props.tokens;
      if (!props.tokens) return null;

      const value = search.value.toLowerCase();
      const result = props.tokens
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

    const handleModalTransfer = ({
      currency,
      isOpen,
    }: {
      isOpen: boolean;
      currency: SelectedToken | Erc20Token | string;
    }) => {
      token.value = currency;
      isModalTransfer.value = isOpen;
      if (!isOpen) {
        symbol.value = '';
        return;
      } else if (currency === nativeTokenSymbol.value) {
        symbol.value = nativeTokenSymbol.value;
      } else {
        const c = currency as SelectedToken | Erc20Token;
        symbol.value = c.symbol;
      }
    };

    const handleModalFaucet = ({ isOpen }: { isOpen: boolean }) => {
      isModalFaucet.value = isOpen;
    };

    const setIsSearch = (isTyping: boolean): void => {
      isSearch.value = isTyping;
    };

    watchEffect(async () => {
      const nativeTokenSymbolRef = nativeTokenSymbol.value;
      if (!balance.value || !nativeTokenSymbolRef) return;
      try {
        isShibuya.value = nativeTokenSymbolRef === 'SBY';
        bal.value = Number(ethers.utils.formatEther(balance.value.toString()));
        isFaucet.value = isShibuya.value || mainnetFaucetAmount > bal.value;
        if (nativeTokenUsd.value) {
          balUsd.value = nativeTokenUsd.value * bal.value;
        }
      } catch (error: any) {
        console.error(error.message);
      }
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
      setIsSearch,
      handleModalTransfer,
      handleModalFaucet,
      checkIsCbridgeToken,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
