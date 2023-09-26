<template>
  <div class="wrapper--mystaking">
    <div class="txt--header">{{ $t('dappStaking.myStaking') }}</div>
    <div class="staking-container">
      <div class="wrapper--tabs responsive">
        <nav class="tabs">
          <div
            class="tab"
            :class="currentTab === MyStakingTab.MyRewards ? 'active' : ''"
            @click="currentTab = MyStakingTab.MyRewards"
          >
            <span class="text--tab">
              {{ $t('dappStaking.myRewards') }}
            </span>
          </div>
          <div
            v-if="unlockingChunks && unlockingChunks.length > 0"
            class="tab"
            :class="currentTab === MyStakingTab.UnbondingList ? 'active' : ''"
            @click="currentTab = MyStakingTab.UnbondingList"
          >
            <span class="text--tab">
              {{ $t('dappStaking.unbonding') }}
            </span>
          </div>
          <div
            v-if="myStakeInfos && myStakeInfos.length > 0"
            class="tab"
            :class="currentTab === MyStakingTab.MyDapps ? 'active' : ''"
            @click="currentTab = MyStakingTab.MyDapps"
          >
            <span class="text--tab">
              {{ $t('dappStaking.myDapps') }}
            </span>
          </div>
        </nav>

        <div class="text--transferable">
          {{ $t('dappStaking.transferableBalance') }} :
          <span v-if="isLoadingBalance">
            <q-skeleton type="rect" animation="fade" class="loading" />
          </span>
          <span v-else>
            <token-balance :balance="transferableBalance.toString()" :symbol="nativeTokenSymbol" />
          </span>
        </div>
      </div>
      <div class="wrapper--panel">
        <template v-if="currentTab === 0">
          <my-rewards />
        </template>
        <template v-else-if="currentTab === 1">
          <unbonding-list :unlocking-chunks="unlockingChunks" />
        </template>
        <template v-else>
          <my-dapps :my-stake-infos="myStakeInfos" />
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch, watchEffect, onUnmounted } from 'vue';
import { ethers } from 'ethers';
import { useStore } from 'src/store';
import { useAccount, useBalance, useNetworkInfo, useStakerInfo } from 'src/hooks';
import { useUnbonding } from 'src/hooks/dapps-staking/useUnbonding';
import MyRewards from './MyRewards.vue';
import UnbondingList from './UnbondingList.vue';
import MyDapps from './MyDapps.vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';

enum MyStakingTab {
  MyRewards = 0,
  UnbondingList = 1,
  MyDapps = 2,
}

export default defineComponent({
  components: {
    MyRewards,
    UnbondingList,
    MyDapps,
    TokenBalance,
  },
  setup() {
    const store = useStore();
    const currentTab = ref<MyStakingTab>(MyStakingTab.MyDapps);
    const { nativeTokenSymbol } = useNetworkInfo();
    const { unlockingChunks, eventWithdrawal } = useUnbonding();
    const { myStakeInfos } = useStakerInfo();
    const { senderSs58Account } = useAccount();

    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const { accountData, isLoadingBalance } = useBalance(selectedAddress);

    const transferableBalance = computed(() => {
      const balance = accountData.value
        ? ethers.utils.formatEther(accountData.value.getUsableTransactionBalance().toString())
        : '0';
      return Number(balance);
    });

    // Memo: reset the MyStakingTab when the account changes
    watch(
      [senderSs58Account],
      () => {
        currentTab.value = MyStakingTab.MyRewards;
      },
      { immediate: true }
    );

    const handleOpenMyRewardsTab = () => {
      currentTab.value = MyStakingTab.MyRewards;
    };

    // Memo: reset the MyStakingTab when the sending withdrawal transaction
    const listenWithdrawalTransaction = (): void => {
      window.addEventListener(eventWithdrawal, handleOpenMyRewardsTab);
    };

    watchEffect(listenWithdrawalTransaction);

    onUnmounted(() => {
      window.removeEventListener(eventWithdrawal, listenWithdrawalTransaction);
    });

    return {
      currentTab,
      isLoadingBalance,
      transferableBalance,
      nativeTokenSymbol,
      unlockingChunks,
      myStakeInfos,
      MyStakingTab,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/my-staking.scss';
</style>
