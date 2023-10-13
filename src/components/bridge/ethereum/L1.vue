<template>
  <div v-if="currentAccount" class="wrapper--bridge">
    <div class="container--bridge">
      <bridge-mode-tab
        :is-action-required="isActionRequired"
        :is-bridge="isBridge"
        :set-is-bridge="setIsBridge"
      />
      <div class="wrapper-containers">
        <l1-bridge
          v-if="isBridge"
          :fetch-user-history="fetchUserHistory"
          :set-is-bridge="setIsBridge"
        />
        <l1-history
          v-else
          :histories="histories"
          :is-loading-histories="isLoadingHistories"
          :l1-network="l1Network"
          :l2-network="l2Network"
          :fetch-user-history="fetchUserHistory"
          :handle-claim="handleClaim"
        />
        <information :transfer-type="HistoryTxType.Transfer" :is-history="false" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { useAccount, useL1History } from 'src/hooks';
import { defineComponent, ref, computed, watch } from 'vue';
import { HistoryTxType } from 'src/modules/account';
import Information from 'src/components/assets/transfer/Information.vue';
import BridgeModeTab from 'src/components/bridge/ethereum/BridgeModeTab.vue';
import L1Bridge from 'src/components/bridge/ethereum/L1Bridge.vue';
import L1History from 'src/components/bridge/ethereum/L1History.vue';
import { useRoute, useRouter } from 'vue-router';

type BridgeTabMode = 'bridge' | 'history';

export default defineComponent({
  components: { Information, BridgeModeTab, L1Bridge, L1History },
  setup() {
    const isBridge = ref<boolean>(true);

    const {
      histories,
      isLoadingHistories,
      l1Network,
      l2Network,
      isActionRequired,
      fetchUserHistory,
      handleClaim,
    } = useL1History();
    const { currentAccount } = useAccount();
    const router = useRouter();
    const route = useRoute();
    const network = computed<string>(() => route.params.network as string);
    const tab = computed<BridgeTabMode>(() => route.query.tab as BridgeTabMode);

    const setIsBridge = (result: boolean): void => {
      isBridge.value = result;
      router.push({
        path: `/${network.value}/bridge/ethereum`,
        query: {
          tab: result ? 'bridge' : 'history',
        },
      });
    };

    watch(
      [tab],
      () => {
        if (tab.value === 'history') {
          setIsBridge(false);
        }
      },
      { immediate: true }
    );

    return {
      currentAccount,
      isBridge,
      HistoryTxType,
      histories,
      isLoadingHistories,
      l1Network,
      l2Network,
      isActionRequired,
      setIsBridge,
      fetchUserHistory,
      handleClaim,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/ethereum/styles/l1.scss';
</style>
