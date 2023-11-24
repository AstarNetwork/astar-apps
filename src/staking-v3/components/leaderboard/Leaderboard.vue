<template>
  <div>
    <div>Tier Leaderboard</div>
    <div>
      <div v-for="[tier, dapps] in leaderBoards" :key="tier">
        Tier {{ tier }}
        <div v-for="dapp in dapps" :key="dapp.chain.id">
          {{ dapp.basic.name }} | {{ dapp.chain.totalStake ?? 0 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useLeaderboard } from 'src/staking-v3/hooks';

export default defineComponent({
  setup() {
    const { leaderBoards } = useLeaderboard();

    return { leaderBoards };
  },
});
</script>
