<template>
  <Modal title="Register a new dApp">
    <template v-slot:content>
      <div> 
        <div class="tw-mb-4">
          <label
            class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
          >
            Logo
          </label>

          <input-file
            v-on:dropFile="onDropFile"
            :file="imageFromFile"
            :extension="fileExtension"
          >
            <Avatar
              v-if="!!imagePreview"
              :url="imagePreview"
              class="tw-mx-auto"
            />
            <icon-base
              v-else
              class="tw-h-12 tw-w-12 tw-mx-auto dark:tw-text-darkGray-100"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <icon-document />
            </icon-base>
          </input-file>
        </div>
        <div class="tw-mb-4">
          <label
            class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
          >
            Name
          </label>
          <input
            class="tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-rounded-md tw-w-full tw-text-blue-900 dark:tw-text-darkGray-100 focus:tw-outline-none tw-placeholder-gray-300 dark:tw-placeholder-darkGray-600 tw-px-3 tw-py-3 tw-appearance-none tw-bg-white dark:tw-bg-darkGray-900"
            placeholder=""
            v-model="data.name"
            maxlength="100"
          />
        </div>
        <div class="tw-mb-4">
          <label
            class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
          >
            Description
          </label>
          <input
            class="tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-rounded-md tw-w-full tw-text-blue-900 dark:tw-text-darkGray-100 focus:tw-outline-none tw-placeholder-gray-300 dark:tw-placeholder-darkGray-600 tw-px-3 tw-py-3 tw-appearance-none tw-bg-white dark:tw-bg-darkGray-900"
            placeholder=""
            v-model="data.description"
            maxlength="1000"
          />
        </div>
        <div class="tw-mb-4">
          <label
            class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
          >
            Contract address
          </label>
          <input
            class="tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-rounded-md tw-w-full tw-text-blue-900 dark:tw-text-darkGray-100 focus:tw-outline-none tw-placeholder-gray-300 dark:tw-placeholder-darkGray-600 tw-px-3 tw-py-3 tw-appearance-none tw-bg-white dark:tw-bg-darkGray-900"
            placeholder=""
            v-model="data.address"
            maxlength="1000"
          />
        </div>
        <div class="tw-mb-4">
          <label
            class="tw-block tw-text-sm tw-font-medium tw-text-gray-500 dark:tw-text-darkGray-400 tw-mb-2"
          >
            Url
          </label>
          <input
            class="tw-border tw-border-gray-300 dark:tw-border-darkGray-500 tw-rounded-md tw-w-full tw-text-blue-900 dark:tw-text-darkGray-100 focus:tw-outline-none tw-placeholder-gray-300 dark:tw-placeholder-darkGray-600 tw-px-3 tw-py-3 tw-appearance-none tw-bg-white dark:tw-bg-darkGray-900"
            placeholder=""
            v-model="data.url"
            maxlength="1000"
          />
        </div>
      </div>
    </template>
    <template v-slot:buttons>
      <button
        type="button"
        @click="registerDapp"
        class="tw-inline-flex tw-items-center tw-px-6 tw-py-3 tw-border tw-border-transparent tw-text-sm tw-font-medium tw-rounded-full tw-shadow-sm tw-text-white tw-bg-blue-500 hover:tw-bg-blue-700 dark:hover:tw-bg-blue-400 focus:tw-outline-none focus:tw-ring focus:tw-ring-blue-100 dark:focus:tw-ring-blue-400 tw-mx-1"
      >
        Register
      </button>
    </template>
  </Modal>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import Modal from 'components/common/Modal.vue';
import InputFile from 'src/components/dapps/modals/InputFile.vue';
import Avatar from 'components/common/Avatar.vue';
import IconBase from 'components/icons/IconBase.vue';
import IconDocument from 'components/icons/IconDocument.vue';
import { useFile, FileState } from 'src/hooks/useFile';
import { useStore } from 'src/store';
import { NewDappItem } from 'src/store/dapps-store/state';

export default defineComponent({
  components: {
    Modal,
    InputFile,
    Avatar,
    IconBase,
    IconDocument
  },
  setup(props, { emit }) {
    const store = useStore();
    const data = reactive<NewDappItem>({} as NewDappItem);
    const imagePreview = ref<string>();
    const fileExtension = ['.png', '.jpg', '.gif'];
    const {
      fileRef: imageFromFile,
      setFile
    } = useFile();

    const onDropFile = (fileState: FileState): void => {
      imagePreview.value = encodeImage(fileState.type, fileState.data);
      setFile(fileState);

      data.iconFileName = fileState.name;
      data.iconFile = imagePreview.value.split(',')[1];
    };

    const registerDapp = async () => {
      const result = await store.dispatch('dapps/registerDapp', data);

      if (result) {
         emit('update:is-open', false);
      }
    }

    const encodeImage = (fileType: string, data: Uint8Array): string => {
      const buffer = Buffer.from(data);
      return `data:${fileType};base64,${buffer.toString('base64')}`
    }

    return {
      data,
      fileExtension,
      imageFromFile,
      imagePreview,
      onDropFile,
      registerDapp
    }
  }
})

</script>
