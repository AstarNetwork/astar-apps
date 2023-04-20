<template>
  <div class="wrapper--mystaking">
    <div class="txt--header">{{ $t('dappStaking.myStaking') }}</div>
    <div class="staking-container">
      <div class="wrapper--tabs responsive">
        <nav class="tabs">
          <div class="tab" :class="currentTab === 0 ? 'active' : ''" @click="currentTab = 0">
            <span class="text--tab">
              {{ $t('dappStaking.myRewards') }}
            </span>
          </div>
          <div
            v-if="unlockingChunks && unlockingChunks.length > 0"
            class="tab"
            :class="currentTab === 1 ? 'active' : ''"
            @click="currentTab = 1"
          >
            <span class="text--tab">
              {{ $t('dappStaking.unbonding') }}
            </span>
          </div>
          <div
            v-if="myStakeInfos && myStakeInfos.length > 0"
            class="tab"
            :class="currentTab === 2 ? 'active' : ''"
            @click="currentTab = 2"
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
import { defineComponent, ref, computed } from 'vue';
import { ethers } from 'ethers';
import { useStore } from 'src/store';
import { useBalance, useNetworkInfo, useStakerInfo } from 'src/hooks';
import { useUnbonding } from 'src/hooks/dapps-staking/useUnbonding';
import MyRewards from './MyRewards.vue';
import UnbondingList from './UnbondingList.vue';
import MyDapps from './MyDapps.vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';

export default defineComponent({
  components: {
    MyRewards,
    UnbondingList,
    MyDapps,
    TokenBalance,
  },
  setup() {
    const store = useStore();
    const currentTab = ref(0);
    const { nativeTokenSymbol } = useNetworkInfo();
    const { unlockingChunks } = useUnbonding();
    const { myStakeInfos } = useStakerInfo();

    const selectedAddress = computed(() => store.getters['general/selectedAddress']);
    const { accountData, isLoadingBalance } = useBalance(selectedAddress);

    const transferableBalance = computed(() => {
      const balance = accountData.value
        ? ethers.utils.formatEther(accountData.value.getUsableTransactionBalance().toString())
        : '0';
      return Number(balance);
    });

    return {
      currentTab,
      isLoadingBalance,
      transferableBalance,
      nativeTokenSymbol,
      unlockingChunks,
      myStakeInfos,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/my-staking.scss';
</style>
