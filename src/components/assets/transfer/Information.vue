<template>
  <div class="wrapper--information">
    <a
      class="container--how-to-use"
      :href="socialUrl.youtube"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="text--title-feature">{{ $t('assets.transferPage.howToUsePortal') }}</span>
      <div class="icon-play">
        <astar-icon-play size="24" />
      </div>
    </a>
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
    <div v-if="isHistory && !isMultisig" id="history" class="container--information">
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
            <transaction-history :tx="tx" />
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
import TransactionHistory from 'src/components/common/TransactionHistory.vue';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { socialUrl } from 'src/links';
import { HistoryTxType } from 'src/modules/account';
import {
  Faq,
  faqH160Transfer,
  faqH160XcmBridge,
  faqSs58Transfer,
  faqSs58XcmBridge,
  faqSs58XvmTransfer,
  getTxHistories,
  hotTopics,
  RecentHistory,
  faqZkEthereumBridge,
} from 'src/modules/information';
import { getXvmAssetsTransferHistories } from 'src/modules/information/recent-history';
import { useStore } from 'src/store';
import { computed, defineComponent, PropType, ref, watchEffect } from 'vue';

export default defineComponent({
  components: { TransactionHistory },
  props: {
    transferType: {
      type: String as PropType<HistoryTxType>,
      required: true,
    },
    isHistory: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  setup(props) {
    const store = useStore();
    const txHistories = ref<RecentHistory[]>([]);
    const isLoadingTxHistories = ref<boolean>(true);
    const { senderSs58Account, isMultisig } = useAccount();
    const { currentNetworkName } = useNetworkInfo();

    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const faqs = computed<Faq[]>(() => {
      if (props.transferType === HistoryTxType.Transfer) {
        return isH160.value ? faqH160Transfer : faqSs58Transfer;
      }
      if (props.transferType === HistoryTxType.Xcm) {
        return isH160.value ? faqH160XcmBridge : faqSs58XcmBridge;
      }
      if (props.transferType === HistoryTxType.ZK_ETHEREUM_BRIDGE) {
        return faqZkEthereumBridge;
      }
      return faqSs58XvmTransfer;
    });

    const setTxHistories = async (): Promise<void> => {
      if (!senderSs58Account.value || !currentNetworkName.value) return;
      try {
        isLoadingTxHistories.value = true;
        const network = currentNetworkName.value.toLowerCase();
        if (props.transferType === HistoryTxType.Xvm) {
          txHistories.value = await getXvmAssetsTransferHistories({
            address: senderSs58Account.value,
            network,
          });
        } else {
          txHistories.value = await getTxHistories({
            address: senderSs58Account.value,
            network,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        isLoadingTxHistories.value = false;
      }
    };

    watchEffect(setTxHistories);

    return { faqs, hotTopics, txHistories, isLoadingTxHistories, socialUrl, isMultisig };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/information.scss';
</style>
