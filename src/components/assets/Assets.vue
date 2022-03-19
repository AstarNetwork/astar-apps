<template>
  <div class="wrapper--assets">
    <div v-if="!selectedAccountAddress" class="backdrop--transparent" />
    <div class="container--assets">
      <Account :ttl-erc20-amount="ttlErc20Amount" />
      <div v-if="!isLoading && selectedAccountAddress">
        <div v-if="isH160"><EvmAssetsList :tokens="tokens" /></div>
        <div v-else><NativeAssetsList /></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Account from 'src/components/assets/Account.vue';
import NativeAssetsList from 'src/components/assets/NativeAssetsList.vue';
import EvmAssetsList from 'src/components/assets/EvmAssetsList.vue';

import { useStore } from 'src/store';
import { defineComponent, computed } from 'vue';
import { useCbridgeV2 } from 'src/hooks';

export default defineComponent({
  components: {
    Account,
    NativeAssetsList,
    EvmAssetsList,
  },
  setup() {
    const { tokens, isLoading, ttlErc20Amount } = useCbridgeV2();
    const store = useStore();
    const selectedAccountAddress = computed(() => store.getters['general/selectedAddress']);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    return {
      selectedAccountAddress,
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
