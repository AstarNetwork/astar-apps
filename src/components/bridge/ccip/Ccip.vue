<template>
  <div v-if="currentAccount" class="wrapper--bridge">
    <div class="container--bridge">
      <div class="wrapper-containers">
        <ccip-bridge
          :selected-token="selectedToken"
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
          :bridge-fee="bridgeFee"
          :is-to-soneium="isToSoneium"
          :is-gas-payable="Boolean(isGasPayable)"
          @update:isApproveMaxAmount="(value: boolean) => (isApproveMaxAmount = value)"
        />
        <information :transfer-type="HistoryTxType.LZ_BRIDGE" :is-history="true" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Information from 'src/components/assets/transfer/Information.vue';
import CcipBridge from 'src/components/bridge/ccip/CcipBridge.vue';
import { useAccount } from 'src/hooks';
import { HistoryTxType } from 'src/modules/account';
import { defineComponent, ref } from 'vue';
import { useCcipBridge } from '../../../hooks/bridge/useCcipBridge';

export default defineComponent({
  components: {
    Information,
    CcipBridge,
  },
  setup() {
    const isBridge = ref<boolean>(true);

    const {
      bridgeAmt,
      errMsg,
      isDisabledBridge,
      fromBridgeBalance,
      toBridgeBalance,
      fromChainName,
      toChainName,
      fromChainId,
      selectedToken,
      isApproved,
      isApproving,
      isApproveMaxAmount,
      bridgeFee,
      isToSoneium,
      isGasPayable,
      inputHandler,
      reverseChain,
      handleBridge,
      handleApprove,
      setIsApproving,
    } = useCcipBridge();

    const { currentAccount } = useAccount();

    return {
      currentAccount,
      isBridge,
      HistoryTxType,
      selectedToken,
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
      bridgeFee,
      isToSoneium,
      isGasPayable,
      inputHandler,
      reverseChain,
      handleBridge,
      handleApprove,
      setIsApproving,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/ccip/styles/ccip.scss';
</style>
