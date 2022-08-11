<template>
  <div class="box--history">
    <div class="history--left">
      <div class="icon--check">
        <astar-icon-circle-check size="20" />
      </div>
      <div class="history-description">
        <p>2022-06-01 10:05</p>
        <p>100 DOT</p>
        <p>To 0x000...000</p>
      </div>
    </div>
    <div class="history--right">
      <div class="container--explorer-icon explorer-icon">
        <astar-icon-external-link />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transaction-history.scss';
</style>
