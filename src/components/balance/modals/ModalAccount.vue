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
              {{ $t('balance.modals.chooseAccount') }}
            </h3>
            <div
              class="
                tw-mt-1 tw-w-full tw-rounded-md tw-bg-white
                dark:tw-bg-darkGray-900
                tw-border tw-border-gray-300
                dark:tw-border-darkGray-500
              "
            >
              <ul
                class="
                  tw-max-h-56 tw-rounded-md tw-py-1 tw-text-base tw-overflow-auto
                  focus:tw-outline-none
                "
              >
                <MetamaskOption
                  v-if="isSupportContract"
                  v-model:selChecked="checkMetamask"
                  :checked="checkMetamask || isH160Account"
                  @connectMetamask="connectMetamask"
                />
                <ModalAccountOption
                  v-for="(account, index) in allAccounts"
                  :key="index"
                  v-model:selOption="selAccount"
                  v-model:selChecked="checkMetamask"
                  :key-idx="index"
                  :address="account"
                  :address-name="allAccountNames[index]"
                  :checked="!checkMetamask && !isH160Account && selAccount === index"
                />
              </ul>
            </div>
          </div>
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row-reverse">
          <button type="button" class="confirm" @click="selectAccount(selAccount, checkMetamask)">
            {{ $t('confirm') }}
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
import { useStore } from 'src/store';
import { useRouter } from 'vue-router';
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
  },
  emits: ['update:is-open'],
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    const currentRoute = computed(() => {
      return useRouter().currentRoute.value;
    });
    const isBalancePath = currentRoute.value.matched[0].path === '/balance';
    const store = useStore();

    const currentAccountIdx = computed(() => store.getters['general/accountIdx']);
    const isCheckMetamask = computed(() => store.getters['general/isCheckMetamask']);
    const isH160Formatted = computed(() => store.getters['general/isH160Formatted']);
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const isSupportContract = ref(providerEndpoints[currentNetworkIdx.value].isSupportContract);
    const selectAccount = (accountIdx: number, checkMetamask: boolean) => {
      console.log(checkMetamask + '/' + accountIdx);
      store.commit('general/setIsCheckMetamask', checkMetamask);
      store.commit('general/setCurrentAccountIdx', accountIdx);
      if (isH160Formatted.value && accountIdx !== 0) {
        store.commit('general/setIsH160Formatted', false);
      }

      emit('update:is-open', false);
    };

    const selAccount = ref(currentAccountIdx.value);
    const checkMetamask = ref<boolean>(isCheckMetamask.value);
    const isH160Account = ref<boolean>(isH160Formatted.value);

    const connectMetamask = (ethAddr: string, ss58: string) => {
      console.log(ethAddr + '/' + ss58);
      store.commit('general/setCurrentEcdsaAccount', { ethereum: ethAddr, ss58 });
    };

    return {
      selAccount,
      checkMetamask,
      isH160Account,
      isSupportContract,
      closeModal,
      selectAccount,
      connectMetamask,
      isBalancePath,
    };
  },
});
</script>

<style scoped>
.confirm {
  @apply tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 tw-mx-1;
}
.confirm:hover {
  @apply tw-bg-blue-700 dark:tw-bg-blue-400;
}
.confirm:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-blue-400;
}
.cancel {
  @apply tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-text-sm tw-font-medium tw-rounded-full tw-text-gray-500 dark:tw-text-darkGray-400 tw-bg-white dark:tw-bg-darkGray-900 tw-mx-1;
}
.cancel:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-700;
}
.cancel:focus {
  @apply tw-outline-none tw-ring tw-ring-gray-100 dark:tw-ring-darkGray-600;
}
</style>
