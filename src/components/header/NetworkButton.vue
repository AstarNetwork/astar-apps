<template>
  <div>
    <div v-if="isNotSelectedEndpoint">
      <connect-button data-testid="btn-network" @click="showNetworkModal">
        <astar-icon-network />
      </connect-button>
      <q-tooltip>
        <span class="text--tooltip">{{ $t('assets.transferPage.selectChain') }}</span>
      </q-tooltip>
    </div>
    <template v-else>
      <meta-update-button
        v-if="isNeedUpdate(isLatestChain, extensionCount)"
        @updated-meta="isLatestChain = true"
      />
      <button v-else type="button" class="btn--network" @click="showNetworkModal">
        <img v-show="currentLogo" class="icon" width="24" :src="currentLogo" />
        <div class="column--network-name">
          <template v-if="width >= screenSize.sm">
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
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const extensionCount = computed(() => store.getters['general/extensionCount']);
    const currentNetworkName = ref<string>(providerEndpoints[currentNetworkIdx.value].displayName);
    const currentLogo = ref<string>(providerEndpoints[currentNetworkIdx.value].defaultLogo);
    const isLatestChain = ref<boolean>(false);

    watch(currentNetworkIdx, (networkIdx) => {
      currentNetworkName.value = providerEndpoints[networkIdx].displayName;
      currentLogo.value = providerEndpoints[networkIdx].defaultLogo;
    });

    const showNetworkModal = () => {
      emit('show-network');
    };

    return {
      isNotSelectedEndpoint,
      currentNetworkName,
      currentLogo,
      isLatestChain,
      extensionCount,
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
  align-items: center;
  height: 32px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  border-radius: 20px;
  transition: all 0.2s ease;
  border: solid 1px transparent;
  img {
    width: 32px;
    height: 32px;
  }
  &:hover {
    border-color: $astar-blue;
    background-color: $astar-blue;
  }
  @media (min-width: $sm) {
    height: 40px;
    padding: 0 16px 0 12px;
    gap: 8px;
    img {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
