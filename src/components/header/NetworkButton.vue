<template>
  <div>
    <MetaUpdateButton
      v-if="isNeedUpdate(isLatestChain, extensionCount)"
      @updated-meta="isLatestChain = true"
    />
    <button
      v-else
      type="button"
      :class="[
        'network-btn',
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
      @click="showNetworkModal"
    >
      <icon-base
        class="tw-w-5 tw-h-5 tw-text-gray-500 tw--ml-1"
        stroke="currentColor"
        icon-name="network"
      >
        <icon-network />
      </icon-base>
      <img class="tw-mx-1" width="16" src="~assets/img/astr-token.png" />
      <template v-if="width >= screenSize.sm">
        {{ currentNetworkName }}
      </template>

      <div class="divider tw-mx-2 tw-h-5" />
      <ConnectionIndicator :connection-type="currentNetworkStatus" :version="version" />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, computed, ref } from 'vue';
import { useStore } from 'src/store';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { useBreakpoints } from 'src/hooks';
import IconBase from 'components/icons/IconBase.vue';
import IconNetwork from 'components/icons/IconNetwork.vue';
import ConnectionIndicator from 'components/header/ConnectionIndicator.vue';
import MetaUpdateButton from 'src/components/header/MetaUpdateButton.vue';

export default defineComponent({
  components: {
    IconBase,
    IconNetwork,
    ConnectionIndicator,
    MetaUpdateButton,
  },
  emits: ['show-network'],
  setup(props, { emit }) {
    const { width, screenSize } = useBreakpoints();
    const store = useStore();
    const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const metaExtensions = computed(() => store.getters['general/metaExtensions']);
    const extensionCount = computed(() => store.getters['general/extensionCount']);
    const currentNetworkName = ref(providerEndpoints[currentNetworkIdx.value].displayName);
    const isLatestChain = ref(false);
    const version = ref('0.0.0');

    watch(currentNetworkIdx, (networkIdx) => {
      version.value = metaExtensions?.value?.extensions[networkIdx].version;
      currentNetworkName.value = providerEndpoints[networkIdx].displayName;
    });

    watch(
      () => metaExtensions.value,
      () => {
        if (metaExtensions?.value?.extensions.length > 0) {
          version.value = metaExtensions?.value?.extensions[0].extension.version;
        }
      }
    );

    const showNetworkModal = () => {
      emit('show-network');
    };

    return {
      currentNetworkStatus,
      currentNetworkName,
      isLatestChain,
      extensionCount,
      version,
      width,
      screenSize,
      showNetworkModal,
    };
  },
  methods: {
    isNeedUpdate(isLatestChain: boolean, extensionCount: number | undefined) {
      return extensionCount && extensionCount > 0 && !isLatestChain;
    },
  },
});
</script>

<style scoped>
.network-btn {
  background: #2c3335;
}
.network-btn:hover {
  /* gray005 selected */
  background: #3c4649;
  /* gray basic */
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
}
.divider {
  border: 1px solid #000;
}
</style>
