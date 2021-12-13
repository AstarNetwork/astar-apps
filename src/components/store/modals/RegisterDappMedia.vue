<template>
  <div>
    <q-input
      :model-value="data.videoUrlInput"
      outlined
      label="Youtube Video link"
      maxlength="500"
      :rules="[
        (v) => (v && v.length > 0) || 'dApp video link is required.',
        (v) => getVideoId(v) !== null || 'Enter a valid YouTube url',
      ]"
      class="tw-my-2"
      @update:model-value="videoUrlChanged"
    >
      <template #prepend>
        <q-icon name="movie" />
      </template>
      <template v-if="data.videoUrl" #append>
        <q-icon
          v-if="data.videoUrl"
          name="remove_red_eye"
          class="tw-cursor-pointer"
          @click="toggleViewPreview()"
        />
      </template>
    </q-input>
    <q-video v-if="showVideoPreview" :src="getEmbedUrl(data.videoUrl)" />
    <q-file
      v-model="data.images"
      outlined
      multiple
      append
      counter
      max-file-size="102400"
      accept=".jpg .png, image/*"
      label="Screenshots (Max. file size 100kB)"
      class="tw-my-4"
      :rules="[(v) => (v && v.length >= 4) || 'At least 4 dApp images are required.']"
      @update:model-value="updateFile(value)"
    >
      <template #file="{ file, index }">
        <q-card class="tw-p-2 tw-m-1">
          <q-img
            :src="data.imagesContent[index]"
            :title="file.name"
            fit="contain"
            width="100px"
            height="100px"
          >
            <div class="text-subtitle2 absolute-bottom tw-text-right">
              <q-icon name="close" @click.prevent="removeFile(index)" />
            </div>
          </q-img>
        </q-card>
      </template>
    </q-file>
    <q-select
      v-model="data.tags"
      outlined
      multiple
      use-chips
      stack-label
      :options="tags"
      label="Tags"
      :rules="[(v) => (v && v.length >= 1) || 'Select at least 1 tag.']"
    ></q-select>
  </div>
</template>
<script lang="ts">
import { NewDappItem } from 'src/store/dapps-store/state';
import { defineComponent, PropType, reactive, watch, ref } from 'vue';

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<NewDappItem>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const data = reactive<NewDappItem>(props.value);
    const showVideoPreview = ref<boolean>(false);
    const tags = ref<string[]>([
      'DeFi',
      'Games',
      'NFT',
      'DEX',
      'Utility',
      'Mixer',
      'Social',
      'Other',
    ]);
    const imgPreviews = ref<string[]>([]);

    const removeFile = (index: number): void => {
      data.images.splice(index, 1);
      data.imagesContent.splice(index, 1);
    };

    const toggleViewPreview = (): void => {
      showVideoPreview.value = !showVideoPreview.value;
    };

    const updateFile = (value: any): void => {
      data.imagesContent = [];
      const index = 0;
      data.images.forEach((image) => {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = () => {
          data.imagesContent.push(reader.result?.toString() || '');
        };
        reader.onerror = (error) => console.log(error);
      });
    };

    const getVideoId = (url: string): string | null => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);

      return match && match[2].length === 11 ? match[2] : null;
    };

    const getEmbedUrl = (url: string): string | null => {
      const id = getVideoId(url);

      return 'http://www.youtube.com/embed/' + id;
    };

    const videoUrlChanged = (url: string): void => {
      const embedUrl = getEmbedUrl(url);
      data.videoUrlInput = url;
      if (embedUrl) {
        data.videoUrl = embedUrl;
      }
    };

    watch(
      () => data,
      () => {
        emit('dataChanged', data);
      },
      { deep: true }
    );

    return {
      data,
      showVideoPreview,
      tags,
      removeFile,
      toggleViewPreview,
      updateFile,
      getEmbedUrl,
      getVideoId,
      videoUrlChanged,
      imgPreviews,
    };
  },
});
</script>
