<template>
  <div v-if="isLeaderboardEmpty" class="wrapper--leaderboard">
    <div class="wrapper--leaderboard__inner">
      <div class="title">{{ $t('stakingV3.projectLeaderboards') }}</div>

      <div class="container--boards">
        <div class="wrapper--tier">
          <div class="container--dapps">
            <div v-for="(dapp, index) in sortedDapps" :key="dapp.chain.id">
              <div class="dapp">
                <div>{{ index + 1 }}</div>
                <div class="dapp--button" @click="navigateDappPage(dapp.basic.address)">
                  <div class="dapp--image">
                    <img :src="dapp.basic.iconUrl" :alt="dapp.basic.name" />
                  </div>
                  <div>{{ dapp.basic.name }}</div>
                </div>
                <div class="amount">
                  <token-balance-native :balance="dapp.chain.totalStake?.toString() ?? '0'" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bg--leaderboard">
      <img :src="require('/src/staking-v3/assets/leaderboard_bg.webp')" alt="" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useLeaderboard } from '../../hooks';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import { useDappStakingNavigation } from '../../hooks';

export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  setup() {
    const { sortedDapps, isLeaderboardEmpty } = useLeaderboard();

    const { navigateDappPage } = useDappStakingNavigation();

    return { sortedDapps, isLeaderboardEmpty, navigateDappPage };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/leaderboard.scss';
@import './styles/tier.scss';
</style>
