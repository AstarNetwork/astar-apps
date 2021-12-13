<template>
  <Modal title="Unlocking chunks">
    <template #content>
      <div class="tw-my-4">
        {{ $t('dappStaking.modals.chunksModalDescription') }}
        <br />
        {{ $t('dappStaking.modals.maxUnlockingChunks', { chunks: maxUnlockingChunks }) }}
      </div>
      <div v-if="unlockingChunks" class="tw-grid tw-grid-cols-12">
        <div class="tw-col-span-1">{{ $t('store.chunk') }}</div>
        <div class="tw-col-span-5 tw-text-right">{{ $t('store.amount') }}</div>
        <div class="tw-col-span-6 tw-text-right">
          {{ $t('dappStaking.modals.availableInEra') }}
        </div>
      </div>
      <div v-for="(chunk, index) in unlockingChunks" :key="index" class="tw-grid tw-grid-cols-12">
        <div class="tw-col-span-1">{{ index + 1 }}.</div>
        <div class="tw-col-span-5 tw-text-right tw-font-semibold">{{ chunk.amount.toHuman() }}</div>
        <div class="tw-col-span-6 tw-text-right">
          {{ chunk.unlockEra.toHuman() }}
          ({{ $t('dappStaking.modals.erasToGo', { era: chunk.erasBeforeUnlock }) }})
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
    maxUnlockingChunks: {
      type: Number,
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