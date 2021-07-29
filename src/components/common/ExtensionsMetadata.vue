<template>
  <button
    :disabled="!isNeedUpdate(extensionCount) || isBusy || isComplete"
    type="button"
    @click="updateMetadata"
    class="tw-inline-flex tw-items-center tw-w-full tw-justify-center tw-px-6 tw-py-1 tw-border tw-border-transparent tw-text-xs tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 hover:tw-bg-blue-700 dark:hover:tw-bg-blue-400 focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-100 dark:focus:tw-ring-blue-400 tw-my-1"
  >
    <template v-if="isNeedUpdate(extensionCount) && !isComplete"
      >Update Metadata</template
    >
    <template v-else>Metadata Already Installed</template>
  </button>
</template>
<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useStore } from 'src/store';
import { useMetaExtensions } from 'src/hooks/useMetaExtensions';
import { useChainInfo } from 'src/hooks/useChainInfo';

export default defineComponent({
  setup() {
    const store = useStore();
    const apiRef = computed(() => store.getters['general/api']);
    const extensionsRef = computed(() => store.getters['general/extensions']);

    const { chainInfo } = useChainInfo(apiRef);

    const { metaExtensions, extensionCount } = useMetaExtensions(
      apiRef,
      extensionsRef
    );

    const selectedIndex = 0;
    const isBusy = ref(false);
    const isComplete = ref(false);
    const updateMetadata = () => {
      const extensions = metaExtensions?.value?.extensions;

      if (chainInfo.value && extensions?.[selectedIndex]) {
        isBusy.value = true;

        extensions[selectedIndex]
          .update(JSON.parse(JSON.stringify(chainInfo.value)))
          .then(() => {
            console.log('updated');
            isBusy.value = false;
            isComplete.value = true;
          })
          .catch(console.error);
      }
    };

    return {
      extensionCount,
      updateMetadata,
      isBusy,
      isComplete,
    };
  },
  methods: {
    isNeedUpdate(extensionCount: number | undefined) {
      return extensionCount && extensionCount > 0;
    },
  },
});
</script>
<style scoped>
button:disabled {
  @apply tw-bg-blue-300 hover:tw-bg-blue-300 dark:hover:tw-bg-blue-300;
}
</style>
