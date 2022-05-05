<template>
  <div
    class="
      tw-bg-white
      dark:tw-bg-darkGray-800
      tw-shadow tw-mb-8 tw-w-72 tw-rounded-lg tw-text-blue-900
      dark:tw-text-darkGray-100
      xl:tw-mx-2
      2xl:tw-mx-0
    "
  >
    <div class="tw-flex tw-flex-grow tw-cursor-pointer tw-p-4" @click="showDappDetails">
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
          {{ cleanMarkup(dapp.description) }}
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
        :show-stake="showStakeModal"
        :staking-list="stakingList"
        @stake-modal-opened="handleStakeModalOpened"
      />
    </div>
    <ModalDappDetails
      v-if="showDappDetailsModal"
      v-model:is-open="showDappDetailsModal"
      :dapp="dapp"
      :stake-info="stakeInfo"
      @show-stake="showStake"
    />
  </div>
</template>

<script lang="ts">
import Avatar from 'components/common/Avatar.vue';
import ModalDappDetails from 'components/dapp-staking/modals/ModalDappDetails.vue';
import StakePanel from 'components/dapp-staking/StakePanel.vue';
import { StakingData } from 'src/modules/dapp-staking';
import { StakeInfo } from 'src/store/dapp-staking/actions';
import { computed, defineComponent, PropType, ref, toRefs } from 'vue';

export default defineComponent({
  components: {
    Avatar,
    StakePanel,
    ModalDappDetails,
  },
  props: {
    dapp: {
      type: Object,
      required: true,
    },
    stakeInfos: {
      type: Array as PropType<StakeInfo[]>,
      required: true,
    },
    accountData: {
      type: Object,
      required: true,
    },
    stakerMaxNumber: {
      type: Number,
      required: true,
    },
    setStakingList: {
      type: Function,
      required: true,
    },
    stakingList: {
      type: Array as PropType<StakingData[]>,
      required: true,
    },
  },
  setup(props) {
    const stakeInfo = computed(() => {
      // Memo: return `undefined` for dapps hasn't registered in local node
      return props.stakeInfos.find((it: StakeInfo | undefined) => {
        if (!it) return undefined;
        return it.dappAddress === props.dapp.address;
      });
    });
    const showDappDetailsModal = ref<boolean>(false);
    const showStakeModal = ref<boolean>(false);
    const showDappDetails = (): void => {
      showDappDetailsModal.value = true;
    };

    const isMaxStaker = computed(() => {
      return stakeInfo.value?.stakersCount === props.stakerMaxNumber;
    });

    const cleanMarkup = (text: string): string => {
      // ATM remove only # and *
      // Use split/join replacement method since replaceAll is not supported.
      if (text) {
        return text.split('*').join('').split('#').join('');
      }

      return text;
    };

    const showStake = (): void => {
      showStakeModal.value = true;
    };

    const handleStakeModalOpened = () => {
      showStakeModal.value = false;
    };

    return {
      ...toRefs(props),
      showDappDetails,
      isMaxStaker,
      showDappDetailsModal,
      showStake,
      showStakeModal,
      handleStakeModalOpened,
      cleanMarkup,
      stakeInfo,
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
