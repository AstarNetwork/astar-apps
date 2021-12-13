<template>
  <div
    class="
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-shadow tw-mb-8 tw-w-72 tw-rounded-lg tw-text-blue-900
      dark:tw-text-darkGray-100
      xl:tw-mx-2
    "
  >
    <div class="tw-flex tw-flex-grow tw-cursor-pointer tw-p-4" @click="emitClickEvent">
      <Avatar :url="dapp.iconUrl" class="tw-w-14 tw-h-14" />
      <div class="tw-ml-4">
        <div
          class="
            tw-text-lg
            tw-font-semibold
            tw-w-48
            tw-whitespace-nowrap
            tw-overflow-ellipsis
            tw-overflow-hidden
          "
        >
          {{ dapp.name }}
        </div>
        <div class="tw-h-11 tw-w-48 description">
          {{ dapp.description }}
        </div>
      </div>
    </div>
    <hr class="dark:tw-bg-darkGray-600" />
    <div class="tw-p-4">
      <StakePanel
        :dapp="dapp"
        :stake-info="stakeInfo"
        :is-max-staker="isMaxStaker"
        :staker-max-number="stakerMaxNumber"
        :account-data="accountData"
        @stake-changed="handleStakeChanged"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, ref, computed, watch } from 'vue';
import { useStore } from 'src/store';
import { useApi } from 'src/hooks';
import Avatar from 'components/common/Avatar.vue';
import StakePanel from 'components/dapp-staking/StakePanel.vue';
import { StakingParameters, StakeInfo } from 'src/store/dapp-staking/actions';

export default defineComponent({
  components: {
    Avatar,
    StakePanel,
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
    stakerMaxNumber: {
      type: Number,
      default: 0,
    },
  },
  emits: ['dappClick'],
  setup(props, { emit }) {
    const store = useStore();
    const { api } = useApi();
    const stakeInfo = ref<StakeInfo>();
    const senderAddress = computed(() => store.getters['general/selectedAccountAddress']);
    const isMaxStaker = ref<boolean>(false);

    const emitClickEvent = (): void => {
      emit('dappClick', props.dapp);
    };

    const handleStakeChanged = (): void => {
      getDappInfo();
    };

    const getDappInfo = () => {
      store
        .dispatch('dapps/getStakeInfo', {
          api: api?.value,
          senderAddress: senderAddress.value,
          dapp: props.dapp,
        } as StakingParameters)
        .then((info: StakeInfo) => {
          if (info) {
            stakeInfo.value = info;
            isMaxStaker.value = info.stakersCount === props.stakerMaxNumber;
          }
        });
    };

    watch(senderAddress, () => {
      getDappInfo();
    });

    if (senderAddress.value) {
      getDappInfo();
    }

    return {
      ...toRefs(props),
      stakeInfo,
      emitClickEvent,
      handleStakeChanged,
      isMaxStaker,
    };
  },
});
</script>

<style scoped>
.description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
