<template>
  <div>
    <div class="header">
      <nav class="tabs">
        <router-link
          to="/dashboard"
          :class="['link', $route.path === '/dashboard' && 'active-link']"
        >
          <div class="col--item">
            <span>
              {{ $t('dashboard.dashboard') }}
            </span>
          </div>
        </router-link>
        <router-link to="/assets" :class="['link', $route.path === '/assets' && 'active-link']">
          <div class="col--item">
            <span>
              {{ $t('assets.assets') }}
            </span>
          </div>
        </router-link>
        <router-link
          v-if="network.isStoreEnabled"
          to="/dapp-staking"
          :class="['link', $route.path === '/dapp-staking' && 'active-link']"
        >
          <div class="col--item">
            <span>
              {{ $t('common.staking') }}
            </span>
          </div>
        </router-link>
        <div class="tabs__indicator" :class="getIndicatorClass($route.path)" />
      </nav>

      <button type="button" class="button--option" @click="showOption = !showOption">
        <icon-base class="icon--dot" stroke="currentColor" icon-name="option">
          <icon-3dots />
        </icon-base>
      </button>
    </div>

    <div v-if="showOption" class="wrapper--bottom">
      <SocialMediaLinks />
      <div class="wrapper--option">
        <LightDarkMode />
        <LocaleChanger />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useStore } from 'src/store';
import { providerEndpoints } from 'src/config/chainEndpoints';
import Icon3dots from 'components/icons/Icon3dots.vue';
import LocaleChanger from '../common/LocaleChanger.vue';
import SocialMediaLinks from '../common/SocialMediaLinks.vue';
import LightDarkMode from '../common/LightDarkMode.vue';
export default defineComponent({
  components: {
    Icon3dots,
    LocaleChanger,
    SocialMediaLinks,
    LightDarkMode,
  },
  setup() {
    const store = useStore();
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const network = ref(providerEndpoints[currentNetworkIdx.value]);
    const showOption = ref(false);

    const getIndicatorClass = (path: string): string => {
      switch (path) {
        case '/dashboard':
          return 'tabs__dashboard';
        case '/assets':
          return 'tabs__assets';
        case '/dapp-staking':
          return 'tabs__assets';
        default:
          return 'tabs__staking';
      }
    };

    return {
      showOption,
      network,
      getIndicatorClass,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/sidebar.scss';
</style>
