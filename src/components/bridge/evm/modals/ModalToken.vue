<template>
  <Modal title="Select a token" class="animate__animated animate__fadeIn" @click="closeModal">
    <template #content>
      <div class="tw-max-w-sm">
        <div>
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
import Token from './Token.vue';
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
