<template>
  <div>
    <connect-button v-if="isNotSelectedEndpoint" @click="showNetworkModal">
      <astar-icon-network />
    </connect-button>
    <template v-else>
      <meta-update-button
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
            <span class="text--network">
              {{ currentNetworkName.replace('Network', '') }}
            </span>
          </template>
        </div>
      </button>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, computed, ref } from 'vue';
import { useStore } from 'src/store';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { useBreakpoints } from 'src/hooks';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import MetaUpdateButton from 'src/components/header/MetaUpdateButton.vue';
import ConnectButton from 'src/components/header/ConnectButton.vue';

export default defineComponent({
  components: {
    MetaUpdateButton,
    ConnectButton,
  },
  emits: ['show-network'],
  setup(props, { emit }) {
    const { width, screenSize } = useBreakpoints();
    const store = useStore();
    const isNotSelectedEndpoint = localStorage.getItem(LOCAL_STORAGE.SELECTED_ENDPOINT) === null;
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
      isNotSelectedEndpoint,
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
  padding: 8px 16px 8px 12px;
  border-radius: 16px;
  margin-left: 8px;
  transition: all 0.3s ease 0s;
  background: transparent;
  color: #fff;
  border: 1px solid $gray-4;

  @media (min-width: $lg) {
    border: 1px solid $navy-3;
  }

  @media (min-width: $sm) {
    margin-left: 16px;
  }

  &:hover {
    background: $astar-blue !important;
    border: 1px solid transparent;
    .iconbase {
      color: $gray-1;
    }
    .divider {
      border-left: 1px solid $gray-1;
    }
    @media (min-width: $lg) {
      background: transparent !important;
      border: 1px solid $gray-4;
      .iconbase {
        color: $gray-5;
      }
      .divider {
        border-left: 1px solid $navy-3;
      }
    }
  }
}

.divider {
  border-left: 1px solid $gray-3;
  margin: 0 8px;
  height: 22px;
  transition: all 0.3s ease 0s;
  @media (min-width: $lg) {
    border-left: 1px solid $navy-3;
  }
}

.iconbase {
  color: $gray-3;
  width: rem(22);
  height: rem(22);
  transition: all 0.3s ease 0s;
  @media (min-width: $lg) {
    color: $navy-3;
  }
}

.icon {
  margin-left: 8px;
  @media (min-width: $sm) {
    margin-right: 8px;
  }
}

.m-btn--network {
  background: transparent;
  border: 1px solid $gray-4;
  box-shadow: none;
  padding: 8px;

  @media (min-width: $lg) {
    border: 1px solid $navy-3;
  }

  .divider {
    margin: 0 8px;
    border-left-color: $gray-4;
    @media (min-width: $lg) {
      border-left-color: $navy-3;
    }
  }
}

.column--network-name {
  margin-top: -1px;
}

.text--network {
  font-weight: 400;
  font-size: 14px;
  color: $gray-1;
  @media (min-width: $lg) {
    color: $navy-1;
  }
}

.body--dark {
  .btn--network {
    border: 1px solid $gray-4;
    &:hover {
      background: $astar-blue !important;
      border: 1px solid transparent;
      .iconbase {
        color: $gray-1;
      }
      .divider {
        border-left: 1px solid $gray-1;
      }
    }
  }

  .iconbase {
    color: $gray-3;
  }

  .m-btn--network {
    border: 1px solid $gray-4;
  }

  .divider {
    border-left: 1px solid $gray-4;
  }

  .text--network {
    color: $gray-1;
  }
}
</style>
