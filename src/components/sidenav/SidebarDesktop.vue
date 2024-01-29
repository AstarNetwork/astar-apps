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
          <astar-icon-base
            :class="['iconbase', isShiden ? 'shiden' : '']"
            icon-color="currentColor"
            icon-name="assets"
          >
            <astar-icon-assets />
          </astar-icon-base>
          <div class="row--item">
            <astar-text type="H4">{{ $t('assets.assets') }}</astar-text>
          </div>
        </router-link>
      </div>
      <div>
        <button
          v-if="isZkatana"
          :disabled="true"
          class="link--disabled"
          :class="['link', $route.path.split('/')[2] === 'dashboard' ? 'activeLink' : '']"
        >
          <astar-icon-base
            :class="['iconbase', isShiden ? 'shiden' : '']"
            icon-color="#0085FF"
            icon-name="dashboard"
          >
            <astar-icon-dashboard />
          </astar-icon-base>
          <div class="row--item">
            <astar-text type="H4">{{ $t('dashboard.dashboard') }}</astar-text>
          </div>
        </button>
        <router-link
          v-else
          :to="RoutePath.Dashboard"
          :class="['link', $route.path.split('/')[2] === 'dashboard' ? 'activeLink' : '']"
        >
          <astar-icon-base
            :class="['iconbase', isShiden ? 'shiden' : '']"
            icon-color="#0085FF"
            icon-name="dashboard"
          >
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
          <astar-icon-base
            :class="['iconbase', isShiden ? 'shiden' : '']"
            icon-color="currentColor"
            icon-name="staking"
          >
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
          <astar-icon-base
            :class="['iconbase', isShiden ? 'shiden' : '']"
            icon-color="currentColor"
            icon-name="bridge"
          >
            <astar-icon-bridge />
          </astar-icon-base>
          <div class="row--item">
            <astar-text type="H4">{{ $t('assets.bridge') }}</astar-text>
          </div>
        </router-link>
      </div>
      <div>
        <a :class="['link']" href="https://astar.network/community/ecosystem/" target="_blank">
          <astar-icon-base :class="['icon-add', isShiden ? 'shiden' : '']" icon-name="ecosystem">
            <icon-ecosystem />
          </astar-icon-base>
          <div class="row--item row--item-ecosystem">
            <astar-text type="H4">{{ $t('common.ecosystem') }}</astar-text>
            <astar-icon-external-link />
          </div>
        </a>
      </div>
      <div>
        <a :class="['link']" :href="socialUrl.forum" target="_blank">
          <astar-icon-base :class="['icon-add', isShiden ? 'shiden' : '']" icon-name="forum">
            <astar-icon-forum />
          </astar-icon-base>
          <div class="row--item row--item-ecosystem">
            <astar-text type="H4">{{ $t('sidenavi.forum') }}</astar-text>
            <astar-icon-external-link />
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
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { useNetworkInfo, useSidebar } from 'src/hooks';
import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';
import Logo from '../common/Logo.vue';
import { useRouter } from 'vue-router';
import { Path as RoutePath } from 'src/router/routes';
import IconEcosystem from './components/IconEcosystem.vue';
import SidebarOptionDesktop from './SidebarOptionDesktop.vue';
import { socialUrl } from 'src/links';

export default defineComponent({
  components: {
    Logo,
    IconEcosystem,
    SidebarOptionDesktop,
  },
  setup() {
    const { isOpen } = useSidebar();
    const { isZkEvm, isZkatana } = useNetworkInfo();

    const store = useStore();
    const currentNetworkIdx = computed<number>(() => store.getters['general/networkIdx']);

    const network = ref(providerEndpoints[currentNetworkIdx.value]);
    const isShiden = computed<boolean>(() => currentNetworkIdx.value === endpointKey.SHIDEN);

    const router = useRouter();
    const path = computed(() => router.currentRoute.value.path.split('/')[2]);

    const getIndicatorClass = (path: string): string => {
      switch (path) {
        case 'dashboard':
          return 'menu__dashboard';
        case 'assets':
          return 'menu__assets';
        case 'dapp-staking':
          return 'menu__staking';
        case 'bridge':
          return 'menu__bridge';
        default:
          return 'menu__staking';
      }
    };

    return {
      isOpen,
      network,
      isShiden,
      getIndicatorClass,
      isZkEvm,
      router,
      path,
      RoutePath,
      socialUrl,
      isZkatana,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/sidebar-desktop.scss';
</style>
