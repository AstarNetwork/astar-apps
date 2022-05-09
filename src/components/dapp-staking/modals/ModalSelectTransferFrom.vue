<template>
  <div class="option-list" @click="onChange(item)">
    <li role="option">
      <div class="tw-flex tw-items-center tw-justify-between">
        <div class="tw-flex tw-items-center">
          <div>
            <div class="tw-text-sm tw-font-medium">
              <span>{{ formattedItem }}</span>
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
  </div>
</template>
<script lang="ts">
import { ASTAR_DECIMALS, balanceFormatter } from 'src/hooks/helper/plasmUtils';
import { StakingData } from 'src/modules/dapp-staking';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    item: {
      type: Object as PropType<StakingData>,
      required: true,
    },
    currentAccount: {
      type: String,
      required: true,
    },
    checked: {
      type: Boolean,
    },
    setAddressTransferFrom: {
      type: Function,
      required: true,
    },
  },
  emits: ['update:sel-checked'],
  setup({ item, currentAccount, setAddressTransferFrom }, { emit }) {
    const formattedItem = computed(() => {
      if (!item) return null;
      const name = item.name === currentAccount ? 'Transferable Balance' : item.name;
      const formattedData = `${name} (${balanceFormatter(item.balance, ASTAR_DECIMALS)})`;
      return formattedData;
    });

    const onChange = (item: StakingData) => {
      setAddressTransferFrom(item.address);
      emit('update:sel-checked', false);
    };

    return {
      formattedItem,
      onChange,
    };
  },
});
</script>

<style>
.option-list {
  @apply tw-text-blue-900 dark:tw-text-darkGray-100  tw-select-none tw-relative tw-py-2 tw-pl-3 tw-pr-9 tw-cursor-pointer;
}
.option-list:hover {
  @apply tw-bg-gray-50 dark:tw-bg-darkGray-700;
}
</style>
