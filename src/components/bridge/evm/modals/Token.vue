<template>
  <div class="row-token">
    <div
      class="token-button"
      :class="selectedToken.symbol === tokenInfo.symbol && 'selected'"
      @click="selectToken(tokenObj)"
    >
      <div class="token">
        <div>
          <img
            v-if="tokenInfo"
            :src="getIcon({ symbol: tokenInfo.symbol, icon: tokenInfo.icon })"
            alt="token-icon"
            class="chain-logo"
          />
        </div>
        <div>
          <span>
            {{ tokenInfo.name }}
          </span>
        </div>
      </div>
      <div class="balance">{{ $n(balance) }} {{ tokenInfo ? tokenInfo.symbol : '' }}</div>
    </div>
    <div v-if="!isNativeToken && isH160">
      <button class="add-metamask tw-tooltip tw-relative" @click="addToWallet">
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
import {
  CbridgeToken,
  EvmChain,
  getIcon,
  getSelectedToken,
  getTokenBalCbridge,
} from 'src/c-bridge';
import IconBase from 'src/components/icons/IconBase.vue';
import IconPlus from 'src/components/icons/IconPlus.vue';
import { addToEvmWallet } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { nativeCurrency } from 'src/web3';
import { computed, defineComponent, ref, watchEffect } from 'vue';

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

    const isNativeToken = nativeCurrency[srcChainId].name === tokenInfo?.symbol;

    const addToWallet = () => {
      if (!isH160.value || !selectedAddress.value || isNativeToken || !tokenInfo) {
        return;
      }

      addToEvmWallet({
        tokenAddress: tokenInfo.address,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimal,
        image: getIcon({ symbol: tokenInfo.symbol, icon: tokenInfo.icon }),
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

    return { tokenInfo, isNativeToken, balance, addToWallet, getIcon, isH160 };
  },
});
</script>
<style lang="scss" scoped>
@import '../styles/bridge-modal';
</style>
