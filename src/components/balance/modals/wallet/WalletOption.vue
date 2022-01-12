<template>
  <div class="wallet" @click="setWalletModal(wallet.source)">
    <img width="40" :src="wallet.img" />
    <div>{{ wallet.name }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import '../../styles/modal-connect-wallet.scss';

export default defineComponent({
  props: {
    wallet: {
      type: Object,
      required: true,
    },
    setWalletModal: {
      type: Function,
      required: true,
    },
  },
});
</script>
