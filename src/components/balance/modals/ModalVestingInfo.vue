<template>
  <Modal title="Vesting info" @click="closeModal">
    <template #content>
      <div>123</div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Modal from 'src/components/common/Modal.vue';

export default defineComponent({
  components: {
    Modal,
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    return {
      closeModal,
    };
  },
});
</script>
