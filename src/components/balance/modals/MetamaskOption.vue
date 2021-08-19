<template>
  <div>
    <li role="option">
      <label class="tw-flex tw-items-center tw-justify-between tw-cursor-pointer">
        <div class="tw-flex tw-items-center tw-h-12">
          <div
            class="tw-h-8 tw-w-8 tw-rounded-full tw-overflow-hidden tw-border tw-border-gray-100 tw-ml-3 tw-mr-3 tw-flex-shrink-0"
          >
            <img width="80" src="~assets/img/metamask.png" />
          </div>
          <div>
            <template v-if="!ecdsaAccounts">
              <div class="tw-text-sm tw-font-medium" @click="onLoadAccount">Connect to Metamask</div>
            </template>
            <template v-else>
              <div class="tw-text-sm tw-font-medium">{{ ecdsaAccounts.ss58 }}</div>
            </template>
            
            <div v-if="errorMsg" class="tw-text-sm">
              {{ errorMsg }}
            </div>
          </div>
        </div>
      </label>
    </li>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, watchEffect } from 'vue';
import { useStore } from 'src/store';
import * as utils from 'src/hooks/custom-signature/utils'
import { EcdsaAddressFormat } from 'src/hooks/types/CustomSignature';
import { useMetamask } from 'src/hooks/custom-signature/useMetamask';

export default defineComponent({
  components: {
  },
  setup() {
    const store = useStore();
    const chainInfo = computed(() => store.getters['general/chainInfo']);
    const { loadedAccounts, requestAccounts, requestSignature } = useMetamask();
    
    const ecdsaAccounts = ref<EcdsaAddressFormat>();
    const errorMsg = ref('');

    watchEffect(() => {
      if (loadedAccounts.value.length > 0 && ecdsaAccounts.value?.ethereum !== loadedAccounts.value[0]) {
        ecdsaAccounts.value = undefined;
      }
    });

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
        // const pubKey = utils.recoverPublicKeyFromSig(loadingAddr, loginMsg, signature);

        // console.log(`Public key: ${pubKey}`);
        
        // const ss58Address = utils.ecdsaPubKeyToSs58(pubKey, chainInfo.value?.ss58Format);

        // ecdsaAccounts.value = { ethereum: loadingAddr, ss58: ss58Address };
      } catch (err) {
        console.error('err', err);
        errorMsg.value = err.message;
      }
    };

    return {
      ecdsaAccounts,
      errorMsg,
      onLoadAccount,
    };
  },
});
</script>
