<template>
  <div v-if="isConnected(currentNetworkStatus)">
    <div class="tw-fixed tw-z-10 tw-inset-0 tw-overflow-y-auto" @click="closeModal">
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
          @click.stop
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
              <div v-if="!substrateAccounts.length && selectedWallet === SupportWallet.Math">
                <li v-if="currentNetworkIdx !== 1">
                  {{ $t('balance.modals.math.supportsNetwork') }}
                </li>
                <li v-if="!substrateAccounts.length">
                  {{ $t('balance.modals.math.switchNetwork') }}
                </li>
              </div>
              <div
                v-else
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
                  <ModalAccountOption
                    v-for="(account, index) in substrateAccounts"
                    :key="index"
                    v-model:selOption="selAccount"
                    :address="account.address"
                    :address-name="account.name"
                    :checked="selAccount === account.address"
                  />
                </ul>
              </div>
            </div>
          </div>
          <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row-reverse">
            <button type="button" class="confirm" @click="selectAccount(selAccount)">
              {{ $t('confirm') }}
            </button>
            <button type="button" class="cancel" @click="closeModal">
              {{ $t('cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { providerEndpoints } from 'src/config/chainEndpoints';
import { SupportWallet } from 'src/config/wallets';
import { castMobileSource } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { SubstrateAccount } from 'src/store/general/state';
import { computed, defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import ModalAccountOption from './ModalAccountOption.vue';

export default defineComponent({
  components: {
    ModalAccountOption,
  },
  props: {
    selectedWallet: {
      type: String,
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

    const substrateAccounts = computed(() => {
      const accounts = store.getters['general/substrateAccounts'];
      const filteredAccounts = accounts.filter((it: SubstrateAccount) => {
        const lookupWallet = castMobileSource(props.selectedWallet);
        return it.source === lookupWallet;
      });
      return filteredAccounts;
    });
    const isH160Formatted = computed(() => store.getters['general/isH160Formatted']);
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const isSupportContract = ref(providerEndpoints[currentNetworkIdx.value].isSupportContract);

    const selectAccount = (account: string) => {
      store.commit('general/setCurrentAddress', account);
      emit('update:is-open', false);
    };

    const selAccount = ref<string>(
      substrateAccounts.value.length ? substrateAccounts.value[0] : ''
    );
    const isH160Account = ref<boolean>(isH160Formatted.value);

    const currentNetworkStatus = computed(() => store.getters['general/networkStatus']);

    return {
      selAccount,
      isH160Account,
      isSupportContract,
      closeModal,
      selectAccount,
      isBalancePath,
      currentNetworkStatus,
      substrateAccounts,
      SupportWallet,
      currentNetworkIdx,
    };
  },
  methods: {
    isConnected(networkStatus: string) {
      return networkStatus === 'connected';
    },
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
