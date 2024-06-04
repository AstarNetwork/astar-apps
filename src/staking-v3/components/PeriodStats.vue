<template>
  <div class="v3-new-container">
    <div>{{ period }} | {{ $t('stakingV3.stats') }}</div>
    <div class="stats-content">
      <dapp-stats-panel title="Total Staked" :data="[]" />
      <dapp-stats-panel title="AAAA" :data="[]" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DappStatsPanel from './DappStatsPanel.vue';

export default defineComponent({
  components: {
    DappStatsPanel,
  },
  props: {
    period: {
      type: Number,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style scoped lang="scss">
@import 'src/css/quasar.variables.scss';

// TODO move to the common place
.v3-new-container {
  border-radius: 24px;
  border: 2px solid $navy-3;
  background: rgba(31, 47, 95, 0.2);
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);
  padding: 48px;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 8px;

  div {
    flex: 1;
  }

  @media (min-width: $md) {
    flex-direction: row;
  }
}
</style>
