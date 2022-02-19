<template>
  <Modal :title="title" @click="closeModal">
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
        <modal-select-account
          v-model:selAddress="data.address"
          :role="Role.FromAddress"
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
      <div v-if="accountData && actionName === StakeAction.Stake" class="tw-mt-1 tw-ml-1">
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
      <div v-if="actionName === StakeAction.Unstake && canUnbondWithdraw" class="tw-mt-4 tw-ml-1">
        {{ $t('dappStaking.modals.unbondingInfo', { era: unbondingPeriod }) }}
      </div>
      <div
        v-if="isMaxChunks && actionName === StakeAction.Unstake && canUnbondWithdraw"
        class="tw-mt-1 tw-ml-1 tw-text-red-700"
      >
        {{ $t('dappStaking.maxChunksWarning', { chunks: maxUnlockingChunks }) }}
      </div>
      <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row">
        <Button type="button" :primary="false" @click="closeModal">{{ $t('close') }}</Button>
        <Button :disabled="!canExecuteAction" @click="action(data)">{{ actionName }}</Button>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import BN from 'bn.js';
import FormatBalance from 'components/balance/FormatBalance.vue';
import ModalSelectAccount from 'components/balance/modals/ModalSelectAccount.vue';
import Modal from 'components/common/Modal.vue';
import { Role } from 'src/components/balance/modals/ModalTransferAmount.vue';
import Avatar from 'src/components/common/Avatar.vue';
import Button from 'src/components/common/Button.vue';
import InputAmount from 'src/components/common/InputAmount.vue';
import { useAccount, useBalance } from 'src/hooks';
import { useChainMetadata, useUnbondWithdraw } from 'src/hooks';
import { $api } from 'boot/api';
import * as plasmUtils from 'src/hooks/helper/plasmUtils';
import { getAmount, StakeModel } from 'src/hooks/store';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, toRefs } from 'vue';
import { StakeAction } from '../StakePanel.vue';

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
    minStaking: {
      type: String,
      required: true,
    },
    stakeAmount: {
      type: BN,
      required: true,
    },
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const store = useStore();
    const { decimal, defaultUnitToken } = useChainMetadata();

    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);

    const data = ref<StakeModel>({
      address: '',
      amount: props.actionName === StakeAction.Stake ? Number(props.minStaking) : 0,
      unit: defaultUnitToken.value,
      decimal: decimal.value,
    } as StakeModel);
    const maxUnlockingChunks = computed<number>(() => store.getters['dapps/getMaxUnlockingChunks']);
    const unlockingChunks = computed<number>(() => store.getters['dapps/getUnlockingChunks']);
    const unbondingPeriod = computed(() => store.getters['dapps/getUnbondingPeriod']);
    const isMaxChunks = unlockingChunks.value >= maxUnlockingChunks.value;
    const { canUnbondWithdraw } = useUnbondWithdraw($api);

    const formatStakeAmount = computed(() => {
      return plasmUtils.reduceBalanceToDenom(props.stakeAmount, decimal.value);
    });

    const canExecuteAction = computed(() => {
      if (data.value && accountData.value) {
        const amount = getAmount(data.value.amount, data.value.unit);
        const usableStakeAmount = accountData.value.getUsableFeeBalance();

        let canExecute =
          props.actionName === StakeAction.Stake
            ? amount.lt(usableStakeAmount) && amount.gtn(0)
            : amount.lte(props.stakeAmount) && amount.gtn(0);

        if (canUnbondWithdraw.value) {
          canExecute = canExecute && !(props.actionName === StakeAction.Unstake && isMaxChunks);
        }

        return canExecute;
      } else {
        return false;
      }
    });

    const reloadAmount = (address: string): void => {
      store.commit('general/setCurrentAddress', address);
    };

    const closeModal = () => {
      emit('update:is-open', false);
    };

    return {
      data,
      formatStakeAmount,
      reloadAmount,
      StakeAction,
      canExecuteAction,
      isMaxChunks,
      maxUnlockingChunks,
      unbondingPeriod,
      canUnbondWithdraw,
      closeModal,
      Role,
      ...toRefs(props),
    };
  },
});
</script>
