<template>
  <div
    class="tw-relative tw-z-0 tw-inline-flex tw-shadow tw-rounded-lg tw-bg-white dark:tw-bg-darkGray-800"
  >
    <div
      class="tw-relative tw-inline-flex tw-items-center tw-py-4 tw-px-1 sm:tw-py-5 sm:tw-px-2 tw-rounded-l-lg tw-flex-1 tw-text-left"
    >
      <div class="tw-flex tw-items-center">
        <div
          class="tw-h-11 tw-w-11 sm:tw-h-12 sm:tw-w-12 tw-rounded-full tw-overflow-hidden tw-border tw-border-gray-100 tw-mx-2 sm:tw-mx-3"
        >
          <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
            <icon-account-sample />
          </icon-base>
        </div>
        <div>
          <p class="tw-text-blue-900 dark:tw-text-darkGray-100 tw-font-bold">
            {{ addressName }}
          </p>
          <p class="tw-text-xs tw-text-gray-500 dark:tw-text-darkGray-400">
            {{ shortenAddress }}
          </p>
        </div>
      </div>

      <button
        type="button"
        @click="openModal"
        class="tw-tooltip tw-ml-auto tw-p-4 sm:tw-p-5 tw-rounded-full hover:tw-bg-gray-100 dark:hover:tw-bg-darkGray-600 focus:tw-z-10 focus:tw-outline-none focus:tw-ring focus:tw-ring-gray-100 dark:focus:tw-ring-darkGray-600 focus:tw-bg-blue-50 dark:focus:tw-bg-darkGray-900 tw-relative"
      >
        <icon-base
          class="tw-h-5 tw-w-5 dark:tw-text-darkGray-100"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <icon-chevron-down />
        </icon-base>

        <!-- Tooltip -->
        <span
          class="tw-pointer-events-none tw-hidden tw-absolute tw-top-0 tw-left-1/2 tw-z-10 tw-transform tw--translate-y-full tw--translate-x-1/2 tw-p-2 tw-text-xs tw-leading-tight tw-text-white tw-bg-gray-800 dark:tw-bg-darkGray-500 tw-rounded-md tw-shadow-lg tw-opacity-90 tw-whitespace-nowrap"
        >
          {{ $t('change') }}
        </span>
      </button>
    </div>

    <div
      class="tw-border-l tw-border-gray-100 dark:tw-border-darkGray-600 tw-flex tw-items-center tw-px-1 md:tw-px-2"
    >
      <button
        type="button"
        class="tw-tooltip tw-p-4 sm:tw-p-5 tw-rounded-full hover:tw-bg-gray-100 dark:hover:tw-bg-darkGray-600 focus:tw-z-10 focus:tw-outline-none focus:tw-ring focus:tw-ring-gray-100 dark:focus:tw-ring-darkGray-600 focus:tw-bg-blue-50 dark:focus:tw-bg-darkGray-900 tw-relative tw-group"
        @click="copyAddress"
      >
        <icon-base
          class="tw-h-5 tw-w-5 dark:tw-text-darkGray-100"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <icon-document-duplicate />
        </icon-base>

        <!-- Tooltip -->
        <span
          class="tw-pointer-events-none tw-hidden tw-absolute tw-top-0 tw-left-1/2 tw-z-10 tw-transform tw--translate-y-full tw--translate-x-1/2  tw-p-2 tw-text-xs tw-leading-tight tw-text-white tw-bg-gray-800 dark:tw-bg-darkGray-500 tw-rounded-md tw-shadow-lg tw-whitespace-nowrap"
        >
          {{ $t('copy') }}
        </span>

        <input type="hidden" id="hiddenAddr" :value="address" />
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, toRefs } from 'vue';
import { useStore } from 'src/store';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import IconBase from 'components/icons/IconBase.vue';
import IconAccountSample from 'components/icons/IconAccountSample.vue';
import IconChevronDown from 'components/icons/IconChevronDown.vue';
import IconDocumentDuplicate from 'components/icons/IconDocumentDuplicate.vue';

export default defineComponent({
  components: {
    IconBase,
    IconAccountSample,
    IconChevronDown,
    IconDocumentDuplicate,
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
  setup(props, { emit }) {
    const openModal = () => {
      emit('update:is-open', true);
    };

    const { address } = toRefs(props);

    const shortenAddress = computed(() => {
      return getShortenAddress(address.value);
    });

    const store = useStore();

    const showAlert = () => {
      store.dispatch('general/showAlertMsg', {
        msg: 'Copy address success!!',
        alertType: 'success',
      });
    };

    return {
      openModal,
      shortenAddress,
      showAlert,
    };
  },
  methods: {
    copyAddress() {
      var copyAddr = document.querySelector('#hiddenAddr') as HTMLInputElement;
      copyAddr.setAttribute('type', 'text');
      copyAddr.select();
      document.execCommand('copy');
      copyAddr.setAttribute('type', 'hidden');
      window.getSelection()?.removeAllRanges();

      this.showAlert();
    },
  },
});
</script>
