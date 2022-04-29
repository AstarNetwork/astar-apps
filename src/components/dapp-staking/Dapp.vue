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
        @stake-changed="handleStakeChanged"
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
import { $api, $isEnableIndividualClaim } from 'boot/api';
import Avatar from 'components/common/Avatar.vue';
import ModalDappDetails from 'components/dapp-staking/modals/ModalDappDetails.vue';
import StakePanel from 'components/dapp-staking/StakePanel.vue';
import { StakingData } from 'src/modules/dapp-staking';
import { useStore } from 'src/store';
import { StakeInfo, StakingParameters } from 'src/store/dapp-staking/actions';
import { computed, defineComponent, ref, toRefs, watch, PropType } from 'vue';

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
    accountData: {
      type: Object,
      required: true,
    },
    stakerMaxNumber: {
      type: Number,
      default: 0,
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
  emits: ['dappClick'],
  setup(props, { emit }) {
    const store = useStore();
    const stakeInfo = ref<StakeInfo>();
    const senderAddress = computed(() => store.getters['general/selectedAddress']);
    const isMaxStaker = ref<boolean>(false);
    const showDappDetailsModal = ref<boolean>(false);
    const showStakeModal = ref<boolean>(false);
    const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
    const isEthWallet = computed(() => store.getters['general/isEthWallet']);
    const isLoading = computed(() => store.getters['general/isLoading']);
    const showDappDetails = (): void => {
      showDappDetailsModal.value = true;
    };

    const handleStakeChanged = (): void => {
      getDappInfo();
      props.setStakingList();
    };

    const getDappInfo = () => {
      store
        .dispatch('dapps/getStakeInfo', {
          api: $api?.value,
          senderAddress: senderAddress.value,
          dapp: props.dapp,
          substrateAccounts: substrateAccounts.value,
          isEnableIndividualClaim: $isEnableIndividualClaim.value,
        } as StakingParameters)
        .then((info: StakeInfo) => {
          if (info) {
            stakeInfo.value = info;
            isMaxStaker.value = info.stakersCount === props.stakerMaxNumber;
          }
        });
    };

    const cleanMarkup = (text: string): string => {
      // ATM remove only # and *
      // Use split/join replacement method since replaceAll is not supported.
      if (text) {
        return text.split('*').join('').split('#').join('');
      }

      return text;
    };

    watch(senderAddress, () => {
      getDappInfo();
    });

    // Memo: update staking data for EthWallet account
    watch(
      [isLoading],
      () => {
        if (isEthWallet.value && !isLoading.value) {
          getDappInfo();
        }
      },
      { immediate: false }
    );

    const showStake = (): void => {
      console.log('show stake');
      showStakeModal.value = true;
    };

    const handleStakeModalOpened = () => {
      showStakeModal.value = false;
    };

    if (senderAddress.value) {
      getDappInfo();
    }

    return {
      ...toRefs(props),
      stakeInfo,
      showDappDetails,
      handleStakeChanged,
      isMaxStaker,
      showDappDetailsModal,
      showStake,
      showStakeModal,
      handleStakeModalOpened,
      cleanMarkup,
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
