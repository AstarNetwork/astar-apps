<template>
  <div>
    <div class="header">
      <nav class="tabs">
        <router-link to="/dashboard" :class="['link', path === 'dashboard' && 'active-link']">
          <div class="column--item column--item--dashboard">
            <span class="text--link">
              {{ $t('dashboard.dashboard') }}
            </span>
          </div>
        </router-link>
        <router-link to="/assets" :class="['link', path === 'assets' && 'active-link']">
          <div class="column--item">
            <span>
              {{ $t('assets.assets') }}
            </span>
          </div>
        </router-link>
        <router-link
          v-if="network.isStoreEnabled"
          to="/dapp-staking"
          :class="['link', path === 'dapp-staking' && 'active-link']"
        >
          <div class="column--item">
            <span class="text--link">
              {{ $t('common.staking') }}
            </span>
          </div>
        </router-link>
        <div class="tabs__indicator" :class="getIndicatorClass(path)" />
      </nav>

      <button type="button" class="button--option" @click="showOption = !showOption">
        <astar-icon-base class="icon--dot" stroke="currentColor" icon-name="option">
          <astar-icon-3dots />
        </astar-icon-base>
      </button>
    </div>

    <div v-if="showOption">
      <SidebarOption />
    </div>
  </div>
</template>

<script lang="ts">
import { endpointKey, providerEndpoints } from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import SidebarOption from './SidebarOption.vue';

export default defineComponent({
  components: {
    SidebarOption,
  },
  setup() {
    const store = useStore();
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const network = ref(providerEndpoints[currentNetworkIdx.value]);
    const showOption = ref(false);
    const router = useRouter();
    const path = computed(() => router.currentRoute.value.path.split('/')[1]);

    const getIndicatorClass = (path: string): string => {
      switch (path) {
        case 'dashboard':
          return 'tabs__dashboard';
        case 'assets':
          return 'tabs__assets';
        case 'dapp-staking':
          return 'tabs__staking';
        default:
          return 'tabs__staking';
      }
    };

    return {
      showOption,
      network,
      getIndicatorClass,
      path,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/sidebar-mobile.scss';
</style>
