<template>
  <div class="tw-flex-1 tw-flex tw-flex-col">
    <div class="tw-flex-1 tw-flex tw-flex-col tw-pt-10 tw-overflow-x-hidden tw-overflow-y-auto">
      <div class="tw-flex tw-items-center">
        <Logo />
      </div>

      <nav class="flex-1">
        <router-link
          to="/assets"
          :class="[$route.path.split('/')[1] === 'assets' ? 'activeLink' : 'inactiveLink']"
          class="tw-items-center tw-justify-center"
        >
          <icon-base
            :class="[$route.path.split('/')[1] === 'balance' ? 'activeSvg' : 'inactiveSvg']"
            viewBox="0 0 24 24"
          >
            <icon-balance />
          </icon-base>
          <span class="tw-ml-3 tw-flex-1">
            <p class="tw-font-bold">
              {{ $t('assets.assets') }}
            </p>
          </span>
        </router-link>

        <router-link
          v-if="network.isStoreEnabled"
          to="/dapp-staking"
          :class="[$route.path.split('/')[1] === 'dapp-staking' ? 'activeLink' : 'inactiveLink']"
        >
          <icon-base
            :class="[$route.path.split('/')[1] === 'dapp-staking' ? 'activeSvg' : 'inactiveSvg']"
            viewBox="0 0 24 24"
          >
            <icon-store />
          </icon-base>
          <span class="tw-font-bold tw-ml-3 tw-flex-1">
            {{ $t('common.dappStaking') }}
          </span>
        </router-link>

        <router-link
          v-if="enableBridge"
          to="/bridge"
          :class="[$route.path.split('/')[1] === 'bridge' ? 'activeLink' : 'inactiveLink']"
        >
          <icon-base
            :class="[$route.path.split('/')[1] === 'bridge' ? 'activeSvg' : 'inactiveSvg']"
            viewBox="0 0 24 24"
          >
            <icon-bridge />
          </icon-base>
          <span class="tw-font-bold tw-ml-3 tw-flex-1">
            {{ $t('bridge.bridge') }}
          </span>
        </router-link>
      </nav>
    </div>

    <div class="tw-flex-shrink-0 tw-p-4 tw-border-t tw-border-gray-200 dark:tw-border-darkGray-600">
      <SocialMediaLinks />
      <div class="tw-flex tw-items-center tw-justify-center">
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
import SocialMediaLinks from '../common/SocialMediaLinks.vue';
import LightDarkMode from '../common/LightDarkMode.vue';
import IconBase from '../icons/IconBase.vue';
import IconBalance from '../icons/IconBalance.vue';
import IconStore from '../icons/IconStore.vue';
import IconBridge from '../icons/IconBridge.vue';
import LocaleChanger from '../common/LocaleChanger.vue';
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
.activeLink {
  @apply tw-bg-blue-200 dark:tw-bg-blue-500 tw-bg-opacity-20 dark:tw-bg-opacity-20 dark:tw-text-white tw-text-blue-500 tw-group tw-flex tw-px-4 tw-py-6 tw-border-r-4 tw-border-blue-500 tw-cursor-default;
}
.inactiveLink {
  @apply tw-text-gray-500 hover:tw-text-gray-700 tw-group tw-flex tw-items-center tw-px-4 tw-py-6 tw-text-sm tw-font-medium dark:tw-text-darkGray-300;
}
.inactiveLink:hover {
  @apply dark:tw-text-white;
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
