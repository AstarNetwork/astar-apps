<template>
  <div>
    <div class="tw-mb-6">
      <label
        class="
          tw-block tw-text-sm tw-font-medium tw-text-gray-500
          dark:tw-text-darkGray-400
          tw-mb-2
        "
        >{{ $t('dappStaking.modals.logo') }}</label
      >

      <input-file :file="imageFromFile" :extension="fileExtensions" @dropFile="onDropFile">
        <Avatar v-if="!!data.iconFile" :url="data.iconFile" class="tw-mx-auto tw-w-20 tw-h-20" />
        <astar-icon-base
          v-else
          class="tw-h-20 tw-w-20 tw-mx-auto dark:tw-text-darkGray-100"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <astar-icon-document />
        </astar-icon-base>
      </input-file>
      <div v-if="!data.iconFile" class="error">dApp logo is required.</div>
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
      maxlength="48"
      label="Contract address"
      class="tw-my-2"
      :rules="[(v) => isValidAddress(v) || 'Enter a valid EVM or SS58 contract address.']"
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
import { isEthereumAddress } from '@polkadot/util-crypto';
import Avatar from 'components/common/Avatar.vue';
import { isUrlValid } from 'components/common/Validators';
import InputFile from 'src/components/dapp-staking/modals/InputFile.vue';
import { FileState, useFile } from 'src/hooks/useFile';
import { NewDappItem } from 'src/store/dapp-staking/state';
import { defineComponent, PropType, reactive, watch } from 'vue';

export default defineComponent({
  components: {
    InputFile,
    Avatar,
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
    const fileExtensions = ['.png', '.jpg', '.jpeg', '.gif'];

    const encodeImage = (fileType: string, data: Uint8Array): string => {
      const buffer = Buffer.from(data);
      return `data:${fileType};base64,${buffer.toString('base64')}`;
    };

    const onDropFile = (fileState: FileState): void => {
      setFile(fileState);

      data.iconFileName = fileState.name;
      data.iconFile = encodeImage(fileState.type, fileState.data);
    };

    const isValidAddress = (address: string): boolean => isEthereumAddress(address); // || isValidAddressPolkadotAddress(address);
    // TODO uncoment the code above when we will support ink contract.

    watch(
      () => data,
      () => {
        emit('dataChanged', data);
      },
      { deep: true }
    );

    return {
      imageFromFile,
      fileExtensions,
      onDropFile,
      data,
      isEthereumAddress,
      isUrlValid,
      isValidAddress,
    };
  },
});
</script>

<style lang="scss" scoped>
.error {
  color: var(--q-negative);
  font-size: 12px;
  margin-top: 8px;
  margin-left: 12px;
}
</style>
