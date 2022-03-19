<template>
  <div class="wrapper--assets">
    <div v-if="!selectedAddress" class="backdrop--transparent" />
    <div class="container--assets">
      <Account :ttl-erc20-amount="ttlErc20Amount" />
      <div v-if="!isLoading && selectedAddress">
        <div v-if="isH160"><EvmAssetList :tokens="tokens" /></div>
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
import { defineComponent, computed } from 'vue';
import { useCbridgeV2 } from 'src/hooks';

export default defineComponent({
  components: {
    Account,
    NativeAssetList,
    EvmAssetList,
  },
  setup() {
    const { tokens, isLoading, ttlErc20Amount } = useCbridgeV2();
    const store = useStore();
    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    return {
      selectedAddress,
      isH160,
      tokens,
      isLoading,
      ttlErc20Amount,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
</style>
