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
      :class="width < screenSize.sm ? 'm-btn--network' : ''"
      @click="showNetworkModal"
    >
      <icon-base class="iconbase tw-w-5 tw-h-5 tw--ml-1" stroke="currentColor" icon-name="network">
        <icon-network />
      </icon-base>
      <img v-show="currentLogo" class="icon" width="16" :src="currentLogo" />
      <template v-if="width >= screenSize.sm">
        {{ currentNetworkName }}
      </template>

      <div class="divider" />
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
    const chainInfo = computed(() => store.getters['general/chainInfo']);
    const metaExtensions = computed(() => store.getters['general/metaExtensions']);
    const extensionCount = computed(() => store.getters['general/extensionCount']);
    const currentNetworkName = ref(providerEndpoints[currentNetworkIdx.value].displayName);
    const currentLogo = ref(providerEndpoints[currentNetworkIdx.value].defaultLogo);
    const isLatestChain = ref(false);
    const version = ref('0.0.0');

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

.btn--network {
  display: flex;
  height: 32px;
  flex-direction: row;
  align-items: center;
  background: #fff;
  padding: 8px 16px 8px 16px;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  margin-left: 8px;
  color: $gray-5;
  @media (min-width: $lg) {
    margin-left: 16px;
  }
}
.btn--network:hover {
  background: #fff;
}
.divider {
  border-left: 1px solid #e6e9ee;
  margin: 0 6px;
  height: 22px;
}
.iconbase {
  color: $gray-4;
}
.icon {
  margin: 0 6px;
}

.m-btn--network {
  border: 1px solid #e6e9ee;
  box-shadow: none;
  padding: 8px;
  .iconbase {
    color: #e6e9ee;
  }
  .divider {
    margin-right: 5px;
    margin-left: -2px;
  }
}

.body--dark {
  .btn--network {
    background: $gray-5;
    color: #fff;
    border: 1px solid $gray-6;
  }
  .btn--network:hover {
    background: #3c4649;
  }
  .divider {
    border-left: 1px solid #191d1f;
  }

  .m-btn--network {
    background: $gray-6;
    color: $gray-3;
    border: 1px solid $gray-5;
    .iconbase {
      color: $gray-4;
    }
    .divider {
      border-left: 1px solid $gray-4;
    }
  }
}
</style>
