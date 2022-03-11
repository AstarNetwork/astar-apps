<template>
  <Modal title="Unlocking chunks" class="tw-text-darkGray-800 dark:tw-text-darkGray-100">
    <template #content>
      <div class="tw-my-4">
        {{ $t('dappStaking.modals.chunksModalDescription') }}
        <br />
        {{ $t('dappStaking.modals.maxUnlockingChunks', { chunks: maxUnlockingChunks }) }}
      </div>
      <div v-if="unlockingChunks" class="tw-grid tw-grid-cols-12">
        <div class="tw-col-span-1">{{ $t('dappStaking.chunk') }}</div>
        <div class="tw-col-span-5 tw-text-right">{{ $t('dappStaking.amount') }}</div>
        <div class="tw-col-span-6 tw-text-right">
          {{ $t('dappStaking.modals.availableInEra') }}
        </div>
      </div>
      <div v-for="(chunk, index) in unlockingChunks" :key="index" class="tw-grid tw-grid-cols-12">
        <div class="tw-col-span-1">{{ index + 1 }}.</div>
        <div class="tw-col-span-5 tw-text-right tw-font-semibold">
          <format-balance :balance="chunk.amount" />
        </div>
        <div class="tw-col-span-6 tw-text-right">
          {{ chunk.unlockEra.toHuman() }}
          ({{ $t('dappStaking.modals.erasToGo', { era: chunk.erasBeforeUnlock }) }})
        </div>
      </div>
      <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row">
        <Button type="button" :primary="false" @click="closeModal">{{ $t('close') }}</Button>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import Modal from 'components/common/Modal.vue';
import Button from 'components/common/Button.vue';
import FormatBalance from 'components/balance/FormatBalance.vue';

export default defineComponent({
  components: {
    Modal,
    FormatBalance,
    Button,
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
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    return {
      closeModal,
      ...toRefs(props),
    };
  },
});
</script>
