<template>
  <div>
    <BackToAsset :class="isHighlightRightUi && 'half-opacity'" />
    <MobileNavigator />
    <div class="wrapper--transfer">
      <div class="container--transfer">
        <TransferModeTab
          :is-local-transfer="isLocalTransfer"
          :set-is-local-transfer="handleSetIsLocalTransfer"
          :is-disabled-xcm="isDisabledXcm"
          :class="isHighlightRightUi && 'half-opacity'"
        />
        <div class="wrapper-containers">
          <div v-if="isLocalTransfer">
            <LocalTransfer
              v-if="isTransferNativeToken"
              :account-data="accountData"
              :class="isHighlightRightUi && 'half-opacity'"
              :symbol="token ? token.metadata.symbol : 'ASTR'"
              :handle-finalized-callback="handleFinalizedCallback"
              :set-right-ui="setRightUi"
            />
            <LocalXcmTransfer
              v-else
              :account-data="accountData"
              :class="isHighlightRightUi && 'half-opacity'"
              :symbol="token ? token.metadata.symbol : 'ASTR'"
              :token="token"
              :handle-finalized-callback="handleFinalizedCallback"
              :set-right-ui="setRightUi"
            />
          </div>
          <div v-else>
            <XcmBridge
              v-if="tokens"
              :token="token"
              :class="isHighlightRightUi && 'half-opacity'"
              :set-right-ui="setRightUi"
              :is-highlight-right-ui="isHighlightRightUi"
              :handle-finalized-callback="handleFinalizedCallback"
              :set-is-select-from-chain="setIsSelectFromChain"
            />
          </div>
          <Information v-if="rightUi === 'information'" :is-local-transfer="isLocalTransfer" />
          <SelectChain
            v-if="rightUi === 'select-chain'"
            v-click-away="cancelHighlight"
            :set-chain="handleSetChain"
            :chains="selectableChains"
          />
          <SelectToken
            v-if="rightUi === 'select-token'"
            v-click-away="cancelHighlight"
            :set-token="handleSetToken"
            :tokens="tokens"
          />
        </div>
      </div>
    </div>
    <ModalSelectChain
      :is-modal-select-chain="isModalSelectChain"
      :handle-modal-select-chain="handleModalSelectChain"
      :set-chain="handleSetChain"
      :chains="selectableChains"
    />
    <ModalSelectToken
      :is-modal-select-token="isModalSelectToken"
      :handle-modal-select-token="handleModalSelectToken"
      :set-token="handleSetToken"
      :tokens="tokens"
    />
  </div>
</template>
<script lang="ts">
import BackToAsset from 'src/components/assets/transfer/BackToAsset.vue';
import Information from 'src/components/assets/transfer/Information.vue';
import LocalTransfer from 'src/components/assets/transfer/LocalTransfer.vue';
import LocalXcmTransfer from 'src/components/assets/transfer/LocalXcmTransfer.vue';
import MobileNavigator from 'src/components/assets/transfer/MobileNavigator.vue';
import ModalSelectChain from 'src/components/assets/transfer/ModalSelectChain.vue';
import ModalSelectToken from 'src/components/assets/transfer/ModalSelectToken.vue';
import SelectChain from 'src/components/assets/transfer/SelectChain.vue';
import SelectToken from 'src/components/assets/transfer/SelectToken.vue';
import TransferModeTab from 'src/components/assets/transfer/TransferModeTab.vue';
import XcmBridge from 'src/components/assets/transfer/XcmBridge.vue';
import { endpointKey } from 'src/config/chainEndpoints';
import {
  useAccount,
  useBalance,
  useBreakpoints,
  useNetworkInfo,
  useTransferRouter,
} from 'src/hooks';
import { wait } from 'src/hooks/helper/common';
import { removeEvmName, XcmChain } from 'src/modules/xcm';
import { Asset } from 'src/v2/models';
import { computed, defineComponent, ref } from 'vue';

export type RightUi = 'information' | 'select-chain' | 'select-token';

export default defineComponent({
  components: {
    BackToAsset,
    MobileNavigator,
    TransferModeTab,
    Information,
    LocalTransfer,
    XcmBridge,
    SelectChain,
    ModalSelectChain,
    LocalXcmTransfer,
    SelectToken,
    ModalSelectToken,
  },
  setup() {
    const isModalSelectChain = ref<boolean>(false);
    const isSelectFromChain = ref<boolean>(false);
    const isModalSelectToken = ref<boolean>(false);
    const rightUi = ref<RightUi>('information');

    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const { screenSize, width } = useBreakpoints();
    const {
      tokenSymbol,
      router,
      from,
      to,
      token,
      selectableFromChains,
      chains,
      tokens,
      isLocalTransfer,
      setIsLocalTransfer,
      setToken,
      setChain,
    } = useTransferRouter();

    const isHighlightRightUi = computed<boolean>(() => rightUi.value !== 'information');
    const { nativeTokenSymbol, currentNetworkName, currentNetworkIdx } = useNetworkInfo();

    const isShibuya = computed<boolean>(() => currentNetworkIdx.value === endpointKey.SHIBUYA);

    const isTransferNativeToken = computed<boolean>(() => {
      return tokenSymbol.value === nativeTokenSymbol.value.toLowerCase();
    });

    const setIsSelectFromChain = (result: boolean) => {
      isSelectFromChain.value = result;
    };

    const handleSetToken = async (t: Asset): Promise<void> => {
      setToken(t);
      await setRightUi('information');
      isModalSelectToken.value && handleModalSelectToken({ isOpen: false });
    };

    const handleSetChain = async (chain: string): Promise<void> => {
      setChain({
        chain,
        isSelectFromChain: isSelectFromChain.value,
      });
      await setRightUi('information');
      isModalSelectChain.value && handleModalSelectChain({ isOpen: false });
    };

    const handleModalSelectChain = ({ isOpen }: { isOpen: boolean }): void => {
      isModalSelectChain.value = isOpen;
    };

    const handleModalSelectToken = ({ isOpen }: { isOpen: boolean }): void => {
      isModalSelectToken.value = isOpen;
    };

    const handleFinalizedCallback = (): void => {
      router.push('/assets');
    };

    const setRightUi = async (ui: RightUi): Promise<void> => {
      if (width.value > screenSize.md) {
        // Memo: tricky way to work with `cancelHighlight` function
        await wait(100);
        rightUi.value = ui;
      } else {
        if (ui === 'select-chain') {
          isModalSelectChain.value = true;
        }
        if (ui === 'select-token') {
          isModalSelectToken.value = true;
        }
      }
    };

    const cancelHighlight = async (e: any): Promise<void> => {
      const openClass = 'container--select-chain';
      if (isHighlightRightUi.value && e.target.className !== openClass) {
        await setRightUi('information');
      }
    };

    const selectableChains = computed<XcmChain[]>(() => {
      if (isSelectFromChain.value) {
        return selectableFromChains.value;
      } else {
        if (from.value === currentNetworkName.value.toLowerCase()) {
          // if: from = Astar/Shiden
          return chains.value.filter((it) => {
            const name = removeEvmName(it.name);
            return (
              currentNetworkName.value.toLowerCase() !== name.toLowerCase() &&
              to.value !== it.name.toLowerCase()
            );
          });
        } else {
          return chains.value.filter((it) => to.value !== it.name.toLowerCase());
        }
      }
    });

    const handleSetIsLocalTransfer = (isLocal: boolean) => {
      setIsLocalTransfer({ isLocal, originChain: token.value!.originChain });
    };

    const isDisabledXcm = computed(() => {
      return isShibuya.value;
    });

    return {
      isLocalTransfer,
      accountData,
      token,
      isHighlightRightUi,
      rightUi,
      isTransferNativeToken,
      isModalSelectChain,
      isModalSelectToken,
      isDisabledXcm,
      tokens,
      selectableChains,
      setRightUi,
      handleModalSelectToken,
      handleModalSelectChain,
      cancelHighlight,
      handleSetIsLocalTransfer,
      handleFinalizedCallback,
      handleSetToken,
      handleSetChain,
      setIsSelectFromChain,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer.scss';
</style>
