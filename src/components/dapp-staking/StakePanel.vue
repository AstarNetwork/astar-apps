<template>
  <div>
    <div>
      <div
        v-if="stakeInfo"
        :class="stakeInfo.isRegistered || stakeInfo.hasStake ? 'tw-mb-4' : 'tw--mb-4'"
      >
        <div :style="{ opacity: stakeInfo?.hasStake ? '1' : '0' }" class="tw-flex tw-flex-row">
          <div class="tw-w-20">{{ $t('dappStaking.yourStake') }}</div>
          <div class="tw-font-semibold">{{ stakeInfo?.yourStake.formatted }}</div>
        </div>
        <template v-if="stakeInfo.isRegistered">
          <div class="tw-flex tw-flex-row">
            <div class="tw-w-20">{{ $t('dappStaking.totalStake') }}</div>
            <div class="tw-font-semibold">{{ stakeInfo.totalStake }}</div>
          </div>
          <div class="tw-mt-1 tw-flex tw-flex-row">
            <div class="tw-w-20">{{ $t('dappStaking.stakersCount') }}</div>
            <div class="tw-font-semibold">{{ stakeInfo.stakersCount }}</div>
          </div>
        </template>
      </div>

      <div v-if="!stakeInfo?.isRegistered && stakeInfo?.stakersCount > 0">
        <div>
          <span class="text--accent">
            {{ $t('dappStaking.projectUnregistered') }}
          </span>
        </div>
        <div v-if="stakeInfo?.hasStake">
          <span class="text--md">
            {{ $t('dappStaking.fundsWillBeUnstaked') }}
          </span>
        </div>
      </div>
      <div v-else class="tw-flex">
        <div>
          <div v-if="stakeInfo?.hasStake">
            <Button :small="true" :primary="true" @click="showStakeModal">
              {{ $t('dappStaking.add') }}
            </Button>
          </div>
          <Button
            v-else
            :small="true"
            :disabled="isMaxStaker || isH160 || !currentAddress"
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
      :selected-tip="selectedTip"
      :native-tip-price="nativeTipPrice"
      :set-selected-tip="setSelectedTip"
    />
  </div>
</template>

<script lang="ts">
import { ISubmittableResult } from '@polkadot/types/types';
import { container, cid } from 'inversify-props';
import { IDappStakingService } from 'src/v2/services';
import { $api } from 'boot/api';
import Button from 'components/common/Button.vue';
import StakeModal from 'components/dapp-staking/modals/StakeModal.vue';
import { ethers } from 'ethers';
import { useChainMetadata, useCustomSignature, useGasPrice, useGetMinStaking } from 'src/hooks';
import { TxType } from 'src/hooks/custom-signature/message';
import * as plasmUtils from 'src/hooks/helper/plasmUtils';
import { signAndSend } from 'src/hooks/helper/wallet';
import { getAmount, StakeModel } from 'src/hooks/store';
import { useUnbondWithdraw } from 'src/hooks/useUnbondWithdraw';
import { StakingData } from 'src/modules/dapp-staking';
import { useStore } from 'src/store';
import { getAddressEnum } from 'src/store/dapp-staking/actions';
import { computed, defineComponent, PropType, ref, toRefs, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
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
    stakingList: {
      type: Array as PropType<StakingData[]>,
      required: true,
    },
  },
  emits: ['stakeModalOpened'],
  setup(props, { emit }) {
    const store = useStore();
    const showModal = ref<boolean>(false);
    const modalTitle = ref<string>('');
    const modalActionName = ref<StakeAction | ''>('');
    const formattedMinStake = ref<string>('');
    const modalAction = ref<Function>();
    const { minStaking } = useGetMinStaking();
    const { decimal } = useChainMetadata();
    const { canUnbondWithdraw } = useUnbondWithdraw($api);
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const { t } = useI18n();
    const { selectedTip, nativeTipPrice, setSelectedTip } = useGasPrice();
    const { isCustomSig, customMsg, handleCustomExtrinsic, handleResult } = useCustomSignature({
      fn: () => {
        store.commit('dapps/setUnlockingChunks', -1);
      },
      txType: TxType.requiredClaim,
    });

    const currentAddress = computed(() => store.getters['general/selectedAddress']);
    const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);

    const showStakeModal = () => {
      modalTitle.value = t('dappStaking.modals.title.stakeOn', { dapp: props.dapp.name });
      modalActionName.value = StakeAction.Stake;
      modalAction.value = stake;
      showModal.value = true;
      emit('stakeModalOpened');
    };

    const showUnstakeModal = () => {
      modalTitle.value = canUnbondWithdraw.value
        ? t('dappStaking.modals.title.startUnbonding', { dapp: props.dapp.name })
        : t('dappStaking.modals.title.unStakeFrom', { dapp: props.dapp.name });
      modalActionName.value = StakeAction.Unstake;
      modalAction.value = unstake;
      showModal.value = true;
      emit('stakeModalOpened');
    };

    watchEffect(() => {
      const minStakingAmount = Number(ethers.utils.formatEther(minStaking.value).toString());
      const stakedAmount =
        props.stakeInfo?.yourStake.denomAmount &&
        plasmUtils.reduceBalanceToDenom(props.stakeInfo?.yourStake.denomAmount, decimal.value);

      formattedMinStake.value =
        Number(stakedAmount) >= Number(minStakingAmount) ? '0' : String(minStakingAmount);

      if (props.showStake) {
        showStakeModal();
      }
    });

    const stake = async (stakeData: StakeModel): Promise<void> => {
      const amount = getAmount(stakeData.amount, stakeData.unit);
      const unit = stakeData.unit;
      try {
        const stakeAmount = plasmUtils.balanceFormatter(amount);
        const transaction = $api!.tx.dappsStaking.bondAndStake(
          getAddressEnum(props.dapp.address),
          amount
        );
        if (props.stakeInfo) {
          const ttlStakeAmount = amount.add(props.stakeInfo.yourStake.denomAmount);
          if (Number(minStaking.value) > Number(ttlStakeAmount.toString())) {
            const msg = t('dappStaking.error.notEnoughMinAmount', {
              amount: formattedMinStake.value,
              symbol: unit,
            });
            store.dispatch('general/showAlertMsg', {
              msg,
              alertType: 'error',
            });
            return;
          }
        } else {
          console.warn('No stakeInfo available. The store is unable to check some constraints.');
        }

        const dappStakingService = container.get<IDappStakingService>(cid.IDappStakingService);
        await dappStakingService.stake(
          props.dapp.address,
          '5DUCu1DL27kB8WViDKogZnezzECcTamY7RWjFBNP2SBJXzwS',
          amount
        );

        // const txResHandler = async (result: ISubmittableResult): Promise<boolean> => {
        //   customMsg.value = t('dappStaking.toast.staked', {
        //     amount: stakeAmount,
        //     dapp: props.dapp.name,
        //   });
        //   return await handleResult(result);
        // };

        // await signAndSend({
        //   transaction,
        //   senderAddress: stakeData.address,
        //   substrateAccounts: substrateAccounts.value,
        //   isCustomSignature: isCustomSig.value,
        //   txResHandler,
        //   handleCustomExtrinsic,
        //   dispatch: store.dispatch,
        //   tip: selectedTip.value.price,
        // });
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
      try {
        const transaction = canUnbondWithdraw.value
          ? $api!.tx.dappsStaking.unbondAndUnstake(getAddressEnum(props.dapp.address), amount)
          : $api!.tx.dappsStaking.unbondUnstakeAndWithdraw(
              getAddressEnum(props.dapp.address),
              amount
            );

        const txResHandler = async (result: ISubmittableResult): Promise<boolean> => {
          customMsg.value = t('dappStaking.toast.unstaked', {
            amount: unstakeAmount,
            dapp: props.dapp.name,
          });
          return await handleResult(result);
        };

        await signAndSend({
          transaction,
          senderAddress: stakeData.address,
          substrateAccounts: substrateAccounts.value,
          isCustomSignature: isCustomSig.value,
          txResHandler,
          handleCustomExtrinsic,
          dispatch: store.dispatch,
          tip: selectedTip.value.price,
        });
      } catch (error) {
        console.error(error);
      } finally {
        store.commit('general/setLoading', false);
        showModal.value = false;
      }
    };

    const finalizeCallback = () => {
      showModal.value = false;
    };

    return {
      ...toRefs(props),
      showModal,
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
      finalizeCallback,
      selectedTip,
      nativeTipPrice,
      setSelectedTip,
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
