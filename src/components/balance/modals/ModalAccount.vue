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
              Choose Account
            </h3>
            <div
              class="tw-mt-1 tw-w-full tw-rounded-md tw-bg-white dark:tw-bg-darkGray-900 tw-border tw-border-gray-300 dark:tw-border-darkGray-500"
            >
              <ul
                class="tw-max-h-56 tw-rounded-md tw-py-1 tw-text-base tw-overflow-auto focus:tw-outline-none"
              >
                <MetamaskOption v-if="isSupportContract" />
                <ModalAccountOption
                  v-for="(account, index) in allAccounts"
                  :key="index"
                  :key-idx="index"
                  :address="account"
                  :addressName="allAccountNames[index]"
                  :checked="selAccount === index"
                  v-model:selOption="selAccount"
                />
              </ul>
            </div>
          </div>
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row-reverse">
          <button
            type="button"
            @click="selectAccount(selAccount)"
            class="tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 hover:tw-bg-blue-700 dark:hover:tw-bg-blue-400 focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-100 dark:focus:tw-ring-blue-400 tw-mx-1"
          >
            Confirm
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
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { providerEndpoints } from 'src/config/chainEndpoints';
import MetamaskOption from './MetamaskOption.vue';
import ModalAccountOption from './ModalAccountOption.vue';

export default defineComponent({
  components: {
    MetamaskOption,
    ModalAccountOption,
  },
  props: {
    allAccounts: {
      type: Array,
      required: true,
    },
    allAccountNames: {
      type: Array,
      required: true,
    },
    accountIdx: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    const store = useStore();

    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const isSupportContract = ref(
      providerEndpoints[currentNetworkIdx.value].isSupportContract
    );
    const selectAccount = (accountIdx: number) => {
      store.commit('general/setCurrentAccountIdx', accountIdx);

      emit('update:is-open', false);
    };

    const selAccount = ref(props.accountIdx);

    return {
      selAccount,
      isSupportContract,
      closeModal,
      selectAccount,
    };
  },
});
</script>
