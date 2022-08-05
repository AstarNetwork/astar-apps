<template>
  <div>
    <BackToAsset />
    <MobileNavigator />
    <div class="wrapper--transfer">
      <div class="container--transfer">
        <TransferModeTab
          :is-local-transfer="isLocalTransfer"
          :set-is-local-transfer="setIsLocalTransfer"
        />
        <div class="wrapper-containers">
          <LocalTransfer v-if="isLocalTransfer" :account-data="accountData" />
          <div v-else>
            <XcmBridge v-if="token !== null" :token="token" />
          </div>
          <Information />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch, watchEffect } from 'vue';
import BackToAsset from 'src/components/assets/transfer/BackToAsset.vue';
import MobileNavigator from 'src/components/assets/transfer/MobileNavigator.vue';
import TransferModeTab from 'src/components/assets/transfer/TransferModeTab.vue';
import Information from 'src/components/assets/transfer/Information.vue';
import LocalTransfer from 'src/components/assets/transfer/LocalTransfer.vue';
import XcmBridge from 'src/components/assets/transfer/XcmBridge.vue';
import { useAccount, useBalance } from 'src/hooks';
import { useStore } from 'src/store';
import { XcmAssets } from 'src/store/assets/state';
import { Asset } from 'src/v2/models';

export default defineComponent({
  components: {
    BackToAsset,
    MobileNavigator,
    TransferModeTab,
    Information,
    LocalTransfer,
    XcmBridge,
  },
  setup() {
    const isLocalTransfer = ref<boolean>(false);
    const setIsLocalTransfer = (result: boolean): void => {
      isLocalTransfer.value = result;
    };
    const token = ref<Asset | null>(null);
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    const store = useStore();
    const xcmAssets = computed<XcmAssets>(() => store.getters['assets/getAllAssets']);

    const handleUpdateXcmTokenAssets = () => {
      if (currentAccount.value) {
        store.dispatch('assets/getAssets', currentAccount.value);
      }
    };

    watch([currentAccount], handleUpdateXcmTokenAssets, { immediate: true });
    watchEffect(() => {
      console.log('xcmAssets.value', xcmAssets.value);
      if (xcmAssets.value) {
        token.value = xcmAssets.value.assets[0];
      }
    });
    return { isLocalTransfer, accountData, setIsLocalTransfer, token };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer.scss';
</style>
