<template>
  <div class="wrapper--information">
    <div id="faq" class="container--information">
      <div class="row--title">
        <astar-icon-group size="20" />
        <span>{{ $t('assets.transferPage.faq') }}</span>
      </div>
      <div class="box--contents">
        <div>
          <span class="text-contents">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </span>
        </div>
        <div>
          <span class="text-faq-link">How do I know my Polkadot address?</span>
        </div>
        <div>
          <span class="text-faq-link">How do I know my Polkadot address?</span>
        </div>
      </div>
    </div>
    <div id="history" class="container--information">
      <div class="row--title">
        <astar-icon-history size="20" />
        <span>{{ $t('assets.transferPage.recentHistory') }}</span>
      </div>
      <div class="box--histories">
        <TransactionHistory />
        <TransactionHistory />
        <TransactionHistory />
        <TransactionHistory />
        <TransactionHistory />
      </div>
    </div>
    <div id="hot-topics" class="container--information">
      <div class="row--title">
        <astar-icon-group size="20" />
        <span>{{ $t('assets.transferPage.hotTopic') }}</span>
      </div>
      <div class="box--contents">
        <div class="container--hot-topics-contents">
          <span class="text-topics-link"> DOT festival!! Event 1 is on! </span>
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
