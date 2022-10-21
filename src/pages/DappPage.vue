<template>
  <dapp v-if="isReady" class="dapp-top" />
  <div v-else />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { defineComponent, ref, watchEffect } from 'vue';
import Dapp from 'src/components/dapp-staking/dapp/Dapp.vue';

export default defineComponent({
  components: { Dapp },
  setup() {
    useMeta({ title: 'Dapp Staking' });
    const isReady = ref<boolean>(false);

    // Memo: scrollBehavior in createRouter is not working (Vue Router)
    // Memo: this is a quick hack to achieve 'scroll to top' whenever the page is opened from dApp page
    const setIsReady = (): void => {
      setTimeout(() => {
        isReady.value = true;
      }, 0);
    };
    watchEffect(setIsReady);
    return { isReady };
  },
});
</script>
<style lang="scss" scoped>
.dapp-top {
  @media (min-width: $lg) {
    margin-top: 50px;
  }
}
</style>
