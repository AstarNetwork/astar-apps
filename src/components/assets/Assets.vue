<template>
  <div class="wrapper--assets">
    <div v-if="!selectedAccountAddress" class="backdrop--transparent" />
    <div class="container--assets">
      <Account />
      <div v-if="isH160">H160</div>
      <div v-else><NativeAssets /></div>
    </div>
  </div>
</template>
<script lang="ts">
import Account from 'src/components/assets/Account.vue';
import NativeAssets from 'src/components/assets/NativeAssets.vue';

import { useStore } from 'src/store';
import { defineComponent, computed } from 'vue';

export default defineComponent({
  components: {
    Account,
    NativeAssets,
  },
  setup() {
    const store = useStore();
    const selectedAccountAddress = computed(() => store.getters['general/selectedAddress']);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    return {
      selectedAccountAddress,
      isH160,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
</style>
