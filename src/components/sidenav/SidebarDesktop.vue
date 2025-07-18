<template>
  <div class="sidebar">
    <div class="icon">
      <logo />
    </div>
    <nav class="menu">
      <div>
        <router-link
          :to="RoutePath.Assets"
          :class="['link', $route.path.split('/')[2] === 'assets' ? 'activeLink' : '']"
        >
          <astar-icon-base class="iconbase" icon-color="currentColor" icon-name="assets">
            <astar-icon-assets />
          </astar-icon-base>
          <div class="row--item">
            <astar-text type="H4">{{ $t('assets.assets') }}</astar-text>
          </div>
        </router-link>
      </div>
      <div>
        <router-link
          :to="RoutePath.Dashboard"
          :class="['link', $route.path.split('/')[2] === 'dashboard' ? 'activeLink' : '']"
        >
          <astar-icon-base class="iconbase" icon-color="#0085FF" icon-name="dashboard">
            <astar-icon-dashboard />
          </astar-icon-base>
          <div class="row--item">
            <astar-text type="H4">{{ $t('dashboard.dashboard') }}</astar-text>
          </div>
        </router-link>
      </div>
      <div>
        <router-link
          v-if="network.isStoreEnabled"
          :to="RoutePath.DappStaking"
          data-testid="dapp-staking"
          :class="['link', $route.path.split('/')[2] === 'dapp-staking' ? 'activeLink' : '']"
        >
          <astar-icon-base class="iconbase" icon-color="currentColor" icon-name="staking">
            <astar-icon-dapp-staking />
          </astar-icon-base>
          <div class="row--item">
            <astar-text type="H4">{{ $t('common.dappStaking') }}</astar-text>
          </div>
        </router-link>
      </div>
      <div>
        <router-link
          :to="RoutePath.Bridge"
          :class="['link', $route.path.split('/')[2] === 'bridge' ? 'activeLink' : '']"
        >
          <astar-icon-base class="iconbase" icon-color="currentColor" icon-name="bridge">
            <astar-icon-bridge />
          </astar-icon-base>
          <div class="row--item">
            <astar-text type="H4">{{ $t('assets.bridge') }}</astar-text>
          </div>
        </router-link>
      </div>
      <div>
        <a :class="['link']" href="https://astar.network/community/ecosystem/" target="_blank">
          <astar-icon-base class="icon-add" icon-name="ecosystem">
            <icon-ecosystem />
          </astar-icon-base>
          <div class="row--item row--item-ecosystem">
            <astar-text type="H4">{{ $t('common.ecosystem') }}</astar-text>
          </div>
        </a>
      </div>
      <div v-if="isGovernanceEnabled">
        <a class="link" :href="governanceUrl" target="_blank">
          <astar-icon-base class="icon-add" icon-name="governance" style="stroke-width: 0.5px">
            <astar-icon-governance />
          </astar-icon-base>
          <div class="row--item row--item-ecosystem">
            <astar-text type="H4">{{ $t('sidenavi.governance') }}</astar-text>
          </div>
        </a>
      </div>
      <div>
        <a :class="['link']" :href="socialUrl.forum" target="_blank">
          <astar-icon-base class="icon-add" icon-name="forum">
            <astar-icon-forum />
          </astar-icon-base>
          <div class="row--item row--item-ecosystem">
            <astar-text type="H4">{{ $t('sidenavi.forum') }}</astar-text>
          </div>
        </a>
      </div>
      <div class="menu__indicator" :class="getIndicatorClass(path)" />
    </nav>

    <div class="wrapper--bottom">
      <sidebar-option-desktop />
    </div>
  </div>
</template>

<script lang="ts">
import { providerEndpoints } from 'src/config/chainEndpoints';
import { useGovernance, useNetworkInfo, useSidebar } from 'src/hooks';
import { socialUrl } from 'src/links';
import { Path as RoutePath } from 'src/router/routes';
import { useStore } from 'src/store';
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import Logo from '../common/Logo.vue';
import SidebarOptionDesktop from './SidebarOptionDesktop.vue';
import IconEcosystem from './components/IconEcosystem.vue';

export default defineComponent({
  components: {
    Logo,
    IconEcosystem,
    SidebarOptionDesktop,
  },
  setup() {
    const { isOpen } = useSidebar();
    const { isZkEvm } = useNetworkInfo();
    const { isGovernanceEnabled, governanceUrl } = useGovernance();

    const store = useStore();
    const currentNetworkIdx = computed<number>(() => store.getters['general/networkIdx']);

    const network = ref(providerEndpoints[currentNetworkIdx.value]);

    const router = useRouter();
    const path = computed(() => router.currentRoute.value.path.split('/')[2]);

    const getIndicatorClass = (path: string): string => {
      const indicatorClassObject: Record<string, string> = {
        dashboard: 'menu__dashboard',
        assets: 'menu__assets',
        'dapp-staking': 'menu__staking',
        bridge: 'menu__bridge',
      };

      let indicatorClass = indicatorClassObject[path] ?? 'menu__staking';

      if (isGovernanceEnabled.value) {
        indicatorClass += ' governance_activated';
      }

      return indicatorClass;
    };

    return {
      isOpen,
      network,
      getIndicatorClass,
      isZkEvm,
      router,
      path,
      RoutePath,
      socialUrl,
      isGovernanceEnabled,
      governanceUrl,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/sidebar-desktop.scss';
</style>
