<template>
  <div v-if="hasStake">
    <Button @click="showStakeModal" :small="true">Add</Button>
    <Button @click="showUnstakeModal" :small="true">Unstake</Button>
  </div>
  <Button v-else @click="showStakeModal" :small="true">Stake</Button>

  <StakeModal
    v-if="showModal"
    v-model:isOpen="showModal"
    :dapp="dapp"
    :action="modalAction"
    :actionName="modalActionName"
    :title="modalTitle"
  />
</template>

<script lang="ts">
import { defineComponent, ref, toRefs } from 'vue'
import BN from 'bn.js';
import Button from 'components/common/Button.vue';
import StakeModal from 'components/store/modals/StakeModal.vue';

export default defineComponent({
  components: {
    Button,
    StakeModal
  },
  props: {
    dapp: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const showModal = ref<boolean>(false);
    const modalTitle = ref<string>('');
    const modalActionName = ref<string>('');
    const modalAction = ref();
    const hasStake = true;

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
      hasStake,
      ...toRefs(props),
      showModal,
      modalTitle,
      modalAction,
      modalActionName,
      showStakeModal,
      showUnstakeModal
    };
  },
})
</script>
