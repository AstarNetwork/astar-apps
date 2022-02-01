<template>
  <div class="row-token">
    <div
      class="token-button"
      :class="selectedToken.symbol === tokenInfo.symbol && 'selected'"
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
      <div class="balance">{{ balance }} {{ tokenInfo ? tokenInfo.symbol : '' }}</div>
    </div>
    <div v-if="!isNativeToken">
      <button class="add-metamask tw-tooltip tw-relative" @click="addToMetaMask">
        <icon-base
          icon-name="plus"
          class="tw-w-5 tw-h-5 tw-text-gray-500 dark:tw-text-darkGray-300"
          stroke="currentColor"
        >
          <icon-plus />
        </icon-base>
        <span class="tooltip">{{ $t('bridge.addWallet') }}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { CbridgeToken, EvmChain, getSelectedToken, getTokenBalCbridge } from 'src/c-bridge';
import { useStore } from 'src/store';
import { nativeCurrency } from 'src/web3';
import { computed, defineComponent, ref, watchEffect } from 'vue';
import IconPlus from '../../icons/IconPlus.vue';
import IconBase from '../../icons/IconBase.vue';
import { getEvmProvider } from 'src/hooks/helper/wallet';

export default defineComponent({
  components: {
    IconBase,
    IconPlus,
  },
  props: {
    srcChainId: {
      type: Number,
      required: true,
      default: EvmChain.Ethereum,
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
  setup({ srcChainId, tokenObj }) {
    const balance = ref<number>(0);
    const store = useStore();
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);

    const tokenInfo = getSelectedToken({
      srcChainId,
      token: tokenObj as CbridgeToken,
    });

    const logo =
      tokenInfo?.symbol === 'USDT'
        ? 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png'
        : tokenInfo?.icon;

    const isNativeToken = nativeCurrency[srcChainId].name === tokenInfo?.symbol;

    const addToMetaMask = () => {
      const provider = getEvmProvider();
      if (!provider || !isH160.value || !selectedAddress.value || isNativeToken || !tokenInfo) {
        return;
      }
      provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenInfo.address,
            symbol: tokenInfo.symbol,
            decimals: tokenInfo.decimal,
            image: logo,
          },
        },
      });
    };

    watchEffect(async () => {
      if (!isH160.value || !srcChainId || !selectedAddress.value || !tokenInfo) return;
      const bal = await getTokenBalCbridge({
        srcChainId,
        cbridgeToken: tokenObj as CbridgeToken,
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
