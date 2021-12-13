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
              {{ $t('balance.modals.chooseNetwork') }}
            </h3>

            <fieldset>
              <ul role="radiogroup">
                <li v-for="(provider, index) in providerEndpoints" :key="index" class="tw-mb-2">
                  <label :class="selNetwork === index ? classRadioOn : classRadioOff">
                    <input
                      name="choose_networks"
                      type="radio"
                      :checked="selNetwork === index"
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
                      @change="selNetwork = index"
                    />
                    <div class="tw-text-left tw-flex-1">
                      <p :class="selNetwork === index ? classRadioTxtOn : classRadioTxtOff">
                        {{ provider.displayName }}
                      </p>

                      <!-- custom endpoint -->
                      <input
                        v-if="provider.key === endpointKey.CUSTOM"
                        v-model="newEndpoint"
                        type="text"
                        placeholder="IP Address / Domain"
                        class="ip-input"
                      />
                    </div>
                  </label>
                </li>
              </ul>
            </fieldset>
          </div>
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row-reverse">
          <button type="button" class="switch" @click="selectNetwork(selNetwork, newEndpoint)">
            {{ $t('balance.modals.switch') }}
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
import { defineComponent, ref, computed } from 'vue';
import { providerEndpoints, endpointKey } from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import { LOCAL_STORAGE } from 'src/config/localStorage';

export default defineComponent({
  props: {
    networkIdx: {
      type: Number,
      required: true,
    },
  },
  emits: ['update:select-network', 'update:is-open'],
  setup(props, { emit }) {
    const classRadioOn =
      'tw-rounded-lg tw-border tw-border-blue-500 tw-bg-blue-200 dark:tw-bg-blue-500 tw-bg-opacity-10 tw-px-4 tw-py-5 tw-flex tw-items-center tw-cursor-pointer';
    const classRadioOff = 'class-radio-off';
    const classRadioTxtOn = 'tw-font-medium tw-text-blue-500 dark:tw-text-blue-400 tw-text-sm';
    const classRadioTxtOff = 'class-radio-tx-off';

    const store = useStore();
    const newEndpoint = ref('');
    const customEndpoint = computed(() => store.getters['general/customEndpoint']);
    newEndpoint.value = customEndpoint.value;

    const closeModal = (): void => {
      emit('update:is-open', false);
    };

    const { NETWORK_IDX, CUSTOM_ENDPOINT } = LOCAL_STORAGE;

    const selectNetwork = (networkIdx: number): void => {
      localStorage.setItem(NETWORK_IDX, networkIdx.toString());
      if (newEndpoint.value) {
        let endpoint = `${newEndpoint.value}`;
        endpoint = !endpoint.includes('wss://') ? `wss://${endpoint}` : endpoint;
        localStorage.setItem(CUSTOM_ENDPOINT, endpoint);
      }
      location.reload();

      emit('update:is-open', false);
      emit('update:select-network', networkIdx);
    };

    const selNetwork = ref(props.networkIdx);

    return {
      closeModal,
      newEndpoint,
      selectNetwork,
      selNetwork,
      classRadioOn,
      classRadioOff,
      classRadioTxtOn,
      classRadioTxtOff,
      providerEndpoints,
      endpointKey,
    };
  },
});
</script>

<style scoped>
.switch {
  @apply tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 tw-mx-1;
}
.switch:hover {
  @apply tw-bg-blue-700 dark:tw-bg-blue-400;
}
.switch:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-400;
}
.cancel {
  @apply tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-gray-300 dark:tw-border-darkGray-600 tw-text-sm tw-font-medium tw-rounded-full tw-text-gray-500 dark:tw-text-darkGray-400 tw-bg-white dark:tw-bg-darkGray-900 tw-mx-1;
}
.cancel:hover {
  @apply dark:tw-bg-darkGray-800 tw-bg-gray-100;
}
.cancel:focus {
  @apply tw-outline-none tw-ring tw-ring-gray-100 dark:tw-ring-darkGray-600;
}
.class-radio-off {
  @apply tw-rounded-lg tw-border tw-border-gray-300 dark:tw-border-darkGray-600 tw-bg-white dark:tw-bg-darkGray-900 tw-px-4 tw-py-5 tw-flex tw-items-start tw-cursor-pointer tw-group;
}
.class-radio-off:hover {
  @apply tw-bg-gray-50 dark:tw-bg-darkGray-800;
}

.ip-input {
  @apply tw-appearance-none tw-bg-gray-50 dark:tw-bg-darkGray-800 tw-block tw-w-full tw-border tw-border-gray-300 dark:tw-border-darkGray-600 tw-rounded-md tw-mt-2 tw-px-2 tw-py-2 tw-text-sm tw-text-gray-700 dark:tw-text-darkGray-100  tw-placeholder-gray-300 dark:tw-placeholder-darkGray-600;
}
.ip-input:focus {
  @apply tw-outline-none tw-bg-white dark:tw-bg-darkGray-900 tw-ring-blue-500 tw-border-blue-500;
}

.class-radio-tx-off {
  @apply tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-text-sm;
}
.class-radio-tx-off:group-hover {
  @apply tw-text-gray-700 dark:tw-text-darkGray-300;
}
</style>
