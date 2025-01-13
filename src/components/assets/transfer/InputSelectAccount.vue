<template>
  <div class="wrapper--select-account">
    <div class="row--input">
      <div class="column--icon-account">
        <div class="column--icon">
          <div v-if="isErc20Transfer || toAddress">
            <img
              v-if="isErc20Transfer || isToEvmAddress"
              width="24"
              src="~assets/img/ethereum.png"
            />
            <astar-icon-base v-else width="24" viewBox="0 0 64 64">
              <astar-icon-account-sample />
            </astar-icon-base>
          </div>
          <div v-else class="placeholder--icon" />
        </div>
        <input
          :value="toAddress"
          class="input--address text--title"
          type="text"
          spellcheck="false"
          :placeholder="$t('assets.transferPage.toPlaceholder')"
          @change="changeAddress"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { isValidEvmAddress } from '@astar-network/astar-sdk-core';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watchEffect } from 'vue';

export default defineComponent({
  props: {
    toAddress: {
      type: String,
      required: false,
      default: '',
    },
    isErc20Transfer: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:sel-address', 'sel-changed'],
  setup(props, { emit }) {
    const isToEvmAddress = ref<boolean>(false);
    const store = useStore();
    const isH160 = computed(() => store.getters['general/isH160Formatted']);

    const changeAddress = (e: any) => {
      emit('update:sel-address', e.currentTarget.value);
    };

    watchEffect(() => {
      isToEvmAddress.value = isValidEvmAddress(props.toAddress ? props.toAddress : '');
    });

    watchEffect(() => {
      if (!props.toAddress && isH160.value) {
        isToEvmAddress.value = true;
      }
    });

    return {
      isToEvmAddress,
      changeAddress,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/transfer/styles/input-select-account.scss';
</style>
