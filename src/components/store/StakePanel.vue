<template>
  <div>
    <div v-if="stakeInfo" class="tw-mb-4">
      {{ $t('store.totalStake') }} <span class="tw-font-semibold">{{ stakeInfo?.totalStake }}</span>
      <div :style="{opacity: stakeInfo?.hasStake ? '1' : '0'}">
          {{ $t('store.yourStake') }}  <span class="tw-font-semibold">{{ stakeInfo?.yourStake }}</span>
      </div>
    </div>
    <div class="tw-flex">
      <div v-if="stakeInfo?.hasStake">
        <Button @click="showStakeModal" :small="true">
          {{ $t('store.add') }}
        </Button>
        <Button @click="showUnstakeModal" :small="true" :primary="false">
          {{ $t('store.unstake') }}
        </Button>
      </div>
      <Button v-else @click="showStakeModal" :small="true">
        {{ $t('store.stake') }}
      </Button>

      <Button
        v-if="stakeInfo?.hasStake"
        :small="true"
        :primary="false"
        class="tw-ml-auto"
        @click="showClaimRewardModal=true">
        {{ $t('store.claim') }}
      </Button>
    </div>
  </div>

  <StakeModal
    v-if="showModal"
    v-model:isOpen="showModal"
    :dapp="dapp"
    :action="modalAction"
    :actionName="modalActionName"
    :title="modalTitle"
  />

  <ClaimRewardModal
    v-if="showClaimRewardModal"
    v-model:isOpen="showClaimRewardModal"
    :dapp="dapp"
    :stakeInfo="stakeInfo"
    :claimAction="claim"
  />
</template>

<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue'
import BN from 'bn.js';
import Button from 'components/common/Button.vue';
import StakeModal, { StakeModel } from 'components/store/modals/StakeModal.vue';
import ClaimRewardModal from 'components/store/modals/ClaimRewardModal.vue';
import { useStore } from 'src/store';
import { useApi } from 'src/hooks';
import { getUnit } from 'src/hooks/helper/units';
import { reduceDenomToBalance } from 'src/hooks/helper/plasmUtils';
import { StakingParameters } from 'src/store/dapps-store/actions';

export default defineComponent({
  components: {
    Button,
    StakeModal,
    ClaimRewardModal
  },
  emits: ['stakeChanged'],
  props: {
    dapp: {
      type: Object,
      required: true
    },
    stakeInfo: {
      type: Object,
      default: undefined
    }
  },
  setup(props, { emit }) {
    const store = useStore();
    const { api } = useApi();
    const showModal = ref<boolean>(false);
    const showClaimRewardModal = ref<boolean>(false);
    const modalTitle = ref<string>('');
    const modalActionName = ref<string>('');
    const modalAction = ref();

    const showStakeModal = () => {
      modalTitle.value = `Stake on ${props.dapp.name}`;
      modalActionName.value = 'Stake';
      modalAction.value = stake;
      showModal.value = true;
    }

    const showUnstakeModal = () => {
      modalTitle.value = `Unstake from ${props.dapp.name}`;
      modalActionName.value = 'Unstake';
      modalAction.value = unstake;
      showModal.value = true;
    }

    const emitStakeChanged = () => {
      emit('stakeChanged', props.dapp);
    }

    // TODO refactor since very similar code is in ModalTransferAmount, maybe to move this logic into InputAmount component
    const getAmount = (stakeData: StakeModel): BN => {
      const unit = getUnit(stakeData.unit);
      const amount = reduceDenomToBalance(
        stakeData.amount,
        unit,
        stakeData.decimal
      );

      console.log('getAmount', stakeData, unit, stakeData.decimal, amount.toString());
      return amount;
    }

    const stake = async (stakeData: StakeModel) => {
      const result = await store.dispatch(
        'dapps/stake',
        {
          api: api?.value,
          senderAddress: stakeData.address,
          dapp: props.dapp,
          amount: getAmount(stakeData),
          decimals: stakeData.decimal,
          unit: stakeData.unit,
          finalizeCallback: emitStakeChanged,
        } as StakingParameters,
      );

      if (result) {
        showModal.value = false;
      }
    }

    const unstake = async (stakeData: StakeModel) => {
      const result = await store.dispatch('dapps/unstake', {
        api: api?.value,
        senderAddress: stakeData.address,
        dapp: props.dapp,
        amount: getAmount(stakeData),
        decimals: stakeData.decimal,
        unit: stakeData.unit,
        finalizeCallback: emitStakeChanged
      } as StakingParameters);

      if (result) {
        showModal.value = false;
      }
    }

    const claim = async () => {
      // TODO maybe to add select address option to modal as in stake/unstake
      const senderAddress = store.getters['general/selectedAccountAddress'];
      const result = await store.dispatch('dapps/claim', {
        api: api?.value,
        senderAddress,
        dapp: props.dapp,
        finalizeCallback: emitStakeChanged
      } as StakingParameters);

      if (result) {
        showClaimRewardModal.value = false;
      }
    }

    return {
      ...toRefs(props),
      showModal,
      showClaimRewardModal,
      modalTitle,
      modalAction,
      modalActionName,
      showStakeModal,
      showUnstakeModal,
      claim
    };
  },
})
</script>
