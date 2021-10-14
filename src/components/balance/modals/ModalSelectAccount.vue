<template>
  <div class="tw-relative">
    <button
      type="button"
      @click="openOption = !openOption"
      class="button-account"
    >
      <div class="tw-flex tw-items-center tw-justify-between">
        <div class="tw-flex tw-items-center">
          <div
            class="tw-h-8 tw-w-8 tw-rounded-full tw-overflow-hidden tw-border tw-border-gray-100 tw-mr-3 tw-flex-shrink-0"
          >
            <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
              <icon-account-sample />
            </icon-base>
          </div>

          <input
            class="tw-w-full tw-text-blue-900 dark:tw-text-darkGray-100 tw-text-xl focus:tw-outline-none tw-bg-transparent tw-placeholder-gray-300 dark:tw-placeholder-darkGray-600"
            style="width: 21rem"
            type="text"
            spellcheck="false"
            v-model="selAddress"
            @change="changeAddress"
          />
        </div>
      </div>

      <span
        class="tw-ml-3 tw-absolute tw-inset-y-0 tw-right-0 tw-flex tw-items-center tw-pr-2 tw-pointer-events-none"
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
      class="tw-block tw-absolute tw-mt-1 tw-w-full tw-rounded-md tw-bg-white dark:tw-bg-darkGray-800 tw-shadow-lg tw-z-10 tw-border tw-border-gray-200 dark:tw-border-darkGray-600"
    >
      <ul
        class="tw-max-h-56 tw-rounded-md tw-py-1 tw-text-base tw-overflow-auto focus:tw-outline-none"
      >
        <MetamaskOption
          v-if="showMetamaskOption"
          :checked="checkMetamask"
          :show-radio-if-unchecked="false"
          v-model:selChecked="checkMetamask"
        />
        <ModalSelectAccountOption
          v-for="(account, index) in allAccounts"
          :key="index"
          :key-idx="index"
          :address="account"
          :address-name="allAccountNames[index]"
          :checked="!checkMetamask && selAccountIdx === index"
          v-model:selOption="selAccountIdx"
          v-model:selChecked="checkMetamask"
        />
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
  },
  setup(props, { emit }) {
    const openOption = ref(false);

    const store = useStore();
    const currentAccountIdx = computed(() => store.getters['general/accountIdx']);
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    
    const isSupportContract = ref(
      providerEndpoints[currentNetworkIdx.value].isSupportContract
    );

    const selAccountIdx = ref(currentAccountIdx.value);

    const selAccount = ref(props.allAccounts[selAccountIdx.value] as string);
    const selAddress = ref(props.allAccounts[selAccountIdx.value] as string);
    const selAccountName = ref(props.allAccountNames[selAccountIdx.value]);

    const isCheckMetamask = computed(() => store.getters['general/isCheckMetamask']);
    const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
    const checkMetamask = ref<boolean>(isCheckMetamask.value);
    const showMetamaskOption = computed(() => isSupportContract.value && currentEcdsaAccount.value.ethereum )

    watch(
      [
        selAccountIdx,
        checkMetamask,
      ],
      () => {
        if(!checkMetamask.value) {
          selAccount.value = props.allAccounts[selAccountIdx.value] as string;
          selAccountName.value = props.allAccountNames[selAccountIdx.value];
          selAddress.value = props.allAccounts[selAccountIdx.value] as string;
        } else {
          selAddress.value = currentEcdsaAccount.value.ss58;
        }

        emit('update:sel-address', selAddress.value);
        emit('selChanged', selAddress.value, checkMetamask.value, selAccountIdx.value);

        openOption.value = false;
      },
      { immediate: true }
    );

    const changeAddress = (e: any) => {
      emit('update:sel-address', e.currentTarget.value);
    }

    return {
      openOption,
      selAccountIdx,
      selAddress,
      isSupportContract,
      checkMetamask,
      showMetamaskOption,
      changeAddress
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