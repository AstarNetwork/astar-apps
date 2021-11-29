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
      v-model="images"
      outlined
      multiple
      append
      counter
      accept=".jpg .png, image/*"
      label="Screenshots"
      class="tw-my-4"
      @update="updateFile(value)"
    >
      <template #prepend>
        <q-icon name="image" />
      </template>
      <template #file="{ index, file }">
        <q-chip :removable="true" @remove="removeFile(index)">
          <div class="ellipsis relative-position">
            {{ file.name }}
          </div>
        </q-chip>
      </template>
    </q-file>
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
    const images = ref(null);
    const showVideoPreview = ref<boolean>(false);

    const removeFile = (index: number): void => {
      data.images.splice(index, 1);
    };

    const toggleViewPreview = (): void => {
      showVideoPreview.value = !showVideoPreview.value;
    };

    const updateFile = (): void => {
      console.log('update');
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
      removeFile,
      toggleViewPreview,
      updateFile,
    };
  },
});
</script>
