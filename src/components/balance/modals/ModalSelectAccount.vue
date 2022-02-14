<template>
  <div class="tw-relative">
    <div class="button-account">
      <div class="tw-flex tw-items-center tw-justify-between">
        <div class="tw-flex tw-items-center">
          <div class="tw-h-8 tw-w-8 tw-overflow-hidden tw-mr-3 tw-flex-shrink-0">
            <img v-if="isEvmAddress" width="80" src="~assets/img/ethereum.png" />
            <icon-base v-else class="tw-h-full tw-w-full" viewBox="0 0 64 64">
              <icon-account-sample />
            </icon-base>
          </div>

          <input
            v-model="valueAddressOrWallet"
            class="
              tw-w-full tw-text-blue-900
              dark:tw-text-darkGray-100
              tw-text-xl
              focus:tw-outline-none
              tw-bg-transparent tw-placeholder-gray-300
              dark:tw-placeholder-darkGray-600
            "
            :class="isEthWallet ? 'input-h160' : 'input-ss58'"
            type="text"
            spellcheck="false"
            :readonly="isReadOnly"
            @focus="openOption = !isEthWallet"
            @blur="closeOption"
            @change="changeAddress"
          />
        </div>
      </div>

      <span
        v-if="!isEthWallet"
        class="
          tw-ml-3
          tw-absolute
          tw-inset-y-0
          tw-right-0
          tw-flex
          tw-items-center
          tw-pr-2
          tw-pointer-events-none
        "
      >
        <icon-base
          class="tw-h-5 tw-w-5 tw-text-gray-400 dark:tw-text-darkGray-300"
          icon-name="selector"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <icon-solid-selector />
        </icon-base>
      </span>
    </div>

    <div
      v-if="openOption"
      class="
        tw-block tw-absolute tw-mt-1 tw-w-full tw-rounded-md tw-bg-white
        dark:tw-bg-darkGray-800
        tw-shadow-lg tw-z-10 tw-border tw-border-gray-200
        dark:tw-border-darkGray-600
      "
    >
      <ul
        class="
          tw-max-h-56 tw-rounded-md tw-py-1 tw-text-base tw-overflow-auto
          focus:tw-outline-none
        "
      >
        <div v-if="!isEthWallet">
          <ModalSelectAccountOption
            v-for="(account, index) in substrateAccounts"
            :key="index"
            v-model:selOption="selAccountIdx"
            :address="account.address"
            :address-name="account.name"
            :checked="selAccountIdx === account.address"
          />
        </div>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import IconAccountSample from 'components/icons/IconAccountSample.vue';
import IconBase from 'components/icons/IconBase.vue';
import IconSolidSelector from 'components/icons/IconSolidSelector.vue';
import { LOCAL_STORAGE } from 'src/config/localStorage';
import { useAccount } from 'src/hooks';
import { isValidEvmAddress } from 'src/config/web3';
import { getSelectedAccount } from 'src/hooks/helper/wallet';
import { useStore } from 'src/store';
import { SubstrateAccount } from 'src/store/general/state';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import ModalSelectAccountOption from './ModalSelectAccountOption.vue';
import { Role } from './ModalTransferAmount.vue';

export default defineComponent({
  components: {
    ModalSelectAccountOption,
    IconBase,
    IconAccountSample,
    IconSolidSelector,
  },
  props: {
    role: {
      type: String,
      required: false,
      default: '',
    },
    toAddress: {
      type: String,
      required: false,
      default: '',
    },
  },
  emits: ['update:sel-address', 'sel-changed'],
  setup(props, { emit }) {
    const isReadOnly = props.role === Role.FromAddress;
    const openOption = ref<boolean>(false);
    const store = useStore();
    const { currentAccountName, currentAccount } = useAccount();
    const currentAddress = computed(() => store.getters['general/selectedAddress']);
    const substrateAccounts = computed(() => {
      const accounts = store.getters['general/substrateAccounts'];
      const selectedAccount = getSelectedAccount(accounts);
      const filteredAccounts = accounts.filter(
        (it: SubstrateAccount) => selectedAccount && it.source === selectedAccount.source
      );
      return filteredAccounts;
    });

    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const isEthWallet = computed(() => store.getters['general/isEthWallet']);
    const selAccountIdx = props.role === Role.ToAddress ? ref('') : ref(currentAddress.value);
    const account = getSelectedAccount(substrateAccounts.value);

    const selAddress = ref(!isH160 ? (account?.address as string) : '');

    watch(
      [selAccountIdx, isEthWallet],
      () => {
        if (!isEthWallet.value) {
          const account = substrateAccounts.value.find(
            (it: SubstrateAccount) => it.address === selAccountIdx.value
          );
          if (!account) return;
          selAddress.value = account.address;

          if (props.role === Role.FromAddress) {
            store.commit('general/setCurrentAddress', account.address);
            localStorage.setItem(LOCAL_STORAGE.SELECTED_ADDRESS, String(account.address));
          }
        } else {
          const lookupAddress = props.role === Role.ToAddress ? '' : currentAccount.value;
          selAddress.value = lookupAddress;
        }

        emit('update:sel-address', selAddress.value);
        emit('sel-changed', selAccountIdx.value);

        openOption.value = false;
      },
      { immediate: true }
    );

    const isEvmAddress = ref<boolean>(false);
    watchEffect(() => {
      isEvmAddress.value =
        props.role === Role.ToAddress
          ? isValidEvmAddress(props.toAddress ? props.toAddress : '')
          : isH160.value;
    });

    const closeOption = () => {
      setTimeout(() => {
        openOption.value = false;
      }, 400);
    };

    const valueAddressOrWallet = ref<string>('');
    watchEffect(() => {
      valueAddressOrWallet.value =
        props.role === Role.FromAddress ? String(currentAccountName.value) : selAddress.value;
    });

    const changeAddress = (e: any) => {
      emit('update:sel-address', e.currentTarget.value);
    };

    return {
      valueAddressOrWallet,
      openOption,
      closeOption,
      selAccountIdx,
      selAddress,
      isH160,
      isReadOnly,
      isEvmAddress,
      substrateAccounts,
      changeAddress,
      isEthWallet,
    };
  },
});
</script>

<style scoped>
.button-account {
  @apply tw-relative tw-text-blue-900 dark:tw-text-darkGray-100 tw-w-full tw-bg-white dark:tw-bg-darkGray-900 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-rounded-md tw-pl-3 tw-pr-10 tw-py-3 tw-text-left;
}
.button-account:hover {
  @apply tw-bg-gray-50 dark:tw-bg-darkGray-800;
}
.button-account:focus {
  @apply tw-outline-none tw-ring tw-ring-blue-100 dark:tw-ring-darkGray-600;
}
</style>

<style lang="scss" scoped>
.input-ss58 {
  width: 14rem;
  @media (min-width: 768px) {
    width: 21rem;
  }
}
.input-h160 {
  width: 14rem;
  @media (min-width: 768px) {
    width: 24rem;
  }
}
</style>
