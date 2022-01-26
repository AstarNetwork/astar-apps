<template>
  <Modal :title="title" @click="closeModal">
    <template #content>
      <div class="tw-max-w-md">
        <div class="tw-text-lg tw-text-center tw-text-blue-900 dark:tw-text-darkGray-100">
          {{ $t('wallet.select') }}
        </div>
        <div
          class="
            tw-flex tw-flex-col
            sm:tw-flex-row sm:tw-flex-wrap
            tw-gap-x-2 tw-justify-center tw-items-center
          "
        >
          <Chain
            v-for="(chain, index) in chains"
            :key="index"
            :chain="chain"
            :select-chain="selectChain"
          />
        </div>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Chain from '../Chain.vue';
import Modal from 'src/components/common/Modal.vue';
export default defineComponent({
  components: {
    Chain,
    Modal,
  },
  props: {
    closeModal: {
      type: Function,
      required: true,
    },
    selectChain: {
      type: Function,
      required: true,
    },
    chains: {
      type: Array,
      required: true,
    },
    modal: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const title = props.modal === 'src' ? 'Select Source Chain' : 'Select Destination Chain';

    return { title };
  },
});
</script>
