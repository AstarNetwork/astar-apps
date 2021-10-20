<template>
  <div v-if="isConnected(currentNetworkStatus)">
    <div class="tw-grid md:tw-auto-cols-max xl:tw-grid-cols-2 tw-gap-4 tw-mb-8">
      <Address
        v-model:isOpen="modalAccount"
        :address="currentAccount"
        :address-name="currentAccountName"
      />
    </div>

    <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-y-4 md:tw-gap-4 tw-mb-8">
      <TotalBalance v-if="accountData" :account-data="accountData" />
      <PlmBalance
        v-if="accountData"
        v-model:isOpenTransfer="modalTransferAmount"
        :address="currentAccount"
        :account-data="accountData"
      />
    </div>

    <!-- Modals -->
    <ModalAccount
      v-if="modalAccount"
      v-model:isOpen="modalAccount"
      :all-accounts="allAccounts"
      :all-account-names="allAccountNames"
    />
    <ModalTransferAmount
      v-if="modalTransferAmount"
      v-model:isOpen="modalTransferAmount"
      :all-accounts="allAccounts"
      :all-account-names="allAccountNames"
      :balance="balance"
      :account-data="accountData"
    />
  </div>

  <!-- <ModalAlertBox
    v-if="!isWeb3Injected"
    :hasClose="false"
    msg="Web3 is not found in the browser. You should install the polkadot extension or wallet."
  /> -->
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs, computed, watch, ref } from 'vue';
import { useBalance, useApi, useAccount } from 'src/hooks';
import { useStore } from 'src/store';
import { useMeta } from 'quasar';
import Address from './Address.vue';
import PlmBalance from './PlmBalance.vue';
import TotalBalance from './TotalBalance.vue';
import ModalAccount from './modals/ModalAccount.vue';
import ModalTransferAmount from './modals/ModalTransferAmount.vue';

interface Modal {
  modalAccount: boolean;
  modalTransferAmount: boolean;
  modalTransferToken: boolean;
}

export default defineComponent({
  components: {
    Address,
    PlmBalance,
    TotalBalance,
    ModalAccount,
    ModalTransferAmount,
  },
  setup() {
    useMeta({ title: 'Balance-Plasm' });

    const stateModal = reactive<Modal>({
      modalAccount: false,
      modalTransferAmount: false,
      modalTransferToken: false,
    });

    const store = useStore();
    const { allAccounts, allAccountNames, currentAccount, currentAccountName } = useAccount();
    const { api } = useApi();
    const { balance, accountData } = useBalance(api, currentAccount);

    const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);

    return {
      ...toRefs(stateModal),
      // isWeb3Injected,
      balance,
      allAccounts,
      allAccountNames,
      currentAccount,
      currentAccountName,
      currentNetworkStatus,
      accountData,
    };
  },
  methods: {
    isConnected(networkStatus: string) {
      return networkStatus === 'connected';
    },
  },
});
</script>
