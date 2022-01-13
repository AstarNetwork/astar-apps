<template>
  <div class="tw-fixed tw-z-10 tw-inset-0 tw-overflow-y-auto" @click="setCloseModal">
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
          tw-shadow-xl
          tw-transform
          tw-transition-all
          tw-mx-2
          tw-my-2
          tw-align-middle
          tw-max-w-lg
          tw-w-full
        "
        @click.stop
      >
        <div>
          <div class="tw-mb-8">
            <div class="tw-flex tw-items-center tw-justify-center tw-mb-4">
              <div class="tw-h-8 tw-w-8 tw-mr-3 tw-mb-2">
                <img width="40" :src="img" />
              </div>
              <div
                class="
                  tw-text-lg tw-font-extrabold tw-text-blue-900
                  dark:tw-text-white
                  tw-text-center tw-mb-2
                "
              >
                {{ $t('installWallet.getWallet', { value: $t(selectedWallet) }) }}
              </div>
            </div>
            <div class="tw-text-md tw-text-blue-900 dark:tw-text-white tw-text-center">
              {{ $t('installWallet.installWallet', { value: $t(selectedWallet) }) }}
            </div>
          </div>
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center">
          <a :href="guideUrl" target="_blank" rel="noopener noreferrer">
            <button type="button" class="learnButton">
              {{ $t('installWallet.howToConnect') }}
            </button>
          </a>
          <a :href="walletUrl" target="_blank" rel="noopener noreferrer">
            <button type="button" class="installButton">
              {{ $t('installWallet.installExtension', { value: $t(selectedWallet) }) }}
            </button>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { supportWalletObj } from 'src/config/wallets';
import { useConnectWallet } from 'src/hooks';
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    setCloseModal: {
      type: Function,
      required: true,
    },
    selectedWallet: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    // @ts-ignore
    const { img, walletUrl, guideUrl } = supportWalletObj[props.selectedWallet];

    return {
      img,
      walletUrl,
      guideUrl,
    };
  },
});
</script>

<style scoped>
.installButton {
  @apply tw-inline-flex tw-items-center tw-px-4 tw-py-3 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500  tw-mx-1;
}
.installButton:hover {
  @apply tw-bg-blue-700 dark:tw-bg-blue-400;
}

.learnButton {
  @apply tw-inline-flex tw-items-center tw-px-4 tw-py-3 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-text-sm tw-font-medium tw-rounded-full tw-text-gray-500 dark:tw-text-darkGray-400 tw-bg-white dark:tw-bg-darkGray-900 tw-mx-3;
}
.learnButton:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-700;
}
</style>
