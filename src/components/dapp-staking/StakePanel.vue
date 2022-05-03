<template>
  <div>
    <div>
      <div v-if="stakeInfo" class="tw-mb-4">
        <div :style="{ opacity: stakeInfo?.hasStake ? '1' : '0' }" class="tw-flex tw-flex-row">
          <div class="tw-w-20">{{ $t('dappStaking.yourStake') }}</div>
          <div class="tw-font-semibold">{{ stakeInfo?.yourStake.formatted }}</div>
        </div>
        <div class="tw-flex tw-flex-row">
          <div class="tw-w-20">{{ $t('dappStaking.totalStake') }}</div>
          <div class="tw-font-semibold">{{ stakeInfo?.totalStake }}</div>
        </div>
        <div class="tw-mt-1 tw-flex tw-flex-row">
          <div class="tw-w-20">{{ $t('dappStaking.stakersCount') }}</div>
          <div class="tw-font-semibold">{{ stakeInfo?.stakersCount }}</div>
        </div>
      </div>
      <div class="tw-flex">
        <div v-if="stakeInfo?.hasStake">
          <Button :small="true" :primary="true" @click="showStakeModal">
            {{ $t('dappStaking.add') }}
          </Button>
          <Button
            v-if="!isEnableIndividualClaim"
            class="btn-unbond"
            :small="true"
            :primary="false"
            @click="showUnstakeModal"
          >
            {{ canUnbondWithdraw ? $t('dappStaking.unbond') : $t('dappStaking.unstake') }}
          </Button>
        </div>
        <Button
          v-else
          :small="true"
          :disabled="isMaxStaker || isH160 || currentAddress === null"
          @click="showStakeModal"
        >
          {{ $t('dappStaking.stake') }}
        </Button>

        <Button
          v-if="isEnableIndividualClaim && stakeInfo?.hasStake"
          :small="true"
          :primary="false"
          class="tw-ml-auto btn-unbond"
          @click="showUnstakeModal"
        >
          {{ canUnbondWithdraw ? $t('dappStaking.unbond') : $t('dappStaking.unstake') }}
        </Button>
        <Button
          v-if="!isEnableIndividualClaim"
          :small="true"
          :primary="true"
          :disabled="isH160 || currentAddress === null"
          class="tw-ml-auto"
          @click="showClaimRewardModal = true"
        >
          {{ $t('dappStaking.claim') }}
        </Button>
      </div>
    </div>

    <StakeModal
      v-if="showModal"
      v-model:isOpen="showModal"
      :dapp="dapp"
      :action="modalAction"
      :action-name="modalActionName"
      :title="modalTitle"
      :min-staking="formattedMinStake"
      :stake-amount="stakeInfo?.yourStake.denomAmount"
      :account-data="accountData"
    />
  </div>
</template>

<script lang="ts">
import { ISubmittableResult } from '@polkadot/types/types';
import { $api, $isEnableIndividualClaim } from 'boot/api';
import Button from 'components/common/Button.vue';
import StakeModal from 'components/dapp-staking/modals/StakeModal.vue';
import { useChainMetadata, useCustomSignature, useGetMinStaking } from 'src/hooks';
import * as plasmUtils from 'src/hooks/helper/plasmUtils';
import { signAndSend } from 'src/hooks/helper/wallet';
import { getAmount, StakeModel } from 'src/hooks/store';
import { useUnbondWithdraw } from 'src/hooks/useUnbondWithdraw';
import { useStore } from 'src/store';
import { hasExtrinsicFailedEvent } from 'src/modules/extrinsic';
import { getAddressEnum } from 'src/store/dapp-staking/actions';
import { computed, defineComponent, ref, toRefs, watchEffect } from 'vue';
import './stake-panel.scss';

export default defineComponent({
  components: {
    Button,
    StakeModal,
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
    stakeInfo: {
      type: Object,
      default: undefined,
    },
    isMaxStaker: {
      type: Boolean,
      default: false,
    },
    stakerMaxNumber: {
      type: Number,
      default: 0,
    },
    showStake: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['stakeChanged', 'stakeModalOpened'],
  setup(props, { emit }) {
    const store = useStore();
    const showModal = ref<boolean>(false);
    const showClaimRewardModal = ref<boolean>(false);
    const modalTitle = ref<string>('');
    const modalActionName = ref<string | ''>('');
    const formattedMinStake = ref<string>('');
    const modalAction = ref();
    const { minStaking } = useGetMinStaking($api);
    const { decimal } = useChainMetadata();
    const { canUnbondWithdraw } = useUnbondWithdraw($api);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const { dispatchError, isCustomSig, customMsg, handleCustomExtrinsic, handleTransactionError } =
      useCustomSignature({
        fn: () => {
          store.commit('dapps/setUnlockingChunks', -1);
        },
      });

    const currentAddress = computed(() => store.getters['general/selectedAddress']);
    const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);

    const showStakeModal = () => {
      modalTitle.value = `Stake on ${props.dapp.name}`;
      modalActionName.value = StakeAction.Stake;
      modalAction.value = stake;
      showModal.value = true;
      emit('stakeModalOpened');
    };

    const showUnstakeModal = () => {
      modalTitle.value = canUnbondWithdraw.value
        ? `Start unbonbonding from ${props.dapp.name}`
        : `Unstake from ${props.dapp.name}`;
      modalActionName.value = StakeAction.Unstake;
      modalAction.value = unstake;
      showModal.value = true;
      emit('stakeModalOpened');
    };

    watchEffect(() => {
      const minStakingAmount = plasmUtils.reduceBalanceToDenom(minStaking.value, decimal.value);
      const stakedAmount =
        props.stakeInfo?.yourStake.denomAmount &&
        plasmUtils.reduceBalanceToDenom(props.stakeInfo?.yourStake.denomAmount, decimal.value);

      formattedMinStake.value =
        Number(stakedAmount) >= Number(minStakingAmount) ? '0' : minStakingAmount;

      if (props.showStake) {
        showStakeModal();
      }
    });

    const emitStakeChanged = () => {
      emit('stakeChanged', props.dapp);
    };

    const stake = async (stakeData: StakeModel): Promise<void> => {
      const amount = getAmount(stakeData.amount, stakeData.unit);
      const unit = stakeData.unit;
      try {
        const apiRef = $api?.value;
        if (!apiRef) {
          throw Error('Cannot connect to the API');
        }
        const stakeAmount = plasmUtils.balanceFormatter(amount);
        const transaction = apiRef.tx.dappsStaking.bondAndStake(
          getAddressEnum(props.dapp.address),
          amount
        );

        if (props.stakeInfo) {
          const ttlStakeAmount = amount.add(props.stakeInfo.yourStake.denomAmount);
          if (ttlStakeAmount.lt(minStaking.value)) {
            store.dispatch('general/showAlertMsg', {
              msg: `The amount of token to be staking must greater than ${formattedMinStake.value} ${unit}`,
              alertType: 'error',
            });
            return;
          }
        } else {
          console.warn('No stakeInfo available. The store is unable to check some constraints.');
        }

        const msg = `You staked ${stakeAmount} on ${props.dapp.name}.`;
        customMsg.value = msg;

        const txResHandler = async (result: ISubmittableResult) => {
          if (result.status.isFinalized) {
            if (!hasExtrinsicFailedEvent(result.events, store.dispatch)) {
              store.dispatch('general/showAlertMsg', {
                msg,
                alertType: 'success',
              });
            }
            store.commit('general/setLoading', false);
          } else {
            store.commit('general/setLoading', true);
          }
        };

        await signAndSend({
          transaction,
          senderAddress: stakeData.address,
          substrateAccounts: substrateAccounts.value,
          isCustomSignature: isCustomSig.value,
          txResHandler,
          dispatchError,
          handleCustomExtrinsic,
          finalizeCallback: emitStakeChanged,
        }).catch((error: Error) => {
          handleTransactionError(error);
        });
      } catch (error) {
        console.error(error);
      } finally {
        showModal.value = false;
        store.commit('general/setLoading', false);
      }
    };

    const unstake = async (stakeData: StakeModel): Promise<void> => {
      const amount = getAmount(stakeData.amount, stakeData.unit);
      const unstakeAmount = plasmUtils.balanceFormatter(amount);
      const apiRef = $api.value;
      try {
        if (!apiRef) {
          throw Error('Cannot connect to the API');
        }
        const transaction = canUnbondWithdraw.value
          ? apiRef.tx.dappsStaking.unbondAndUnstake(getAddressEnum(props.dapp.address), amount)
          : apiRef.tx.dappsStaking.unbondUnstakeAndWithdraw(
              getAddressEnum(props.dapp.address),
              amount
            );

        const msg = `You unstaked ${unstakeAmount} on ${props.dapp.name}.`;
        customMsg.value = msg;

        const txResHandler = async (result: ISubmittableResult) => {
          if (result.status.isFinalized) {
            if (!hasExtrinsicFailedEvent(result.events, store.dispatch)) {
              store.commit('dapps/setUnlockingChunks', -1);
              store.dispatch('general/showAlertMsg', {
                msg,
                alertType: 'success',
              });
            }
            store.commit('general/setLoading', false);
          } else {
            store.commit('general/setLoading', true);
          }
        };

        await signAndSend({
          transaction,
          senderAddress: stakeData.address,
          substrateAccounts: substrateAccounts.value,
          isCustomSignature: isCustomSig.value,
          txResHandler,
          dispatchError,
          handleCustomExtrinsic,
          finalizeCallback: emitStakeChanged,
        }).catch((error: Error) => {
          handleTransactionError(error);
        });
      } catch (error) {
        console.error(error);
      } finally {
        store.commit('general/setLoading', false);
        showModal.value = false;
      }
    };

    return {
      ...toRefs(props),
      showModal,
      showClaimRewardModal,
      modalTitle,
      modalAction,
      modalActionName,
      showStakeModal,
      showUnstakeModal,
      formattedMinStake,
      unstake,
      canUnbondWithdraw,
      isH160,
      currentAddress,
      isEnableIndividualClaim: $isEnableIndividualClaim,
    };
  },
});

export enum StakeAction {
  Stake = 'Stake',
  Unstake = 'Start unbonding',
}
</script>

<style lang="scss" scoped>
.btn-unbond {
  background: lavender !important;
  border-color: silver;
  color: black;
}
.btn-unbond:hover {
  background: lightgray !important;
}
</style>
