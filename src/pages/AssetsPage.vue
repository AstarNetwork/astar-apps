<template>
  <div v-if="currentAccount && isReady">
    <!-- Fixme: scroll to top when the app was routed from other page -->
    <router-view id="assets-top" :style="`background-image: ${bg}`" />
  </div>
  <div v-else />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useAccount, useNetworkInfo, usePageReady } from 'src/hooks';
import { useStore } from 'src/store';
import { XcmAssets } from 'src/store/assets/state';
import { computed, defineComponent, watch } from 'vue';
import { generateMeta } from 'src/config/metadata';
import { Path } from 'src/router';

// <div v-else /> Memo: To avoid not rendering anything when users go to other pages
// Leaving comments on the `template` caused an unknown bug

export default defineComponent({
  setup() {
    useMeta(generateMeta(Path.Assets));
    const store = useStore();
    const { isReady } = usePageReady();
    const { isMainnet } = useNetworkInfo();
    const { currentAccount } = useAccount();
    const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);

    const handleLoadingAssets = async (): Promise<void> => {
      const account = localStorage.getItem(LOCAL_STORAGE.SELECTED_ADDRESS);
      if (!isMainnet.value || !account) {
        store.commit('general/setLoading', false);
        return;
      }
      if (xcmAssets.value.assets.length === 0) {
        store.commit('general/setLoading', true);
      } else {
        store.commit('general/setLoading', false);
      }
    };
    watch([xcmAssets], handleLoadingAssets, { immediate: true });
    return { currentAccount, isReady };
  },
  // mounted() {
  // Memo: scrollBehavior in createRouter is not working
  // Memo: scrollTo doesn't work with fixed header
  // scrollTo('assets-top');
  // },
});
</script>
<style lang="scss" scoped>
#assets-top {
  padding: 0 16px;
  position: relative;
  padding-bottom: 36px;
  @media (min-width: $sm) {
    padding-top: 16px;
  }
  @media (min-width: $lg) {
    padding-left: 40px;
    padding-right: 40px;
    padding-top: 36px;
  }
}
</style>
