<template>
  <div>
    <div class="store-container">
      <div class="wrapper--tabs responsive">
        <nav class="tabs">
          <div class="tab" :class="currentTab === 0 ? 'active' : ''" @click="currentTab = 0">
            My Rewards
          </div>
          <div class="tab" :class="currentTab === 1 ? 'active' : ''" @click="currentTab = 1">
            Unbonding
          </div>
          <div class="tab" :class="currentTab === 2 ? 'active' : ''" @click="currentTab = 2">
            My dApps
          </div>
        </nav>

        <div class="text--transferable">Transferable Balance : 20,432.1 ASTR</div>
      </div>
      <div class="wrapper--panel">
        <template v-if="currentTab === 0">
          <MyRewards />
        </template>
        <template v-else-if="currentTab === 1">
          <UnbondingList />
        </template>
        <template v-else>
          <MyDapps />
        </template>
      </div>
    </div>

    <Teleport to="#app--main">
      <div :class="!isLoading && 'highest-z-index'">
        <!-- <ModalRegisterDapp
          v-if="showRegisterDappModal"
          v-model:is-open="showRegisterDappModal"
          :show-close-button="false"
        /> -->
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
import MyRewards from 'src/components/dapp-staking-v2/my-staking/MyRewards.vue';
import UnbondingList from 'src/components/dapp-staking-v2/my-staking/UnbondingList.vue';
import MyDapps from 'src/components/dapp-staking-v2/my-staking/MyDapps.vue';
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  components: {
    MyRewards,
    UnbondingList,
    MyDapps,
  },
  setup() {
    // TODO: need to remove legacy
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
    //

    const currentTab = ref(0);

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
      currentTab,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.store-container {
  grid-template-columns: repeat(auto-fit, minmax(288px, max-content));
  background: #fff;
  border-radius: 6px;
  padding: 18px 24px 24px 24px;
}

.wrapper--tabs {
  display: flex;
  justify-content: space-between;

  @media (max-width: $lg) {
    display: block;
  }
}

.responsive {
  width: 100%;
  overflow-x: auto;
}

.text--transferable {
  font-weight: 600;
  font-size: 14px;
  color: #9da3ae;
  margin-top: 16px;
  text-align: right;
}

.tabs {
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

.body--dark {
  .store-container {
    background: $gray-5-selected-dark;
    box-shadow: 0px 0px 20px 5px rgba(0, 0, 0, 0.15);
  }

  .tabs {
    .tab {
      color: $gray-1;

      &:hover {
        color: $gray-3;
      }
    }
  }
}
</style>
