<template>
  <div>
    <div class="tw-mb-4">
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

    <Input
      v-model="data.name"
      label="Name"
      type="text"
      required
      maxlength="200"
      :validation-message="validationErrors['name']"
    />
    <Input
      v-model="data.description"
      label="Description"
      type="text"
      required
      maxlength="2000"
      :validation-message="validationErrors['description']"
    />
    <Input
      v-model="data.address"
      label="Contract address"
      type="text"
      required
      maxlength="42"
      :validation-message="validationErrors['address']"
    />
    <Input v-model="data.url" label="Url" type="text" maxlength="1000" />
  </div>
</template>
<script lang="ts">
import { PropType, reactive, watch, ref } from 'vue';
import { LooseObject, NewDappItem } from 'src/store/dapps-store/state';
import { defineComponent } from 'vue';
import { useFile, FileState } from 'src/hooks/useFile';
import { isEthereumAddress } from '@polkadot/util-crypto';
import Input from 'src/components/common/Input.vue';
import InputFile from 'src/components/dapps/modals/InputFile.vue';
import Avatar from 'components/common/Avatar.vue';
import IconBase from 'components/icons/IconBase.vue';
import IconDocument from 'components/icons/IconDocument.vue';

export default defineComponent({
  components: {
    Input,
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
    const validationErrors = ref<LooseObject>({});

    const handleChange = (a: NewDappItem): void => {
      console.log('value', a);
    };

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

    const validate = (field: string, errorMessage?: string): boolean => {
      if (data[field]) {
        validationErrors.value[field] = '';
        return true;
      }

      validationErrors.value[field] = errorMessage
        ? errorMessage
        : `The field ${field} is required.`;
      return false;
    };

    const validateName = (): boolean => {
      return validate('name', 'dApp name is required.');
    };

    const validateDescription = (): boolean => {
      return validate('description', 'Please tell us a few words about your dApp.');
    };

    const validateContractAddress = (): boolean => {
      if (validate('address', 'Please enter contract address.')) {
        if (isEthereumAddress(data.address)) {
          validationErrors.value['address'] = '';
          return true;
        } else {
          validationErrors.value['address'] = 'Please enter a valid EVM address.';
          return false;
        }
      }

      return false;
    };

    const validateAll = (): boolean => {
      return validateName() && validateDescription() && validateContractAddress();
    };

    watch(
      () => data,
      () => {
        emit('dataChanged', data);
      },
      { deep: true }
    );

    watch(
      () => data.name,
      () => validateName()
    );

    watch(
      () => data.description,
      () => validateDescription()
    );

    watch(
      () => data.address,
      () => validateContractAddress()
    );

    return {
      imageFromFile,
      imagePreview,
      fileExtensions,
      handleChange,
      onDropFile,
      data,
      validationErrors,
    };
  },
});
</script>
