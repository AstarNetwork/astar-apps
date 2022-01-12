<template>
  <div>
    <button v-if="!shortenAddress" type="button" class="modal-button" @click="openSelectModal">
      {{ $t('wallet.connectWallet') }}
    </button>

    <button v-else type="button" class="modal-button" @click="disconnectAccount">
      <div class="tw-h-6 tw-w-6 tw-overflow-hidden tw-mr-3">
        <div v-if="isH160Formatted">
          <img width="80" src="~assets/img/ethereum.png" />
        </div>
        <div v-else>
          <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
            <icon-account-sample />
          </icon-base>
        </div>
      </div>
      {{ shortenAddress }}
      <icon-base class="tw-ml-3 tw-h-3 tw-w-3" viewBox="0 0 20 20" aria-hidden="true">
        <icon-disconnect />
      </icon-base>
    </button>

    <modal-connect-wallet
      v-if="modalName === WalletOption.SelectWallet"
      :set-wallet-modal="setWalletModal"
      :set-close-modal="setCloseModal"
    />

    <ModalAccount
      v-if="modalAccountSelect"
      v-model:isOpen="modalAccountSelect"
      :all-accounts="allAccounts"
      :all-account-names="allAccountNames"
    />

    <ModalInstallWallet
      v-if="modalName === WalletOption.NoExtension"
      :set-close-modal="setCloseModal"
      :selected-wallet="selectedWallet"
    />
  </div>
</template>

<script lang="ts">
import IconAccountSample from 'components/icons/IconAccountSample.vue';
import IconBase from 'components/icons/IconBase.vue';
import IconDisconnect from 'components/icons/IconDisconnect.vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useConnectWallet } from 'src/hooks';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { useStore } from 'src/store';
import { computed, defineComponent, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import ModalAccount from '../balance/modals/ModalAccount.vue';
import ModalConnectWallet from '../balance/modals/ModalConnectWallet.vue';
import ModalInstallWallet from '../balance/modals/ModalInstallWallet.vue';

export default defineComponent({
  components: {
    IconBase,
    IconDisconnect,
    IconAccountSample,
    ModalAccount,
    ModalConnectWallet,
    ModalInstallWallet,
  },

  setup() {
    const {
      WalletOption,
      modalConnectWallet,
      modalName,
      allAccounts,
      allAccountNames,
      currentAccount,
      currentAccountName,
      selectedWallet,
      modalAccountSelect,
      currentNetworkStatus,
      setCloseModal,
      setWalletModal,
      openSelectModal,
      disconnectAccount,
    } = useConnectWallet();

    const router = useRouter();
    const accountId = localStorage.getItem(LOCAL_STORAGE.SELECTED_ACCOUNT_ID);
    const store = useStore();
    const isH160Formatted = computed(() => store.getters['general/isH160Formatted']);

    watchEffect(() => {
      const isDappStakingPath = router.currentRoute.value.matched[0].path === '/dapp-staking';
      if (currentNetworkStatus.value !== 'connected' || !isDappStakingPath) return;
      if (currentAccount.value === '' && accountId === null) {
        setTimeout(() => {
          openSelectModal();
        }, 200);
      }
    });

    const shortenAddress = computed(() => {
      return getShortenAddress(currentAccount.value);
    });

    return {
      shortenAddress,
      WalletOption,
      modalConnectWallet,
      currentAccount,
      modalName,
      allAccounts,
      allAccountNames,
      currentAccountName,
      selectedWallet,
      modalAccountSelect,
      isH160Formatted,
      setCloseModal,
      setWalletModal,
      openSelectModal,
      disconnectAccount,
    };
  },
});
</script>

<style scoped>
.modal-button {
  @apply tw-inline-flex tw-justify-center tw-items-center tw-w-full tw-rounded-full tw-border tw-border-gray-300 dark:tw-border-darkGray-600 tw-px-4 tw-py-2  tw-bg-white dark:tw-bg-darkGray-900 tw-text-xs tw-font-medium tw-text-gray-700 dark:tw-text-darkGray-100;
}
.modal-button:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-700;
}
.modal-button:focus {
  @apply tw-outline-none tw-ring tw-ring-gray-100 dark:tw-ring-darkGray-600;
}
</style>
