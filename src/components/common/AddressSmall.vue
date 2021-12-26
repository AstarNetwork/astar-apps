<template>
  <div>
    <button v-if="!shortenAddress" type="button" class="modal-button" @click="openSelectModal">
      {{ $t('wallet.connectWallet') }}
    </button>

    <button v-else type="button" class="modal-button" @click="disconnectAccount">
      <div class="tw-h-6 tw-w-6 tw-overflow-hidden tw-mx-3 sm:tw-mx-4">
        <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
          <icon-account-sample />
        </icon-base>
      </div>
      {{ shortenAddress }}
      <icon-base class="tw--mr-1 tw-ml-2 tw-h-4 tw-w-4" viewBox="0 0 20 20" aria-hidden="true">
        <icon-solid-chevron-down />
      </icon-base>
    </button>

    <modal-connect-wallet
      v-if="modalName === WalletOption.SelectWallet"
      :set-polkadot="setPolkadot"
      :set-meta-mask="setMetaMask"
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
import { defineComponent, computed } from 'vue';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import IconBase from 'components/icons/IconBase.vue';
import IconSolidChevronDown from 'components/icons/IconSolidChevronDown.vue';
import IconAccountSample from 'components/icons/IconAccountSample.vue';
import { useConnectWallet } from 'src/hooks';
import ModalAccount from '../balance/modals/ModalAccount.vue';
import ModalConnectWallet from '../balance/modals/ModalConnectWallet.vue';
import ModalInstallWallet from '../balance/modals/ModalInstallWallet.vue';

export default defineComponent({
  components: {
    IconBase,
    IconSolidChevronDown,
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
      setPolkadot,
      setCloseModal,
      setMetaMask,
      openSelectModal,
      disconnectAccount,
    } = useConnectWallet();

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
      setPolkadot,
      setCloseModal,
      setMetaMask,
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
