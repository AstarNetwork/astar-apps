<template>
  <div>
    <li role="option">
      <label class="tw-flex tw-items-center tw-justify-between tw-cursor-pointer">
        <div class="tw-flex tw-items-center tw-h-12">
          <div
            class="tw-h-8 tw-w-8 tw-rounded-full tw-overflow-hidden tw-border tw-border-gray-100 tw-ml-3 tw-mr-3 tw-flex-shrink-0"
          >
            <img width="80" src="~assets/img/metamask.png" />
          </div>
          <div>
            <div class="tw-text-sm tw-font-medium">Connect to Metamask</div>
          </div>
        </div>
      </label>
    </li>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
  },
  setup(props, { emit }) {
    const onConnect = () => {
      emit('connect', true);
     };
;
    return {
      onConnect
    };
  },
  methods: {
    opClass(checked: boolean) {
      if (checked) {
        return 'tw-text-blue-900 dark:tw-text-darkGray-100 tw-cursor-default tw-select-none tw-relative tw-py-2 tw-pl-3 tw-pr-6 tw-bg-blue-200 dark:tw-bg-blue-500 tw-bg-opacity-20';
      } else {
        return 'tw-text-blue-900 dark:tw-text-darkGray-100 tw-cursor-default tw-select-none tw-relative tw-py-2 tw-pl-3 tw-pr-6 hover:tw-bg-gray-50 dark:hover:tw-bg-darkGray-800';
      }
    },
  },
});
</script>
