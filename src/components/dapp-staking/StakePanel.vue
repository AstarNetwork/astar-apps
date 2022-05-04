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
        <div>
          <div v-if="stakeInfo?.hasStake">
            <Button :small="true" :primary="true" @click="showStakeModal">
              {{ $t('dappStaking.add') }}
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
        </div>

        <Button
          v-if="stakeInfo?.hasStake"
          :small="true"
          :primary="false"
          class="tw-ml-auto btn-unbond"
          @click="showUnstakeModal"
        >
          {{ canUnbondWithdraw ? $t('dappStaking.unbond') : $t('dappStaking.unstake') }}
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
      :staking-list="stakingList"
      :finalize-callback="finalizeCallback"
    />

    <ClaimRewardModal
      v-if="dapp && showClaimRewardModal"
      v-model:isOpen="showClaimRewardModal"
      :dapp="dapp"
      :stake-info="stakeInfo"
      :claim-action="claim"
    />
  </div>
</template>

<script lang="ts">
import { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { formatBalance } from '@polkadot/util';
import { $api } from 'boot/api';
import Button from 'components/common/Button.vue';
import ClaimRewardModal from 'components/dapp-staking/modals/ClaimRewardModal.vue';
import StakeModal from 'components/dapp-staking/modals/StakeModal.vue';
import { useChainMetadata, useCustomSignature, useGetMinStaking } from 'src/hooks';
import * as plasmUtils from 'src/hooks/helper/plasmUtils';
import { getAmount, StakeModel } from 'src/hooks/store';
import { useUnbondWithdraw } from 'src/hooks/useUnbondWithdraw';
import { StakingData } from 'src/modules/dapp-staking';
import { useStore } from 'src/store';
import { ClaimParameters, getAddressEnum, StakingParameters } from 'src/store/dapp-staking/actions';
import { computed, defineComponent, PropType, ref, toRefs, watchEffect } from 'vue';
import './stake-panel.scss';

export default defineComponent({
  components: {
    Button,
    StakeModal,
    ClaimRewardModal,
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
    stakingList: {
      type: Array as PropType<StakingData[]>,
      required: true,
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
    const { callFunc, dispatchError, isCustomSig, customMsg } = useCustomSignature({
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

      const stakeCustomExtrinsic = async () => {
        try {
          const balance = formatBalance(amount, {
            withSi: true,
            decimals: stakeData.decimal,
            withUnit: unit,
          });
          customMsg.value = `You staked ${balance} on ${props.dapp.name}.`;
          const fn: SubmittableExtrinsicFunction<'promise'> | undefined =
            $api?.value?.tx.dappsStaking.bondAndStake;
          const method: SubmittableExtrinsic<'promise'> | undefined =
            fn && fn(getAddressEnum(props.dapp.address), amount);

          method && (await callFunc(method));
          emitStakeChanged();
        } catch (e) {
          dispatchError((e as Error).message);
        }
      };

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

      if (isCustomSig.value) {
        await stakeCustomExtrinsic();
        showModal.value = false;
      } else {
        const result = await store.dispatch('dapps/stake', {
          api: $api?.value,
          senderAddress: stakeData.address,
          dapp: props.dapp,
          amount,
          decimals: stakeData.decimal,
          unit,
          finalizeCallback: emitStakeChanged,
          substrateAccounts: substrateAccounts.value,
        } as StakingParameters);

        if (result) {
          showModal.value = false;
        }
      }
    };

    const unstake = async (stakeData: StakeModel): Promise<void> => {
      const dispatchCommand = canUnbondWithdraw.value ? 'dapps/unbond' : 'dapps/unstake';
      const amount = getAmount(stakeData.amount, stakeData.unit);

      const unstakeCustomExtrinsic = async () => {
        try {
          const balance = formatBalance(amount, {
            withSi: true,
            decimals: stakeData.decimal,
            withUnit: stakeData.unit,
          });
          customMsg.value = `You unstaked ${balance} on ${props.dapp.name}.`;
          const fn: SubmittableExtrinsicFunction<'promise'> | undefined = canUnbondWithdraw.value
            ? $api?.value?.tx.dappsStaking.unbondAndUnstake
            : $api?.value?.tx.dappsStaking.unbondUnstakeAndWithdraw;
          const method: SubmittableExtrinsic<'promise'> | undefined =
            fn && fn(getAddressEnum(props.dapp.address), amount);

          method && (await callFunc(method));
          emitStakeChanged();
        } catch (e) {
          dispatchError((e as Error).message);
        }
      };

      if (isCustomSig.value) {
        await unstakeCustomExtrinsic();
        showModal.value = false;
      } else {
        const result = await store.dispatch(dispatchCommand, {
          api: $api?.value,
          senderAddress: stakeData.address,
          dapp: props.dapp,
          amount,
          decimals: stakeData.decimal,
          unit: stakeData.unit,
          finalizeCallback: emitStakeChanged,
          substrateAccounts: substrateAccounts.value,
        } as StakingParameters);

        if (result) {
          showModal.value = false;
        }
      }
    };

    const claim = async (unclaimedEras: number[], claimFinishedCallback: () => void) => {
      // TODO maybe to add select address option to modal as in stake/unstake
      const senderAddress = store.getters['general/selectedAddress'];

      const claimCustomExtrinsic = async () => {
        const erasToClaim = unclaimedEras;
        if (erasToClaim.length === 0) {
          store.dispatch(
            'general/showAlertMsg',
            {
              msg: 'All rewards have been already claimed.',
              alertType: 'warning',
            },
            { root: true }
          );

          return true;
        }

        try {
          const transactions = [];
          for (let era of erasToClaim) {
            transactions.push(
              $api?.value?.tx.dappsStaking.claim(getAddressEnum(props.dapp.address), era)
            );
          }

          customMsg.value = 'All rewards have been already claimed.';
          const fn: SubmittableExtrinsicFunction<'promise'> | undefined =
            $api?.value?.tx.utility.batch;
          const method: SubmittableExtrinsic<'promise'> | undefined = fn && fn(transactions);

          method && (await callFunc(method));
          emitStakeChanged();
        } catch (e) {
          dispatchError((e as Error).message);
        }
      };

      if (isCustomSig.value) {
        await claimCustomExtrinsic();
      } else {
        await store.dispatch('dapps/claimBatch', {
          api: $api?.value,
          senderAddress,
          dapp: props.dapp,
          substrateAccounts: substrateAccounts.value,
          finalizeCallback: function () {
            emitStakeChanged();
            claimFinishedCallback();
          },
          unclaimedEras,
        } as ClaimParameters);
      }
    };

    const finalizeCallback = () => {
      emitStakeChanged();
      showModal.value = false;
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
      claim,
      formattedMinStake,
      unstake,
      canUnbondWithdraw,
      isH160,
      currentAddress,
      finalizeCallback,
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
