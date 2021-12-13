<template>
  <div class="tw-bg-white dark:tw-bg-darkGray-800 tw-shadow tw-rounded-lg tw-p-5">
    <p
      class="
        tw-text-blue-900
        dark:tw-text-darkGray-100
        tw-text-lg tw-font-bold tw-leading-tight tw-mb-3
      "
    >
      {{ code.json.name }}
    </p>

    <div class="tw-grid tw-grid-cols-1 tw-gap-2 tw-my-4">
      <div>
        <div class="tw-text-xs tw-text-gray-500 dark:tw-text-darkGray-400">
          {{ $t('contracts.codeHash') }}
        </div>
        <div class="tw-flex tw-justify-between tw-items-center">
          <div class="tw-text-xs tw-text-blue-900 dark:tw-text-darkGray-100">
            {{ shortenCodeHash }}
          </div>
          <button type="button" class="coppy-address-button tw-tooltip" @click="copyAddress">
            <icon-base
              class="tw-h-5 tw-w-5 dark:tw-text-darkGray-100"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <icon-document-duplicate />
            </icon-base>
            <span
              class="
                tw-pointer-events-none
                tw-hidden
                tw-absolute
                tw-top-0
                tw-left-1/2
                tw-z-10
                tw-transform
                tw--translate-y-full
                tw--translate-x-1/2
                tw-p-2
                tw-text-xs
                tw-leading-tight
                tw-text-white
                tw-bg-gray-800
                dark:tw-bg-darkGray-500
                tw-rounded-md tw-shadow-lg
              "
              >{{ $t('copy') }}</span
            >
          </button>
          <input id="hiddenCodehash" type="hidden" :value="code.json.codeHash" />
        </div>
      </div>
      <div>
        <div class="tw-text-xs tw-text-gray-500 dark:tw-text-darkGray-400">
          {{ $t('contracts.msgs') }}
        </div>
        <div v-if="messages" class="tw-text-xs tw-text-blue-900 dark:tw-text-darkGray-100">
          <Message v-for="message in messages" :key="message.identifier" :message="message" />
        </div>
      </div>
    </div>

    <div class="tw-text-right">
      <button type="button" class="forget-button" @click="onForget">
        {{ $t('forget') }}
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
import Message from 'components/contracts/Message.vue';

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
  emits: ['confirmRemoval'],
  setup(props, { emit }) {
    const { code } = toRefs(props);

    const shortenCodeHash = computed(() => {
      const codeHash = code.value.json.codeHash;
      return codeHash ? `${codeHash.slice(0, 6)}${'.'.repeat(6)}${codeHash.slice(-6)}` : '';
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
      var copyAddr = document.querySelector('#hiddenCodehash') as HTMLInputElement;
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

<style scoped>
.coppy-address-button {
  @apply tw-p-3 tw-rounded-full tw-relative tw-group tw--mr-2 tw--my-3;
}
.coppy-address-button:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-600;
}
.coppy-address-button:focus {
  @apply tw-z-10 tw-outline-none tw-ring tw-ring-gray-100 dark:tw-ring-darkGray-600 tw-bg-blue-50 dark:tw-bg-darkGray-900;
}
.forget-button {
  @apply tw-inline-flex tw-items-center tw-rounded-full tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-px-3 tw-py-2 tw-bg-white dark:tw-bg-darkGray-800 tw-text-xs tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400;
}
.forget-button:hover {
  @apply tw-bg-gray-100 dark:tw-bg-darkGray-700;
}
.forget-button:focus {
  @apply tw-outline-none tw-ring tw-ring-gray-100 dark:tw-ring-darkGray-600;
}
</style>
