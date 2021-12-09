<template>
  <div
    class="
      tw-max-w-lg tw-flex tw-justify-center tw-px-6 tw-pt-5 tw-pb-6 tw-border-2 tw-border-gray-300
      dark:tw-border-darkGray-500
      tw-border-dashed tw-rounded-md tw-bg-blue-50
      dark:tw-bg-darkGray-800
    "
    v-bind="getRootProps()"
  >
    <div class="tw-space-y-1 tw-text-center">
      <icon-base
        v-if="!$slots.default"
        class="tw-h-12 tw-w-12 tw-mx-auto dark:tw-text-darkGray-100"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <icon-document />
      </icon-base>
      <slot></slot>
      <div v-if="file" class="tw-flex tw-text-sm tw-text-gray-500 dark:tw-text-darkGray-400">
        <div>{{ $t('contracts.modals.file', { name: file.name }) }}</div>
      </div>
      <div v-else class="tw-flex tw-text-sm tw-text-gray-500 dark:tw-text-darkGray-400">
        <div>
          <input v-bind="getInputProps()" />
          <div class="upload focus-within:tw-ring-offset-none">
            {{ $t('contracts.modals.uploadFile') }}
          </div>
          <p v-if="isDragActive">{{ $t('contracts.modals.dropFile') }}</p>
          <p v-else class="tw-pl-1">{{ $t('contracts.modals.orDrag') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import IconBase from 'components/icons/IconBase.vue';
import IconDocument from 'components/icons/IconDocument.vue';
import { hexToU8a, isHex, u8aToString } from '@polkadot/util';
import { useDropzone } from 'vue3-dropzone';

export default defineComponent({
  components: {
    IconDocument,
    IconBase,
  },
  props: {
    file: {
      type: Object,
      required: true,
    },
    extension: {
      type: Array as () => string | string[],
      required: true,
    },
  },
  emits: ['drop-file'],
  setup(props, { emit }) {
    const BYTE_STR_0 = '0'.charCodeAt(0);
    const BYTE_STR_X = 'x'.charCodeAt(0);
    const STR_NL = '\n';
    const NOOP = (): void => undefined;

    function convertResult(result: ArrayBuffer): Uint8Array {
      const data = new Uint8Array(result);

      // this converts the input (if detected as hex), via the hex conversion route
      if (data[0] === BYTE_STR_0 && data[1] === BYTE_STR_X) {
        let hex = u8aToString(data);

        while (hex[hex.length - 1] === STR_NL) {
          hex = hex.substr(0, hex.length - 1);
        }

        if (isHex(hex)) {
          return hexToU8a(hex);
        }
      }

      return data;
    }

    const onDrop = (files: any, rejectReasons: any): void => {
      console.log(files);
      console.log(rejectReasons);

      if (rejectReasons.length > 0) {
        alert('file upload is rejected.');
        return;
      }

      files.forEach((file: File): void => {
        const reader = new FileReader();

        reader.onabort = NOOP;
        reader.onerror = NOOP;

        reader.onload = ({ target }: ProgressEvent<FileReader>): void => {
          if (target && target.result) {
            const data = convertResult(target.result as ArrayBuffer);
            const fileState = {
              data,
              name: file.name,
              size: data.length,
              type: file.type,
            };

            emit('drop-file', fileState);
          }
        };

        reader.readAsArrayBuffer(file);
      });
    };

    const { getRootProps, getInputProps, ...rest } = useDropzone({
      onDrop,
      multiple: false,
      accept: props.extension,
    });

    return {
      onDrop,
      getRootProps,
      getInputProps,
      ...rest,
    };
  },
});
</script>

<style scoped>
.upload {
  @apply tw-relative tw-cursor-pointer tw-rounded-md tw-font-medium tw-text-blue-500 dark:tw-text-blue-400;
}
.upload:hover {
  @apply tw-text-blue-400 dark:tw-text-blue-300;
}
</style>
