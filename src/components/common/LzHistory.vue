<template>
  <a :href="tx.explorerUrl" target="_blank" rel="noopener noreferrer" class="box--history">
    <div class="history--left">
      <div
        v-if="tx.status !== 'FAILED'"
        :class="tx.status === 'DELIVERED' ? 'icon--check' : 'icon--pending'"
      >
        <astar-icon-circle-check size="20" />
      </div>
      <div v-else class="icon--failed">
        <astar-icon-circle-close size="20" />
      </div>
      <div class="history-description">
        <p>{{ time }}</p>
        <div class="row--tx-description">
          <p>[{{ tx.status }}]</p>
          <p><token-balance :balance="tx.amount ? tx.amount : '0'" :symbol="tx.symbol" /></p>
        </div>
        <p>{{ tx.note }}</p>
      </div>
    </div>
    <div class="history--right">
      <div class="container--explorer-icon explorer-icon">
        <astar-icon-external-link />
      </div>
    </div>
  </a>
</template>
<script lang="ts">
import { date } from 'quasar';
import { truncate } from '@astar-network/astar-sdk-core';
import { RecentLzHistory } from 'src/modules/information';
import { defineComponent, PropType } from 'vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';

export default defineComponent({
  components: { TokenBalance },
  props: {
    tx: {
      type: Object as PropType<RecentLzHistory>,
      required: true,
    },
  },
  setup(props) {
    const time = date.formatDate(Number(props.tx.timestamp) * 1000, 'YYYY-MM-DD HH:mm');
    return { truncate, time };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/common/styles/transaction-history.scss';
</style>
