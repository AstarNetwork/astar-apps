<template>
  <div>
    <li role="option" :class="opClass(checked)">
      <label
        class="tw-flex tw-items-center tw-justify-between tw-cursor-pointer"
        @click="onLoadAccount"
      >
        <div class="tw-flex tw-items-center">
          <div class="tw-h-8 tw-w-8 tw-overflow-hidden tw-mr-3 tw-flex-shrink-0">
            <img width="80" src="~assets/img/ethereum.png" />
          </div>
          <div class="tw-flex tw-items-center">
            <template v-if="!curAddress">
              <div class="tw-text-sm tw-font-medium dark:tw-text-darkGray-100">
                {{ $t('balance.modals.connectMetamask') }}
              </div>
            </template>
            <template v-else>
              <div>
                <div class="tw-text-sm tw-font-medium dark:tw-text-darkGray-100">
                  {{ $t('balance.modals.ethereumExtension') }}
                </div>
                <div v-if="checked" class="tw-text-xs tw-text-gray-500 dark:tw-text-darkGray-400">
                  {{ shortenAddr(curAddress) }}
                </div>
              </div>
            </template>

            <div v-if="errorMsg" class="tw-text-sm">{{ errorMsg }}</div>
          </div>
        </div>

        <div v-if="curAddress" class="tw-relative tw-w-5 tw-h-5">
          <input
            name="choose_account"
            type="radio"
            :class="[
              showRadioIfUnchecked ? 'tw-border-gray-300' : 'tw-border-red-400',
              'tw-appearance-none',
              'tw-border-2',
              'dark:tw-border-darkGray-600',
              'tw-rounded-full',
              'focus:tw-ring-blue-500',
              'tw-h-4',
              'tw-w-4',
              'tw-mr-3',
              'focus:tw-outline-none',
              'tw-bg-white',
              'dark:tw-bg-darkGray-900',
              'checked:tw-border-4',
              'checked:tw-border-blue-500',
            ]"
            :checked="checked"
            @change="onSelectMetamask"
          />
        </div>
      </label>
    </li>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, watchEffect } from 'vue';
import { useStore } from 'src/store';
import * as utils from 'src/hooks/custom-signature/utils';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { EcdsaAddressFormat } from 'src/hooks/types/CustomSignature';
import { useMetamask } from 'src/hooks/custom-signature/useMetamask';
import { ASTAR_SS58_FORMAT } from 'src/hooks/helper/plasmUtils';

export default defineComponent({
  components: {},
  props: {
    checked: {
      type: Boolean,
    },
    showRadioIfUnchecked: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:sel-checked', 'connectMetamask'],
  setup(props, { emit }) {
    const store = useStore();
    const isH160 = computed(() => store.getters['general/isH160Formatted']);
    const { requestAccounts, requestSignature } = useMetamask();

    const currentEcdsaAccount = computed(() => store.getters['general/currentEcdsaAccount']);
    const ecdsaAccounts = ref<EcdsaAddressFormat>(currentEcdsaAccount.value);
    const curAddress = ref<string>(currentEcdsaAccount.value.ss58);

    watchEffect(() => {
      if (isH160.value) {
        curAddress.value = currentEcdsaAccount.value.h160;
      }
    });

    const errorMsg = ref('');

    const shortenAddr = (addr: string) => {
      return getShortenAddress(addr);
    };

    const onLoadAccount = async () => {
      if (curAddress.value) {
        return;
      }

      try {
        const accounts = await requestAccounts();
        const loadingAddr = accounts[0];
        const loginMsg = `Sign this message to login with address ${loadingAddr}`;

        const signature = await requestSignature(loginMsg, loadingAddr);
        console.log(signature);

        if (typeof signature !== 'string') {
          throw new Error('Failed to fetch signature');
        }

        // FIXME: keccak issue should be resolved : https://github.com/cryptocoinjs/keccak/pull/22
        const pubKey = utils.recoverPublicKeyFromSig(loadingAddr, loginMsg, signature);

        console.log(`Public key: ${pubKey}`);

        const ss58Address = utils.ecdsaPubKeyToSs58(pubKey, ASTAR_SS58_FORMAT);

        console.log(`ethereum: ${loadingAddr} / ss58: ${ss58Address}`);

        ecdsaAccounts.value = { ethereum: loadingAddr, ss58: ss58Address };
        curAddress.value = ss58Address;
        onSelectMetamask();
      } catch (err: any) {
        console.error('err', err);
        errorMsg.value = err.message;
      }
    };

    const onSelectMetamask = () => {
      emit('update:sel-checked', true);
      emit('connectMetamask', ecdsaAccounts.value?.ethereum, curAddress.value);
    };

    return {
      curAddress,
      shortenAddr,
      ecdsaAccounts,
      errorMsg,
      onLoadAccount,
      onSelectMetamask,
    };
  },
  methods: {
    opClass(checked: boolean) {
      if (checked) {
        return 'tw-text-blue-900 dark:tw-text-darkGray-100 tw-cursor-default tw-select-none tw-relative tw-py-2 tw-pl-3 tw-pr-6 tw-bg-blue-200 dark:tw-bg-blue-500 tw-bg-opacity-20';
      } else {
        return 'not-checkerd';
      }
    },
  },
});
</script>

<style scoped>
.not-checkerd {
  @apply tw-text-blue-900 dark:tw-text-darkGray-100 tw-cursor-default tw-select-none tw-relative tw-py-2 tw-pl-3 tw-pr-6;
}
.not-checkerd:hover {
  @apply hover:tw-bg-gray-50 dark:tw-bg-darkGray-800;
}
</style>
