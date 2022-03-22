<template>
  <button
    v-if="isNeedUpdate(extensionCount) && !isComplete"
    type="button"
    :disabled="!isNeedUpdate(extensionCount) || isBusy || isComplete"
    :class="[
      'connect-btn',
      'tw-inline-flex',
      'tw-items-center',
      'tw-px-4',
      'tw-py-1',
      'tw-border',
      'tw-border-transparent',
      'tw-text-sm',
      'tw-font-medium',
      'tw-rounded-full',
      'tw-shadow-sm',
      'tw-text-white',
      'tw-bg-gray-500',
      'hover:tw-bg-gray-500',
      'focus:tw-outline-none',
      'focus:tw-ring',
      'focus:tw-ring-gray-100',
      'dark-ring-dark-gray',
      'tw-mx-1',
    ]"
    @click="updateMetadata"
  >
    <icon-base
      class="tw-w-5 tw-h-5 tw-text-white tw--ml-1 tw-mr-1"
      stroke="currentColor"
      icon-name="network"
    >
      <icon-network />
    </icon-base>
    {{ $t('common.updateMetadata') }}
    <!-- <template v-else>{{ $t('common.metadataAlreadyInstalled') }}</template> -->
  </button>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useStore } from 'src/store';
import IconBase from 'components/icons/IconBase.vue';
import IconNetwork from 'components/icons/IconNetwork.vue';

export default defineComponent({
  components: {
    IconBase,
    IconNetwork,
  },
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
.connect-btn {
  background: #ff5621;
}
.connect-btn:hover {
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #ff5621;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
}
.connect-btn:disabled {
  background: #d3d6dc;
}
</style>
