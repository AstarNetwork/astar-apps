<template>
  <Teleport to="#app--main">
    <div class="tw-fixed tw-inset-0 tw-overflow-y-auto" :class="!isLoading && 'highest-z-index'">
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
            tw-py-10 tw-shadow-xl tw-transform tw-transition-all tw-mx-2 tw-align-middle tw-w-auto
            modal-wrapper
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
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { useStore } from 'src/store';
import { defineComponent, toRefs, computed } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      default: '',
    },
    showCloseButton: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const isLoading = computed<boolean>(() => store.getters['general/isLoading']);
    const closeModal = () => {
      emit('update:is-open', false);
    };

    return {
      closeModal,
      isLoading,
      ...toRefs(props),
    };
  },
});
</script>

<style lang="scss" scoped>
.modal-wrapper {
  margin-top: 100px;
  margin-bottom: 100px;
}
</style>
