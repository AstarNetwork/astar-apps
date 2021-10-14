<template>
  <button type="button" class="modal-button" @click="openModal">
    <div
      class="
        tw-h-6 tw-w-6 tw-rounded-full tw-overflow-hidden tw-border tw-border-gray-100 tw-mx-3
        sm:tw-mx-4
      "
    >
      <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
        <icon-account-sample />
      </icon-base>
    </div>
    {{ shortenAddress }}
    <icon-base class="tw--mr-1 tw-ml-2 tw-h-4 tw-w-4" viewBox="0 0 20 20" aria-hidden="true">
      <icon-solid-chevron-down />
    </icon-base>
  </button>
</template>

<script lang="ts">
import { defineComponent, computed, toRefs } from 'vue';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import IconBase from 'components/icons/IconBase.vue';
import IconSolidChevronDown from 'components/icons/IconSolidChevronDown.vue';
import IconAccountSample from 'components/icons/IconAccountSample.vue';

export default defineComponent({
  components: {
    IconBase,
    IconSolidChevronDown,
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
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const openModal = () => {
      emit('update:is-open', true);
    };

    const { address } = toRefs(props);
    const shortenAddress = computed(() => {
      return getShortenAddress(address.value);
    });

    return {
      openModal,
      shortenAddress,
    };
  },
});
</script>

<style scoped>
.modal-button {
  @apply tw-inline-flex tw-justify-center tw-items-center tw-w-full tw-rounded-full tw-border tw-border-gray-300 dark:tw-border-darkGray-600 tw-px-4 tw-py-2  tw-bg-white dark:tw-bg-darkGray-900 tw-text-xs tw-font-medium tw-text-gray-700 dark:tw-text-darkGray-100;
}
.modal-button:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-700;
}
.modal-button:focus {
  @apply tw-outline-none tw-ring tw-ring-gray-100 dark:tw-ring-darkGray-600;
}
</style>
