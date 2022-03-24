<template>
  <li role="option" class="list" @click="onChange(address)">
    <div class="list__row">
      <div class="box__row">
        <img v-if="iconWallet" width="24" :src="iconWallet" alt="wallet-icon" />
        <div class="column--wallet-address">
          <div class="column--wallet-name">
            <span class="text--title">{{ addressName }}</span>
          </div>
          <span class="text--title">{{ shortenAddress }}</span>
        </div>
      </div>
    </div>
  </li>
</template>
<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { useWalletIcon } from 'src/hooks';
export default defineComponent({
  props: {
    address: {
      type: String,
      required: true,
    },
    addressName: {
      type: String,
      required: true,
    },
    checked: {
      type: Boolean,
    },
  },
  emits: ['update:sel-checked', 'update:sel-option'],
  setup(props, { emit }) {
    const { address } = toRefs(props);
    const { iconWallet } = useWalletIcon();
    const shortenAddress = computed(() => {
      return getShortenAddress(address.value);
    });

    const onChange = (address: string) => {
      emit('update:sel-option', address);
      emit('update:sel-checked', false);
    };

    return {
      shortenAddress,
      iconWallet,
      onChange,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-select-account.scss';
</style>
