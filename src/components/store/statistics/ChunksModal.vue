<template>
  <Modal>
    <template #content>
      <div class="tw-my-8 tw-text-2xl tw-font-semibold">{{ $t('store.unlockingChunks') }}</div>
      <div class="tw-grid tw-grid-cols-12">
        <div class="tw-col-span-1">{{ $t('store.chunk') }}</div>
        <div class="tw-col-span-7 tw-text-right">{{ $t('store.amount') }}</div>
        <div class="tw-col-span-4 tw-text-right">{{ $t('store.era') }}</div>
      </div>
      <div v-for="(chunk, index) in unlockingChunks" :key="index" class="tw-grid tw-grid-cols-12">
        <div class="tw-col-span-1">{{ index + 1 }}.</div>
        <div class="tw-col-span-7 tw-text-right tw-font-semibold">{{ chunk.amount.toHuman() }}</div>
        <div class="tw-col-span-4 tw-text-right">
          {{ chunk.unlockEra.toHuman() }} ({{ chunk.erasBeforeUnlock }})
        </div>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import Modal from 'components/common/Modal.vue';

export default defineComponent({
  components: {
    Modal,
  },
  props: {
    unlockingChunks: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>