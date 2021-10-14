<template>
  <button
    :disabled="!isNeedUpdate(extensionCount) || isBusy || isComplete"
    type="button"
    class="update-metadata"
    @click="updateMetadata"
  >
    <template v-if="isNeedUpdate(extensionCount) && !isComplete">
      {{ $t('common.updateMetadata') }}</template
    >
    <template v-else> {{ $t('common.metadataAlreadyInstalled') }}</template>
  </button>
</template>
<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useStore } from 'src/store';

export default defineComponent({
  setup() {
    const store = useStore();

    const chainInfo = computed(() => store.getters['general/chainInfo']);
    const metaExtensions = computed(() => store.getters['general/metaExtensions']);
    const extensionCount = computed(() => store.getters['general/extensionCount']);

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
  @apply tw-bg-blue-300 hover:tw-bg-blue-300;
}
</style>

<style scoped>
.update-metadata {
  @apply tw-inline-flex tw-items-center tw-w-full tw-justify-center tw-px-6 tw-py-1 tw-border tw-border-transparent tw-text-xs tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 tw-my-1;
}
.update-metadata:hover {
  @apply tw-bg-blue-700 dark:tw-bg-blue-400;
}
.update-metadata:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-400;
}
</style>
