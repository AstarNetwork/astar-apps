<template>
  <div>
    <div class="txt--header">{{ $t('dappStaking.myStaking') }}</div>
    <div class="staking-container">
      <div class="wrapper--tabs responsive">
        <nav class="tabs">
          <div class="tab" :class="currentTab === 0 ? 'active' : ''" @click="currentTab = 0">
            {{ $t('dappStaking.myRewards') }}
          </div>
          <div class="tab" :class="currentTab === 1 ? 'active' : ''" @click="currentTab = 1">
            {{ $t('dappStaking.unbonding') }}
          </div>
          <div class="tab" :class="currentTab === 2 ? 'active' : ''" @click="currentTab = 2">
            {{ $t('dappStaking.myDapps') }}
          </div>
        </nav>

        <div class="text--transferable">
          {{ $t('dappStaking.transferableBalance') }} : 20,432.1 ASTR
        </div>
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
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import MyRewards from 'src/components/dapp-staking-v2/my-staking/MyRewards.vue';
import UnbondingList from 'src/components/dapp-staking-v2/my-staking/UnbondingList.vue';
import MyDapps from 'src/components/dapp-staking-v2/my-staking/MyDapps.vue';

export default defineComponent({
  components: {
    MyRewards,
    UnbondingList,
    MyDapps,
  },
  setup() {
    const currentTab = ref(0);

    return {
      currentTab,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/my-staking.scss';
</style>