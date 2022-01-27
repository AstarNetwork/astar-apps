<template>
  <Modal title="Select a token" @click="closeModal">
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
          <Token
            v-for="(token, index) in tokens"
            :key="index"
            :token-obj="token"
            :selected-token="selectedToken"
            :src-chain-id="srcChainId"
            :select-token="selectToken"
          />
        </div>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Token from '../Token.vue';
import Modal from 'src/components/common/Modal.vue';
export default defineComponent({
  components: {
    Token,
    Modal,
  },
  props: {
    closeModal: {
      type: Function,
      required: true,
    },
    selectToken: {
      type: Function,
      required: true,
    },
    tokens: {
      type: Array,
      required: true,
    },
    selectedToken: {
      type: Object,
      required: true,
    },
    srcChainId: {
      type: Number,
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
