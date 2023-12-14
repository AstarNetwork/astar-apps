<template>
  <div v-if="isLeaderboardEmpty" class="wrapper">
    <div class="title">{{ $t('stakingV3.leaderboard') }}</div>
    <div v-for="(dapp, index) in sortedDapps" :key="dapp.chain.id" class="dapps--container">
      <div class="dapp">
        <div>{{ index + 1 }}</div>
        <div><img :src="dapp.basic.iconUrl" :alt="dapp.basic.name" class="dapp--image" /></div>
        <div>{{ dapp.basic.name }}</div>
        <div class="amount">
          <token-balance-native :balance="dapp.chain.totalStake?.toString() ?? '0'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useLeaderboard } from '../../hooks';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';

export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  setup() {
    const { sortedDapps, isLeaderboardEmpty } = useLeaderboard();

    return { sortedDapps, isLeaderboardEmpty };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/css/quasar.variables.scss';
.wrapper {
  background-color: $gray-1;
  border-radius: 16px;
  padding: 16px;
  width: 100%;
}
.title {
  font-size: 32px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin-bottom: 20px;
}
.dapps--container {
  display: flex;
  flex-flow: column wrap;
}

.dapp {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 0;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.dapp--image {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

.amount {
  text-align: right;
  width: 120px;
}
</style>
