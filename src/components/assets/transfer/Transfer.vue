<template>
  <div>
    <BackToAsset :class="isHighlightRightUi && 'half-opacity'" />
    <MobileNavigator />
    <div class="wrapper--transfer">
      <div class="container--transfer">
        <TransferModeTab
          :is-local-transfer="isLocalTransfer"
          :set-is-local-transfer="setIsLocalTransfer"
          :class="isHighlightRightUi && 'half-opacity'"
        />
        <div class="wrapper-containers">
          <div v-if="isLocalTransfer">
            <LocalTransfer
              v-if="isTransferNativeToken"
              :account-data="accountData"
              :class="isHighlightRightUi && 'half-opacity'"
              :symbol="token ? token.metadata.symbol : 'ASTR'"
            />
            <LocalXcmTransfer
              v-else
              :account-data="accountData"
              :class="isHighlightRightUi && 'half-opacity'"
              :symbol="token ? token.metadata.symbol : 'ASTR'"
              :token="token"
            />
          </div>
          <div v-else>
            <XcmBridge
              v-if="token !== null"
              :token="token"
              :class="isHighlightRightUi && 'half-opacity'"
              :set-right-ui="setRightUi"
              :is-highlight-right-ui="isHighlightRightUi"
            />
          </div>
          <Information v-if="rightUi === 'information'" />
          <SelectChain v-if="rightUi === 'select-chain'" v-click-away="cancelHighlight" />
        </div>
      </div>
    </div>
    <ModalSelectChain
      :is-modal-select-chain="isModalSelectChain"
      :handle-modal-select-chain="handleModalSelectChain"
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
import XcmBridge from 'src/components/assets/transfer/XcmBridge.vue';
import ModalSelectChain from 'src/components/assets/transfer/ModalSelectChain.vue';
import { useAccount, useBalance, useBreakpoints, useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import { XcmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';
import { wait } from 'src/hooks/helper/common';
import { useRouter } from 'vue-router';
import { generateAstarNativeTokenObject } from 'src/modules/xcm/tokens';

type RightUi = 'information' | 'select-chain';

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
  },
  setup() {
    const isModalSelectChain = ref<boolean>(false);
    const rightUi = ref<RightUi>('information');
    const isLocalTransfer = ref<boolean>(false);
    const setIsLocalTransfer = (result: boolean): void => {
      isLocalTransfer.value = result;
      const query = router.currentRoute.value.query;
      const symbol = query.token as string;
      const network = query.network as string;
      // if (result) {
      router.replace({
        path: '/assets/transfer',
        query: { token: symbol.toLowerCase(), network, mode: result ? 'local' : 'xcm' },
      });
      // router.replace({ query: { token: 'dot', network: 'astar', mode: result ? 'local' : 'xcm' } });
      // router.push({
      //   query: { mode: result ? 'local' : 'xcm' },
      // });
      // }
    };
    const token = ref<Asset | null>(null);
    const router = useRouter();
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const store = useStore();
    const { screenSize, width } = useBreakpoints();
    const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);
    const isHighlightRightUi = computed<boolean>(() => rightUi.value !== 'information');
    const { nativeTokenSymbol } = useNetworkInfo();

    const isTransferNativeToken = computed(() => {
      const query = router.currentRoute.value.query;
      const symbol = query.token as string;
      return symbol.toLowerCase() === nativeTokenSymbol.value.toLowerCase();
    });

    const handleModalSelectChain = ({ isOpen }: { isOpen: boolean }) => {
      isModalSelectChain.value = isOpen;
    };

    const setRightUi = async (ui: RightUi): Promise<void> => {
      if (width.value > screenSize.md) {
        // Memo: tricky way to work with `cancelHighlight` function
        await wait(100);
        rightUi.value = ui;
      } else {
        isModalSelectChain.value = true;
      }
    };

    const cancelHighlight = async (e: any) => {
      const openClass = 'container--select-chain';
      if (isHighlightRightUi.value && e.target.className !== openClass) {
        setRightUi('information');
      }
    };
    const handleUpdateXcmTokenAssets = () => {
      if (currentAccount.value) {
        store.dispatch('assets/getAssets', currentAccount.value);
      }
    };

    watch([currentAccount], handleUpdateXcmTokenAssets, { immediate: true });

    const redirect = () => {
      router.push({
        path: '/assets/transfer',
        query: { token: 'dot', network: 'astar', mode: 'local' },
      });
    };

    const handleDefaultConfig = () => {
      const query = router.currentRoute.value.query;
      const symbol = query.token as string;
      const mode = query.mode as string;
      if (mode === 'xcm') {
        isLocalTransfer.value = false;
      } else {
        isLocalTransfer.value = true;
      }

      if (xcmAssets.value && xcmAssets.value.assets.length > 0) {
        try {
          console.log('symbol', symbol);
          console.log('nativeTokenSymbol.value', nativeTokenSymbol.value);
          if (symbol.toLowerCase() === nativeTokenSymbol.value.toLowerCase()) {
            token.value = generateAstarNativeTokenObject(nativeTokenSymbol.value) as any;
          } else {
            token.value = xcmAssets.value.assets.find(
              (it) => it.metadata.symbol.toLowerCase() === symbol.toLowerCase()
            ) as Asset;
          }
          // console.log('symbol', symbol);
          // console.log('token.value', token.value);
          if (!token.value) throw Error('No token is found');
        } catch (error) {
          console.error('error', error);
          redirect();
        }
      }
    };

    watchEffect(handleDefaultConfig);
    return {
      isLocalTransfer,
      accountData,
      setIsLocalTransfer,
      token,
      isHighlightRightUi,
      rightUi,
      setRightUi,
      cancelHighlight,
      handleModalSelectChain,
      isModalSelectChain,
      isTransferNativeToken,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer.scss';
</style>
