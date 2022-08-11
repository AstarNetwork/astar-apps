<template>
  <div class="wrapper--information">
    <div id="faq" class="container--information">
      <div class="row--title">
        <astar-icon-group size="20" />
        <span>{{ $t('assets.transferPage.faq') }}</span>
      </div>
      <div class="box--contents">
        <a
          v-for="faq in faqs"
          :key="faq.title"
          :href="faq.url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-faq-link"
        >
          {{ faq.title }}
        </a>
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
        <a
          v-for="hotTopic in hotTopics"
          :key="hotTopic.title"
          :href="hotTopic.url"
          target="_blank"
          rel="noopener noreferrer"
          class="container--hot-topics-contents"
        >
          <span class="text-topics-link">
            {{ hotTopic.title }}
          </span>
          <div class="container--explorer-icon">
            <astar-icon-external-link />
          </div>
        </a>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import TransactionHistory from 'src/components/assets/transfer/TransactionHistory.vue';
import { useStore } from 'src/store';
import {
  Faq,
  faqH160Transfer,
  faqH160XcmBridge,
  faqSs58Transfer,
  faqSs58XcmBridge,
  hotTopics,
} from 'src/modules/transfer';
export default defineComponent({
  components: { TransactionHistory },
  props: {
    isLocalTransfer: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const faqs = computed<Faq[]>(() => {
      if (isH160.value) {
        return props.isLocalTransfer ? faqH160Transfer : faqH160XcmBridge;
      } else {
        return props.isLocalTransfer ? faqSs58Transfer : faqSs58XcmBridge;
      }
    });
    return { faqs, hotTopics };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/information.scss';
</style>
