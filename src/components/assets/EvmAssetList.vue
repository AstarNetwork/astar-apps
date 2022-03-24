<template>
  <div>
    <div v-if="isShibuya || tokens" class="container">
      <div class="row">
        <span class="text--title">{{ $t('assets.assets') }}</span>
      </div>

      <div v-if="tokenSymbol !== 'SDN'" class="border--separator" />

      <div v-if="tokenSymbol !== 'SDN'" class="rows">
        <div class="row row--details">
          <div class="row__left">
            <div class="column--currency">
              <img class="token-logo" :src="nativeTokenImg" :alt="tokenSymbol" />
              <div class="column--ticker">
                <span class="text--title">{{ tokenSymbol }}</span>
                <span class="text--label">{{
                  tokenSymbol === 'SBY' ? 'Shibuya' : currentNetwork
                }}</span>
              </div>
            </div>
          </div>
          <div class="row__right">
            <div class="column column--balance">
              <div class="column__box">
                <div class="text--accent">
                  <span>{{ $n(bal) }} {{ tokenSymbol }}</span>
                </div>
                <div class="text--label">
                  <span>{{ $n(balUsd) }} {{ $t('usd') }}</span>
                </div>
              </div>
            </div>
            <div class="column--asset-buttons column--buttons--multi">
              <button
                class="btn btn--sm bg--astar color--astar"
                @click="handleModalTransfer({ isOpen: true, currency: tokenSymbol })"
              >
                {{ $t('assets.transfer') }}
              </button>
              <!-- Memo: temporary -->
              <router-link to="/bridge">
                <button class="btn btn--sm bg--astar color--astar">
                  {{ $t('assets.bridge') }}
                </button>
              </router-link>
              <button v-if="isFaucet" class="btn btn--sm bg--astar color--astar">
                {{ $t('assets.faucet') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-for="t in tokens" :key="t.symbol">
        <EvmToken
          :token="t"
          :is-faucet="t.symbol === 'SDN' && isFaucet && currentNetwork === 'Shiden'"
          :handle-modal-transfer="handleModalTransfer"
          :is-erc20="t.symbol !== tokenSymbol"
        />
      </div>
    </div>
    <ModalTransfer
      :is-modal-transfer="isModalTransfer"
      :handle-modal-transfer="handleModalTransfer"
      :symbol="symbol"
      :account-data="null"
      :token="token"
    />
  </div>
</template>
<script lang="ts">
import { ethers } from 'ethers';
import { SelectedToken } from 'src/c-bridge';
import EvmToken from 'src/components/assets/EvmToken.vue';
import { useBalance, usePrice } from 'src/hooks';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType, ref, watchEffect } from 'vue';
import ModalTransfer from './modals/ModalTransfer.vue';
import { getTokenImage } from 'src/token';

export default defineComponent({
  components: {
    EvmToken,
    ModalTransfer,
  },
  props: {
    tokens: {
      type: Object as PropType<SelectedToken[]>,
      required: false,
      default: null,
    },
  },
  setup() {
    const isModalTransfer = ref<boolean>(false);
    const token = ref<SelectedToken | string | null>(null);
    const symbol = ref<string>('');
    const bal = ref<number>(0);
    const balUsd = ref<number>(0);
    const isShibuya = ref<boolean>(false);
    const isFaucet = ref<boolean>(false);
    // Memo: defined by hard-coding to avoid sending too many requests to faucet API server
    const mainnetFaucetAmount = 0.002;

    const store = useStore();
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const { balance } = useBalance(selectedAddress);
    const { nativeTokenUsd } = usePrice();
    const tokenSymbol = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.tokenSymbol : '';
    });
    const currentNetwork = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      return chainInfo ? chainInfo.chain : '';
    });

    const nativeTokenImg = computed(() =>
      getTokenImage({ isNativeToken: true, symbol: tokenSymbol.value })
    );

    const handleModalTransfer = ({
      currency,
      isOpen,
    }: {
      isOpen: boolean;
      currency: SelectedToken | string;
    }) => {
      token.value = currency;
      isModalTransfer.value = isOpen;
      if (!isOpen) {
        symbol.value = '';
        return;
      } else if (currency === tokenSymbol.value) {
        symbol.value = tokenSymbol.value;
      } else {
        const c = currency as SelectedToken;
        symbol.value = c.symbol;
      }
    };

    watchEffect(async () => {
      const tokenSymbolRef = tokenSymbol.value;
      if (!balance.value || !tokenSymbolRef) return;
      try {
        isShibuya.value = tokenSymbolRef === 'SBY';
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
      tokenSymbol,
      balUsd,
      currentNetwork,
      isShibuya,
      mainnetFaucetAmount,
      isFaucet,
      isModalTransfer,
      symbol,
      token,
      nativeTokenImg,
      handleModalTransfer,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
