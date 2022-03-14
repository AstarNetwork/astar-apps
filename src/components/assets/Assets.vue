<template>
  <div class="wrapper--assets">
    <div v-if="!selectedAccountAddress" class="backdrop--transparent" />
    <div class="container--assets">
      <Account />
    </div>
  </div>
</template>
<script lang="ts">
import Account from 'src/components/assets/Account.vue';
import { useStore } from 'src/store';
import { defineComponent, computed } from 'vue';

export default defineComponent({
  components: {
    Account,
  },
  setup() {
    const store = useStore();
    const selectedAccountAddress = computed(() => store.getters['general/selectedAddress']);
    return {
      selectedAccountAddress,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/assets.scss';
</style>
