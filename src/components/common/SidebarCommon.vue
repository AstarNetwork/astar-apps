<template>
  <div class="tw-flex-1 tw-flex tw-flex-col tw-pt-10 tw-overflow-y-auto">
    <div class="tw-flex tw-items-center">
      <img width="200" src="~assets/img/astar.png" />
      <ConnectionIndicator
        class="tw-pt-4"
        :connectionType="currentNetworkStatus"
      />
    </div>

    <div class="tw-p-4">
      <button
        type="button"
        @click="modalNetwork = true"
        class="tw-inline-flex tw-justify-center tw-w-full tw-rounded-full tw-border tw-border-gray-300 dark:tw-border-darkGray-600 tw-px-4 tw-py-3 tw-bg-white dark:tw-bg-darkGray-900 tw-text-xs tw-font-medium tw-text-gray-700 dark:tw-text-darkGray-100 hover:tw-bg-gray-100 dark:hover:tw-bg-darkGray-700 focus:tw-outline-none focus:tw-ring focus:tw-ring-gray-100 dark:focus:tw-ring-darkGray-600"
      >
        {{ currentNetworkName }}
        <icon-base
          class="tw--mr-1 tw-ml-2 tw-h-4 tw-w-4"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <icon-solid-chevron-down />
        </icon-base>
      </button>

      <ExtensionsMetadata v-if="!isLocalChain" />
    </div>

    <nav class="flex-1">
      <router-link
        to="/balance"
        :class="[
          $route.path.split('/')[1] === 'balance'
            ? 'activeLink'
            : 'inactiveLink',
        ]"
        class="tw-items-center tw-justify-center"
        style="height: 104px"
      >
        <icon-base
          :class="[
            $route.path.split('/')[1] === 'balance'
              ? 'activeSvg'
              : 'inactiveSvg',
          ]"
          viewBox="0 0 24 24"
        >
          <icon-balance />
        </icon-base>
        <span class="tw-ml-3 tw-flex-1">
          <p class="tw-font-bold">Balance</p>
          <p
            class="tw-text-xs tw-text-blue-900 dark:tw-text-darkGray-100 tw-font-semibold tw-flex tw-justify-between"
          >
            <span>{{ defaultAccountName }}</span>
          </p>
          <p class="tw-text-xs tw-text-gray-500 dark:tw-text-darkGray-400">
            {{ shortenAddress }}
          </p>
        </span>
      </router-link>

      <router-link
        v-if="isSupportContract"
        to="/dapps"
        :class="[
          $route.path.split('/')[1] === 'dapps' ? 'activeLink' : 'inactiveLink',
        ]"
      >
        <icon-base
          :class="[
            $route.path.split('/')[1] === 'dapps' ? 'activeSvg' : 'inactiveSvg',
          ]"
          viewBox="0 0 24 24"
        >
          <icon-dapps />
        </icon-base>
        <span class="tw-font-bold tw-ml-3 tw-flex-1">dApps</span>
      </router-link>

      <a
        href="https://lockdrop.plasmnet.io/"
        target="_blank"
        :class="[
          $route.path.split('/')[1] === 'lockdrop'
            ? 'activeLink'
            : 'inactiveLink',
        ]"
      >
        <icon-base
          :class="[
            $route.path.split('/')[1] === 'lockdrop'
              ? 'activeSvg'
              : 'inactiveSvg',
          ]"
          iconColor="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <icon-dot-lockdrop />
        </icon-base>
        <span class="tw-ml-3 tw-flex-1">Plasm Lockdrop</span>
      </a>
    </nav>
  </div>

  <div
    class="tw-flex-shrink-0 tw-p-4 tw-border-t tw-border-gray-200 dark:tw-border-darkGray-600"
  >
    <SocialMediaLinks />
    <LightDarkMode />
  </div>

  <!-- Modals -->
  <ModalNetwork
    v-if="modalNetwork"
    :network-idx="currentNetworkIdx"
    v-model:isOpen="modalNetwork"
    v-model:selectNetwork="currentNetworkIdx"
  />
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { useStore } from 'src/store';
import { useAccount, useSidebar } from 'src/hooks';
import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';
import ConnectionIndicator from './ConnectionIndicator.vue';
import ExtensionsMetadata from './ExtensionsMetadata.vue';
import SocialMediaLinks from './SocialMediaLinks.vue';
import LightDarkMode from './LightDarkMode.vue';
import IconBase from '../icons/IconBase.vue';
import IconDapps from '../icons/IconDapps.vue';
import IconDotLockdrop from '../icons/IconDotLockdrop.vue';
import IconBalance from '../icons/IconBalance.vue';
import IconSolidChevronDown from '../icons/IconSolidChevronDown.vue';
import ModalNetwork from 'src/components/balance/modals/ModalNetwork.vue';

export default defineComponent({
  components: {
    ConnectionIndicator,
    ExtensionsMetadata,
    SocialMediaLinks,
    LightDarkMode,
    IconBase,
    IconDapps,
    IconDotLockdrop,
    IconBalance,
    IconSolidChevronDown,
    ModalNetwork,
  },
  setup() {
    const { isOpen } = useSidebar();
    const modalNetwork = ref(false);

    const store = useStore();

    const {
      allAccounts,
      allAccountNames,
      defaultAccount,
      defaultAccountName,
    } = useAccount();

    const shortenAddress = computed(() => {
      return `${defaultAccount.value.slice(0, 6)}${'.'.repeat(
        6
      )}${defaultAccount.value.slice(-6)}`;
    });

    const currentAccountIdx = computed(() => store.getters['general/accountIdx']);
    const isCheckMetamask = computed(() => store.getters['general/isCheckMetamask']);
    const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);

    watch(currentAccountIdx, () => {
      if (currentAccountIdx.value !== -1) {
        defaultAccount.value = allAccounts.value[currentAccountIdx.value];
        defaultAccountName.value = allAccountNames.value[currentAccountIdx.value];
      }
    });

    watch(
      isCheckMetamask,
      () => {
        if (isCheckMetamask.value && currentEcdsaAccount.value) {
          defaultAccount.value = currentEcdsaAccount.value.ss58;
          defaultAccountName.value = 'ECDSA (Ethereum Extension)';
        }
      },
      { immediate: true }
    )

    const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const currentNetworkName = ref(
      providerEndpoints[currentNetworkIdx.value].displayName
    );

    watch(currentNetworkIdx, (networkIdx) => {
      currentNetworkName.value = providerEndpoints[networkIdx].displayName;
    });

    const isLocalChain = currentNetworkIdx.value === endpointKey.LOCAL;
    const isSupportContract = ref(
      providerEndpoints[currentNetworkIdx.value].isSupportContract
    );

    return {
      isOpen,
      modalNetwork,
      shortenAddress,
      defaultAccountName,
      currentNetworkStatus,
      currentNetworkIdx,
      currentNetworkName,
      isLocalChain,
      isSupportContract,
    };
  },
});
</script>
<style scoped>
.activeLink {
  @apply tw-bg-blue-200 dark:tw-bg-blue-500 tw-bg-opacity-20 dark:tw-text-white tw-text-blue-500 tw-group tw-flex tw-px-4 tw-py-6 tw-border-r-4 tw-border-blue-500 tw-cursor-default;
}
.inactiveLink {
  @apply tw-text-gray-500 dark:tw-text-darkGray-300 hover:tw-text-gray-700 dark:hover:tw-text-white tw-group tw-flex tw-items-center tw-px-4 tw-py-6 tw-text-sm tw-font-medium;
}
.activeSvg {
  @apply tw-text-blue-500 dark:tw-text-white tw-h-6 tw-w-6;
}
.inactiveSvg {
  @apply tw-text-gray-500 dark:tw-text-darkGray-300 group-hover:tw-text-gray-700 dark:group-hover:tw-text-white tw-h-6 tw-w-6;
}
</style>
