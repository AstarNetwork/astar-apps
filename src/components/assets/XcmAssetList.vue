<template>
  <div>
    <div v-for="t in xcmAssets" :key="t.id">
      <XcmToken :token="t" :handle-modal-transfer="handleModalTransfer" />
      {{ t.id }}
    </div>

    <!-- <Teleport to="#app--main">
      <ModalTransfer
        :is-modal-transfer="isModalTransfer"
        :handle-modal-transfer="handleModalTransfer"
        :symbol="symbol"
        :account-data="null"
        :token="token"
        :handle-update-token-balances="handleUpdateTokenBalances"
      />
    </Teleport> -->
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, PropType, ref, watchEffect } from 'vue';
import { useXcmAssets } from 'src/hooks';
import { ChainAsset } from 'src/hooks/xcm/useXcmAssets';
import XcmToken from 'src/components/assets/XcmToken.vue';
// import ModalTransfer from 'src/components/assets/modals/ModalTransfer.vue';

export default defineComponent({
  components: {
    XcmToken,
    // ModalTransfer,
  },
  setup(props) {
    const token = ref<ChainAsset>();
    const symbol = ref<string>('');
    const isModalTransfer = ref<boolean>(false);
    const { xcmAssets, handleUpdateTokenBalances } = useXcmAssets();

    const handleModalTransfer = ({
      currency,
      isOpen,
    }: {
      isOpen: boolean;
      currency: ChainAsset;
    }) => {
      token.value = currency;
      isModalTransfer.value = isOpen;
      if (!isOpen) {
        symbol.value = '';
      } else {
        const c = currency as ChainAsset;
        symbol.value = c.metadata.symbol.toString();
      }
    };

    return {
      xcmAssets,
      handleModalTransfer,
      handleUpdateTokenBalances,
    };
  },
});
</script>
<style lang="scss" scoped>
</style>