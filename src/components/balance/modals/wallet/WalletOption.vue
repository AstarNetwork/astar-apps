<template>
  <div class="wallet" @click="wallet.click">
    <img width="40" :src="wallet.img" />
    <div>{{ $t(wallet.name) }}</div>
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
  },
});
</script>
