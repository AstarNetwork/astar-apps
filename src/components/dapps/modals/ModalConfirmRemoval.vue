<template>
  <div class="tw-fixed tw-z-10 tw-inset-0 tw-overflow-y-auto">
    <div class="tw-flex tw-items-center tw-justify-center tw-min-h-screen">
      <!-- Background overlay -->
      <div class="tw-fixed tw-inset-0 tw-transition-opacity" aria-hidden="true">
        <div
          class="tw-absolute tw-inset-0 tw-bg-gray-900 dark:tw-bg-black tw-opacity-75"
        ></div>
      </div>

      <div
        class="tw-inline-block tw-bg-white dark:tw-bg-darkGray-900 tw-rounded-lg tw-px-4 sm:tw-px-8 tw-py-10 tw-overflow-hidden tw-shadow-xl tw-transform tw-transition-all tw-mx-2 tw-my-2 tw-align-middle tw-max-w-lg tw-w-full"
      >
        <div>
          <div>
            <h3
              class="tw-text-lg tw-font-extrabold tw-text-blue-900 dark:tw-text-white tw-mb-6 tw-text-center"
            >
              Confirm
              <span v-if="ctype == 'codehash'"> codeHash </span>
              <span v-else> contract </span>
              removal
            </h3>

            <div class="tw-grid tw-grid-cols-1 tw-gap-6 dark:tw-text-white">
              <div>
                <div v-if="ctype === 'codehash'">
                  You are about to remove this code from your list of available
                  code hashes. Once completed, should you need to access it
                  again, you will have to manually add the code hash again.
                  <br />
                  This operation does not remove the uploaded code WASM and ABI
                  from the chain, nor any deployed contracts. The forget
                  operation only limits your access to the code on this browser.
                </div>
                <div v-else>
                  You are about to remove this contract from your list of
                  available contracts. Once completed, should you need to access
                  it again, you will have to manually add the contract's address
                  in the Instantiate tab. <br />
                  This operation does not remove the history of the contract
                  from the chain, nor any associated funds from its account. The
                  forget operation only limits your access to the contract on
                  this browser.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row-reverse">
          <button
            type="button"
            @click="forget"
            class="tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 hover:tw-bg-blue-700 dark:hover:tw-bg-blue-400 focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-100 dark:focus:tw-ring-blue-400 tw-mx-1"
          >
            Forget
          </button>
          <button
            type="button"
            @click="closeModal"
            class="tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-text-sm tw-font-medium tw-rounded-full tw-text-gray-500 dark:tw-text-darkGray-400 tw-bg-white dark:tw-bg-darkGray-900 hover:tw-bg-gray-100 dark:hover:tw-bg-darkGray-700 focus:tw-outline-none focus:tw-ring focus:tw-ring-gray-100 dark:focus:tw-ring-darkGray-600 tw-mx-1"
          >
            Cancel
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
