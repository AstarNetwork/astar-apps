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
              Choose Networks
            </h3>

            <fieldset>
              <ul role="radiogroup">
                <li
                  v-for="(provider, index) in providerEndpoints"
                  :key="index"
                  class="mb-2"
                >
                  <label
                    :class="selNetwork === index ? classRadioOn : classRadioOff"
                  >
                    <input
                      name="choose_networks"
                      type="radio"
                      :checked="selNetwork === index"
                      @change="selNetwork = index"
                      class="tw-appearance-none tw-border-2 tw-border-gray-300 dark:tw-border-darkGray-600 tw-rounded-full focus:tw-ring-blue-500 tw-h-4 tw-w-4 tw-mr-3 focus:tw-outline-none tw-bg-white dark:tw-bg-darkGray-900 checked:tw-border-4 checked:tw-border-blue-500"
                    />
                    <div class="tw-text-left tw-flex-1">
                      <p
                        :class="
                          selNetwork === index
                            ? classRadioTxtOn
                            : classRadioTxtOff
                        "
                      >
                        {{ provider.displayName }}
                      </p>

                      <!-- custom endpoint -->
                      <input
                        v-if="index === 4"
                        type="text"
                        placeholder="IP Address / Domain"
                        class="tw-appearance-none tw-bg-gray-50 dark:tw-bg-darkGray-800 tw-block tw-w-full tw-border tw-border-gray-300 dark:tw-border-darkGray-600 focus:tw-ring-blue-500 focus:tw-border-blue-500 tw-rounded-md tw-mt-2 tw-px-2 tw-py-2 focus:tw-outline-none tw-text-sm tw-text-gray-700 dark:tw-text-darkGray-100 focus:tw-bg-white dark:focus:tw-bg-darkGray-900 tw-placeholder-gray-300 dark:tw-placeholder-darkGray-600"
                        v-model="customEndpoint"
                      />
                    </div>
                  </label>
                </li>
              </ul>
            </fieldset>
          </div>
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row-reverse">
          <button
            type="button"
            @click="selectNetwork(selNetwork)"
            class="tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 hover:tw-bg-blue-700 dark:hover:tw-bg-blue-400 focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-100 dark:focus:tw-ring-blue-400 tw-mx-1"
          >
            Switch
          </button>
          <button
            type="button"
            @click="closeModal"
            class="tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-gray-300 dark:tw-border-darkGray-600 tw-text-sm tw-font-medium tw-rounded-full tw-text-gray-500 dark:tw-text-darkGray-400 tw-bg-white dark:tw-bg-darkGray-900 dark:hover:tw-bg-darkGray-800 hover:tw-bg-gray-100 focus:tw-outline-none focus:tw-ring focus:tw-ring-gray-100 dark:focus:tw-ring-darkGray-600 tw-mx-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { providerEndpoints } from 'src/config/chainEndpoints';

export default defineComponent({
  props: {
    networkIdx: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const classRadioOn =
      'tw-rounded-lg tw-border tw-border-blue-500 tw-bg-blue-200 dark:tw-bg-blue-500 tw-bg-opacity-10 tw-px-4 tw-py-5 tw-flex tw-items-center tw-cursor-pointer';
    const classRadioOff =
      'tw-rounded-lg tw-border tw-border-gray-300 dark:tw-border-darkGray-600 tw-bg-white dark:tw-bg-darkGray-900 hover:tw-bg-gray-50 dark:hover:tw-bg-darkGray-800 tw-px-4 tw-py-5 tw-flex tw-items-start tw-cursor-pointer tw-group';
    const classRadioTxtOn =
      'tw-font-medium tw-text-blue-500 dark:tw-text-blue-400 tw-text-sm';
    const classRadioTxtOff =
      'tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 group-hover:tw-text-gray-700 dark:group-hover:tw-text-darkGray-300 tw-text-sm';

    const customEndpoint = ref('');

    const closeModal = (): void => {
      emit('update:is-open', false);
    };

    const selectNetwork = (networkIdx: number): void => {
      localStorage.setItem('networkIdx', networkIdx.toString());
      if (customEndpoint.value) {
        const endpoint = `ws://${customEndpoint.value}`;
        localStorage.setItem('customEndpoint', endpoint);
      }
      location.reload();

      emit('update:is-open', false);
      emit('update:select-network', networkIdx);
    };

    const selNetwork = ref(props.networkIdx);

    return {
      closeModal,
      customEndpoint,
      selectNetwork,
      selNetwork,
      classRadioOn,
      classRadioOff,
      classRadioTxtOn,
      classRadioTxtOff,
      providerEndpoints,
    };
  },
});
</script>
