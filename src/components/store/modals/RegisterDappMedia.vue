<template>
  <div>
    <q-input
      v-model="data.videoUrl"
      outlined
      label="Video link"
      maxlength="500"
      :rules="[(v) => v !== '' || 'dApp video link is required.']"
      class="tw-my-2"
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
      @update:model-value="updateFile(value)"
    >
      <template #file="{ file, index }">
        <q-card class="tw-p-2 tw-m-1">
          <q-img
            :src="data.imagesContent[index]"
            :title="file.name"
            fit="contain"
            width="180px"
            height="180px"
          >
            <div class="text-subtitle2 absolute-top tw-text-right">
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
      //const files = value.images as File[];
      // const files = images;
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

      console.log('update', data.images);
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
      imgPreviews,
    };
  },
});
</script>
