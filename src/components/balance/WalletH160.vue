<template>
  <div
    class="
      tw-relative tw-z-0 tw-inline-flex tw-shadow tw-rounded-lg tw-bg-white
      dark:tw-bg-darkGray-800
    "
  >
    <div
      class="
        tw-relative tw-inline-flex tw-items-center tw-py-4 tw-px-1
        sm:tw-py-5 sm:tw-px-2
        tw-rounded-l-lg tw-flex-1 tw-text-left
      "
    >
      <div class="tw-flex tw-items-center">
        <div
          class="
            tw-h-11 tw-w-11
            sm:tw-h-12 sm:tw-w-12
            tw-rounded-full tw-overflow-hidden
            sm:tw-border
            tw-border-gray-100 tw-mx-2
            sm:tw-mx-3
          "
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

    <div class="tw-flex tw-items-center">
      <div
        class="
          tw-border-l tw-border-gray-100
          dark:tw-border-darkGray-600
          tw-flex tw-items-center tw-px-1
          md:tw-px-2
        "
      >
        <button type="button" class="icon tw-tooltip" @click="copyAddress">
          <icon-base
            class="tw-h-5 tw-w-5 dark:tw-text-darkGray-100"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <icon-document-duplicate />
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
              tw-rounded-md tw-shadow-lg tw-whitespace-nowrap
            "
            >{{ $t('copy') }}</span
          >

          <input id="hiddenAddr" type="hidden" :value="address" />
        </button>
      </div>

      <div
        v-if="isSubscan"
        class="
          tw-border-l tw-border-gray-100
          dark:tw-border-darkGray-600
          tw-flex tw-items-center tw-px-1
          md:tw-px-2
        "
      >
        <a :href="subScan" target="_blank" rel="noopener noreferrer">
          <button type="button" class="icon tw-tooltip">
            <icon-base
              class="dark:tw-text-darkGray-300 tw-h-5 tw-w-5 tw-mt-1"
              viewBox="0 0 30 40"
              aria-hidden="true"
            >
              <icon-link />
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
                tw-rounded-md tw-shadow-lg tw-whitespace-nowrap
              "
              >{{ $t('subscan') }}</span
            >

            <input id="hiddenAddr" type="hidden" :value="address" />
          </button>
        </a>
      </div>
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
import IconLink from 'components/icons/IconLink.vue';
import { providerEndpoints } from 'src/config/chainEndpoints';
export default defineComponent({
  components: {
    IconBase,
    IconAccountSample,
    IconChevronDown,
    IconDocumentDuplicate,
    IconLink,
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
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const openModal = () => {
      emit('update:is-open', true);
    };
    const { address } = toRefs(props);
    const shortenAddress = computed(() => {
      return getShortenAddress(address.value);
    });
    const store = useStore();
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const selectedAccountAddress = computed(() => store.getters['general/selectedAccountAddress']);
    const subScan = computed(
      () =>
        `${providerEndpoints[currentNetworkIdx.value].subscan}/account/${
          selectedAccountAddress.value
        }`
    );
    const isSubscan = providerEndpoints[currentNetworkIdx.value].subscan !== '';
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
      subScan,
      isSubscan,
      currentNetworkIdx,
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