<template>
  <div class="tw-border tw-m-4 tw-w-72 tw-rounded-lg">
    <div class="tw-flex tw-flex-grow tw-cursor-pointer tw-p-4" @click="emitClickEvent">
      <Avatar :url="dapp.iconUrl" class="tw-w-14 tw-h-14" />
      <div class="tw-ml-4">
        <div class="tw-text-lg tw-font-semibold">{{ dapp.name }}</div>
        <div class="tw-h-11 tw-overflow-ellipsis tw-overflow-y-hidden">{{ dapp.description }}</div>
      </div>
    </div>
    <hr />
    <div class="tw-p-4">
      <StakePanel :dapp="dapp" :stakeInfo="stakeInfo" v-on:stake-changed="handleStakeChanged" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, ref, computed, watch } from 'vue'
import { useStore } from 'src/store';
import { useApi } from 'src/hooks';
import Avatar from 'components/common/Avatar.vue';
import StakePanel from 'components/store/StakePanel.vue';
import { StakingParameters, StakeInfo } from 'src/store/dapps-store/actions';

export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true
    }
  },
  components: {
    Avatar,
    StakePanel
  },
  setup(props, { emit }) {
    const store = useStore();
    const { api } = useApi();
    const stakeInfo = ref<StakeInfo>();
    const senderAddress = computed(() => store.getters['general/selectedAccountAddress']);

    const emitClickEvent = (): void => {
      emit('dappClick', props.dapp)
    }

    const handleStakeChanged = (): void => {
      getDappInfo();
    }

    const getDappInfo = () => {
      store.dispatch('dapps/getStakeInfo',{
        api: api?.value,
        senderAddress: senderAddress.value,
        dapp: props.dapp,
      } as StakingParameters)
      .then((info: StakeInfo) => {
        stakeInfo.value = info;
      });
    }
    
    watch(senderAddress, () => {
      console.log('watching', senderAddress.value);
      getDappInfo();
    })

    if (senderAddress.value) {
      getDappInfo();
    }

    return {
      ...toRefs(props),
      stakeInfo,
      emitClickEvent,
      handleStakeChanged
    }
  },
})
</script>
