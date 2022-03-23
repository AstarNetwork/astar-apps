<template>
  <li role="option" class="list" @click="onChange(address)">
    <div class="list__row">
      <div class="column--icon-account">
        <div class="column--icon">
          <icon-base viewBox="0 0 64 64">
            <icon-account-sample />
          </icon-base>
        </div>
        <div>
          <div class="text--account">{{ addressName }}</div>
          <div class="text--address">
            {{ shortenAddress }}
          </div>
        </div>
      </div>
      <div class="column--checkbox">
        <input name="choose_account" type="radio" class="input--checkbox" :checked="checked" />
      </div>
    </div>
  </li>
</template>
<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import IconBase from 'components/icons/IconBase.vue';
import IconAccountSample from 'components/icons/IconAccountSample.vue';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';

export default defineComponent({
  components: {
    IconBase,
    IconAccountSample,
  },
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

    const shortenAddress = computed(() => {
      return getShortenAddress(address.value);
    });

    const onChange = (address: string) => {
      emit('update:sel-option', address);
      emit('update:sel-checked', false);
    };

    return {
      shortenAddress,
      onChange,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/modal-select-account.scss';
</style>
