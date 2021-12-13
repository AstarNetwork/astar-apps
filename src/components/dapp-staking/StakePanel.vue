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
        <div class="tw-mt-1">
          <div class="tw-w-20">{{ $t('dappStaking.stakersCount') }}</div>
          <div class="tw-relative">
            <VueJsProgress
              :percentage="Number(((stakeInfo?.stakersCount / stakerMaxNumber) * 100).toFixed(0))"
              :bg="stakeInfo?.stakersCount === stakerMaxNumber ? 'pinkglamour' : 'turquoise'"
              :delay="600"
              :striped="!isMaxStaker"
              :animation="!isMaxStaker"
            />
            <div class="tw-absolute tw-bottom-0 tw-w-full tw-text-white tw-font-semibold">
              <div class="tw-flex tw-justify-center">
                {{ stakeInfo?.stakersCount.toLocaleString('en-US') }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="tw-flex">
        <div v-if="stakeInfo?.hasStake">
          <Button :small="true" :primary="true" @click="showStakeModal">
            {{ $t('dappStaking.add') }}
          </Button>
          <Button :small="true" :primary="false" @click="showUnstakeModal">
            {{ $t('dappStaking.unstake') }}
          </Button>
        </div>
        <Button v-else :small="true" :disabled="isMaxStaker" @click="showStakeModal">
          {{ $t('dappStaking.stake') }}
        </Button>

        <Button
          :small="true"
          :primary="true"
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
import { defineComponent, ref, toRefs, watchEffect } from 'vue';
import StakeModal from 'components/dapp-staking/modals/StakeModal.vue';
import { StakeModel } from 'src/hooks/store';
import Button from 'components/common/Button.vue';
import ClaimRewardModal from 'components/dapp-staking/modals/ClaimRewardModal.vue';
import { useApi, useChainMetadata, useGetMinStaking } from 'src/hooks';
import * as plasmUtils from 'src/hooks/helper/plasmUtils';
import { useStore } from 'src/store';
import { StakingParameters } from 'src/store/dapp-staking/actions';
import { getAmount } from 'src/hooks/store';
import VueJsProgress from 'vue-js-progress';
import './stake-panel.scss';

export default defineComponent({
  components: {
    Button,
    StakeModal,
    ClaimRewardModal,
    VueJsProgress,
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
  },
  emits: ['stakeChanged'],
  setup(props, { emit }) {
    const store = useStore();
    const { api } = useApi();
    const showModal = ref<boolean>(false);
    const showClaimRewardModal = ref<boolean>(false);
    const modalTitle = ref<string>('');
    const modalActionName = ref<StakeAction | ''>('');
    const formattedMinStake = ref<string>('');
    const modalAction = ref();
    const { minStaking } = useGetMinStaking(api);
    const { decimal } = useChainMetadata();

    watchEffect(() => {
      const minStakingAmount = plasmUtils.reduceBalanceToDenom(minStaking.value, decimal.value);
      const stakedAmount =
        props.stakeInfo?.yourStake.denomAmount &&
        plasmUtils.reduceBalanceToDenom(props.stakeInfo?.yourStake.denomAmount, decimal.value);

      formattedMinStake.value =
        Number(stakedAmount) >= Number(minStakingAmount) ? '0' : minStakingAmount;
    });

    const showStakeModal = () => {
      modalTitle.value = `Stake on ${props.dapp.name}`;
      modalActionName.value = StakeAction.Stake;
      modalAction.value = stake;
      showModal.value = true;
    };

    const showUnstakeModal = () => {
      modalTitle.value = `Unstake from ${props.dapp.name}`;
      modalActionName.value = StakeAction.Unstake;
      modalAction.value = unstake;
      showModal.value = true;
    };

    const emitStakeChanged = () => {
      emit('stakeChanged', props.dapp);
    };

    const stake = async (stakeData: StakeModel) => {
      const amount = getAmount(stakeData.amount, stakeData.unit);
      const unit = stakeData.unit;

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

      const result = await store.dispatch('dapps/stake', {
        api: api?.value,
        senderAddress: stakeData.address,
        dapp: props.dapp,
        amount,
        decimals: stakeData.decimal,
        unit,
        finalizeCallback: emitStakeChanged,
      } as StakingParameters);

      if (result) {
        showModal.value = false;
      }
    };

    const unstake = async (stakeData: StakeModel) => {
      const result = await store.dispatch('dapps/unstake', {
        api: api?.value,
        senderAddress: stakeData.address,
        dapp: props.dapp,
        amount: getAmount(stakeData.amount, stakeData.unit),
        decimals: stakeData.decimal,
        unit: stakeData.unit,
        finalizeCallback: emitStakeChanged,
      } as StakingParameters);

      if (result) {
        showModal.value = false;
      }
    };

    const claim = async () => {
      // TODO maybe to add select address option to modal as in stake/unstake
      const senderAddress = store.getters['general/selectedAccountAddress'];
      const result = await store.dispatch('dapps/claimBatch', {
        api: api?.value,
        senderAddress,
        dapp: props.dapp,
        finalizeCallback: emitStakeChanged,
      } as StakingParameters);

      if (result) {
        showClaimRewardModal.value = false;
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
      claim,
      formattedMinStake,
    };
  },
});

export enum StakeAction {
  Stake = 'Stake',
  Unstake = 'Unstake',
}
</script>
