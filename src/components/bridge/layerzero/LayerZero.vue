<template>
  <div v-if="currentAccount" class="wrapper--bridge">
    <div class="container--bridge">
      <div class="wrapper-containers">
        <lz-bridge
          :selected-token="selectedToken"
          :set-right-ui="setRightUi"
          :bridge-amt="String(bridgeAmt)"
          :err-msg="errMsg"
          :is-disabled-bridge="isDisabledBridge || !isGelatoApiConnected"
          :from-bridge-balance="fromBridgeBalance"
          :to-bridge-balance="toBridgeBalance"
          :from-chain-name="fromChainName"
          :to-chain-name="toChainName"
          :is-approving="isApproving"
          :is-approved="isApproved"
          :input-handler="inputHandler"
          :reverse-chain="reverseChain"
          :handle-bridge="handleBridge"
          :handle-approve="handleApprove"
          :set-is-approving="setIsApproving"
          :is-approve-max-amount="isApproveMaxAmount"
          @update:isApproveMaxAmount="(value: boolean) => (isApproveMaxAmount = value)"
        />
        <information
          v-if="rightUi === 'information'"
          :transfer-type="HistoryTxType.ZK_ETHEREUM_BRIDGE"
          :is-history="false"
        />
        <!-- <select-token
          v-if="rightUi === 'select-token'"
          v-click-away="cancelHighlight"
          :set-token="handleSetToken"
          :tokens="zkTokens"
          :input-import-token-handler="inputImportTokenHandler"
          :import-token-address="importTokenAddress"
          :from-chain-id="fromChainId"
          :from-chain-name="fromChainName"
          :to-chain-name="toChainName"
          :set-zk-tokens="setZkTokens"
        /> -->
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { wait } from '@astar-network/astar-sdk-core';
import { RightUi } from 'src/components/assets/transfer/Transfer.vue';
import SelectToken from 'src/components/bridge/common/SelectToken.vue';
import { useAccount, useBreakpoints, useL1Bridge, useL1History } from 'src/hooks';
import { HistoryTxType } from 'src/modules/account';
import { ZkToken } from 'src/modules/zk-evm-bridge';
import { defineComponent, ref, computed, watch } from 'vue';
import Information from 'src/components/assets/transfer/Information.vue';
import LzBridge from 'src/components/bridge/layerzero/LzBridge.vue';

import { useRoute, useRouter } from 'vue-router';
import { useLayerZeroBridge } from '../../../hooks/bridge/useLayerZeroBridge';

export default defineComponent({
  components: {
    Information,
    LzBridge,
    // SelectToken,
  },
  setup() {
    const isBridge = ref<boolean>(true);
    const rightUi = ref<RightUi>('information');
    const isModalSelectToken = ref<boolean>(false);

    const { screenSize, width } = useBreakpoints();
    const {
      histories,
      isLoadingHistories,
      l1Network,
      l2Network,
      isActionRequired,
      isGelatoApiConnected,
      fetchUserHistory,
      handleClaim,
    } = useL1History();

    const {
      bridgeAmt,
      errMsg,
      isDisabledBridge,
      fromBridgeBalance,
      toBridgeBalance,
      fromChainName,
      toChainName,
      importTokenAddress,
      fromChainId,
      zkTokens,
      selectedToken,
      isApproved,
      isApproving,
      isApproveMaxAmount,
      inputHandler,
      reverseChain,
      handleBridge,
      inputImportTokenHandler,
      // setZkTokens,
      setSelectedToken,
      handleApprove,
      setIsApproving,
    } = useLayerZeroBridge();

    const { currentAccount } = useAccount();
    const router = useRouter();
    const route = useRoute();
    const network = computed<string>(() => route.params.network as string);
    const isHighlightRightUi = computed<boolean>(() => rightUi.value !== 'information');

    const setRightUi = async (ui: RightUi): Promise<void> => {
      if (width.value > screenSize.md) {
        // Memo: tricky way to work with `cancelHighlight` function
        await wait(100);
        rightUi.value = ui;
      } else {
        if (ui === 'select-token') {
          isModalSelectToken.value = true;
        }
      }
    };

    const cancelHighlight = async (e: any): Promise<void> => {
      const openClass = 'container--select-chain';
      if (isHighlightRightUi.value && e.target.className !== openClass) {
        await setRightUi('information');
        const mockBlankInputEvent = { target: { value: '' } };
        inputImportTokenHandler(mockBlankInputEvent);
      }
    };

    const handleModalSelectToken = ({ isOpen }: { isOpen: boolean }): void => {
      isModalSelectToken.value = isOpen;
    };

    const handleSetToken = async (t: ZkToken): Promise<void> => {
      // setSelectedToken(t);
      await setRightUi('information');
      isModalSelectToken.value && handleModalSelectToken({ isOpen: false });
    };

    return {
      currentAccount,
      isBridge,
      HistoryTxType,
      histories,
      isLoadingHistories,
      l1Network,
      l2Network,
      isActionRequired,
      isModalSelectToken,
      rightUi,
      isHighlightRightUi,
      zkTokens,
      selectedToken,
      importTokenAddress,
      bridgeAmt,
      errMsg,
      isDisabledBridge,
      fromBridgeBalance,
      toBridgeBalance,
      fromChainName,
      toChainName,
      fromChainId,
      isApproved,
      isApproving,
      isApproveMaxAmount,
      isGelatoApiConnected,
      inputImportTokenHandler,
      cancelHighlight,
      handleSetToken,
      setRightUi,
      fetchUserHistory,
      handleClaim,
      inputHandler,
      reverseChain,
      handleBridge,
      // setZkTokens,
      setSelectedToken,
      handleApprove,
      setIsApproving,
      handleModalSelectToken,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/ethereum/styles/l1.scss';
</style>
