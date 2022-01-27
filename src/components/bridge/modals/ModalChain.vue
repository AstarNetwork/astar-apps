<template>
  <Modal :title="title" @click="closeModal">
    <template #content>
      <div class="tw-max-w-sm">
        <Chain
          v-for="(chain, index) in chains"
          :key="index"
          :chain="chain"
          :select-chain="selectChain"
          :selected-chain="selectedChain"
        />
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
    selectedChain: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const title = props.modal === 'src' ? 'Select Source Chain' : 'Select Destination Chain';

    return { title };
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/modal';
</style>
