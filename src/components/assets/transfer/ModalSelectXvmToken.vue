<template>
  <modal-wrapper
    :is-modal-open="isModalSelectToken"
    :title="$t('assets.transferPage.selectToken')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
    class-name="transfer-modal"
  >
    <div class="container--select-item-mobile">
      <div class="container--items">
        <div
          v-for="t in tokens"
          :key="t.erc20Contract"
          class="row--item"
          :class="token.symbol === t.symbol && 'row--item-selected'"
          @click="setToken(t)"
        >
          <div class="column--item-name">
            <div class="item-logo">
              <jazzicon :address="token.erc20Contract" :diameter="24" />
            </div>
            <span class="text--item-name">{{ t.symbol }}</span>
          </div>
          <div class="column--item-name">
            <span class="text--token-amount">
              <TokenBalance :balance="String(t.userBalance)" :symbol="t.symbol" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </modal-wrapper>
</template>
<script lang="ts">
import { fadeDuration } from '@astar-network/astar-ui';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { truncate } from 'src/hooks/helper/common';
import { XvmAsset } from 'src/modules/token';
import { wait } from 'src/v2/common';
import { defineComponent, PropType, ref } from 'vue';
import Jazzicon from 'vue3-jazzicon/src/components';

export default defineComponent({
  components: {
    ModalWrapper,
    TokenBalance,
    [Jazzicon.name]: Jazzicon,
  },
  props: {
    isModalSelectToken: {
      type: Boolean,
      required: true,
    },
    handleModalSelectToken: {
      type: Function,
      required: true,
    },
    setToken: {
      type: Function,
      required: true,
    },
    tokens: {
      type: Object as PropType<XvmAsset[]>,
      required: true,
    },
    token: {
      type: Object as PropType<XvmAsset>,
      required: true,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);
    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.handleModalSelectToken({ isOpen: false });
      isClosingModal.value = false;
    };

    return { closeModal, isClosingModal, truncate };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/select-chain.scss';
</style>
