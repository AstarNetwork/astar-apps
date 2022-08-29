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
      <div v-if="isLoadingTxHistories" class="skeleton--history">
        <q-skeleton animation="fade" class="skeleton--history" style="height: 355px" />
      </div>
      <div v-else>
        <div v-if="txHistories.length > 0" class="box--histories">
          <div v-for="tx in txHistories" :key="tx.timestamp">
            <TransactionHistory :tx="tx" />
          </div>
        </div>
        <div v-else>
          <span> {{ $t('assets.transferPage.noTxRecords') }} </span>
        </div>
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
import TransactionHistory from 'src/components/assets/transfer/TransactionHistory.vue';
import { useAccount, useNetworkInfo } from 'src/hooks';
import {
  Faq,
  faqH160Transfer,
  faqH160XcmBridge,
  faqSs58Transfer,
  faqSs58XcmBridge,
  getTxHistories,
  hotTopics,
  RecentHistory,
} from 'src/modules/transfer';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watchEffect } from 'vue';

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
    const txHistories = ref<RecentHistory[]>([]);
    const isLoadingTxHistories = ref<boolean>(true);
    const { currentAccount } = useAccount();
    const { currentNetworkName } = useNetworkInfo();

    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const faqs = computed<Faq[]>(() => {
      if (isH160.value) {
        return props.isLocalTransfer ? faqH160Transfer : faqH160XcmBridge;
      } else {
        return props.isLocalTransfer ? faqSs58Transfer : faqSs58XcmBridge;
      }
    });

    const setTxHistories = async (): Promise<void> => {
      if (!currentAccount.value || !currentNetworkName.value) return;
      try {
        isLoadingTxHistories.value = true;
        txHistories.value = await getTxHistories({
          address: currentAccount.value,
          network: currentNetworkName.value.toLowerCase(),
        });
      } catch (error) {
        console.error(error);
      } finally {
        isLoadingTxHistories.value = false;
      }
    };

    watchEffect(async () => {
      await setTxHistories();
      console.log('txHistories', txHistories.value);
    });

    return { faqs, hotTopics, txHistories, isLoadingTxHistories };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/information.scss';
</style>
