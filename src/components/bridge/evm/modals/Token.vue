<template>
  <div v-if="token" class="row-token">
    <div
      class="token-button"
      :class="selectedToken.symbol === token.symbol && 'selected'"
      @click="selectToken(token)"
    >
      <div class="token">
        <div>
          <img
            :src="getIcon({ symbol: token.symbol, icon: token.icon })"
            alt="token-icon"
            class="chain-logo"
          />
        </div>
        <div>
          <span>
            {{ token.name }}
          </span>
        </div>
      </div>
      <div class="balance">{{ $n(Number(token.userBalance)) }} {{ token.symbol }}</div>
    </div>
    <div v-if="isH160 && nativeCurrency[srcChainId].name !== token.symbol">
      <button
        class="add-metamask tw-tooltip tw-relative"
        @click="
          addToEvmWallet({
            tokenAddress: selectedAddress,
            symbol: token.symbol,
            decimals: token.decimal,
            image: getIcon({ symbol: token.symbol, icon: token.icon }),
          })
        "
      >
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
import { getIcon } from 'src/c-bridge';
import IconBase from 'src/components/icons/IconBase.vue';
import IconPlus from 'src/components/icons/IconPlus.vue';
import { addToEvmWallet } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { nativeCurrency } from 'src/web3';
import { computed, defineComponent } from 'vue';
export default defineComponent({
  components: {
    IconBase,
    IconPlus,
  },
  props: {
    token: {
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
    srcChainId: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const store = useStore();
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);

    return {
      getIcon,
      isH160,
      addToEvmWallet,
      selectedAddress,
      nativeCurrency,
    };
  },
});
</script>
<style lang="scss" scoped>
@import '../styles/bridge-modal';
</style>
