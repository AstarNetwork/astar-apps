<template>
  <div class="wrapper--select-account">
    <div class="row--input">
      <div class="column--icon-account">
        <div class="column--icon">
          <div>
            <img width="24" src="~assets/img/ethereum.png" />
          </div>
        </div>
        <input
          :value="toAddress"
          class="input--address text--title"
          type="text"
          spellcheck="false"
          placeholder="Destination Address"
          @focus="true"
          @blur="closeOption"
          @change="changeAddress"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { wait } from 'src/hooks/helper/common';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    toAddress: {
      type: String,
      required: false,
      default: '',
    },
  },
  emits: ['update:sel-address', 'sel-changed'],
  setup(props, { emit }) {
    const openOption = ref<boolean>(false);

    const closeOption = async (): Promise<void> => {
      // Memo: load the account data before closing
      const delay = 400;
      await wait(delay);
      openOption.value = false;
    };

    const changeAddress = (e: any) => {
      emit('update:sel-address', e.currentTarget.value);
    };
    return {
      closeOption,
      changeAddress,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-select-account.scss';
</style>
