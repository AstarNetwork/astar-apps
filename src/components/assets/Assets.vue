<template>
  <div v-if="selectedAddress && isDisplay" class="wrapper--assets">
    <div class="container--assets">
      <Account :ttl-erc20-amount="ttlErc20Amount" />
      <div v-if="selectedAddress">
        <div v-if="isH160">
          <EvmAssetList :tokens="tokens" />
        </div>
        <div v-else><NativeAssetList /></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Account from 'src/components/assets/Account.vue';
import NativeAssetList from 'src/components/assets/NativeAssetList.vue';
import EvmAssetList from 'src/components/assets/EvmAssetList.vue';

import { useStore } from 'src/store';
import { defineComponent, computed, ref, watchEffect } from 'vue';
import { useCbridgeV2 } from 'src/hooks';
import { LOCAL_STORAGE } from 'src/config/localStorage';

export default defineComponent({
  components: {
    Account,
    NativeAssetList,
    EvmAssetList,
  },
  setup() {
    const { tokens, ttlErc20Amount } = useCbridgeV2();
    const isDisplay = ref<boolean>(false);
    const store = useStore();
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);

    const setIsDisplay = (): void => {
      const address = localStorage.getItem(LOCAL_STORAGE.SELECTED_ADDRESS);
      const isEthereumExtension = address === 'Ethereum Extension';
      if (!isDisplay.value && isEthereumExtension) {
        setTimeout(() => {
          isDisplay.value = true;
        }, 1000);
      } else {
        isDisplay.value = true;
      }
    };

    watchEffect(() => {
      setIsDisplay();
    });

    return {
      selectedAddress,
      isH160,
      tokens,
      ttlErc20Amount,
      isDisplay,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
</style>
