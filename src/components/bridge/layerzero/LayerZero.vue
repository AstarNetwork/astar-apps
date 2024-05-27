<template>
  <div v-if="currentAccount" class="wrapper--bridge">
    <div class="container--bridge">
      <div class="wrapper-containers">
        <lz-bridge
          :selected-token="selectedToken"
          :set-right-ui="setRightUi"
          :bridge-amt="String(bridgeAmt)"
          :err-msg="errMsg"
          :is-disabled-bridge="isDisabledBridge"
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
          :transaction-fee="transactionFee"
          @update:isApproveMaxAmount="(value: boolean) => (isApproveMaxAmount = value)"
        />
        <information
          v-if="rightUi === 'information'"
          :transfer-type="HistoryTxType.LZ_BRIDGE"
          :is-history="true"
        />
        <select-token
          v-if="rightUi === 'select-token'"
          v-click-away="cancelHighlight"
          :set-token="handleSetToken"
          :tokens="lzTokens"
          :input-import-token-handler="inputImportTokenHandler"
          :import-token-address="importTokenAddress"
          :from-chain-id="fromChainId"
          :from-chain-name="fromChainName"
          :to-chain-name="toChainName"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { wait } from '@astar-network/astar-sdk-core';
import Information from 'src/components/assets/transfer/Information.vue';
import { RightUi } from 'src/components/assets/transfer/Transfer.vue';
import LzBridge from 'src/components/bridge/layerzero/LzBridge.vue';
import SelectToken from 'src/components/bridge/layerzero/SelectToken.vue';
import { useAccount, useBreakpoints } from 'src/hooks';
import { HistoryTxType } from 'src/modules/account';
import { computed, defineComponent, ref } from 'vue';
import { useLayerZeroBridge } from '../../../hooks/bridge/useLayerZeroBridge';
import { LayerZeroToken } from '../../../modules/zk-evm-bridge/layerzero/index';

export default defineComponent({
  components: {
    Information,
    LzBridge,
    SelectToken,
  },
  setup() {
    const isBridge = ref<boolean>(true);
    const rightUi = ref<RightUi>('information');
    const isModalSelectToken = ref<boolean>(false);

    const { screenSize, width } = useBreakpoints();

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
      lzTokens,
      selectedToken,
      isApproved,
      isApproving,
      isApproveMaxAmount,
      transactionFee,
      inputHandler,
      reverseChain,
      handleBridge,
      inputImportTokenHandler,
      setSelectedToken,
      handleApprove,
      setIsApproving,
    } = useLayerZeroBridge();

    const { currentAccount } = useAccount();
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

    const handleSetToken = async (t: LayerZeroToken): Promise<void> => {
      setSelectedToken(t);
      await setRightUi('information');
      isModalSelectToken.value && handleModalSelectToken({ isOpen: false });
    };

    return {
      currentAccount,
      isBridge,
      HistoryTxType,
      isModalSelectToken,
      rightUi,
      isHighlightRightUi,
      lzTokens,
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
      transactionFee,
      inputImportTokenHandler,
      cancelHighlight,
      handleSetToken,
      setRightUi,
      inputHandler,
      reverseChain,
      handleBridge,
      setSelectedToken,
      handleApprove,
      setIsApproving,
      handleModalSelectToken,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/layerzero/styles/layerzero.scss';
</style>
