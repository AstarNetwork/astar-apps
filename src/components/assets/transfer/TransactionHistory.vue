<template>
  <div class="box--history">
    <div class="history--left">
      <div :class="isHighLighted ? 'icon--check-active' : 'icon--check'">
        <astar-icon-circle-check size="20" />
      </div>
      <div :class="isHighLighted ? 'history-description-active' : 'history-description'">
        <p>2022-06-01 10:05</p>
        <p>100 DOT</p>
        <p>To 0x000...000</p>
      </div>
    </div>
    <div class="history--right">
      <div
        class="container--explorer-icon"
        :class="isHighLighted ? 'explorer-icon-active' : 'explorer-icon'"
      >
        <astar-icon-external-link />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    isHighLighted: {
      type: Boolean,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transaction-history.scss';
</style>
