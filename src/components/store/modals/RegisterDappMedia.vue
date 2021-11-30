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
    <q-video v-if="showVideoPreview" :src="data.videoUrl" />
    <q-file
      v-model="data.images"
      outlined
      multiple
      append
      counter
      accept=".jpg .png, image/*"
      label="Screenshots"
      class="tw-my-4"
      @update:model-value="updateFile(value)"
    >
      <template #prepend>
        <q-icon name="image" />
      </template>
      <template #file="{ index, file }">
        <!-- <q-chip :removable="true" @remove="removeFile(index)">
          <div class="ellipsis relative-position">
            {{ file.name }}
            <img :src="file.content" />
          </div>
        </q-chip> -->
        <q-card class="tw-w-28 tw-p-2 tw-m-1">
          <img :src="file.content" :title="index" />
        </q-card>
      </template>
    </q-file>
    <!-- <q-uploader :factory="factoryFn" multiple class="tw-w-full" @failed="uploadFailed"></q-uploader> -->
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
    const images = ref([]);
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

    const removeFile = (index: number): void => {
      data.images.splice(index, 1);
    };

    const toggleViewPreview = (): void => {
      showVideoPreview.value = !showVideoPreview.value;
    };

    const updateFile = (value: any): void => {
      const reader = new FileReader();
      reader.readAsDataURL(value.images[0]);
      reader.onload = () => (value.images[0].content = reader.result);
      reader.onerror = (error) => console.log(error);
      console.log('update', value);
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
      images,
      showVideoPreview,
      tags,
      removeFile,
      toggleViewPreview,
      updateFile,
    };
  },
});
</script>
