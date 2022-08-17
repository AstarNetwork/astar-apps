<template>
  <div>
    <BackToAsset :class="isHighlightRightUi && 'half-opacity'" />
    <MobileNavigator />
    <div class="wrapper--transfer">
      <div class="container--transfer">
        <TransferModeTab
          :is-local-transfer="isLocalTransfer"
          :set-is-local-transfer="setIsLocalTransfer"
          :is-disabled-xcm="isShibuya"
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
            :set-chain="setChain"
            :chains="selectableChains"
          />
          <SelectToken
            v-if="rightUi === 'select-token'"
            v-click-away="cancelHighlight"
            :set-token="setToken"
            :tokens="tokens"
          />
        </div>
      </div>
    </div>
    <ModalSelectChain
      :is-modal-select-chain="isModalSelectChain"
      :handle-modal-select-chain="handleModalSelectChain"
      :set-chain="setChain"
      :chains="selectableChains"
    />
    <ModalSelectToken
      :is-modal-select-token="isModalSelectToken"
      :handle-modal-select-token="handleModalSelectToken"
      :set-token="setToken"
      :tokens="tokens"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch, watchEffect } from 'vue';
import BackToAsset from 'src/components/assets/transfer/BackToAsset.vue';
import MobileNavigator from 'src/components/assets/transfer/MobileNavigator.vue';
import TransferModeTab from 'src/components/assets/transfer/TransferModeTab.vue';
import Information from 'src/components/assets/transfer/Information.vue';
import LocalTransfer from 'src/components/assets/transfer/LocalTransfer.vue';
import LocalXcmTransfer from 'src/components/assets/transfer/LocalXcmTransfer.vue';
import SelectChain from 'src/components/assets/transfer/SelectChain.vue';
import SelectToken from 'src/components/assets/transfer/SelectToken.vue';
import XcmBridge from 'src/components/assets/transfer/XcmBridge.vue';
import ModalSelectChain from 'src/components/assets/transfer/ModalSelectChain.vue';
import ModalSelectToken from 'src/components/assets/transfer/ModalSelectToken.vue';
import {
  useAccount,
  useBalance,
  useBreakpoints,
  useNetworkInfo,
  useTransferRouter,
} from 'src/hooks';
import { useStore } from 'src/store';
import { XcmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';
import { wait } from 'src/hooks/helper/common';
import { generateNativeAsset, xcmToken } from 'src/modules/xcm/tokens';
import { endpointKey } from 'src/config/chainEndpoints';
import { Chain, checkIsRelayChain, XcmChain, xcmChains } from 'src/modules/xcm';

type RightUi = 'information' | 'select-chain' | 'select-token';

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
    const isLocalTransfer = ref<boolean>(true);
    const token = ref<Asset>();
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const store = useStore();
    const { screenSize, width } = useBreakpoints();
    const {
      chainFrom,
      chainTo,
      tokenSymbol,
      router,
      isTransferPage,
      redirect,
      mode,
      network,
      xcmOpponentChain,
    } = useTransferRouter();

    const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);
    const isHighlightRightUi = computed<boolean>(() => rightUi.value !== 'information');
    const { nativeTokenSymbol, currentNetworkName, currentNetworkIdx } = useNetworkInfo();

    const isShibuya = computed<boolean>(() => currentNetworkIdx.value === endpointKey.SHIBUYA);

    const isTransferNativeToken = computed<boolean>(() => {
      return tokenSymbol.value === nativeTokenSymbol.value.toLowerCase();
    });

    const getNetworkName = (chain?: string): string => {
      console.log('getNetworkName');
      const isNativeToken = tokenSymbol.value === nativeTokenSymbol.value.toLowerCase();
      const currentNetwork = currentNetworkName.value.toLowerCase();
      const defaultXcmBridgeForNative =
        currentNetworkIdx.value === endpointKey.ASTAR
          ? Chain.ACALA.toLowerCase()
          : Chain.KARURA.toLowerCase();

      if (chain) {
        // if: users select chain via SelectChain UI
        const isDuplicated = chain === chainFrom.value || chain === chainTo.value;
        // const c = chain.toLowerCase();
        // Todo: check: chainFrom
        const isAstarEvm = chain.includes('evm') || chainTo.value.includes('evm');
        console.log('chain', chain);
        console.log('isDuplicated', isDuplicated);
        if (isSelectFromChain.value) {
          const toNetwork = isDuplicated
            ? defaultXcmBridgeForNative
            : isAstarEvm
            ? chainTo.value
            : currentNetwork;
          console.log('isAstarEvm', isAstarEvm);
          console.log('toNetwork', toNetwork);
          return (chain + '-' + toNetwork).toLowerCase();
        } else {
          console.log('isAstarEvm', isAstarEvm);
          const fromNetwork = isDuplicated
            ? defaultXcmBridgeForNative
            : isAstarEvm
            ? chainFrom.value
            : currentNetwork;
          console.log('fromNetwork', fromNetwork);
          return (fromNetwork + '-' + chain).toLowerCase();
        }
      } else {
        const originChain = isLocalTransfer.value
          ? ''
          : isNativeToken
          ? defaultXcmBridgeForNative
          : token.value?.originChain.toLowerCase();
        return isLocalTransfer.value ? currentNetwork : originChain + '-' + currentNetwork;
      }
    };

    const setIsLocalTransfer = (result: boolean): void => {
      isLocalTransfer.value = result;
      const mode = result ? 'local' : 'xcm';
      const network = getNetworkName();
      router.replace({
        path: '/assets/transfer',
        query: { token: tokenSymbol.value, network, mode },
      });
    };

    const setIsSelectFromChain = (result: boolean) => {
      isSelectFromChain.value = result;
    };

    const setToken = async (t: Asset): Promise<void> => {
      const network = getNetworkName();
      const mode = isLocalTransfer.value ? 'local' : 'xcm';
      router.replace({
        path: '/assets/transfer',
        query: { token: t.metadata.symbol.toLowerCase(), network, mode },
      });
      await setRightUi('information');
      isModalSelectToken.value && handleModalSelectToken({ isOpen: false });
    };

    const setChain = async (chain: string): Promise<void> => {
      const network = getNetworkName(chain);
      console.log('network', network);
      const selectedNetwork = network.split('-')[1].toLowerCase();
      console.log('selectedNetwork', selectedNetwork);
      const t =
        xcmToken[currentNetworkIdx.value].find((it) => {
          return it.originChain.toLowerCase() === selectedNetwork && it.isNativeToken;
        })?.symbol || nativeTokenSymbol.value;
      router.replace({
        path: '/assets/transfer',
        query: { token: t.toLowerCase(), network, mode: 'xcm' },
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

    const handleUpdateXcmTokenAssets = (): void => {
      if (currentAccount.value) {
        store.dispatch('assets/getAssets', currentAccount.value);
      }
    };

    const handleDefaultConfig = (): void => {
      // Memo: avoid triggering this function whenever users go back to assets page
      if (!isTransferPage.value || !currentNetworkName.value) {
        return;
      }

      const symbol = tokenSymbol.value;
      const nativeTokenSymbolRef = nativeTokenSymbol.value;
      isLocalTransfer.value = mode.value === 'local';

      const isRedirect = !network.value
        .toLowerCase()
        .includes(currentNetworkName.value.toLowerCase());

      if (isRedirect) return redirect();

      token.value = generateNativeAsset(nativeTokenSymbolRef);
      const isFetchedAssets = xcmAssets.value && xcmAssets.value.assets.length !== 0;
      if (isFetchedAssets && symbol) {
        try {
          const isXcmAsset = symbol !== nativeTokenSymbolRef.toLowerCase();
          if (isXcmAsset) {
            token.value = xcmAssets.value.assets.find(
              (it) => it.metadata.symbol.toLowerCase() === symbol
            );
          }
          if (!token.value) throw Error('No token is found');
        } catch (error) {
          console.error('error', error);
          redirect();
        }
      }
    };

    const tokens = computed<Asset[]>(() => {
      let tokens: Asset[];
      if (!xcmAssets.value || !nativeTokenSymbol.value) return [];

      const nativeToken = generateNativeAsset(nativeTokenSymbol.value);
      let selectableTokens;
      if (isLocalTransfer.value) {
        selectableTokens = xcmAssets.value.assets;
        tokens = selectableTokens.filter(({ isXcmCompatible }) => isXcmCompatible);
        tokens.unshift(nativeToken);
      } else {
        const selectedNetwork = xcmOpponentChain.value;
        const isSelectedRelayChain = checkIsRelayChain(selectedNetwork);
        selectableTokens = xcmAssets.value.assets.filter(
          (it) => it.originChain.toLowerCase() === selectedNetwork.toLowerCase()
        );
        tokens = selectableTokens.filter(({ isXcmCompatible }) => isXcmCompatible);
        !isSelectedRelayChain && tokens.push(nativeToken);
      }

      return tokens;
    });

    const chains = computed<XcmChain[]>(() => {
      const relayChainId =
        currentNetworkIdx.value === endpointKey.ASTAR ? Chain.POLKADOT : Chain.KUSAMA;
      const disabledChain = [Chain.MOONBEAM];
      const selectableChains = xcmChains.filter((it) => {
        return it.relayChain === relayChainId && !disabledChain.includes(it.name);
      });
      selectableChains.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      return selectableChains;
    });

    const selectableFromChains = computed<XcmChain[]>(() => {
      return chains.value.filter((it) => !it.name.includes('_evm'));
    });

    const selectableChains = computed<XcmChain[]>(() => {
      return isSelectFromChain.value ? selectableFromChains.value : chains.value;
    });

    watch([currentAccount], handleUpdateXcmTokenAssets, { immediate: true });
    watchEffect(handleDefaultConfig);

    watchEffect(() => {
      // console.log('chains', chains.value);
      // console.log('selectableChains', selectableChains.value);
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
      isShibuya,
      xcmAssets,
      tokens,
      selectableChains,
      setRightUi,
      handleModalSelectToken,
      handleModalSelectChain,
      cancelHighlight,
      setIsLocalTransfer,
      handleFinalizedCallback,
      setToken,
      setChain,
      setIsSelectFromChain,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer.scss';
</style>
