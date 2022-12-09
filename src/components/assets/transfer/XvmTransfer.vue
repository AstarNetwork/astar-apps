<template>
  <div>
    <back-to-page
      :class="isHighlightRightUi && 'half-opacity'"
      :text="$t('assets.transferPage.backToAssets')"
      :link="Path.Assets"
    />
    <mobile-navigator v-if="currentAccount" />
    <div v-if="currentAccount" class="wrapper--transfer">
      <div class="container--transfer">
        <div v-if="token" class="wrapper-containers">
          <xvm-token-transfer
            :class="isHighlightRightUi && 'half-opacity'"
            :set-right-ui="setRightUi"
            :token="token"
          />
          <!-- Todo: update inforamtions for XVM -->
          <information v-if="rightUi === 'information'" :is-local-transfer="true" />
          <select-xvm-token
            v-if="rightUi === 'select-token'"
            v-click-away="cancelHighlight"
            :set-token="handleSetToken"
            :tokens="tokens"
          />
        </div>
      </div>
    </div>

    <modal-select-xvm-token
      v-if="token && tokens"
      :is-modal-select-token="isModalSelectToken"
      :handle-modal-select-token="handleModalSelectToken"
      :set-token="handleSetToken"
      :tokens="tokens"
      :token="token"
    />
  </div>
</template>
<script lang="ts">
import Information from 'src/components/assets/transfer/Information.vue';
import XvmTokenTransfer from 'src/components/assets/transfer/XvmTokenTransfer.vue';
import MobileNavigator from 'src/components/assets/transfer/MobileNavigator.vue';
import ModalSelectXvmToken from 'src/components/assets/transfer/ModalSelectXvmToken.vue';
import SelectXvmToken from 'src/components/assets/transfer/SelectXvmToken.vue';
import BackToPage from 'src/components/common/BackToPage.vue';
import {
  useAccount,
  useBalance,
  useBreakpoints,
  useNetworkInfo,
  useXvmTransferRouter,
} from 'src/hooks';
import { wait } from 'src/hooks/helper/common';
import { XvmAsset } from 'src/modules/token';
import { Path } from 'src/router';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';

export type RightUi = 'information' | 'select-token';

export default defineComponent({
  components: {
    BackToPage,
    MobileNavigator,
    Information,
    SelectXvmToken,
    ModalSelectXvmToken,
    XvmTokenTransfer,
  },
  setup() {
    const isModalSelectToken = ref<boolean>(false);
    const rightUi = ref<RightUi>('information');

    const store = useStore();
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const { screenSize, width } = useBreakpoints();
    const { token, tokens, setToken } = useXvmTransferRouter();

    const isH160 = computed<boolean>(() => store.getters['general/isH160Formatted']);
    const isHighlightRightUi = computed<boolean>(() => rightUi.value !== 'information');
    const { evmNetworkIdx, isMainnet } = useNetworkInfo();

    const handleModalSelectToken = ({ isOpen }: { isOpen: boolean }): void => {
      isModalSelectToken.value = isOpen;
    };

    const handleSetToken = async (t: XvmAsset): Promise<void> => {
      setToken(t);
      await setRightUi('information');
      handleModalSelectToken({ isOpen: false });
    };

    const setRightUi = async (ui: RightUi): Promise<void> => {
      if (width.value > screenSize.md) {
        // Memo: tricky way to work with `cancelHighlight` function
        await wait(100);
        rightUi.value = ui;
      } else {
        isModalSelectToken.value = true;
      }
    };

    const cancelHighlight = async (e: any): Promise<void> => {
      const openClass = 'container--select-chain';
      if (isHighlightRightUi.value && e.target.className !== openClass) {
        await setRightUi('information');
      }
    };

    const handleUpdateXvmTokenAssets = (): void => {
      if (currentAccount.value && evmNetworkIdx.value) {
        store.dispatch('assets/getXvmAssets', {
          currentAccount: currentAccount.value,
          isFetchUsd: isMainnet.value,
          srcChainId: evmNetworkIdx.value,
        });
      }
    };

    watch([currentAccount, evmNetworkIdx], handleUpdateXvmTokenAssets, { immediate: true });

    watchEffect(() => {
      console.log('token', token.value);
      console.log('tokens', tokens.value);
    });

    return {
      accountData,
      token,
      isHighlightRightUi,
      rightUi,
      isModalSelectToken,
      tokens,
      isH160,
      currentAccount,
      Path,
      setRightUi,
      handleModalSelectToken,
      cancelHighlight,
      handleSetToken,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer.scss';
</style>
