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
        <router-link
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
        <div v-else class="dummy-row" />
      </div>
      <div @mouseover="hoverNFT = true" @mouseleave="hoverNFT = false">
        <router-link
          to="#"
          :class="['link', $route.path.split('/')[2] === 'astar-nft' ? 'activeLink' : '']"
        >
          <astar-icon-base
            :class="['icon-add', isShiden ? 'shiden' : '']"
            stroke="currentColor"
            icon-name="staking"
          >
            <icon-side-nft />
          </astar-icon-base>
          <div class="row--item">
            <astar-text type="H4">NFT</astar-text>
          </div>
        </router-link>
        <balloon
          class="balloon"
          :is-balloon="hoverNFT"
          :is-balloon-closing="!hoverNFT"
          :text="$t('sidenavi.comingsoon')"
        />
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
      <div class="menu__indicator" :class="getIndicatorClass(path)" />
    </nav>

    <div class="wrapper--bottom">
      <connection-trouble />
      <social-media-links />
      <div class="wrapper--option">
        <light-dark-mode />
        <locale-changer />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { useSidebar } from 'src/hooks';
import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';
import LocaleChanger from '../common/LocaleChanger.vue';
import SocialMediaLinks from '../common/SocialMediaLinks.vue';
import LightDarkMode from '../common/LightDarkMode.vue';
import Logo from '../common/Logo.vue';
import ConnectionTrouble from 'src/components/common/ConnectionTrouble.vue';
import { useRouter } from 'vue-router';
import { Path as RoutePath } from 'src/router/routes';
import IconSideNft from './components/IconSideNFT.vue';
import IconEcosystem from './components/IconEcosystem.vue';
import Balloon from './components/Balloon.vue';

export default defineComponent({
  components: {
    SocialMediaLinks,
    LightDarkMode,
    LocaleChanger,
    Logo,
    ConnectionTrouble,
    IconSideNft,
    IconEcosystem,
    Balloon,
  },
  setup() {
    const { isOpen } = useSidebar();

    const store = useStore();
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);

    const network = ref(providerEndpoints[currentNetworkIdx.value]);
    const isShiden = computed(() => currentNetworkIdx.value === endpointKey.SHIDEN);

    const router = useRouter();
    const path = computed(() => router.currentRoute.value.path.split('/')[2]);

    const hoverNFT = ref(false);

    const getIndicatorClass = (path: string): string => {
      switch (path) {
        case 'dashboard':
          return 'menu__dashboard';
        case 'assets':
          return 'menu__assets';
        case 'dapp-staking':
          return 'menu__staking';
        default:
          return 'menu__staking';
      }
    };

    return {
      isOpen,
      network,
      isShiden,
      getIndicatorClass,
      router,
      path,
      RoutePath,
      hoverNFT,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/sidebar-desktop.scss';
</style>
