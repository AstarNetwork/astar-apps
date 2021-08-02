<template>
  <div class="tw-bg-white dark:tw-bg-darkGray-800 tw-shadow tw-rounded-lg tw-p-5">
    <p
      class="tw-text-blue-900 dark:tw-text-darkGray-100 tw-text-lg tw-font-bold tw-leading-tight tw-mb-3"
    >
      {{ code.json.name }}
    </p>

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
            @click="copyAddress"
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
            id="hiddenCodehash"
            :value="code.json.codeHash"
          />
        </div>
      </div>
      <div>
        <div class="tw-text-xs tw-text-gray-500 dark:tw-text-darkGray-400">Messages</div>
        <div v-if="messages" class="tw-text-xs tw-text-blue-900 dark:tw-text-darkGray-100">
          <Message
            v-for="message in messages"
            :message="message"
            :key="message.identifier"
          />
        </div>
      </div>
    </div>

    <div class="tw-text-right">
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
import { defineComponent, ref, toRefs, computed } from 'vue';
import { useStore } from 'src/store';
import IconBase from 'components/icons/IconBase.vue';
import IconDocumentDuplicate from 'components/icons/IconDocumentDuplicate.vue';
import type { CodeStored } from 'src/store/contracts/state';
import { useMessages } from 'src/hooks';
import Message from 'components/dapps/Message.vue';

export default defineComponent({
  components: {
    IconBase,
    IconDocumentDuplicate,
    Message,
  },
  props: {
    code: {
      type: Object as () => CodeStored,
      required: true,
    },
  },
  setup(props, { emit }) {
    const { code } = toRefs(props);

    const shortenCodeHash = computed(() => {
      const codeHash = code.value.json.codeHash;
      return codeHash
        ? `${codeHash.slice(0, 6)}${'.'.repeat(6)}${codeHash.slice(-6)}`
        : '';
    });

    const abi = ref(code.value.contractAbi);
    const { messages } = useMessages(abi);

    const store = useStore();

    const onForget = () => {
      emit('confirmRemoval', code.value.json.codeHash);
    };

    const showAlert = () => {
      store.dispatch('general/showAlertMsg', {
        msg: 'Copy codeHash success!!',
        alertType: 'success',
      });
    };

    return {
      shortenCodeHash,
      messages,
      showAlert,
      onForget,
    };
  },
  methods: {
    copyAddress() {
      var copyAddr = document.querySelector(
        '#hiddenCodehash'
      ) as HTMLInputElement;
      copyAddr.setAttribute('type', 'text');
      copyAddr.select();
      document.execCommand('copy');
      copyAddr.setAttribute('type', 'hidden');
      window.getSelection()?.removeAllRanges();

      this.showAlert();
    },
  },
});
</script>
