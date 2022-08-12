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
              v-if="token !== null"
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
import { useAccount, useBalance, useBreakpoints, useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import { XcmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';
import { wait } from 'src/hooks/helper/common';
import { useRouter } from 'vue-router';
import { generateNativeAsset, xcmToken } from 'src/modules/xcm/tokens';
import { endpointKey } from 'src/config/chainEndpoints';
import { Chain, checkIsRelayChain } from 'src/modules/xcm';

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
    const router = useRouter();
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const store = useStore();
    const { screenSize, width } = useBreakpoints();
    const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);
    const isHighlightRightUi = computed<boolean>(() => rightUi.value !== 'information');
    const { nativeTokenSymbol, currentNetworkName, currentNetworkIdx } = useNetworkInfo();

    const isShibuya = computed(() => currentNetworkIdx.value === endpointKey.SHIBUYA);

    const isTransferNativeToken = computed<boolean>(() => {
      const query = router.currentRoute.value.query;
      const symbol = query.token as string;
      return symbol.toLowerCase() === nativeTokenSymbol.value.toLowerCase();
    });

    const getNetworkName = (chain?: string): string => {
      const query = router.currentRoute.value.query;
      const symbol = query.token as string;
      const isNativeToken = symbol.toLowerCase() === nativeTokenSymbol.value.toLowerCase();
      const currentNetwork = currentNetworkName.value.toLowerCase();
      const defaultXcmBridgeForNative =
        currentNetworkIdx.value === endpointKey.ASTAR
          ? Chain.ACALA.toLowerCase()
          : Chain.KARURA.toLowerCase();

      if (chain) {
        // if: users select chain via SelectChain UI
        if (chain.toLowerCase() === currentNetwork) {
          return currentNetwork + '-' + defaultXcmBridgeForNative;
        } else {
          const c = chain.toLowerCase();
          return isSelectFromChain.value ? c + '-' + currentNetwork : currentNetwork + '-' + c;
        }
      } else {
        const originChain = isLocalTransfer.value
          ? ''
          : isNativeToken
          ? defaultXcmBridgeForNative
          : token.value?.originChain.toLowerCase();
        return isLocalTransfer.value ? currentNetwork : currentNetwork + '-' + originChain;
      }
    };

    const setIsLocalTransfer = (result: boolean): void => {
      isLocalTransfer.value = result;
      const query = router.currentRoute.value.query;
      const symbol = query.token as string;
      const network = getNetworkName();
      router.replace({
        path: '/assets/transfer',
        query: { token: symbol.toLowerCase(), network, mode: result ? 'local' : 'xcm' },
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
      const selectedNetwork = network.split('-')[1].toLowerCase();
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

    const redirect = (): void => {
      const token = nativeTokenSymbol.value.toLowerCase();
      const network = currentNetworkName.value.toLowerCase();
      router.push({
        path: '/assets/transfer',
        query: { token, network, mode: 'local' },
      });
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
      const currentRouteRef = router.currentRoute.value;
      // Memo: avoid triggering this function whenever users go back to assets page
      if (!currentRouteRef.fullPath.includes('transfer') || !currentNetworkName.value) {
        return;
      }

      const nativeTokenSymbolRef = nativeTokenSymbol.value;
      const query = currentRouteRef.query;
      const s = (query.token as string) || '';
      const symbol = s.toLowerCase();
      const mode = query.mode as string;
      const network = query.network as string;
      isLocalTransfer.value = mode === 'local';

      const isRedirect =
        !symbol || !network.toLowerCase().includes(currentNetworkName.value.toLowerCase());
      if (isRedirect) return redirect();

      token.value = generateNativeAsset(nativeTokenSymbolRef);
      const isFetchedAssets = xcmAssets.value && xcmAssets.value.assets.length !== 0;
      if (isFetchedAssets) {
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
      const currentRouteRef = router.currentRoute.value;
      const query = currentRouteRef.query;
      const network = query.network as string;
      if (!xcmAssets.value || !nativeTokenSymbol.value) return [];

      const nativeToken = generateNativeAsset(nativeTokenSymbol.value);
      let selectableTokens;
      if (isLocalTransfer.value) {
        selectableTokens = xcmAssets.value.assets;
        tokens = selectableTokens.filter(({ isXcmCompatible }) => isXcmCompatible);
        tokens.unshift(nativeToken);
      } else {
        const selectedNetwork = network.split('-')[1].toLowerCase();
        const isSelectedRelayChain = checkIsRelayChain(selectedNetwork);
        selectableTokens = xcmAssets.value.assets.filter(
          (it) => it.originChain.toLowerCase() === selectedNetwork
        );
        tokens = selectableTokens.filter(({ isXcmCompatible }) => isXcmCompatible);
        !isSelectedRelayChain && tokens.push(nativeToken);
      }

      return tokens;
    });

    watch([currentAccount], handleUpdateXcmTokenAssets, { immediate: true });
    watchEffect(handleDefaultConfig);

    // watchEffect(() => {
    //   console.log('token', token.value);
    //   console.log('isLocalTransfer', isLocalTransfer.value);
    // });

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
