<template>
  <div
    class="
      tw-relative tw-z-0 tw-inline-flex tw-shadow tw-rounded-lg tw-bg-white
      dark:tw-bg-darkGray-800
    "
  >
    <div
      class="
        tw-relative tw-inline-flex tw-items-center tw-py-2 tw-px-1
        sm:tw-px-2
        tw-rounded-l-lg tw-flex-1 tw-text-left
      "
    >
      <div class="tw-flex tw-items-center tw-pl-4">
        <div class="tw-text-blue-900 dark:tw-text-darkGray-100 tw-font-bold">
          {{ walletName }}
        </div>
      </div>

      <button type="button" class="icon tw-ml-auto tw-tooltip" @click="openModal">
        <icon-base
          class="tw-h-5 tw-w-5 dark:tw-text-darkGray-100"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <icon-chevron-down />
        </icon-base>

        <!-- Tooltip -->
        <span
          class="
            tw-pointer-events-none
            tw-hidden
            tw-absolute
            tw-top-0
            tw-left-1/2
            tw-z-10
            tw-transform
            tw--translate-y-full
            tw--translate-x-1/2
            tw-p-2
            tw-text-xs
            tw-leading-tight
            tw-text-white
            tw-bg-gray-800
            dark:tw-bg-darkGray-500
            tw-rounded-md tw-shadow-lg tw-opacity-90 tw-whitespace-nowrap
          "
          >{{ $t('change') }}</span
        >
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import IconBase from 'components/icons/IconBase.vue';
import IconChevronDown from 'components/icons/IconChevronDown.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    IconBase,
    IconChevronDown,
  },
  props: {
    walletName: {
      type: String,
      required: true,
    },
  },

  emits: ['update:is-open'],
  setup(props, { emit }) {
    const openModal = () => {
      emit('update:is-open', true);
    };

    return {
      openModal,
    };
  },
});
</script>

<style scoped>
.icon {
  @apply tw-p-4 sm:tw-p-5 tw-rounded-full tw-relative;
}
.icon:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-600;
}
.icon:focus {
  @apply tw-z-10 tw-outline-none tw-ring tw-ring-gray-100 tw-bg-blue-50 dark:tw-ring-darkGray-600 dark:tw-bg-darkGray-900;
}
</style>
