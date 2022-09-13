<template>
  <a :href="tx.explorerUrl" target="_blank" rel="noopener noreferrer" class="box--history">
    <div class="history--left">
      <div class="icon--check">
        <astar-icon-circle-check size="20" />
      </div>
      <div class="history-description">
        <p>{{ time }}</p>
        <div class="row--tx-description">
          <p>[{{ tx.txType }}]</p>
          <p>{{ $n(truncate(tx.amount)) }} {{ tx.symbol }}</p>
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
import { truncate } from 'src/hooks/helper/common';
import { RecentHistory } from 'src/modules/transfer';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    tx: {
      type: Object as PropType<RecentHistory>,
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
@use 'src/components/assets/transfer/styles/transaction-history.scss';
</style>
