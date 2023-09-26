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
          v-for="faq in faqDappStaking"
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
    <div v-if="!isMultisig" id="history" class="container--information">
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
import { providerEndpoints } from 'src/config/chainEndpoints';
import { useAccount, useNetworkInfo } from 'src/hooks';
import { socialUrl } from 'src/links';
import {
  castStakeTxType,
  faqDappStaking,
  getStakeTxHistories,
  hotTopics,
  RecentStakeHistory,
} from 'src/modules/information';
import { useStore } from 'src/store';
import { DappCombinedInfo } from 'src/v2/models';
import { computed, defineComponent, ref, watchEffect } from 'vue';

export default defineComponent({
  components: { TransactionHistory },
  setup() {
    const txHistories = ref<RecentStakeHistory[]>([]);
    const isLoadingTxHistories = ref<boolean>(true);
    const { senderSs58Account, isMultisig } = useAccount();
    const { currentNetworkName, nativeTokenSymbol, currentNetworkIdx } = useNetworkInfo();
    const store = useStore();
    const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
    const subScan = computed<string>(() => `${providerEndpoints[currentNetworkIdx.value].subscan}`);

    const setTxHistories = async (): Promise<void> => {
      if (!senderSs58Account.value || !currentNetworkName.value) return;
      try {
        isLoadingTxHistories.value = true;
        const data = await getStakeTxHistories({
          address: senderSs58Account.value,
          network: currentNetworkName.value.toLowerCase(),
          symbol: nativeTokenSymbol.value,
          dapps: dapps.value,
          subScan: subScan.value,
        });
        if (data) {
          txHistories.value = data.map((it) => {
            return {
              ...it,
              txType: castStakeTxType(it.txType),
            };
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        isLoadingTxHistories.value = false;
      }
    };

    watchEffect(setTxHistories);

    return { faqDappStaking, hotTopics, txHistories, isLoadingTxHistories, socialUrl, isMultisig };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/stake-manage/styles/stake-information.scss';
</style>
