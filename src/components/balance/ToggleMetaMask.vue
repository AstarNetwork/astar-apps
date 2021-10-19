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
        tw-rounded-l-lg tw-flex-1 tw-text-left tw-justify-between
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
          <img width="80" src="~assets/img/metamask.png" />
        </div>
        <div>
          <p class="tw-text-blue-900 dark:tw-text-darkGray-100 tw-font-bold">
            Current address scheme
          </p>
          <p class="tw-text-blue-900 dark:tw-text-darkGray-100 tw-font-bold">H160 (EVM)</p>
        </div>
      </div>
      <div class="tw-mr-4">
        <Toggle v-model:value="isToggleOn" @toggleAction="toggleAction" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { useMetamask } from 'src/hooks/custom-signature/useMetamask';
import { useStore } from 'src/store';
import { computed, defineComponent, ref } from 'vue';
import Toggle from './Toggle.vue';
import * as utils from 'src/hooks/custom-signature/utils';

export default defineComponent({
  components: {
    Toggle,
  },

  setup() {
    const isToggleOn = ref(false);
    const store = useStore();
    const { requestAccounts, requestSignature } = useMetamask();

    const chainInfo = computed(() => store.getters['general/chainInfo']);
    const isSS58 = computed(() => store.getters['general/isCheckMetamask']);
    const isH160 = computed(() => store.getters['general/isCheckMetamaskH160']);

    const toggleAction = async () => {
      isToggleOn.value = !isToggleOn.value;
      store.commit('general/setIsCheckMetamask', !isSS58.value);
      store.commit('general/setIsCheckMetamaskH160', !isH160.value);

      const accounts = await requestAccounts();
      const loadingAddr = accounts[0];
      const loginMsg = `Sign this message to login with address ${loadingAddr}`;
      const signature = await requestSignature(loginMsg, loadingAddr);

      if (isH160.value) {
        store.commit('general/setCurrentEcdsaAccount', {
          ethereum: loadingAddr,
          h160: loadingAddr,
        });
        return;
      }
      if (isSS58.value) {
        const pubKey = utils.recoverPublicKeyFromSig(loadingAddr, loginMsg, signature);
        const ss58Address = utils.ecdsaPubKeyToSs58(pubKey, chainInfo.value?.ss58Format);
        store.commit('general/setCurrentEcdsaAccount', {
          ethereum: loadingAddr,
          ss58: ss58Address,
        });
        return;
      }
    };

    return {
      toggleAction,
      isToggleOn,
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
