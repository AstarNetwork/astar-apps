<template>
  <div class="sidebar">
    <q-list padding class="menu-list">
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
              :class="[$route.path.split('/')[1] === 'balance' ? 'activeSvg' : 'inactiveSvg']"
              viewBox="0 0 24 24"
            >
              <icon-balance />
            </icon-base>
            <div class="tw-ml-3 tw-flex-1">
              {{ $t('assets.assets') }}
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
              :class="[$route.path.split('/')[1] === 'dapp-staking' ? 'activeSvg' : 'inactiveSvg']"
              viewBox="0 0 24 24"
            >
              <icon-store />
            </icon-base>
            <div class="tw-ml-3 tw-flex-1">
              {{ $t('common.dappStaking') }}
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
              :class="[$route.path.split('/')[1] === 'bridge' ? 'activeSvg' : 'inactiveSvg']"
              viewBox="0 0 24 24"
            >
              <icon-bridge />
            </icon-base>
            <span class="tw-ml-3 tw-flex-1">
              {{ $t('bridge.bridge') }}
            </span>
          </router-link>
        </div>
      </div>

      <div
        class="tw-flex-shrink-0 tw-p-4 tw-border-t tw-border-gray-200 dark:tw-border-darkGray-600"
      >
        <SocialMediaLinks />
        <div class="tw-flex tw-items-center tw-justify-center">
          <LightDarkMode />
          <LocaleChanger />
        </div>
      </div>
    </q-list>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { useSidebar } from 'src/hooks';
import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';
import IconBase from '../icons/IconBase.vue';
import IconBalance from '../icons/IconBalance.vue';
import IconStore from '../icons/IconStore.vue';
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
    IconBalance,
    IconStore,
    IconBridge,
    Logo,
  },
  setup() {
    const { isOpen } = useSidebar();

    const store = useStore();
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);

    const network = ref(providerEndpoints[currentNetworkIdx.value]);
    const enableBridge = computed(
      () => isH160.value && currentNetworkIdx.value !== endpointKey.SHIBUYA
    );

    return {
      isOpen,
      network,
      enableBridge,
    };
  },
});
</script>
<style scoped>
.icon {
  text-align: center;
  width: 140px;
  margin-left: 20px;
}

.sidebar {
  width: 224px;
  height: 100%;
  padding-top: 40px;
  background: #2c3335;
}

.menu {
  margin-top: 50px;
  margin-left: 24px;
}

.link {
  display: flex;
  align-items: center;
  width: 176px;
  height: 38px;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 6px;
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

.activeSvg {
  @apply tw-text-blue-500 dark:tw-text-white tw-h-6 tw-w-6;
}
.inactiveSvg {
  @apply tw-text-gray-500 group-hover:tw-text-gray-700 tw-h-6 tw-w-6 dark:tw-text-darkGray-300;
}
.inactiveSvg:group-hover {
  @apply dark:tw-text-white;
}
</style>
