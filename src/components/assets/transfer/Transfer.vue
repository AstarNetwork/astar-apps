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
          <div v-if="isLocalTransfer"><LocalTransfer :account-data="accountData" /></div>
          <div v-else>Todo: XCM UI</div>
          <Information />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import BackToAsset from 'src/components/assets/transfer/BackToAsset.vue';
import MobileNavigator from 'src/components/assets/transfer/MobileNavigator.vue';
import TransferModeTab from 'src/components/assets/transfer/TransferModeTab.vue';
import Information from 'src/components/assets/transfer/Information.vue';
import LocalTransfer from 'src/components/assets/transfer/LocalTransfer.vue';
import { useAccount, useBalance } from 'src/hooks';

export default defineComponent({
  components: { BackToAsset, MobileNavigator, TransferModeTab, Information, LocalTransfer },
  setup() {
    const isLocalTransfer = ref<boolean>(true);
    const setIsLocalTransfer = (result: boolean): void => {
      isLocalTransfer.value = result;
    };
    const { currentAccount } = useAccount();
    const { accountData } = useBalance(currentAccount);
    return { isLocalTransfer, accountData, setIsLocalTransfer };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer.scss';
</style>
