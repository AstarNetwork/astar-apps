<template>
  <div class="wallet" @click="wallet.click">
    <img width="40" :src="wallet.img" />
    <div>{{ $t(wallet.name) }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    wallet: {
      type: Object,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
@import '../../styles/modal-connect-wallet.scss';
</style>
