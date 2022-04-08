<template>
  <div class="sidebar">
    <div class="icon">
      <Logo />
    </div>
    <nav class="menu">
      <div>
        <router-link
          to="/assets"
          :class="['link', $route.path.split('/')[1] === 'assets' ? 'activeLink' : '']"
        >
          <icon-base
            :class="['iconbase', isShiden ? 'shiden' : '']"
            stroke="currentColor"
            icon-name="assets"
          >
            <icon-assets />
          </icon-base>
          <div class="row--item">
            <astar-text type="H4">{{ $t('assets.assets') }}</astar-text>
          </div>
        </router-link>
      </div>
      <div>
        <router-link
          to="/dashboard"
          :class="['link', $route.path.split('/')[1] === 'dashboard' ? 'activeLink' : '']"
        >
          <icon-base
            :class="['iconbase', isShiden ? 'shiden' : '']"
            stroke="currentColor"
            icon-name="dashboard"
          >
            <icon-dashboard />
          </icon-base>
          <div class="row--item">
            <astar-text type="H4">{{ $t('dashboard.dashboard') }}</astar-text>
          </div>
        </router-link>
      </div>
      <div>
        <router-link
          v-if="network.isStoreEnabled"
          to="/dapp-staking"
          :class="['link', $route.path.split('/')[1] === 'dapp-staking' ? 'activeLink' : '']"
        >
          <icon-base
            :class="['iconbase', isShiden ? 'shiden' : '']"
            stroke="currentColor"
            icon-name="staking"
          >
            <icon-staking />
          </icon-base>
          <div class="row--item">
            <astar-text type="H4">{{ $t('common.staking') }}</astar-text>
          </div>
        </router-link>
      </div>
      <div>
        <router-link
          v-if="enableBridge"
          to="/bridge"
          :class="['link', $route.path.split('/')[1] === 'bridge' ? 'activeLink' : '']"
        >
          <icon-base
            :class="['iconbase', isShiden ? 'shiden' : '']"
            stroke="currentColor"
            icon-name="bridge"
          >
            <icon-bridge />
          </icon-base>
          <span class="row--item">
            <astar-text type="H4">{{ $t('bridge.bridge') }}</astar-text>
          </span>
        </router-link>
      </div>
      <div class="menu__indicator" :class="getIndicatorClass(path)" />
    </nav>

    <div class="wrapper--bottom">
      <SocialMediaLinks />
      <div class="wrapper--option">
        <LightDarkMode />
        <LocaleChanger />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { useSidebar } from 'src/hooks';
import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';
import IconBase from '../icons/IconBase.vue';
import IconDashboard from '../icons/IconDashboard.vue';
import IconAssets from '../icons/IconAssets.vue';
import IconStaking from '../icons/IconDappStaking.vue';
import IconBridge from '../icons/IconBridge.vue';
import LocaleChanger from '../common/LocaleChanger.vue';
import SocialMediaLinks from '../common/SocialMediaLinks.vue';
import LightDarkMode from '../common/LightDarkMode.vue';
import Logo from '../common/Logo.vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  components: {
    SocialMediaLinks,
    LightDarkMode,
    LocaleChanger,
    IconBase,
    IconDashboard,
    IconAssets,
    IconStaking,
    IconBridge,
    Logo,
  },
  setup() {
    const { isOpen } = useSidebar();

    const store = useStore();
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);

    const network = ref(providerEndpoints[currentNetworkIdx.value]);
    const isShiden = computed(() => currentNetworkIdx.value === endpointKey.SHIDEN);
    const enableBridge = computed(
      () => isH160.value && currentNetworkIdx.value !== endpointKey.SHIBUYA
    );

    const router = useRouter();
    const path = computed(() => router.currentRoute.value.path.split('/')[1]);

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
      enableBridge,
      getIndicatorClass,
      router,
      path,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/sidebar-desktop.scss';
</style>
