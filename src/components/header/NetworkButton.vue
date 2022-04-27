<template>
  <div>
    <MetaUpdateButton
      v-if="isNeedUpdate(isLatestChain, extensionCount)"
      @updated-meta="isLatestChain = true"
    />
    <button
      v-else
      type="button"
      class="btn--network"
      :class="screenSize.sm > width && 'm-btn--network'"
      @click="showNetworkModal"
    >
      <astar-icon-base class="iconbase" stroke="currentColor" icon-name="network">
        <astar-icon-network />
      </astar-icon-base>
      <img v-show="currentLogo" class="icon" width="16" :src="currentLogo" />
      <div class="column--network-name">
        <template v-if="width >= screenSize.md">
          <span class="text--md">
            {{ currentNetworkName }}
          </span>
        </template>
        <template v-else-if="width >= screenSize.sm">
          <span class="text--md">
            {{ currentNetworkName.replace('Network', '') }}
          </span>
        </template>
      </div>

      <div class="divider" />
      <astar-connection-indicator :connection-type="currentNetworkStatus" :version="version" />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, computed, ref } from 'vue';
import { useStore } from 'src/store';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { useBreakpoints } from 'src/hooks';
import MetaUpdateButton from 'src/components/header/MetaUpdateButton.vue';

export default defineComponent({
  components: {
    MetaUpdateButton,
  },
  emits: ['show-network'],
  setup(props, { emit }) {
    const { width, screenSize } = useBreakpoints();
    const store = useStore();
    const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const chainInfo = computed(() => store.getters['general/chainInfo']);
    const metaExtensions = computed(() => store.getters['general/metaExtensions']);
    const extensionCount = computed(() => store.getters['general/extensionCount']);
    const currentNetworkName = ref<string>(providerEndpoints[currentNetworkIdx.value].displayName);
    const currentLogo = ref<string>(providerEndpoints[currentNetworkIdx.value].defaultLogo);
    const isLatestChain = ref<boolean>(false);
    const version = ref<string>('0.0.0');

    watch(currentNetworkIdx, (networkIdx) => {
      currentNetworkName.value = providerEndpoints[networkIdx].displayName;
      currentLogo.value = providerEndpoints[networkIdx].defaultLogo;
    });

    watch(
      () => chainInfo.value,
      () => {
        version.value = `0.0.${chainInfo.value?.specVersion}`;
      }
    );

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
      currentLogo,
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

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.btn--network {
  display: flex;
  height: 32px;
  flex-direction: row;
  align-items: center;
  background: #fff;
  padding: 8px 16px 8px 12px;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  margin-left: 8px;
  color: $gray-5;
  @media (min-width: $sm) {
    margin-left: 16px;
  }
}

.btn--network:hover {
  background: #fff;
}

.divider {
  border-left: 1px solid $border-separator-light;
  margin: 0 8px;
  height: 22px;
}

.iconbase {
  color: $gray-3 !important;
  width: rem(22);
  height: rem(22);
  @media (min-width: $sm) {
    color: #e6e9ee !important;
  }
}

.icon {
  margin-left: 8px;
  @media (min-width: $sm) {
    margin-right: 8px;
  }
}

.m-btn--network {
  border: 1px solid $object-light;
  box-shadow: none;
  padding: 8px;
  .iconbase {
    color: $object-light;
  }
  .divider {
    margin: 0 8px;
  }
}

.column--network-name {
  margin-top: -1px;
}

.body--dark {
  .btn--network {
    background: $gray-5;
    color: #fff;
    border: 1px solid $gray-6;
  }
  .btn--network:hover {
    background: $gray-5-selected;
  }
  .divider {
    border-left: 1px solid $gray-6;
  }

  .m-btn--network {
    background: $gray-6;
    color: $gray-3;
    border: 1px solid $gray-5;
  }
  .divider {
    border-left: 1px solid $gray-4;
  }
  .iconbase {
    color: $astar-blue-dark !important;
    @media (min-width: $md) {
      color: $gray-4 !important;
    }
  }
}
</style>
