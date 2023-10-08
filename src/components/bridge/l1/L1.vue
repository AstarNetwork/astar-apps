<template>
  <div v-if="currentAccount" class="wrapper--bridge">
    <div class="container--bridge">
      <bridge-mode-tab :is-bridge="isBridge" :set-is-bridge="setIsBridge" />
      <div class="wrapper-containers">
        <div v-if="isBridge">
          <l1-bridge />
        </div>
        <div v-else>history</div>
        <information :transfer-type="HistoryTxType.Transfer" :is-history="false" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { useAccount } from 'src/hooks';
import { defineComponent, ref, computed, watch } from 'vue';
import { HistoryTxType } from 'src/modules/account';
import Information from 'src/components/assets/transfer/Information.vue';
import BridgeModeTab from 'src/components/bridge/l1/BridgeModeTab.vue';
import L1Bridge from 'src/components/bridge/l1/L1Bridge.vue';
import { useRoute, useRouter } from 'vue-router';

type BridgeTabMode = 'bridge' | 'history';

export default defineComponent({
  components: { Information, BridgeModeTab, L1Bridge },
  setup() {
    const isBridge = ref<boolean>(true);

    const router = useRouter();
    const route = useRoute();
    const network = computed<string>(() => route.params.network as string);
    const tab = computed<BridgeTabMode>(() => route.query.tab as BridgeTabMode);
    const setIsBridge = (result: boolean): void => {
      isBridge.value = result;
      router.push({
        path: `/${network.value}/bridge/l1`,
        query: {
          tab: result ? 'bridge' : 'history',
        },
      });
    };
    const { currentAccount } = useAccount();

    watch(
      [tab],
      () => {
        if (tab.value === 'history') {
          setIsBridge(false);
        }
      },
      { immediate: true }
    );

    return { currentAccount, isBridge, HistoryTxType, setIsBridge };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/l1/styles/l1.scss';
</style>
