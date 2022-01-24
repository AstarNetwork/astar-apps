<template>
  <div>
    <div v-if="isH160">
      <div class="tw-grid md:tw-auto-cols-max xl:tw-grid-cols-2 tw-gap-4">
        <WalletH160
          v-model:isOpen="modalAccount"
          :address="currentAccount"
          :address-name="currentAccountName"
        />
      </div>
    </div>

    <div v-if="!isH160">
      <div class="tw-grid lg:tw-grid-cols-2 tw-gap-4">
        <Wallet v-model:isOpen="modalAccount" :wallet-name="currentAccountName" />
      </div>
      <div class="tw-grid lg:tw-grid-cols-2 tw-gap-4 tw-mt-8">
        <Addresses />
      </div>
    </div>

    <div
      class="
        tw-grid tw-grid-cols-1
        md:tw-grid-cols-3
        xl:tw-grid-cols-4
        tw-gap-y-8
        md:tw-gap-8
        tw-mt-8
      "
    >
      <TotalBalance v-if="accountData" :account-data="accountData" />
      <PlmBalance
        v-if="accountData"
        v-model:isOpenTransfer="modalTransferAmount"
        v-model:isOpenWithdrawalEvmDeposit="modalWithdrawalEvmDeposit"
        v-model:isOpenModalFaucet="modalFaucet"
        :address="currentAccount"
        :account-data="accountData"
      />
    </div>

    <!-- Modals -->
    <ModalTransferAmount
      v-if="modalTransferAmount"
      v-model:isOpen="modalTransferAmount"
      :balance="balance"
      :account-data="accountData"
    />
    <ModalWithdrawalEvmDeposit
      v-if="modalWithdrawalEvmDeposit"
      v-model:isOpen="modalWithdrawalEvmDeposit"
      :balance="evmDeposit"
      :account="currentAccount"
      :account-name="currentAccountName"
    />
    <ModalFaucet v-if="modalFaucet" v-model:isOpen="modalFaucet" />
  </div>

  <!-- <ModalAlertBox
    v-if="!isWeb3Injected"
    :hasClose="false"
    msg="Web3 is not found in the browser. You should install the polkadot extension or wallet."
  /> -->
</template>
<script lang="ts">
import 'animate.css';
import { useMeta } from 'quasar';
import { useAccount, useApi, useBalance, useEvmDeposit, useFaucet } from 'src/hooks';
import { useStore } from 'src/store';
import { computed, defineComponent, reactive, toRefs } from 'vue';
import Addresses from './Addresses.vue';
import ModalFaucet from './modals/ModalFaucet.vue';
import ModalTransferAmount from './modals/ModalTransferAmount.vue';
import ModalWithdrawalEvmDeposit from './modals/ModalWithdrawalEvmDeposit.vue';
import PlmBalance from './PlmBalance.vue';
import TotalBalance from './TotalBalance.vue';
import Wallet from './Wallet.vue';
import WalletH160 from './WalletH160.vue';

interface Modal {
  modalAccount: boolean;
  modalTransferAmount: boolean;
  modalWithdrawalEvmDeposit: boolean;
  modalTransferToken: boolean;
  modalFaucet: boolean;
}

export default defineComponent({
  components: {
    Wallet,
    WalletH160,
    PlmBalance,
    TotalBalance,
    Addresses,
    ModalTransferAmount,
    ModalWithdrawalEvmDeposit,
    ModalFaucet,
  },
  setup() {
    useMeta({ title: 'Wallet' });

    const stateModal = reactive<Modal>({
      modalAccount: false,
      modalTransferAmount: false,
      modalTransferToken: false,
      modalWithdrawalEvmDeposit: false,
      modalFaucet: false,
    });

    const store = useStore();
    const { currentAccount, currentAccountName } = useAccount();
    const { api } = useApi();
    const { balance, accountData } = useBalance(api, currentAccount);

    const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const { evmDeposit } = useEvmDeposit();

    return {
      ...toRefs(stateModal),
      balance,
      evmDeposit,
      currentAccount,
      currentAccountName,
      currentNetworkStatus,
      accountData,
      isH160,
    };
  },
  methods: {
    isConnected(networkStatus: string) {
      return networkStatus === 'connected';
    },
  },
});
</script>
