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
        <l1-history
          v-else
          :histories="histories"
          :is-loading-histories="isLoadingHistories"
          :l1-network="l1Network"
          :l2-network="l2Network"
          :fetch-user-history="fetchUserHistory"
          :handle-claim="handleClaim"
        />
        <information
          v-if="rightUi === 'information'"
          :transfer-type="HistoryTxType.ZK_ETHEREUM_BRIDGE"
          :is-history="false"
        />
        <select-token
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
        />
      </div>
      <modal-select-import-token
        :is-modal-select-token="isModalSelectToken"
        :handle-modal-select-token="handleModalSelectToken"
        :set-token="handleSetToken"
        :tokens="zkTokens"
        :token="selectedToken"
        :input-import-token-handler="inputImportTokenHandler"
        :import-token-address="importTokenAddress"
        :from-chain-id="fromChainId"
        :from-chain-name="fromChainName"
        :to-chain-name="toChainName"
        :set-tokens="setZkTokens"
      />
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
import BridgeModeTab from 'src/components/bridge/ethereum/BridgeModeTab.vue';
import L1Bridge from 'src/components/bridge/ethereum/L1Bridge.vue';
import L1History from 'src/components/bridge/ethereum/L1History.vue';
import ModalSelectImportToken from 'src/components/bridge/ethereum/ModalSelectImportToken.vue';
import { useRoute, useRouter } from 'vue-router';

type BridgeTabMode = 'bridge' | 'history';

export default defineComponent({
  components: {
    Information,
    BridgeModeTab,
    L1Bridge,
    L1History,
    SelectToken,
    ModalSelectImportToken,
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
      setZkTokens,
      setSelectedToken,
      handleApprove,
      setIsApproving,
    } = useL1Bridge();

    const { currentAccount } = useAccount();
    const router = useRouter();
    const route = useRoute();
    const network = computed<string>(() => route.params.network as string);
    const tab = computed<BridgeTabMode>(() => route.query.tab as BridgeTabMode);
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
      setSelectedToken(t);
      await setRightUi('information');
      isModalSelectToken.value && handleModalSelectToken({ isOpen: false });
    };

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
      setIsBridge,
      fetchUserHistory,
      handleClaim,
      inputHandler,
      reverseChain,
      handleBridge,
      setZkTokens,
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
