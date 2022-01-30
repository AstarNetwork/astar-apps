<template>
  <div class="row-token">
    <div
      class="token-button"
      :class="selectedToken.org_token.token.symbol === tokenInfo.token.symbol && 'selected'"
      @click="selectToken(tokenObj)"
    >
      <div class="token">
        <div>
          <img :src="logo" alt="token-icon" class="chain-logo" />
        </div>
        <div>
          <span>
            {{ tokenInfo.name }}
          </span>
        </div>
      </div>
      <div class="balance">{{ balance }} {{ tokenInfo ? tokenInfo.token.symbol : '' }}</div>
    </div>
    <div v-if="!isNativeToken">
      <button class="add-metamask tw-tooltip tw-relative" @click="addToMetaMask">
        <img width="30" src="~assets/img/metamask.png" />
        <span class="tooltip">{{ $t('bridge.addMetamask') }}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { getTokenBalCbridge, getTokenInfo, PeggedPairConfig } from 'src/c-bridge';
import { useStore } from 'src/store';
import { nativeCurrency } from 'src/web3';
import { computed, defineComponent, ref, watchEffect } from 'vue';

export default defineComponent({
  props: {
    srcChainId: {
      type: Number,
      required: true,
      default: 1,
    },
    tokenObj: {
      type: Object,
      required: true,
    },
    selectedToken: {
      type: Object,
      required: true,
    },
    selectToken: {
      type: Function,
      required: true,
    },
  },
  setup({ srcChainId, tokenObj, selectedToken }) {
    const balance = ref<number>(0);
    const store = useStore();
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const tokenInfo = getTokenInfo({ srcChainId, selectedToken: tokenObj as PeggedPairConfig });

    const logo =
      tokenInfo.token.symbol === 'USDT'
        ? 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
        : tokenInfo.icon;

    const isNativeToken = nativeCurrency[srcChainId].name === tokenInfo.token.symbol;

    const addToMetaMask = () => {
      const provider = typeof window !== 'undefined' && window.ethereum;
      if (!provider || !isH160.value || !selectedAddress.value || isNativeToken || !tokenInfo) {
        return;
      }
      provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenInfo.token.address,
            symbol: tokenInfo.token.symbol,
            decimals: tokenInfo.token.decimal,
            image: logo,
          },
        },
      });
    };

    watchEffect(async () => {
      if (!isH160.value || !srcChainId || !selectedAddress.value || !tokenInfo) return;
      const bal = await getTokenBalCbridge({
        srcChainId,
        selectedToken: tokenObj as PeggedPairConfig,
        address: selectedAddress.value,
      });
      balance.value = Number(Number(bal).toFixed(3));
    });

    return { tokenInfo, logo, isNativeToken, balance, addToMetaMask };
  },
});
</script>
<style lang="scss" scoped>
@import '../styles/bridge-modal';
</style>
