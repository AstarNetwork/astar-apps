<template>
  <li role="option" class="list" @click="onChange(walletName)">
    <div class="list__row">
      <div class="box__row">
        <img v-if="iconWallet" width="24" :src="iconWallet" alt="wallet-icon" />
        <div class="column--wallet-address">
          <span class="text--title">{{ walletName }}</span>
        </div>
      </div>
    </div>
  </li>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    iconWallet: {
      type: Object,
      default: null,
    },
    walletName: {
      type: String,
      required: true,
    },
    checked: {
      type: Boolean,
    },
  },
  emits: ['update:sel-checked', 'update:sel-option'],
  setup(props, { emit }) {
    const onChange = (walletName: string) => {
      emit('update:sel-option', walletName);
      emit('update:sel-checked', false);
    };

    return {
      onChange,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-select-account.scss';
</style>
