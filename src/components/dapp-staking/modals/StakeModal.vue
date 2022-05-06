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
      <div v-if="isEnableNominationTransfer && actionName === StakeAction.Stake" class="tw-mb-4">
        <label
          class="
            tw-block tw-text-sm tw-font-medium tw-text-gray-500
            dark:tw-text-darkGray-400
            tw-mb-2
          "
          >{{ $t('dappStaking.modals.fundsFrom') }}</label
        >
        <ModalNominationTransfer
          :staking-list="stakingList"
          :formatted-transfer-from="formattedTransferFrom"
          :current-account="currentAccount"
          :set-address-transfer-from="setAddressTransferFrom"
          :dapp-address="dapp.address"
        />
      </div>
      <div class="container--amount">
        <InputAmount
          v-model:amount="data.amount"
          v-model:selectedUnit="data.unit"
          title="Amount"
          :max-in-default-unit="maxAmount"
          :is-max-button="isMaxButton"
        />
        <div class="box--information">
          <div v-if="accountData && actionName === StakeAction.Stake" class="tw-mt-1 tw-ml-1">
            {{ $t('dappStaking.modals.availableToStake') }}
            <format-balance
              :balance="accountData?.getUsableFeeBalance()"
              class="tw-inline tw-font-semibold"
            />
          </div>
          <div v-if="actionName === StakeAction.Stake" class="box__row--err-msg">
            <span>{{ errMsg }}</span>
          </div>
        </div>
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

        <Button
          v-if="isEnableNominationTransfer && formattedTransferFrom.isNominationTransfer"
          :disabled="
            isDisabledNominationTransfer({
              amount: Number(data.amount),
              stakedAmount: stakeAmount ? Number(stakeAmount) : 0,
            })
          "
          @click="handleNominationTransfer({ amount: data.amount, targetContractId: dapp.address })"
          >{{ actionName }}</Button
        >
        <Button v-else :disabled="!canExecuteAction" @click="action(data)">{{ actionName }}</Button>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import BN from 'bn.js';
import FormatBalance from 'components/common/FormatBalance.vue';
import ModalSelectAccount from 'components/common/ModalSelectAccount.vue';
import Modal from 'components/common/Modal.vue';
import Avatar from 'src/components/common/Avatar.vue';
import Button from 'src/components/common/Button.vue';
import InputAmount from 'src/components/common/InputAmount.vue';
import { useChainMetadata, useNominationTransfer, useUnbondWithdraw } from 'src/hooks';
import { $api } from 'boot/api';
import * as plasmUtils from 'src/hooks/helper/plasmUtils';
import { getAmount, StakeModel } from 'src/hooks/store';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, toRefs, PropType } from 'vue';
import { StakeAction } from '../StakePanel.vue';
import ModalNominationTransfer from 'src/components/dapp-staking/modals/ModalNominationTransfer.vue';
import { StakingData } from 'src/modules/dapp-staking';
import { ethers } from 'ethers';
import { useI18n } from 'vue-i18n';

export enum Role {
  FromAddress = 'FromAddress',
  ToAddress = 'ToAddress',
}

export default defineComponent({
  components: {
    Modal,
    ModalSelectAccount,
    InputAmount,
    Button,
    Avatar,
    FormatBalance,
    ModalNominationTransfer,
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
    finalizeCallback: {
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
    stakingList: {
      type: Array as PropType<StakingData[]>,
      required: true,
    },
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const store = useStore();
    const { decimal, defaultUnitToken } = useChainMetadata();
    const {
      setAddressTransferFrom,
      formattedTransferFrom,
      addressTransferFrom,
      currentAccount,
      formattedMinStaking,
      nativeTokenSymbol,
      isEnableNominationTransfer,
      nominationTransfer,
      isDisabledNominationTransfer,
    } = useNominationTransfer({ stakingList: props.stakingList });
    const { t } = useI18n();

    const handleNominationTransfer = async ({
      amount,
      targetContractId,
    }: {
      amount: string;
      targetContractId: string;
    }) => {
      try {
        await nominationTransfer({ amount, targetContractId });
        props.finalizeCallback();
      } catch (error) {
        console.error(error);
      }
    };

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
      if (data.value) {
        const amount = getAmount(data.value.amount, data.value.unit);
        const useableStakeAmount = props.accountData.getUsableFeeBalance();

        let canExecute =
          props.actionName === StakeAction.Stake
            ? amount.lt(useableStakeAmount) && amount.gtn(0)
            : amount.lte(props.stakeAmount) && amount.gtn(0);

        if (canUnbondWithdraw.value) {
          canExecute = canExecute && !(props.actionName === StakeAction.Unstake && isMaxChunks);
        }

        return canExecute;
      } else {
        return false;
      }
    });

    const errMsg = computed(() => {
      const stakedAmount = props.stakeAmount ? Number(props.stakeAmount) : 0;
      const inputAmount = Number(data.value.amount);
      const stakingAmount = inputAmount + stakedAmount;
      const isNotEnoughMinAmount = formattedMinStaking.value > stakingAmount;

      if (isNotEnoughMinAmount) {
        return t('dappStaking.error.notEnoughMinAmount', {
          amount: formattedMinStaking.value,
          symbol: nativeTokenSymbol.value,
        });
      }

      if (isEnableNominationTransfer.value) {
        const isNominationTransfer = formattedTransferFrom.value?.isNominationTransfer;
        if (isNominationTransfer) {
          const balTransferFrom = Number(
            ethers.utils.formatEther(formattedTransferFrom.value.item.balance.toString())
          );
          const targetBalAfterTransfer = balTransferFrom - inputAmount;
          if (inputAmount >= balTransferFrom) {
            return '';
          } else if (formattedMinStaking.value > targetBalAfterTransfer) {
            return t('dappStaking.error.allFundsWillBeTransferred', {
              minStakingAmount: formattedMinStaking.value,
              symbol: nativeTokenSymbol.value,
            });
          }
        }
      }
      return '';
    });

    const nominationTransferMaxAmount = computed(() => {
      return formattedTransferFrom.value
        ? Number(ethers.utils.formatEther(formattedTransferFrom.value.item.balance.toString()))
        : 0;
    });

    const isMaxButton = computed(() => {
      const isNominationTransferMax =
        isEnableNominationTransfer.value &&
        formattedTransferFrom.value &&
        formattedTransferFrom.value.isNominationTransfer;
      return props.actionName === StakeAction.Unstake || isNominationTransferMax;
    });

    const maxAmount = computed(() => {
      if (props.actionName === StakeAction.Unstake) {
        return formatStakeAmount;
      }

      if (
        isEnableNominationTransfer.value &&
        formattedTransferFrom.value &&
        formattedTransferFrom.value.isNominationTransfer
      ) {
        return nominationTransferMaxAmount.value;
      }

      return 0;
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
      formattedTransferFrom,
      setAddressTransferFrom,
      currentAccount,
      addressTransferFrom,
      handleNominationTransfer,
      isDisabledNominationTransfer,
      nominationTransferMaxAmount,
      isEnableNominationTransfer: isEnableNominationTransfer.value,
      errMsg,
      isMaxButton,
      maxAmount,
      ...toRefs(props),
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.container--amount {
  position: relative;
}

.box--information {
  position: relative;
}

.box__row--err-msg {
  position: absolute;
  color: $warning-red;
  margin-top: 1px;
  font-size: 12.4px;
}
</style>
