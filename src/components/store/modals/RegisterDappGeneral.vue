<template>
  <div>
    <div class="tw-mb-6">
      <label
        class="
          tw-block tw-text-sm tw-font-medium tw-text-gray-500
          dark:tw-text-darkGray-400
          tw-mb-2
        "
        >{{ $t('store.modals.logo') }}</label
      >

      <input-file :file="imageFromFile" :extension="fileExtensions" @dropFile="onDropFile">
        <Avatar v-if="!!imagePreview" :url="imagePreview" class="tw-mx-auto tw-w-36 tw-h-36" />
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

    <q-input
      v-model="data.name"
      outlined
      label="Name"
      maxlength="200"
      class="tw-my-2"
      :rules="[(v) => (v && v.length > 0) || 'dApp name is required.']"
    />
    <q-input
      v-model="data.address"
      outlined
      maxlength="42"
      label="Contract address"
      class="tw-my-2"
      :rules="[(v) => isEthereumAddress(v) || 'Enter a valid EVM contract address.']"
    />
    <q-input
      v-model="data.url"
      outlined
      maxlength="1000"
      label="Project url"
      class="tw-my-2"
      :rules="[(v) => v !== '' || 'Enter project url.', (v) => isUrlValid(v) || 'Invalid url.']"
    />
  </div>
</template>
<script lang="ts">
import { PropType, reactive, watch, ref } from 'vue';
import { NewDappItem } from 'src/store/dapps-store/state';
import { defineComponent } from 'vue';
import { useFile, FileState } from 'src/hooks/useFile';
import { isEthereumAddress } from '@polkadot/util-crypto';
import InputFile from 'src/components/dapps/modals/InputFile.vue';
import Avatar from 'components/common/Avatar.vue';
import IconBase from 'components/icons/IconBase.vue';
import IconDocument from 'components/icons/IconDocument.vue';
import { isUrlValid } from 'components/common/Validators';

export default defineComponent({
  components: {
    InputFile,
    Avatar,
    IconBase,
    IconDocument,
  },
  props: {
    value: {
      type: Object as PropType<NewDappItem>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const data = reactive<NewDappItem>(props.value);
    const { fileRef: imageFromFile, setFile } = useFile();
    const imagePreview = ref<string>();
    const fileExtensions = ['.png', '.jpg', '.gif'];

    const encodeImage = (fileType: string, data: Uint8Array): string => {
      const buffer = Buffer.from(data);
      return `data:${fileType};base64,${buffer.toString('base64')}`;
    };

    const onDropFile = (fileState: FileState): void => {
      imagePreview.value = encodeImage(fileState.type, fileState.data);
      setFile(fileState);

      data.iconFileName = fileState.name;
      data.iconFile = imagePreview.value;
    };

    watch(
      () => data,
      () => {
        emit('dataChanged', data);
      },
      { deep: true }
    );

    return {
      imageFromFile,
      imagePreview,
      fileExtensions,
      onDropFile,
      data,
      isEthereumAddress,
      isUrlValid,
    };
  },
});
</script>
