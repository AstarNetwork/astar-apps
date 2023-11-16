<template>
  <modal-wrapper
    :is-modal-open="isModalSelectDapp"
    :title="$t('stakingV3.selectProjects')"
    :is-closing="isClosingModal"
    :close-modal="closeModal"
    class-name="select-dapp-modal"
  >
    <div class="wrapper--dapps">
      <div v-for="dapp in dapps" :key="dapp.address" class="dapp" @click="handleDappSelected(dapp)">
        <img :src="dapp.logoUrl" :alt="dapp.name" class="dapp--logo" />
        <div>{{ dapp.name }}</div>
      </div>
    </div>
  </modal-wrapper>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { fadeDuration } from '@astar-network/astar-ui';
import ModalWrapper from 'src/components/common/ModalWrapper.vue';
import { wait } from 'src/v2/common';
import { Dapp } from './Model';

export default defineComponent({
  components: {
    ModalWrapper,
  },
  props: {
    dapps: {
      type: Object as PropType<Dapp[]>,
      required: true,
    },
    isModalSelectDapp: {
      type: Boolean,
      required: true,
    },
    handleModalSelectDapp: {
      type: Function as PropType<(isOpen: { isOpen: boolean }) => void>,
      required: true,
    },
    dappSelected: {
      type: Function as PropType<(dapp: Dapp) => void>,
      required: false,
      default: undefined,
    },
  },
  setup(props) {
    const isClosingModal = ref<boolean>(false);

    const closeModal = async (): Promise<void> => {
      isClosingModal.value = true;
      await wait(fadeDuration);
      props.handleModalSelectDapp({ isOpen: false });
      isClosingModal.value = false;
    };

    const handleDappSelected = (dapp: Dapp): void => {
      if (props.dappSelected) {
        props.dappSelected(dapp);
      }

      closeModal();
    };

    return { closeModal, handleDappSelected, isClosingModal };
  },
});
</script>

<style lang="scss" scoped>
.wrapper--dapps {
  padding: 0 16px;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.dapp--logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  margin-right: 16px;
}

.dapp {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}
</style>
