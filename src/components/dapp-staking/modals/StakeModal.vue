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
          >{{ $t('dappStaking.modals.address') }}</label
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
        :max-in-default-unit="
          actionName === StakeAction.Unstake
            ? formatStakeAmount
            : accountData?.getUsableFeeBalance()
        "
        :is-max-button="actionName === StakeAction.Unstake ? true : false"
      />
      <div v-if="accountData && actionName !== StakeAction.Unstake" class="tw-mt-1 tw-ml-1">
        {{ $t('dappStaking.modals.availableToStake') }}
        <format-balance
          :balance="accountData?.getUsableFeeBalance()"
          class="tw-inline tw-font-semibold"
        />
      </div>
      <div v-if="accountData && actionName === StakeAction.Unstake" class="tw-mt-1 tw-ml-1">
        {{ $t('dappStaking.yourStake') }}
        <format-balance :balance="stakeAmount" class="tw-inline tw-font-semibold" />
      </div>
    </template>
    <template #buttons>
      <Button :disabled="!canExecuteAction" @click="action(data)">{{ actionName }}</Button>
    </template>
  </Modal>
</template>

<script lang="ts">
import BN from 'bn.js';
import FormatBalance from 'components/balance/FormatBalance.vue';
import ModalSelectAccount from 'components/balance/modals/ModalSelectAccount.vue';
import Modal from 'components/common/Modal.vue';
import Avatar from 'src/components/common/Avatar.vue';
import Button from 'src/components/common/Button.vue';
import InputAmount from 'src/components/common/InputAmount.vue';
import { useChainMetadata } from 'src/hooks';
import * as plasmUtils from 'src/hooks/helper/plasmUtils';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, toRefs } from 'vue';
import { StakeAction } from '../StakePanel.vue';
import { getAmount, StakeModel } from 'src/hooks/store';

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
    accountData: {
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
    minStaking: {
      type: String,
      required: true,
    },
    stakeAmount: {
      type: BN,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { decimal, defaultUnitToken } = useChainMetadata();

    const data = ref<StakeModel>({
      address: '',
      amount: props.actionName === StakeAction.Stake ? Number(props.minStaking) : 0,
      unit: defaultUnitToken.value,
      decimal: decimal.value,
    } as StakeModel);
    const allAccounts = computed(() => store.getters['general/allAccounts']);
    const allAccountNames = computed(() => store.getters['general/allAccountNames']);

    const formatStakeAmount = computed(() => {
      return plasmUtils.reduceBalanceToDenom(props.stakeAmount, decimal.value);
    });

    const canExecuteAction = computed(() => {
      if (data.value) {
        const amount = getAmount(data.value.amount, data.value.unit);
        const useableStakeAmount = props.accountData.getUsableFeeBalance();

        return props.actionName === StakeAction.Stake
          ? amount.lt(useableStakeAmount) && amount.gtn(0)
          : amount.lte(props.stakeAmount) && amount.gtn(0);
      } else {
        return false;
      }
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
      formatStakeAmount,
      reloadAmount,
      StakeAction,
      canExecuteAction,
      ...toRefs(props),
    };
  },
});
</script>
