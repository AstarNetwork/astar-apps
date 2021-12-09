<template>
  <div class="tw-flex-1 tw-flex tw-flex-col">
    <div class="tw-flex-1 tw-flex tw-flex-col tw-pt-10 tw-overflow-x-hidden tw-overflow-y-auto">
      <div class="tw-flex tw-items-center">
        <div v-if="currentNetworkIdx === endpointKey.SHIDEN" class="tw-px-6">
          <img width="150" src="~assets/img/shiden.png" />
        </div>
        <div v-else-if="currentNetworkIdx === endpointKey.SHIBUYA" class="tw-px-6">
          <img width="150" src="~assets/img/shibuya.svg" />
        </div>
        <img v-else width="200" src="~assets/img/astar.png" />
        <ConnectionIndicator class="tw-pt-4" :connection-type="currentNetworkStatus" />
      </div>

      <div class="tw-p-4">
        <div class="tw-mb-1">
          <AddressSmall
            v-model:isOpen="modalAccount"
            :address="currentAccount"
            :address-name="currentAccountName"
          />
        </div>

        <button type="button" class="network-button" @click="modalNetwork = true">
          {{ currentNetworkName }}
          <icon-base class="tw--mr-1 tw-ml-2 tw-h-4 tw-w-4" viewBox="0 0 20 20" aria-hidden="true">
            <icon-solid-chevron-down />
          </icon-base>
        </button>

        <ExtensionsMetadata v-if="!isLocalChain" />
      </div>

      <nav class="flex-1">
        <router-link
          to="/balance"
          :class="[$route.path.split('/')[1] === 'balance' ? 'activeLink' : 'inactiveLink']"
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
              {{ $t('balance.balance') }}
            </p>
            <p
              class="
                tw-text-xs tw-text-blue-900
                dark:tw-text-darkGray-100
                tw-font-semibold tw-flex tw-justify-between
              "
            >
              <span>{{ currentAccountName }}</span>
            </p>
            <p class="tw-text-xs tw-text-gray-500 dark:tw-text-darkGray-400">
              {{ shortenAddress }}
            </p>
          </span>
        </router-link>

        <router-link
          v-if="network.isSupportContract && !isH160"
          to="/contracts"
          :class="[$route.path.split('/')[1] === 'contracts' ? 'activeLink' : 'inactiveLink']"
        >
          <icon-base
            :class="[$route.path.split('/')[1] === 'contracts' ? 'activeSvg' : 'inactiveSvg']"
            viewBox="0 0 24 24"
          >
            <icon-dapps />
          </icon-base>
          <span class="tw-font-bold tw-ml-3 tw-flex-1">
            {{ $t('common.contract') }}
          </span>
        </router-link>

        <router-link
          v-if="network.isStoreEnabled && !isH160"
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

        <a
          href="https://lockdrop.plasmnet.io/"
          target="_blank"
          :class="[$route.path.split('/')[1] === 'lockdrop' ? 'activeLink' : 'inactiveLink']"
        >
          <icon-base
            :class="[$route.path.split('/')[1] === 'lockdrop' ? 'activeSvg' : 'inactiveSvg']"
            icon-color="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <icon-dot-lockdrop />
          </icon-base>
          <span class="tw-ml-3 tw-flex-1">
            {{ $t('common.plasmLockdrop') }}
          </span>
        </a>
      </nav>
    </div>

    <div class="tw-flex-shrink-0 tw-p-4 tw-border-t tw-border-gray-200 dark:tw-border-darkGray-600">
      <SocialMediaLinks />
      <div class="tw-flex tw-items-center tw-justify-center">
        <LightDarkMode />
        <locale-changer />
      </div>
    </div>

    <!-- Modals -->
    <ModalNetwork
      v-if="modalNetwork"
      v-model:isOpen="modalNetwork"
      v-model:selectNetwork="currentNetworkIdx"
      :network-idx="currentNetworkIdx"
    />

    <ModalAccount
      v-if="modalAccount"
      v-model:isOpen="modalAccount"
      :all-accounts="allAccounts"
      :all-account-names="allAccountNames"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, reactive, toRefs } from 'vue';
import { useStore } from 'src/store';
import { useAccount, useSidebar } from 'src/hooks';
import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import ConnectionIndicator from './ConnectionIndicator.vue';
import ExtensionsMetadata from './ExtensionsMetadata.vue';
import SocialMediaLinks from './SocialMediaLinks.vue';
import LightDarkMode from './LightDarkMode.vue';
import IconBase from '../icons/IconBase.vue';
import IconDapps from '../icons/IconDapps.vue';
import IconDotLockdrop from '../icons/IconDotLockdrop.vue';
import IconBalance from '../icons/IconBalance.vue';
import IconSolidChevronDown from '../icons/IconSolidChevronDown.vue';
import IconStore from '../icons/IconStore.vue';
import ModalNetwork from 'src/components/balance/modals/ModalNetwork.vue';
import LocaleChanger from './LocaleChanger.vue';
import AddressSmall from '../common/AddressSmall.vue';
import ModalAccount from '../balance/modals/ModalAccount.vue';

interface Modal {
  modalAccount: boolean;
  modalNetwork: boolean;
}

export default defineComponent({
  components: {
    ConnectionIndicator,
    ExtensionsMetadata,
    SocialMediaLinks,
    LightDarkMode,
    LocaleChanger,
    IconBase,
    IconDapps,
    IconDotLockdrop,
    IconBalance,
    IconSolidChevronDown,
    IconStore,
    ModalNetwork,
    AddressSmall,
    ModalAccount,
  },
  setup() {
    const { isOpen } = useSidebar();
    const stateModal = reactive<Modal>({
      modalNetwork: false,
      modalAccount: false,
    });
    const isH160 = computed(() => store.getters['general/isH160Formatted']);

    const store = useStore();
    const { allAccounts, allAccountNames, currentAccount, currentAccountName } = useAccount();

    const shortenAddress = computed(() => {
      return getShortenAddress(currentAccount.value);
    });

    const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const currentNetworkName = ref(providerEndpoints[currentNetworkIdx.value].displayName);

    watch(currentNetworkIdx, (networkIdx) => {
      currentNetworkName.value = providerEndpoints[networkIdx].displayName;
    });

    const isLocalChain = currentNetworkIdx.value === endpointKey.LOCAL;
    const network = ref(providerEndpoints[currentNetworkIdx.value]);

    return {
      ...toRefs(stateModal),
      isOpen,
      currentNetworkStatus,
      currentNetworkIdx,
      currentNetworkName,
      isLocalChain,
      network,
      shortenAddress,
      currentAccount,
      currentAccountName,
      allAccounts,
      allAccountNames,
      isH160,
      endpointKey,
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

.network-button {
  @apply tw-inline-flex tw-justify-center tw-w-full tw-rounded-full tw-border tw-border-gray-300 dark:tw-border-darkGray-600 tw-px-4 tw-py-3 tw-bg-white dark:tw-bg-darkGray-900 tw-text-xs tw-font-medium tw-text-gray-700 dark:tw-text-darkGray-100;
}
.network-button:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-700;
}
.network-button:focus {
  @apply tw-outline-none tw-ring tw-ring-gray-100 dark:tw-ring-darkGray-600;
}
</style>
