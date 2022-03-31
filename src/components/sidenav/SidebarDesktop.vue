<template>
  <div class="sidebar">
    <div class="icon">
      <Logo />
    </div>
    <div class="menu">
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
    </div>

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

    return {
      isOpen,
      network,
      isShiden,
      enableBridge,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.icon {
  text-align: center;
  width: 170px;
  margin-left: 8px;
}
.iconbase {
  color: $astar-blue-dark;
  width: 20px;
  height: 20px;
}
// .shiden {
//   color: $shiden-purple-dark;
// }
.sidebar {
  width: 224px;
  height: 100%;
  padding-top: 18px;
  background: #e6e9ee;
  display: flex;
  flex-direction: column;
}

.menu {
  margin-top: rem(32);
  margin-left: 24px;
  flex-grow: 1;

  .row--item {
    flex: 1 1 0%;
    margin-left: rem(12);
  }
}

.link {
  display: flex;
  align-items: center;
  width: 176px;
  height: 38px;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 6px;
  color: $gray-5;
}
.link:hover {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)), #e6e9ee;
}
.activeLink {
  background: #d3d6dc;
}
.activeLink:hover {
  background: #d3d6dc;
}

.wrapper--bottom {
  flex-shrink: 0;
  padding: rem(16);

  .wrapper--option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: rem(4.8);
  }
}

.body--dark {
  .sidebar {
    background: $gray-5;
  }
  .link {
    color: #f7f7f8;
  }
  .link:hover {
    background: #313a3d;
  }
  .activeLink {
    background: #3c4649;
  }
  .activeLink:hover {
    background: #3c4649;
  }
}
</style>
