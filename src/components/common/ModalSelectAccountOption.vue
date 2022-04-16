<template>
  <li role="option" class="option-list">
    <div
      class="tw-flex tw-items-center tw-justify-between tw-cursor-pointer"
      @click="onChange(address)"
    >
      <div class="tw-flex tw-items-center">
        <div
          class="
            tw-h-8
            tw-w-8
            tw-rounded-full
            tw-overflow-hidden
            tw-border
            tw-border-gray-100
            tw-mr-3
            tw-flex-shrink-0
          "
        >
          <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
            <icon-account-sample />
          </icon-base>
        </div>
        <div>
          <div class="tw-text-sm tw-font-medium">{{ addressName }}</div>
          <div class="tw-text-xs tw-text-gray-500 dark:tw-text-darkGray-400">
            {{ shortenAddress }}
          </div>
        </div>
      </div>

      <div class="tw-relative tw-w-5 tw-h-5">
        <input
          name="choose_account"
          type="radio"
          class="
            tw-appearance-none tw-border-2 tw-border-gray-300
            dark:tw-border-darkGray-600
            tw-rounded-full
            focus:tw-ring-blue-500
            tw-h-4 tw-w-4 tw-mr-3
            focus:tw-outline-none
            tw-bg-white
            dark:tw-bg-darkGray-900
            checked:tw-border-4 checked:tw-border-blue-500
          "
          :checked="checked"
        />
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

<style>
.option-list {
  @apply tw-text-blue-900 dark:tw-text-darkGray-100 tw-cursor-default tw-select-none tw-relative tw-py-2 tw-pl-3 tw-pr-9;
}
.option-list:hover {
  @apply tw-bg-gray-50 dark:tw-bg-darkGray-700;
}
</style>
