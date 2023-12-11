<template>
  <div v-if="!isLeaderboardEmpty" class="container--leaderboard">
    <div class="title">{{ $t('stakingV3.tierLeaderboard') }}</div>
    <div class="tier--boards">
      <div v-for="[tier, dapps] in leaderBoards" :key="tier">
        <tier :tier="tier" :dapps="dapps" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useLeaderboard } from 'src/staking-v3/hooks';
import Tier from './Tier.vue';

export default defineComponent({
  components: {
    Tier,
  },
  setup() {
    const { leaderBoards, isLeaderboardEmpty } = useLeaderboard();

    return { leaderBoards, isLeaderboardEmpty };
  },
});
</script>

<style scoped>
.container--leaderboard {
  width: 100%;
}

.tier--boards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.title {
  font-size: 32px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin-bottom: 20px;
}
</style>
