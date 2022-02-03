<template>
  <Modal :title="title" class="animate__animated animate__fadeIn" @click="closeModal">
    <template #content>
      <div class="tw-max-w-sm">
        <!-- <Chain
          v-for="(chain, index) in chains"
          :key="index"
          :chain="chain"
          :select-chain="selectChain"
          :selected-chain="selectedChain"
        /> -->
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// import Chain from './Chain.vue';
import Modal from 'src/components/common/Modal.vue';
export default defineComponent({
  components: {
    // Chain,
    Modal,
  },
  props: {
    closeModal: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const title = 'Bridge history';

    return { title };
  },
});
</script>

<style lang="scss" scoped>
@import '../styles/bridge-modal';
</style>
