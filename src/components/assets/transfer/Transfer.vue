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
          <div>left</div>
          <div>right</div>
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

export default defineComponent({
  components: { BackToAsset, MobileNavigator, TransferModeTab },
  setup() {
    const isLocalTransfer = ref<boolean>(true);
    const setIsLocalTransfer = (result: boolean): void => {
      isLocalTransfer.value = result;
    };
    return { isLocalTransfer, setIsLocalTransfer };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/transfer.scss';
</style>
