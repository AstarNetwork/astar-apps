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
            :style="isH160 ? 'width: 24rem' : 'width: 21rem'"
            type="text"
            spellcheck="false"
            :readonly="isReadOnly"
            @focus="openOption = !isH160"
            @blur="closeOption"
            @change="changeAddress"
          />
        </div>
      </div>

      <span
        v-if="!isH160"
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
        <div v-if="!isH160">
          <ModalSelectAccountOption
            v-for="(account, index) in substrateAccounts"
            :key="index"
            v-model:selOption="selAccountIdx"
            :address="account.address"
            :address-name="account.name"
            :checked="selAccountIdx === index"
            :role="role"
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
import { useAccount } from 'src/hooks';
import { isValidEvmAddress } from 'src/hooks/helper/plasmUtils';
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
  emits: ['update:sel-address', 'selChanged'],
  setup(props, { emit }) {
    const isReadOnly = props.role === Role.FromAddress;
    const openOption = ref(false);
    const store = useStore();
    const { currentAccountName } = useAccount();
    const currentAccountIdx = computed(() => store.getters['general/accountIdx']);
    const substrateAccounts = computed(() => {
      const accounts = store.getters['general/substrateAccounts'];
      const selectedAccount = getSelectedAccount(accounts);
      const filteredAccounts = accounts.filter(
        (it: SubstrateAccount) => selectedAccount && it.source === selectedAccount.source
      );
      return filteredAccounts;
    });

    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const selAccountIdx = ref(currentAccountIdx.value);
    const account = getSelectedAccount(substrateAccounts.value);

    const selAddress = ref(!isH160 ? (account?.address as string) : '');
    const selAccountName = ref(account?.name);

    const isCheckMetamask = computed(() => store.getters['general/isCheckMetamask']);
    const checkMetamask = ref<boolean>(isCheckMetamask.value);
    const isH160Account = ref<boolean>(isH160.value);
    const checkMetamaskOption = isH160.value ? isH160Account : checkMetamask;

    watch(
      [selAccountIdx, checkMetamaskOption],
      () => {
        if (!checkMetamaskOption.value) {
          const account = substrateAccounts.value.find(
            (it: SubstrateAccount) => it.address === selAccountIdx.value
          );
          selAccountName.value = account.name;
          selAddress.value = account.address;

          if (props.role === Role.FromAddress) {
            store.commit('general/setCurrentAccountIdx', account.address);
          }
        } else {
          if (props.role === Role.ToAddress && isH160.value) {
            selAddress.value = '';
          }
        }

        emit('update:sel-address', selAddress.value);
        emit('selChanged', selAddress.value, isCheckMetamask.value, selAccountIdx.value);

        openOption.value = false;
      },
      { immediate: true }
    );

    const isEvmAddress = ref<boolean>(false);
    watchEffect(() => {
      isEvmAddress.value = isValidEvmAddress(props.toAddress ? props.toAddress : '');
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
      checkMetamask,
      isH160,
      checkMetamaskOption,
      isReadOnly,
      isEvmAddress,
      substrateAccounts,
      changeAddress,
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
