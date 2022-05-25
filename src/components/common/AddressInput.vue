<template>
  <div class="box--input box--hover--active">
    <div class="box__space-between">
      <span> {{ title }} </span>
      <div v-if="isDisplayBalance">
        <span class="text--to--balance">
          {{ $t('assets.modals.balance', { amount: $n(truncate(addressBalance)), token: symbol }) }}
        </span>
      </div>
      <div v-else />
    </div>
    <div class="wrapper--select-account">
      <div class="row--input">
        <div class="column--icon-account">
          <div class="column--icon">
            <div v-if="isEvm">
              <img width="24" src="~assets/img/ethereum.png" />
            </div>
            <astar-icon-base v-else width="24" viewBox="0 0 64 64">
              <astar-icon-account-sample />
            </astar-icon-base>
          </div>
          <input
            :value="toAddress"
            class="input--address text--title"
            type="text"
            spellcheck="false"
            :placeholder="placeholder"
            @focus="true"
            @change="changeAddress"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { truncate } from 'src/hooks/helper/common';

export default defineComponent({
  props: {
    toAddress: {
      type: String,
      required: false,
      default: '',
    },
    isEvm: {
      type: Boolean,
      required: true,
    },
    isDisplayBalance: {
      type: Boolean,
      required: true,
    },
    symbol: {
      type: String,
      required: false,
      default: '',
    },
    addressBalance: {
      type: Number,
      required: false,
      default: 0,
    },
    title: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      required: true,
    },
  },
  // emits: ['update:sel-address', 'sel-changed'],
  emits: ['update:sel-address'],
  setup(props, { emit }) {
    // const openOption = ref<boolean>(false);

    // const closeOption = async (): Promise<void> => {
    //   // Memo: load the account data before closing
    //   const delay = 400;
    //   await wait(delay);
    //   openOption.value = false;
    // };

    const changeAddress = (e: any) => {
      emit('update:sel-address', e.currentTarget.value);
    };
    return {
      // closeOption,
      changeAddress,
      truncate,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/common/styles/address-input.scss';
</style>
