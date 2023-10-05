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
import { defineComponent, ref } from 'vue';
import { HistoryTxType } from 'src/modules/account';
import Information from 'src/components/assets/transfer/Information.vue';
import BridgeModeTab from 'src/components/bridge/l1/BridgeModeTab.vue';
import L1Bridge from 'src/components/bridge/l1/L1Bridge.vue';

export default defineComponent({
  components: { Information, BridgeModeTab, L1Bridge },
  setup() {
    const isBridge = ref<boolean>(true);
    const setIsBridge = (result: boolean): void => {
      isBridge.value = result;
    };
    const { currentAccount } = useAccount();

    return { currentAccount, isBridge, HistoryTxType, setIsBridge };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/l1/styles/l1.scss';
</style>
