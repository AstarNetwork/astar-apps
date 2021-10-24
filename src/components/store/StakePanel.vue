<template>
  <div>
    <div>
      <div v-if="stakeInfo" class="tw-mb-4">
        {{ $t('store.totalStake') }}
        <span class="tw-font-semibold">{{ stakeInfo?.totalStake }}</span>
        <div :style="{ opacity: stakeInfo?.hasStake ? '1' : '0' }">
          {{ $t('store.yourStake') }}
          <span class="tw-font-semibold">{{ stakeInfo?.yourStake }}</span>
        </div>
      </div>
      <div class="tw-flex">
        <div v-if="stakeInfo?.hasStake">
          <Button :small="true" @click="showStakeModal">
            {{ $t('store.add') }}
          </Button>
          <Button :small="true" :primary="false" @click="showUnstakeModal">
            {{ $t('store.unstake') }}
          </Button>
        </div>
        <Button v-else :small="true" @click="showStakeModal">
          {{ $t('store.stake') }}
        </Button>

        <Button
          :small="true"
          :primary="false"
          class="tw-ml-auto"
          @click="showClaimRewardModal = true"
        >
          {{ $t('store.claim') }}
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
    />

    <ClaimRewardModal
      v-if="stakeInfo && dapp && showClaimRewardModal"
      v-model:isOpen="showClaimRewardModal"
      :dapp="dapp"
      :stake-info="stakeInfo"
      :claim-action="claim"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue';
import BN from 'bn.js';
import Web3 from 'web3';
import Button from 'components/common/Button.vue';
import StakeModal, { StakeModel } from 'components/store/modals/StakeModal.vue';
import ClaimRewardModal from 'components/store/modals/ClaimRewardModal.vue';
import { useStore } from 'src/store';
import { useApi, useGetMinStaking } from 'src/hooks';
import { getUnit } from 'src/hooks/helper/units';
import { reduceDenomToBalance } from 'src/hooks/helper/plasmUtils';
import { StakingParameters } from 'src/store/dapps-store/actions';

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
    stakeInfo: {
      type: Object,
      default: undefined,
    },
  },
  emits: ['stakeChanged'],
  setup(props, { emit }) {
    const store = useStore();
    const { api } = useApi();
    const showModal = ref<boolean>(false);
    const showClaimRewardModal = ref<boolean>(false);
    const modalTitle = ref<string>('');
    const modalActionName = ref<string>('');
    const modalAction = ref();
    const { minStaking } = useGetMinStaking(api);

    const showStakeModal = () => {
      modalTitle.value = `Stake on ${props.dapp.name}`;
      modalActionName.value = 'Stake';
      modalAction.value = stake;
      showModal.value = true;
    };

    const showUnstakeModal = () => {
      modalTitle.value = `Unstake from ${props.dapp.name}`;
      modalActionName.value = 'Unstake';
      modalAction.value = unstake;
      showModal.value = true;
    };

    const emitStakeChanged = () => {
      emit('stakeChanged', props.dapp);
    };

    // TODO refactor since very similar code is in ModalTransferAmount, maybe to move this logic into InputAmount component
    const getAmount = (stakeData: StakeModel): BN => {
      const unit = getUnit(stakeData.unit);
      const amount = reduceDenomToBalance(stakeData.amount, unit, stakeData.decimal);

      console.log('getAmount', stakeData, unit, stakeData.decimal, amount.toString());
      return amount;
    };

    const stake = async (stakeData: StakeModel) => {
      const web3 = new Web3();
      const amount = getAmount(stakeData);
      const unit = stakeData.unit;
      const formattedMinStake = web3.utils.fromWei(minStaking.value.toString());

      if (amount.lt(minStaking.value)) {
        store.dispatch('general/showAlertMsg', {
          msg: `The amount of token to be staking must greater than ${formattedMinStake} ${unit}`,
          alertType: 'error',
        });
        return;
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
        amount: getAmount(stakeData),
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
    };
  },
});
</script>
