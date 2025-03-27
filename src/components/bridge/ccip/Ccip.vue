<template>
  <div v-if="currentAccount" class="wrapper--bridge">
    <div class="container--bridge">
      <div class="wrapper-containers">
        <ccip-bridge
          :class="isHighlightRightUi && 'half-opacity'"
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
          :set-right-ui="setRightUi"
          :input-handler="inputHandler"
          :reverse-chain="reverseChain"
          :handle-bridge="handleBridge"
          :handle-approve="handleApprove"
          :set-is-approving="setIsApproving"
          :is-approve-max-amount="isApproveMaxAmount"
          :bridge-fee="bridgeFee"
          :is-gas-payable="Boolean(isGasPayable)"
          :load-is-approved="loadIsApproved"
          @update:isApproveMaxAmount="(value: boolean) => (isApproveMaxAmount = value)"
        />
        <div v-if="rightUi === 'information'">
          <information :transfer-type="HistoryTxType.CCIP_BRIDGE" :is-history="false" />
          <div v-if="isGasRebate" class="row--banner">
            <img
              class="banner--eth-rebates"
              src="~assets/img/banner/banner-eth-rebate.png"
              alt="eth-rebate"
            />
          </div>
        </div>
        <select-chain
          v-if="rightUi === 'select-chain'"
          v-click-away="cancelHighlight"
          :set-chain="handleSetChain"
          :chains="getSelectableChains(isSelectFromChain ? fromChainName : toChainName)"
        />
      </div>
    </div>
    <modal-select-chain
      :is-modal-select-chain="isModalSelectChain"
      :handle-modal-select-chain="handleModalSelectChain"
      :set-chain="handleSetChain"
      :chains="getSelectableChains(isSelectFromChain ? fromChainName : toChainName)"
      :selected-chain="isSelectFromChain ? fromChainName : toChainName"
    />
  </div>
</template>
<script lang="ts">
import Information from 'src/components/assets/transfer/Information.vue';
import CcipBridge from 'src/components/bridge/ccip/CcipBridge.vue';
import SelectChain from 'src/components/bridge/ccip/SelectChain.vue';
import ModalSelectChain from 'src/components/bridge/ccip/ModalSelectChain.vue';
import { useAccount, useBreakpoints } from 'src/hooks';
import { HistoryTxType } from 'src/modules/account';
import { computed, defineComponent, ref } from 'vue';
import { useCcipBridge } from '../../../hooks/bridge/useCcipBridge';
import { wait } from '@astar-network/astar-sdk-core';
import { reverseObject } from 'src/modules/common';
import { CcipNetworkName, ccipNetworkParam } from 'src/modules/ccip-bridge';

type RightUi = 'information' | 'select-chain';

export default defineComponent({
  components: {
    Information,
    CcipBridge,
    SelectChain,
    ModalSelectChain,
  },
  setup() {
    const isBridge = ref<boolean>(true);
    const isModalSelectChain = ref<boolean>(false);
    const isSelectFromChain = ref<boolean>(false);
    const rightUi = ref<RightUi>('information');
    const isHighlightRightUi = computed<boolean>(() => rightUi.value !== 'information');

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
      isGasPayable,
      router,
      route,
      chains,
      loadIsApproved,
      inputHandler,
      reverseChain,
      handleBridge,
      handleApprove,
      setIsApproving,
    } = useCcipBridge();

    const { currentAccount } = useAccount();
    const { screenSize, width } = useBreakpoints();

    const isGasRebate = computed<boolean>(() => {
      return (
        toChainName.value === CcipNetworkName.Soneium &&
        fromChainName.value === CcipNetworkName.AstarEvm
      );
    });

    const handleSetChain = async (chain: CcipNetworkName): Promise<void> => {
      let query = { from: '', to: '' };
      const selectedChain = reverseObject(ccipNetworkParam)[chain];
      const originalFrom = String(route.query.from);
      const originalTo = String(route.query.to);

      query = isSelectFromChain.value
        ? { from: selectedChain, to: originalTo }
        : { from: originalFrom, to: selectedChain };

      if (query.from === query.to) {
        if (isSelectFromChain.value) {
          query.from = selectedChain;
          query.to = originalFrom;
        } else {
          query.from = originalTo;
          query.to = selectedChain;
        }
      }

      router.replace({
        query,
      });
      await setRightUi('information');
      isModalSelectChain.value && handleModalSelectChain({ isOpen: false });
    };

    const handleModalSelectChain = ({ isOpen }: { isOpen: boolean }): void => {
      isModalSelectChain.value = isOpen;
    };

    const setRightUi = async (ui: RightUi, setChainDirection?: 'from' | 'to'): Promise<void> => {
      if (setChainDirection) {
        isSelectFromChain.value = setChainDirection === 'from';
      }

      if (width.value > screenSize.md) {
        // Memo: tricky way to work with `cancelHighlight` function
        await wait(100);
        rightUi.value = ui;
      } else {
        if (ui === 'select-chain') {
          isModalSelectChain.value = true;
        } else {
          isModalSelectChain.value = false;
        }
      }
    };

    const cancelHighlight = async (e: any): Promise<void> => {
      const openClass = 'container--select-chain';
      if (isHighlightRightUi.value && e.target.className !== openClass) {
        await setRightUi('information');
      }
    };

    const getSelectableChains = (selectedChain: CcipNetworkName): CcipNetworkName[] => {
      return chains.value.filter((chain) => chain !== selectedChain);
    };

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
      isGasPayable,
      rightUi,
      isSelectFromChain,
      isHighlightRightUi,
      isModalSelectChain,
      loadIsApproved,
      isGasRebate,
      setRightUi,
      getSelectableChains,
      cancelHighlight,
      inputHandler,
      reverseChain,
      handleBridge,
      handleApprove,
      setIsApproving,
      handleModalSelectChain,
      handleSetChain,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/bridge/ccip/styles/ccip.scss';
</style>
