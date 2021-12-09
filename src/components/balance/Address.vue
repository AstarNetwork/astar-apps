<template>
  <div class="tw-inline-flex">
    <div class="tw-relative tw-inline-flex tw-items-center tw-rounded-l-lg tw-flex-1 tw-text-left">
      <div class="tw-flex tw-items-center">
        <div class="tw-h-11 tw-w-11 sm:tw-h-12 sm:tw-w-12 tw-overflow-hidden tw-mx-2 sm:tw-mx-3">
          <div v-if="format === 'H160'">
            <img width="80" src="~assets/img/ethereum.png" />
          </div>
          <div v-else>
            <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
              <icon-account-sample />
            </icon-base>
          </div>
        </div>
        <div>
          <p class="tw-text-blue-900 dark:tw-text-darkGray-100 tw-font-bold">
            {{ format }}
          </p>
          <p class="tw-text-xs tw-text-gray-500 dark:tw-text-darkGray-400">
            <span class="tw-hidden sm:tw-block lg:tw-hidden 2xl:tw-block">
              {{ address }}
            </span>
            <span class="sm:tw-hidden lg:tw-block 2xl:tw-hidden">
              {{ getShortenAddress(address) }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <div class="tw-flex tw-items-center">
      <div class="tw-flex tw-items-center tw-px-1 md:tw-px-2">
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
        </button>
      </div>

      <div
        v-if="isSubscan"
        class="
          tw-border-l tw-border-gray-100
          dark:tw-border-darkGray-600
          tw-flex tw-items-center tw-pl-1
          md:tw-pl-2
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
          </button>
        </a>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, watchEffect } from 'vue';
import { useStore } from 'src/store';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import IconBase from 'components/icons/IconBase.vue';
import IconAccountSample from 'components/icons/IconAccountSample.vue';
import IconDocumentDuplicate from 'components/icons/IconDocumentDuplicate.vue';
import IconLink from 'components/icons/IconLink.vue';
import { providerEndpoints } from 'src/config/chainEndpoints';
import { useAccount } from 'src/hooks';
import { toEvmAddress } from 'src/hooks/helper/plasmUtils';
import { AddressFormat } from './Addresses.vue';

export default defineComponent({
  components: {
    IconBase,
    IconAccountSample,
    IconDocumentDuplicate,
    IconLink,
  },
  props: {
    format: {
      type: String,
      required: true,
    },
  },

  setup({ format }) {
    const store = useStore();
    const address = ref<string>('');
    const { currentAccount } = useAccount();

    watchEffect(() => {
      if (!currentAccount.value) return;

      address.value =
        format === AddressFormat.SS58 ? currentAccount.value : toEvmAddress(currentAccount.value);
    });

    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const subScan = computed(
      () => `${providerEndpoints[currentNetworkIdx.value].subscan}/account/${address.value}`
    );

    const isSubscan = providerEndpoints[currentNetworkIdx.value].subscan !== '';

    const copyAddress = async () => {
      await navigator.clipboard.writeText(address.value);
      store.dispatch('general/showAlertMsg', {
        msg: 'Copy address success!!',
        alertType: 'success',
      });
    };

    return {
      address,
      subScan,
      isSubscan,
      currentNetworkIdx,
      copyAddress,
      getShortenAddress,
    };
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
