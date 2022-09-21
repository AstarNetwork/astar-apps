<template>
  <div class="box--input-address box--hover--active" :class="isInputtingAddress && 'box--active'">
    <input
      :value="toAddress"
      class="input--address text--title"
      type="text"
      spellcheck="false"
      :placeholder="placeholder"
      @focus="toggleIsInputtingAddress"
      @blur="toggleIsInputtingAddress"
      @change="changeAddress"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    toAddress: {
      type: String,
      required: false,
      default: '',
    },
    placeholder: {
      type: String,
      required: true,
    },
    isInputtingAddress: {
      type: Boolean,
      required: true,
    },
    toggleIsInputtingAddress: {
      type: Function,
      required: true,
    },
  },
  emits: ['update:sel-address'],
  setup(props, { emit }) {
    const changeAddress = (e: any) => {
      emit('update:sel-address', e.currentTarget.value);
    };
    return {
      changeAddress,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/common/styles/simple-input.scss';
</style>
