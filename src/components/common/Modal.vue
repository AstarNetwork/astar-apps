<template>
  <div class="tw-fixed tw-z-10 tw-inset-0 tw-overflow-y-auto">
    <div class="tw-flex tw-items-center tw-justify-center tw-min-h-screen">
      <!-- Background overlay -->
      <div class="tw-fixed tw-inset-0 tw-transition-opacity" aria-hidden="true">
        <div class="tw-absolute tw-inset-0 tw-bg-gray-900 dark:tw-bg-black tw-opacity-75"></div>
      </div>

      <div
        class="
          tw-inline-block tw-bg-white
          dark:tw-bg-darkGray-900
          tw-rounded-lg tw-px-4
          sm:tw-px-8
          tw-py-10
          tw-shadow-xl
          tw-transform
          tw-transition-all
          tw-mx-2
          tw-my-2
          tw-align-middle
          tw-max-w-lg
          tw-w-full
        "
      >
        <div>
          <div>
            <h3
              class="
                tw-text-lg tw-font-extrabold tw-text-blue-900
                dark:tw-text-white
                tw-mb-6 tw-text-center
              "
            >
              {{ title }}
            </h3>
            <div>
              <slot name="content"></slot>
            </div>
          </div>
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row">
          <Button type="button" :primary="false" @click="closeModal">{{ $t('close') }}</Button>
          <slot name="buttons"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import Button from 'src/components/common/Button.vue';

export default defineComponent({
  components: {
    Button,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    return {
      ...toRefs(props),
      closeModal,
    };
  },
});
</script>
