<template>
  <div class="tw-bg-white dark:tw-bg-darkGray-800 tw-shadow tw-rounded-lg tw-p-5 tw-mb-5">
    <div class="tw-flex tw-items-center tw--mx-5 tw-px-4">
      <div
        class="tw-h-8 tw-w-8 tw-rounded-full tw-overflow-hidden tw-border tw-border-gray-100 tw-mr-2"
      >
        <icon-base class="tw-h-full tw-w-full" viewBox="0 0 64 64">
          <icon-account-sample />
        </icon-base>
      </div>
      <div class="">
        <p
          class="tw-text-blue-900 dark:tw-text-darkGray-100 tw-font-semibold tw-leading-tight tw-text-sm"
        >
          {{ contractName }}
        </p>
        <p
          class="tw-text-xs tw-text-gray-500 dark:tw-text-darkGray-400 tw-font-normal tw-leading-tight"
        >
          {{ shortenAddress }}
        </p>
      </div>
      <button
        type="button"
        class="tw-ml-auto tw-tooltip tw-p-3 tw-rounded-full hover:tw-bg-gray-100 dark:hover:tw-bg-darkGray-600 focus:tw-z-10 focus:tw-outline-none focus:tw-ring focus:tw-ring-gray-100 dark:focus:tw-ring-darkGray-600 focus:tw-bg-blue-50 dark:focus:tw-bg-darkGray-900 tw-relative tw-group tw--mr-1"
        @click="copyAddress"
      >
        <icon-document-duplicate />
        <span
          class="tw-pointer-events-none tw-hidden tw-absolute tw-top-0 tw-left-1/2 tw-z-10 tw-transform tw--translate-y-full tw--translate-x-1/2 tw-p-2 tw-text-xs tw-leading-tight tw-text-white tw-bg-gray-800 dark:tw-bg-darkGray-500 tw-rounded-md tw-shadow-lg"
        >
          Copy
        </span>
      </button>
      <input type="hidden" id="hiddenAddr" :value="address" />
    </div>

    <div class="tw-grid tw-grid-cols-1 tw-gap-2 tw-my-4">
      <div>
        <div class="tw-text-xs tw-text-gray-500 dark:tw-text-darkGray-400">
          Code hash
        </div>
        <div class="tw-flex tw-justify-between tw-items-center">
          <div class="tw-text-xs tw-text-blue-900 dark:tw-text-darkGray-100">
            {{ shortenCodeHash }}
          </div>
          <button
            type="button"
            class="tw-tooltip tw-p-3 tw-rounded-full hover:tw-bg-gray-100 dark:hover:tw-bg-darkGray-600 focus:tw-z-10 focus:tw-outline-none focus:tw-ring focus:tw-ring-gray-100 dark:focus:tw-ring-darkGray-600 focus:tw-bg-blue-50 dark:focus:tw-bg-darkGray-900 tw-relative tw-group tw--mr-2 tw--my-3"
            @click="copyCodeHash"
          >
            <icon-base
              class="tw-h-5 tw-w-5 dark:tw-text-darkGray-100"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <icon-document-duplicate />
            </icon-base>
            <span
              class="tw-pointer-events-none tw-hidden tw-absolute tw-top-0 tw-left-1/2 tw-z-10 tw-transform tw--translate-y-full tw--translate-x-1/2 tw-p-2 tw-text-xs tw-leading-tight tw-text-white tw-bg-gray-800 dark:tw-bg-darkGray-500 tw-rounded-md tw-shadow-lg"
            >
              Copy
            </span>
          </button>
          <input
            type="hidden"
            id="hiddenCodeHash"
            :value="realCodeHash"
          />
        </div>
      </div>

      <div>
        <div class="tw-text-xs tw-text-gray-500 dark:tw-text-darkGray-400">Messages</div>
        <div v-if="execMethods" class="tw-text-xs tw-text-blue-900 dark:tw-text-darkGray-100">
          <Message
            v-for="(message, index) in execMethods"
            :message="message"
            :messageIndex="index"
            :key="message.identifier"
            v-on:callMethod="onCallMethod"
          />
        </div>
      </div>
    </div>

    <div class="tw-text-right">
      <button
        type="button"
        class="tw-inline-flex tw-items-center tw-rounded-full tw-border tw-border-blue-300 dark:tw-border-darkBlue-500 tw-px-3 tw-py-2 tw-bg-white dark:tw-bg-darkBlue-800 tw-text-xs tw-font-medium hover:tw-bg-blue-100 dark:hover:tw-bg-darkBlue-700 focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-100 dark:focus:tw-ring-darkBlue-600 tw-text-gray-500 dark:tw-text-darkBlue-400 tw-mr-2"
        @click="copyABI"
      >
        Copy ABI
      </button>
      <input type="hidden" id="hiddenAbi" :value="abi" />
      <button
        type="button"
        class="tw-inline-flex tw-items-center tw-rounded-full tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-px-3 tw-py-2 tw-bg-white dark:tw-bg-darkGray-800 tw-text-xs tw-font-medium hover:tw-bg-gray-100 dark:hover:tw-bg-darkGray-700 focus:tw-outline-none focus:tw-ring focus:tw-ring-gray-100 dark:focus:tw-ring-darkGray-600 tw-text-gray-500 dark:tw-text-darkGray-400"
        @click="onForget"
      >
        Forget
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';
import { useStore } from 'src/store';
import { useMessages } from 'src/hooks';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import IconBase from 'components/icons/IconBase.vue';
import IconAccountSample from 'components/icons/IconAccountSample.vue';
import IconDocumentDuplicate from 'components/icons/IconDocumentDuplicate.vue';
import Message from 'components/dapps/Message.vue';
import { ContractPromise } from '@polkadot/api-contract';

export default defineComponent({
  components: {
    IconBase,
    IconAccountSample,
    IconDocumentDuplicate,
    Message,
  },
  props: {
    contract: {
      type: Object as () => ContractPromise,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    }
  },
  setup(props, { emit }) {
    const { contract } = toRefs(props);

    const address = contract.value.address.toString();

    const contractName = computed(() => {
      //@ts-ignore
      return contract.value?.abi?.json?.contract.name;
    });

    const shortenAddress = computed(() => {
      return getShortenAddress(address);
    });

    const realCodeHash = computed(() => {
      //@ts-ignore
      return contract.value?.abi?.json?.source.hash;
    });

    const shortenCodeHash = computed(() => {
      // @ts-ignore
      const codeHash = contract.value.abi.json.source.hash;
      return codeHash
        ? `${codeHash.slice(0, 6)}${'.'.repeat(6)}${codeHash.slice(-6)}`
        : '';
    });

    const store = useStore();

    const downloadURI = (uri: string, name: string) => {
      var link = document.createElement('a');
      link.download = name;
      link.href = uri;
      link.click();
    };

    const onCallMethod = (messageIndex: number) => {
      emit('call-method', props.index, messageIndex);
    };

    const abiRef = ref(contract.value.abi);
    const { messages } = useMessages(abiRef);
    const execMethods = messages.value?.filter(m => !m.isConstructor)

    const abi = JSON.stringify(contract.value.abi.json);

    const onExport = () => {
      const abiData = 'text/json;charset=utf-8,' + encodeURIComponent(abi);
      downloadURI(abiData, 'metadata.json');
    };

    const onForget = () => {
      emit('confirmRemoval', contract.value.address.toString());
    };

    const showAlert = (msg: string) => {
      store.dispatch('general/showAlertMsg', {
        msg,
        alertType: 'success',
      });
    };

    return {
      address,
      contractName,
      shortenAddress,
      realCodeHash,
      shortenCodeHash,
      abi,
      execMethods,
      onCallMethod,
      onExport,
      onForget,
      showAlert,
    };
  },
  methods: {
    copy(elementStr: string, alertMsg: string) {
      var copyAddr = document.querySelector(elementStr) as HTMLInputElement;
      copyAddr.setAttribute('type', 'text');
      copyAddr.select();
      document.execCommand('copy');
      copyAddr.setAttribute('type', 'hidden');
      window.getSelection()?.removeAllRanges();

      this.showAlert(alertMsg);
    },
    copyAddress() {
      this.copy('#hiddenAddr', 'Copy address success!!');
    },
    copyCodeHash() {
      this.copy('#hiddenCodeHash', 'Copy codehash success!!');
    },
    copyABI() {
      this.copy('#hiddenAbi', 'Copy ABI success!!');
    },
  },
});
</script>
