<template>
  <div class="tw-flex"> 
    <div v-if="hasStake">
      <Button @click="showStakeModal" :small="true">Add</Button>
      <Button @click="showUnstakeModal" :small="true" :primary="false">Unstake</Button>
    </div>
    <Button v-else @click="showStakeModal" :small="true">Stake</Button>

    <Button
      v-if="hasStake"
      :small="true"
      :primary="false"
      class="tw-ml-auto"
      @click="showClaimRewardModal=true">
      Claim
    </Button>
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
    :claimAction="claim"
  />
</template>

<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue'
import Button from 'components/common/Button.vue';
import StakeModal from 'components/store/modals/StakeModal.vue';
import ClaimRewardModal from 'components/store/modals/ClaimRewardModal.vue';
import { useStore } from 'src/store';
import { useApi } from 'src/hooks';
import { StakingParameters } from 'src/store/dapps-store/actions';

export default defineComponent({
  components: {
    Button,
    StakeModal,
    ClaimRewardModal
  },
  props: {
    dapp: {
      type: Object,
      required: true
    },
    hasStake: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
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

    const stake = async (senderAddress: string, value: number) => {
      const result = await store.dispatch('dapps/stake', {
        api: api?.value,
        senderAddress: 'ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8',
        dapp: props.dapp,
        amount: value
      } as StakingParameters);

      if (result) {
        showModal.value = false;
      }
    }

    const unstake = async (senderAddress: string, value: number) => {
      const result = await store.dispatch('dapps/unstake', {
        api: api?.value,
        senderAddress: 'ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8',
        dapp: props.dapp,
        amount: value
      } as StakingParameters);

      if (result) {
        showModal.value = false;
      }
    }

    const claim = async () => {
      const result = await store.dispatch('dapps/claim', {
        api: api?.value,
        senderAddress: 'ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8',
        dapp: props.dapp,
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
