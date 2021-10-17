<template>
  <div class="tw-relative">
    <button type="button" class="button-account" @click="openOption = !openOption && !isH160">
      <div class="tw-flex tw-items-center tw-justify-between">
        <div class="tw-flex tw-items-center">
          <div
            class="
              tw-h-8
              tw-w-8
              tw-rounded-full
              tw-overflow-hidden
              tw-border
              tw-border-gray-100
              tw-mr-3
              tw-flex-shrink-0
            "
          >
            <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
              <icon-account-sample />
            </icon-base>
          </div>

          <input
            v-model="selAddress"
            class="
              tw-w-full tw-text-blue-900
              dark:tw-text-darkGray-100
              tw-text-xl
              focus:tw-outline-none
              tw-bg-transparent tw-placeholder-gray-300
              dark:tw-placeholder-darkGray-600
            "
            style="width: 21rem"
            type="text"
            spellcheck="false"
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
    </button>

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
        <MetamaskOption
          v-if="showMetamaskOption"
          v-model:selChecked="checkMetamaskOption"
          :checked="checkMetamaskOption"
          :show-radio-if-unchecked="false"
          :is-h160="isH160"
        />
        <div v-if="!isH160">
          <ModalSelectAccountOption
            v-for="(account, index) in allAccounts"
            :key="index"
            v-model:selOption="selAccountIdx"
            v-model:selChecked="checkMetamaskOption"
            :key-idx="index"
            :address="account"
            :address-name="allAccountNames[index]"
            :checked="!checkMetamaskOption && selAccountIdx === index"
          />
        </div>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { useStore } from 'src/store';
import { providerEndpoints } from 'src/config/chainEndpoints';

import IconBase from 'components/icons/IconBase.vue';
import IconAccountSample from 'components/icons/IconAccountSample.vue';
import IconSolidSelector from 'components/icons/IconSolidSelector.vue';
import ModalSelectAccountOption from './ModalSelectAccountOption.vue';
import MetamaskOption from './MetamaskOption.vue';

export default defineComponent({
  components: {
    ModalSelectAccountOption,
    MetamaskOption,
    IconBase,
    IconAccountSample,
    IconSolidSelector,
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
    role: {
      type: String,
      defalut: false,
      default: '',
    },
  },
  emits: ['update:sel-address', 'selChanged'],
  setup(props, { emit }) {
    const openOption = ref(false);

    const store = useStore();
    const currentAccountIdx = computed(() => store.getters['general/accountIdx']);
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);

    const isSupportContract = ref(providerEndpoints[currentNetworkIdx.value].isSupportContract);

    const isH160 = computed(() => store.getters['general/isCheckMetamaskH160']);
    const selAccountIdx = ref(currentAccountIdx.value);

    const selAccount = ref(props.allAccounts[selAccountIdx.value] as string);
    const selAddress = ref(!isH160 ? (props.allAccounts[selAccountIdx.value] as string) : '');
    const selAccountName = ref(props.allAccountNames[selAccountIdx.value]);

    const isCheckMetamask = computed(() => store.getters['general/isCheckMetamask']);
    const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
    const checkMetamask = ref<boolean>(isCheckMetamask.value);
    const showMetamaskOption = computed(
      () => isSupportContract.value && currentEcdsaAccount.value.ethereum
    );

    const checkMetamaskH160 = ref<boolean>(isH160.value);
    const checkMetamaskOption = isH160.value ? checkMetamaskH160 : checkMetamask;
    const ecdsaAccountValue = isH160.value
      ? currentEcdsaAccount.value.h160
      : currentEcdsaAccount.value.ss58;

    watch(
      [selAccountIdx, checkMetamaskOption, ecdsaAccountValue],
      () => {
        if (!checkMetamaskOption.value) {
          selAccount.value = props.allAccounts[selAccountIdx.value] as string;
          selAccountName.value = props.allAccountNames[selAccountIdx.value];
          selAddress.value = props.allAccounts[selAccountIdx.value] as string;
        } else {
          if (props.role === 'toAddress' && isH160) {
            selAddress.value = '';
          } else {
            selAddress.value = ecdsaAccountValue;
          }
        }

        emit('update:sel-address', selAddress.value);
        emit(
          'selChanged',
          selAddress.value,
          checkMetamaskOption.value,
          selAccountIdx.value,
          isH160.value
        );

        openOption.value = false;
      },
      { immediate: true }
    );

    const changeAddress = (e: any) => {
      emit('update:sel-address', e.currentTarget.value);
    };

    return {
      openOption,
      selAccountIdx,
      selAddress,
      isSupportContract,
      checkMetamask,
      showMetamaskOption,
      changeAddress,
      isH160,
      checkMetamaskOption,
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
