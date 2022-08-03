<template>
  <div class="wrapper--information">
    <div class="container--information">
      <div class="row--title">
        <astar-icon-group size="20" />
        <span>FAQ</span>
      </div>
      <div class="box--contents">
        <div>
          <span class="text-contents">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </span>
        </div>
        <div>
          <span class="text--active">How do I know my Polkadot address?</span>
        </div>
        <div>
          <span class="text-contents">How do I know my Polkadot address?</span>
        </div>
      </div>
    </div>
    <div class="container--information">
      <div class="row--title">
        <astar-icon-history size="20" />
        <span>Recent History</span>
      </div>
      <div class="box--histories">
        <TransactionHistory :is-high-lighted="true" />
        <TransactionHistory :is-high-lighted="false" />
        <TransactionHistory :is-high-lighted="false" />
        <TransactionHistory :is-high-lighted="false" />
        <TransactionHistory :is-high-lighted="false" />
      </div>
    </div>
    <div class="container--information">
      <div class="row--title">
        <astar-icon-group size="20" />
        <span>Hot Topics</span>
      </div>
      <div class="box--contents">
        <div class="container--hot-topics-contents">
          <span class="text-contents"> DOT festival!! Event 1 is on! </span>
          <div class="container--explorer-icon">
            <astar-icon-external-link />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import TransactionHistory from 'src/components/assets/transfer/TransactionHistory.vue';
export default defineComponent({
  components: { TransactionHistory },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/information.scss';
</style>
