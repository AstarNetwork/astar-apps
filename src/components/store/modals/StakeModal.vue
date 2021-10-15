<template>
  <Modal :title="title">
    <template #content>
      <Avatar :url="dapp.iconUrl" class="tw-w-36 tw-h-36 tw-mb-4 tw-mx-auto" />
      <div class="tw-mb-4">
        <label
          class="
            tw-block tw-text-sm tw-font-medium tw-text-gray-500
            dark:tw-text-darkGray-400
            tw-mb-2
          "
          >{{ $t('store.modals.address') }}</label
        >
        <ModalSelectAccount
          v-model:selAddress="data.address"
          :all-accounts="allAccounts"
          :all-account-names="allAccountNames"
          @sel-changed="reloadAmount"
        />
      </div>
      <InputAmount
        v-model:amount="data.amount"
        v-model:selectedUnit="data.unit"
        title="Amount"
        :max-in-default-unit="formatBalance"
      />
      <div class="tw-mt-1 tw-ml-1">
        {{ $t('balance.transferable') }}
        <format-balance
          :balance="accountData?.getUsableTransactionBalance()"
          class="tw-inline tw-font-semibold"
        />
      </div>
    </template>
    <template #buttons>
      <Button :disabled="data.amount <= 0" @click="action(data)">{{ actionName }}</Button>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, computed, ref, toRefs } from 'vue';
import { useStore } from 'src/store';
import { useChainMetadata } from 'src/hooks';
import Modal from 'components/common/Modal.vue';
import ModalSelectAccount from 'components/balance/modals/ModalSelectAccount.vue';
import InputAmount from 'src/components/common/InputAmount.vue';
import Button from 'src/components/common/Button.vue';
import Avatar from 'src/components/common/Avatar.vue';
import * as plasmUtils from 'src/hooks/helper/plasmUtils';
import { useBalance, useApi, useAccount } from 'src/hooks';
import FormatBalance from 'components/balance/FormatBalance.vue';

export default defineComponent({
  components: {
    Modal,
    ModalSelectAccount,
    InputAmount,
    Button,
    Avatar,
    FormatBalance,
  },
  props: {
    dapp: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    action: {
      type: Function,
      required: true,
    },
    actionName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { decimal, defaultUnitToken } = useChainMetadata();

    const data = ref<StakeModel>({
      address: '',
      amount: 0,
      unit: defaultUnitToken.value,
      decimal: decimal.value,
    } as StakeModel);
    const allAccounts = computed(() => store.getters['general/allAccounts']);
    const allAccountNames = computed(() => store.getters['general/allAccountNames']);

    const { currentAccount } = useAccount();
    const { api } = useApi();
    const { accountData } = useBalance(api, currentAccount);

    const formatBalance = computed(() => {
      const tokenDecimal = decimal.value;
      return plasmUtils.reduceBalanceToDenom(
        accountData!.value!.getUsableTransactionBalance(),
        tokenDecimal
      );
    });

    const reloadAmount = (
      address: string,
      isMetamaskChecked: boolean,
      selAccountIdx: number
    ): void => {
      store.commit('general/setIsCheckMetamask', isMetamaskChecked);
      store.commit('general/setCurrentAccountIdx', selAccountIdx);
    };

    return {
      data,
      allAccounts,
      allAccountNames,
      formatBalance,
      reloadAmount,
      accountData,
      ...toRefs(props),
    };
  },
});

export interface StakeModel {
  address: string;
  amount: number;
  unit: string;
  decimal: number;
}
</script>
