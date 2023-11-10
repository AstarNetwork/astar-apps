<template>
  <div>
    <q-file
      v-model="data.images"
      outlined
      multiple
      append
      max-file-size="1000000"
      accept="image/jpeg, .png"
      :label="$t('dappStaking.modals.images', { ratio: '16:9', size: '1 MB' })"
      class="component"
      lazy-rules="ondemand"
      :rules="[(v: File[]) => (v && v.length >= 5) || $t('dappStaking.modals.imagesRequired')]"
      @update:model-value="updateDappImages()"
    >
      <template #file="{ file, index }">
        <image-card
          :base64-image="data.imagesContent[index]"
          :description="file.name"
          :can-remove-card="index > 0"
          class="card"
          @remove="removeFile(index)"
        >
          <add-item-card />
        </image-card>
      </template>
    </q-file>
  </div>
</template>

<script lang="ts">
import { NewDappItem } from 'src/store/dapp-staking/state';
import { defineComponent, PropType, reactive, watch } from 'vue';
import ImageCard from './ImageCard.vue';
import AddItemCard from './AddItemCard.vue';

export default defineComponent({
  components: {
    ImageCard,
    AddItemCard,
  },
  props: {
    dapp: {
      type: Object as PropType<NewDappItem>,
      required: true,
    },
  },
  emits: ['dappChanged'],
  setup(props, { emit }) {
    const data = reactive<NewDappItem>(props.dapp);

    const updateDappImages = (): void => {
      data.imagesContent = [];
      data.imagesContent.push('');

      data.images.forEach((image, index) => {
        if (index > 0) {
          const reader = new FileReader();
          reader.readAsDataURL(image);
          reader.onload = () => {
            data.imagesContent.push(reader.result?.toString() || '');
          };
          reader.onerror = (error) => console.error(error);
        }
      });
    };

    const removeFile = (index: number): void => {
      data.images.splice(index, 1);
      data.imagesContent.splice(index, 1);
    };

    watch(
      () => data,
      () => {
        emit('dappChanged', data);
      },
      { deep: true }
    );

    return {
      data,
      updateDappImages,
      removeFile,
    };
  },
});
</script>

<style scoped>
.card {
  margin-top: 8px;
  margin-right: 12px;
}
</style>
