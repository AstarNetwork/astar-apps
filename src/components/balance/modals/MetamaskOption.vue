<template>
  <div>
    <li role="option" :class="opClass(checked)">
      <label class="tw-flex tw-items-center tw-justify-between tw-cursor-pointer">
        <div class="tw-flex tw-items-center">
          <div
            class="tw-h-8 tw-w-8 tw-rounded-full tw-overflow-hidden tw-border tw-border-gray-100 tw-mr-3 tw-flex-shrink-0"
          >
            <img width="80" src="~assets/img/metamask.png" />
          </div>
          <div>
            <template v-if="!ecdsaAccounts">
              <div class="tw-text-sm tw-font-medium dark:tw-text-darkGray-100" @click="onLoadAccount">Connect to Metamask</div>
            </template>
            <template v-else>
              <div>
                <div class="tw-text-sm tw-font-medium dark:tw-text-darkGray-100">ECDSA (Ethereum extension)</div>
                <div class="tw-text-xs tw-text-gray-500 dark:tw-text-darkGray-400">
                  {{ shortenAddress }}
                </div>
              </div>
            </template>
            
            <div v-if="errorMsg" class="tw-text-sm">
              {{ errorMsg }}
            </div>
          </div>
        </div>

        <div class="tw-relative tw-w-5 tw-h-5" v-if="ecdsaAccounts">
          <input
            name="choose_account"
            type="radio"
            class="tw-appearance-none tw-border-2 tw-border-gray-300 dark:tw-border-darkGray-600 tw-rounded-full focus:tw-ring-blue-500 tw-h-4 tw-w-4 tw-mr-3 focus:tw-outline-none tw-bg-white dark:tw-bg-darkGray-900 checked:tw-border-4 checked:tw-border-blue-500"
            :checked="checked"
            @change="onSelectMetamask"
          />
        </div>
      </label>
    </li>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, watchEffect, toRefs } from 'vue';
import { useStore } from 'src/store';
import * as utils from 'src/hooks/custom-signature/utils'
import { EcdsaAddressFormat } from 'src/hooks/types/CustomSignature';
import { useMetamask } from 'src/hooks/custom-signature/useMetamask';

export default defineComponent({
  components: {
  },
  props: {
    // address: {
    //   type: String,
    //   required: true,
    // },
    checked: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const chainInfo = computed(() => store.getters['general/chainInfo']);
    const { loadedAccounts, requestAccounts, requestSignature } = useMetamask();
    
    const ecdsaAccounts = ref<EcdsaAddressFormat>();
    // const curAddress = ref<string>(props.address);
    const shortenAddress = ref('');
    const errorMsg = ref('');

    watchEffect(() => {
      if (loadedAccounts.value.length > 0 && ecdsaAccounts.value?.ethereum !== loadedAccounts.value[0]) {
        ecdsaAccounts.value = undefined;
      }
    });

    const shortenAddr = (addr: string) => {
      return addr
        ? `${addr.slice(0, 6)}${'.'.repeat(6)}${addr.slice(
            -6
          )}`
        : '';
    }

    const onLoadAccount = async () => {
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
        
        const ss58Address = utils.ecdsaPubKeyToSs58(pubKey, chainInfo.value?.ss58Format);

        console.log(`ethereum: ${loadingAddr} / ss58: ${ss58Address}`);

        ecdsaAccounts.value = { ethereum: loadingAddr, ss58: ss58Address };
        // curAddress.value = ss58Address;
        shortenAddress.value = shortenAddr(ss58Address);

        // console.log('ss', curAddress.value);

        // onSelectMetamask();
      } catch (err) {
        console.error('err', err);
        errorMsg.value = err.message;
      }
    };
    
    const onSelectMetamask = () => {
      emit('update:sel-checked', true);
      emit('connectMetamask', ecdsaAccounts.value?.ethereum, ecdsaAccounts.value?.ss58);
    };

    return {
      // curAddress,
      shortenAddress,
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
        return 'tw-text-blue-900 dark:tw-text-darkGray-100 tw-cursor-default tw-select-none tw-relative tw-py-2 tw-pl-3 tw-pr-6 hover:tw-bg-gray-50 dark:hover:tw-bg-darkGray-800';
      }
    },
  },
});
</script>
