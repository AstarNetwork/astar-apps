<template>
  <div class="tw-fixed tw-z-10 tw-inset-0 tw-overflow-y-auto">
    <div class="tw-flex tw-items-center tw-justify-center tw-min-h-screen">
      <!-- Background overlay -->
      <div class="tw-fixed tw-inset-0 tw-transition-opacity" aria-hidden="true">
        <div
          class="tw-absolute tw-inset-0 tw-bg-gray-900 dark:tw-bg-black tw-opacity-75"
        ></div>
      </div>

      <div
        class="tw-inline-block tw-bg-white dark:tw-bg-darkGray-900 tw-rounded-lg tw-px-4 sm:tw-px-8 tw-py-10 tw-overflow-hidden tw-shadow-xl tw-transform tw-transition-all tw-mx-2 tw-my-2 tw-align-middle tw-max-w-lg tw-w-full"
      >
        <div>
          <div>
            <h3
              class="tw-text-lg tw-font-extrabold tw-text-blue-900 dark:tw-text-white tw-mb-6 tw-text-center"
            >
              Add an existing code hash
            </h3>

            <div class="tw-grid tw-grid-cols-1 tw-gap-6">
              <div>
                <label
                  class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
                >
                  Code bundle name
                </label>
                <input
                  class="tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-rounded-md tw-w-full tw-text-blue-900 dark:tw-text-darkGray-100 focus:tw-outline-none tw-placeholder-gray-300 dark:tw-placeholder-darkGray-600 tw-px-3 tw-py-3 tw-appearance-none bg-white dark:tw-bg-darkGray-900"
                  placeholder=""
                  v-model="bundleName"
                />
              </div>

              <div>
                <label
                  class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
                >
                  Code hash
                </label>
                <input
                  class="tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-rounded-md tw-w-full tw-text-blue-900 dark:tw-text-darkGray-100 focus:tw-outline-none tw-placeholder-gray-300 dark:tw-placeholder-darkGray-600 tw-px-3 tw-py-3 tw-appearance-none tw-bg-white dark:tw-bg-darkGray-900"
                  placeholder=""
                  v-model="codeHash"
                />
              </div>

              <div>
                <label
                  class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
                >
                  Contract ABI
                </label>
                <input-file
                  v-on:dropFile="onDropFile"
                  :file="wasmFromFile"
                  :extension="extensionFile"
                />
              </div>
              <contract-info :messages="messages" />
            </div>
          </div>
        </div>
        <div class="tw-mt-6 tw-flex tw-justify-center tw-flex-row-reverse">
          <button
            type="button"
            @click="save"
            class="tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 hover:tw-bg-blue-700 dark:hover:tw-bg-blue-400 focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-100 dark:focus:tw-ring-blue-400 tw-mx-1"
          >
            Save
          </button>
          <button
            type="button"
            @click="closeModal"
            class="tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-text-sm tw-font-medium tw-rounded-full tw-text-gray-500 dark:tw-text-darkGray-400 tw-bg-white dark:tw-bg-darkGray-900 hover:tw-bg-gray-100 dark:hover:tw-bg-darkGray-700 focus:tw-outline-none focus:tw-ring focus:tw-ring-gray-100 dark:focus:tw-ring-darkGray-600 tw-mx-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useStore } from 'src/store';
import { stringify } from '@polkadot/util';
import { useApi, useMessages } from 'src/hooks';
import useAbi from 'src/hooks/useAbi';
import { useFile, FileState } from 'src/hooks/useFile';
import InputFile from './InputFile.vue';
import ContractInfo from './ContractInfo.vue';

export default defineComponent({
  props: {
    address: {
      type: String,
      required: true,
    },
  },
  components: {
    InputFile,
    ContractInfo,
  },
  setup(props, { emit }) {
    const closeModal = () => {
      emit('update:is-open', false);
    };

    const store = useStore();
    const { api } = useApi();

    const { abi, onChangeAbi, onRemoveAbi } = useAbi();

    const codeHash = ref('');
    const bundleName = ref('');

    const { fileRef: wasmFromFile, setFile: setWasmFile } = useFile({
      onChange: onChangeAbi,
      onRemove: onRemoveAbi,
      validate: (file) =>
        file?.data.subarray(0, 4).toString() === '0,97,115,109',
    });

    const extensionFile = ['.contract', '.json'];

    const onDropFile = (fileState: FileState) => {
      setWasmFile(fileState);
    };

    const { messages } = useMessages(abi);

    const save = async () => {
      if (!codeHash.value || !bundleName.value || !abi.value) {
        return;
      }

      const codeJson = {
        // @ts-ignore
        abi: stringify(abi.value.json),
        name: bundleName.value || '<>',
        tags: [],
      };

      console.log('codeJson', codeJson);

      store.dispatch('contracts/saveCode', {
        api: api?.value,
        _codeHash: codeHash.value,
        partial: codeJson,
      });

      closeModal();
    };

    return {
      closeModal,
      save,
      bundleName,
      codeHash,
      wasmFromFile,
      extensionFile,
      onDropFile,
      messages,
    };
  },
});
</script>
