<template>
  <div>
    <div class="store-container">
      <div class="responsive">
        <nav class="tabs">
          <div class="tab active">My Rewards</div>
          <div class="tab">Unbonding</div>
          <div class="tab">My dApps</div>
        </nav>
      </div>
      <div class="wrapper--panel">
        <div class="card">
          <p>Total Stakes</p>
          <div>500,000 ASTR</div>
        </div>
        <div class="card">
          <p>Available to claim</p>
          <div>5 Era</div>
        </div>
        <div class="card">
          <p>Re-Stake after claiming</p>
          <div>ON</div>
        </div>
        <div class="card">
          <p>Total Earned (all-time)</p>
          <div>10,000 ASTR</div>
        </div>
      </div>
    </div>

    <Teleport to="#app--main">
      <div :class="!isLoading && 'highest-z-index'">
        <!-- <ModalRegisterDapp
          v-if="showRegisterDappModal"
          v-model:is-open="showRegisterDappModal"
          :show-close-button="false"
        />
        <ModalMaintenance :show="isPalletDisabled" /> -->
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { useAccount, useBalance, useCurrentEra, useStakerInfo, useStakingList } from 'src/hooks';
import { formatUnitAmount } from 'src/hooks/helper/plasmUtils';
import { useStore } from 'src/store';
import { StakeInfo } from 'src/store/dapp-staking/actions';
import { DappItem } from 'src/store/dapp-staking/state';
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  components: {},
  setup() {
    useMeta({ title: 'Discover dApps' });
    const store = useStore();
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    const { progress, blocksUntilNextEra, era } = useCurrentEra();
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const { stakeInfos } = useStakerInfo();
    const { dapps, stakingList } = useStakingList();

    const maxNumberOfStakersPerContract = computed(
      () => store.getters['dapps/getMaxNumberOfStakersPerContract']
    );
    const minimumStakingAmount = computed(() => {
      const amount = store.getters['dapps/getMinimumStakingAmount'];
      return formatUnitAmount(amount);
    });

    const showRegisterDappModal = ref<boolean>(false);
    const selectedDapp = ref<DappItem>();
    const selectedDappInfo = ref<StakeInfo>();
    const isPalletDisabled = computed(() => store.getters['dapps/getIsPalletDisabled']);
    const isDapps = computed(() => dapps.value.length > 0);

    return {
      isDapps,
      dapps,
      selectedDapp,
      selectedDappInfo,
      showRegisterDappModal,
      maxNumberOfStakersPerContract,
      minimumStakingAmount,
      progress,
      blocksUntilNextEra,
      era,
      accountData,
      currentAccount,
      isPalletDisabled,
      stakeInfos,
      stakingList,
      isLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.store-container {
  grid-template-columns: repeat(auto-fit, minmax(288px, max-content));
}

.responsive {
  width: 100%;
  overflow-x: auto;
}

.tabs {
  // display: table;
  // table-layout: auto;
  border-collapse: separate;
  display: inline-flex;
  flex-wrap: wrap;
  gap: 12px;
  &.tabs-center {
    margin: auto;
  }
  &.tabs-justify {
    width: 100%;
    table-layout: fixed;
  }
  .tab {
    position: relative;
    display: table-cell;
    transition: all ease 0.3s;
    padding: 14px 10px;
    transform: translate3d(0, 0, 0);
    color: $gray-5-selected;
    font-size: 16px;
    font-weight: 400;
    font-style: normal;
    white-space: nowrap;
    cursor: pointer;
    &:hover {
      color: $gray-5;
    }
    &:after {
      transition: all 0.3s cubic-bezier(1, 0, 0, 1);
      will-change: transform, box-shadow, opacity;
      position: absolute;
      content: '';
      height: 3px;
      bottom: 0px;
      left: 0px;
      right: 0px;
      border-radius: 3px 3px 0px 0px;
      background: $astar-blue;
      box-shadow: 0px 4px 10px 3px rgba($astar-blue, 0.15);
      opacity: 0;
      transform: scale(0, 1);
    }
    &.active {
      font-weight: 600;
      &:after {
        opacity: 1;
        transform: scale(1, 1);
      }
    }
  }
}

.wrapper--panel {
  display: flex;
  flex-wrap: wrap;
}

// .tabs {
//   display: flex;
//   padding-left: 3px;
// }

// .tab {
//   display: flex;
//   align-items: center;
//   font-weight: 400;
//   font-size: 14px;
//   line-height: 17px;
//   text-align: center;
//   color: $gray-3;
//   padding: 12px;
// }

// .active-tab {
//   font-weight: 700;
//   color: $gray-5;
// }

// .tabs__indicator {
//   position: absolute;
//   height: 4px;
//   top: 0;
//   z-index: 0;
//   background: $astar-blue;
//   border-radius: 0px 0px 8px 8px;
//   transition: all 0.5s ease 0s;
//   width: 36px !important;
// }

// .column--item {
//   min-width: 53px;
//   font-size: 14px;
//   transition: all 0.2s ease 0s;
//   &:hover {
//     font-weight: 700;
//     color: $gray-5;
//     transition: all 0.2s ease 0s;
//   }
// }
</style>
