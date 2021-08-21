<template>
  <div v-if="isWeb3Injected && isConnected(currentNetworkStatus)">
    <div class="tw-grid lg:tw-grid-cols-2 tw-gap-4 tw-mb-4">
      <Address
        :address="currentAccount"
        :address-name="currentAccountName"
        v-model:isOpen="modalAccount"
      />
    </div>

    <div class="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 tw-gap-4 tw-mb-8">
      <TotalBalance />
      <PlmBalance
        :address="currentAccount"
        v-model:isOpenTransfer="modalTransferAmount"
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
      v-on:completeTransfer="completeTransfer"
      :all-accounts="allAccounts"
      :all-account-names="allAccountNames"
      :balance="balance"
    />
  </div>

  <!-- <ModalAlertBox
    v-if="!isWeb3Injected"
    :hasClose="false"
    msg="Web3 is not found in the browser. You should install the polkadot extension or wallet."
  /> -->
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  watch,
  provide,
  ref,
} from 'vue';
import { useAccount, useBalance, useApi } from 'src/hooks';
import { useStore } from 'src/store';
import { useMeta } from 'quasar';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import Address from './Address.vue';
import PlmBalance from './PlmBalance.vue';
import TotalBalance from './TotalBalance.vue';
// import ModalAlertBox from 'components/common/ModalAlertBox.vue';
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
    // ModalAlertBox,
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

    const currentAccount = ref('');
    const currentAccountName = ref('');

    const {
      allAccounts,
      allAccountNames,
    } = useAccount(currentAccount, currentAccountName);

    watch(currentAccount, () => {
      console.log('dfddf', currentAccountName.value)
    });

    const { api } = useApi();

    const store = useStore();

    const { balance } = useBalance(api, currentAccount);
    provide('balance', balance);

    const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);

    const completeTransfer = () => {
      const curAccountRef = ref(currentAccount.value);
      const { balance: balanceRef } = useBalance(api, curAccountRef);

      watch(balanceRef, () => {
        console.log('new balance:', balance.value);
        balance.value = balanceRef.value;
      });
    };

    return {
      ...toRefs(stateModal),
      isWeb3Injected,
      balance,
      allAccounts,
      allAccountNames,
      currentAccount,
      currentAccountName,
      currentNetworkStatus,
      completeTransfer,
    };
  },
  methods: {
    isConnected(networkStatus: string) {
      return networkStatus === 'connected';
    },
  },
});
</script>
