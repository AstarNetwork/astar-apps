<template>
  <div class="staking-header">
    <div>Build2Earn</div>
    <div class="card-container">
      <home-card title="Total dApps" :value="dappsCount.toString()"></home-card>
      <home-card title="Current block" :value="currentBlock.toString()"></home-card>
      <home-card title="Current era" :value="currentEra.toString()"></home-card>
      <home-card title="TVL" :value="tvl.tvlDefaultUnit.toString()"></home-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'src/store';
import { DappCombinedInfo } from 'src/v2/models/DappsStaking';
import { TvlModel } from 'src/v2/models';
import HomeCard from './HomeCard.vue';

export default defineComponent({
  components: {
    HomeCard,
  },
  setup() {
    const store = useStore();
    const dappsCount = computed<DappCombinedInfo[]>(
      () => store.getters['dapps/getRegisteredDapps']().length
    );
    const currentBlock = computed<number>(() => store.getters['general/getCurrentBlock']);
    const currentEra = computed<number>(() => store.getters['dapps/getCurrentEra']);
    const tvl = computed<TvlModel>(() => store.getters['dapps/getTvl']);

    return {
      dappsCount,
      currentBlock,
      currentEra,
      tvl,
    };
  },
});
</script>

<style scoped>
.staking-header {
  min-height: 200px;
  border: 1px solid lightgray;
  border-radius: 4px;
  padding: 8px;
}

.card-container {
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;
}

.card-container .header-card {
  margin-left: 8px;
  margin-right: 8px;
}
</style>
