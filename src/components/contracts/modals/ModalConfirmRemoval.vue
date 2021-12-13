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
          tw-overflow-hidden
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
              {{ $t('confirm') }}
              <!-- Memo: Add translation file if necesally -->
              <span v-if="ctype == 'codehash'">codeHash</span>
              <span v-else>contract</span>
              {{ $t('contracts.modals.removal') }}
            </h3>

            <div class="tw-grid tw-grid-cols-1 tw-gap-6 dark:tw-text-white">
              <div>
                <div v-if="ctype === 'codehash'">
                  {{ $t('contracts.modals.removeCode.first') }}
                  <br />
                  {{ $t('contracts.modals.removeCode.second') }}
                </div>
                <div v-else>
                  {{ $t('contracts.modals.removeContract.first') }}
                  <br />
                  {{ $t('contracts.modals.removeContract.second') }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row-reverse">
          <button type="button" class="forget-button" @click="forget">
            {{ $t('forget') }}
          </button>
          <button type="button" class="cancel" @click="closeModal">
            {{ $t('cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    ctype: {
      type: String,
      default: 'codehash',
    },
  },
  emits: ['update:is-open', 'forget'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    const forget = () => {
      emit('forget', true);
    };

    return {
      closeModal,
      forget,
    };
  },
});
</script>

<style scoped>
.forget-button {
  @apply tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 tw-mx-1;
}
.forget-button:hover {
  @apply tw-bg-blue-700 dark:tw-bg-blue-400;
}
.forget-button:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-400;
}

.cancel {
  @apply tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-text-sm tw-font-medium tw-rounded-full tw-text-gray-500 dark:tw-text-darkGray-400 tw-bg-white dark:tw-bg-darkGray-900 tw-mx-1;
}
.cancel:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-700;
}
.cancel:focus {
  @apply tw-outline-none tw-ring tw-ring-gray-100 dark:tw-ring-darkGray-600;
}
</style>
