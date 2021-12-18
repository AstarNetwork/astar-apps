<template>
  <div v-if="isConnected(currentNetworkStatus)">
    <div class="tw-grid md:tw-grid-cols-2 xl:tw-grid-cols-3 tw-gap-4 tw-mb-8">
      <Wallet
        v-model:isOpen="modalAccount"
        :wallet-name="currentAccountName"
        :is-evm-deposit="isEvmDeposit"
      />
    </div>
    <Accounts
      v-model:isOpenTransfer="modalTransferAmount"
      v-model:isOpenTransferEthereum="modalTransferAmountEthereum"
      v-model:isOpenWithdrawalEvmDeposit="modalWithdrawalEvmDeposit"
      :current-account="currentAccount"
      :account-data="accountData"
      :is-evm-deposit="isEvmDeposit"
      :evm-deposit="evmDeposit"
      :is-transferable="accountData?.getUsableTransactionBalance().toString() !== '0'"
    />

    <div class="tw-mt-8">
      <PlmBalance
        v-if="accountData"
        v-model:isOpenModalFaucet="modalFaucet"
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
      :account-data="accountData"
      :is-ethereum="false"
    />
    <ModalTransferAmount
      v-if="modalTransferAmountEthereum"
      v-model:isOpen="modalTransferAmountEthereum"
      :all-accounts="allAccounts"
      :all-account-names="allAccountNames"
      :account-data="accountData"
      :is-ethereum="true"
    />
    <ModalWithdrawalEvmDeposit
      v-if="modalWithdrawalEvmDeposit"
      v-model:isOpen="modalWithdrawalEvmDeposit"
      :balance="evmDeposit"
      :account="currentAccount"
      :account-name="currentAccountName"
    />
    <ModalFaucet
      v-if="modalFaucet"
      v-model:isOpen="modalFaucet"
      :info="faucetInfo"
      :request-faucet="requestFaucet"
    />
  </div>

  <!-- <ModalAlertBox
    v-if="!isWeb3Injected"
    :hasClose="false"
    msg="Web3 is not found in the browser. You should install the polkadot extension or wallet."
  /> -->
</template>
<script lang="ts">
import { useMeta } from 'quasar';
import { useAccount, useApi, useBalance, useEvmDeposit, useFaucet } from 'src/hooks';
import { useStore } from 'src/store';
import { computed, defineComponent, reactive, toRefs } from 'vue';
import Accounts from './Accounts.vue';
import ModalAccount from './modals/ModalAccount.vue';
import ModalFaucet from './modals/ModalFaucet.vue';
import ModalTransferAmount from './modals/ModalTransferAmount.vue';
import ModalWithdrawalEvmDeposit from './modals/ModalWithdrawalEvmDeposit.vue';
import PlmBalance from './PlmBalance.vue';
import Wallet from './Wallet.vue';

interface Modal {
  modalAccount: boolean;
  modalTransferAmount: boolean;
  modalTransferAmountEthereum: boolean;
  modalWithdrawalEvmDeposit: boolean;
  modalTransferToken: boolean;
  modalFaucet: boolean;
}

export default defineComponent({
  components: {
    Wallet,
    PlmBalance,
    ModalAccount,
    ModalTransferAmount,
    ModalWithdrawalEvmDeposit,
    ModalFaucet,
    Accounts,
  },
  setup() {
    useMeta({ title: 'Wallet' });

    const stateModal = reactive<Modal>({
      modalAccount: false,
      modalTransferAmount: false,
      modalTransferAmountEthereum: false,
      modalTransferToken: false,
      modalWithdrawalEvmDeposit: false,
      modalFaucet: false,
    });

    const store = useStore();
    const { allAccounts, allAccountNames, currentAccount, currentAccountName } = useAccount();
    const { api } = useApi();
    const { balance, accountData } = useBalance(api, currentAccount);
    const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);
    const { evmDeposit, isEvmDeposit } = useEvmDeposit();
    const { faucetInfo, requestFaucet } = useFaucet();

    return {
      ...toRefs(stateModal),
      balance,
      evmDeposit,
      allAccounts,
      allAccountNames,
      currentAccount,
      currentAccountName,
      currentNetworkStatus,
      accountData,
      faucetInfo,
      requestFaucet,
      isEvmDeposit,
    };
  },
  methods: {
    isConnected(networkStatus: string) {
      return networkStatus === 'connected';
    },
  },
});
</script>
