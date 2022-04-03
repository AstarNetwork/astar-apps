<template>
  <div class="tw-inline-flex">
    <div class="tw-relative tw-inline-flex tw-items-center tw-rounded-l-lg tw-flex-1 tw-text-left">
      <div class="tw-flex tw-items-center">
        <div class="tw-h-11 tw-w-11 sm:tw-h-12 sm:tw-w-12 tw-overflow-hidden tw-mx-2 sm:tw-mx-3">
          <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
            <icon-account-sample />
          </icon-base>
        </div>
        <div>
          <div class="tw-flex tw-items-center tw-gap-x-2">
            <p class="tw-text-blue-900 dark:tw-text-darkGray-100 tw-font-bold">
              {{ $t('balance.native') }}
            </p>

            <button class="tw-tooltip">
              <div>
                <q-icon class="tw-w-4 tw-h-4 tw-mb-1" :name="farQuestionCircle" color="grey" />
              </div>

              <!-- Tooltip -->
              <span
                class="
                  tw-pointer-events-none
                  tw-hidden
                  tw-absolute
                  tw-top-0
                  tw-z-10
                  tw-transform
                  tw--translate-y-full
                  tw-p-2
                  tw-text-xs
                  tw-leading-tight
                  tw-text-white
                  tw-bg-gray-800
                  dark:tw-bg-darkGray-500
                  tw-rounded-md tw-shadow-lg
                  md:tw-whitespace-nowrap
                "
                >{{
                  $t('balance.tooltipNative', {
                    value: currentNetworkName,
                  })
                }}</span
              >
            </button>
          </div>
          <p class="tw-text-xs tw-text-gray-500 dark:tw-text-darkGray-400">
            <span class="tw-hidden sm:tw-block lg:tw-hidden 2xl:tw-block">
              {{ currentAccount }}
            </span>
            <span class="sm:tw-hidden lg:tw-block 2xl:tw-hidden">
              {{ getShortenAddress(currentAccount) }}
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
import { farQuestionCircle } from '@quasar/extras/fontawesome-v5';
import IconAccountSample from 'components/icons/IconAccountSample.vue';
import IconBase from 'components/icons/IconBase.vue';
import IconDocumentDuplicate from 'components/icons/IconDocumentDuplicate.vue';
import IconLink from 'components/icons/IconLink.vue';
import { getProviderIndex, providerEndpoints } from 'src/config/chainEndpoints';
import { useAccount } from 'src/hooks';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { useStore } from 'src/store';
import { computed, defineComponent } from 'vue';
import copy from 'copy-to-clipboard';

export default defineComponent({
  components: {
    IconBase,
    IconAccountSample,
    IconDocumentDuplicate,
    IconLink,
  },

  setup() {
    const store = useStore();
    const { currentAccount } = useAccount();

    const currentNetworkIdx = computed(() => {
      const chainInfo = store.getters['general/chainInfo'];
      const chain = chainInfo ? chainInfo.chain : '';
      return getProviderIndex(chain);
    });

    const currentNetworkName = computed(() => {
      const id = store.getters['general/networkIdx'];
      return providerEndpoints[id].displayName;
    });

    const subScan = computed(
      () => `${providerEndpoints[currentNetworkIdx.value].subscan}/account/${currentAccount.value}`
    );

    const copyAddress = async () => {
      copy(currentAccount.value);
      store.dispatch('general/showAlertMsg', {
        msg: 'Copy address success!',
        alertType: 'success',
      });
    };

    return {
      subScan,
      copyAddress,
      getShortenAddress,
      farQuestionCircle,
      currentNetworkName,
      currentAccount,
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
