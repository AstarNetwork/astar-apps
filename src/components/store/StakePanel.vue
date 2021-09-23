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
  />
</template>

<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue'
import BN from 'bn.js';
import Button from 'components/common/Button.vue';
import StakeModal from 'components/store/modals/StakeModal.vue';
import ClaimRewardModal from 'components/store/modals/ClaimRewardModal.vue';

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

    const stake = (address: string, value: BN): void => {
      console.log(`you staked ${value.toString()} from adress ${address}`)
    }

    const unstake = (address: string, value: BN): void => {
      console.log(`you un-staked ${value.toString()} from adress ${address}`)
    }

    return {
      ...toRefs(props),
      showModal,
      showClaimRewardModal,
      modalTitle,
      modalAction,
      modalActionName,
      showStakeModal,
      showUnstakeModal
    };
  },
})
</script>
