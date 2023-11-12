<template>
  <items-container :title="$t('dappStaking.modals.description')" class="component">
    <div class="wrapper--description">
      <div class="wrapper--tab">
        <description-tab :is-edit="isEditDescription" :set-is-edit="setIsEdit" />
      </div>
      <div v-if="isEditDescription">
        <q-input
          v-model="data.description"
          maxlength="5000"
          type="textarea"
          class="description"
          rows="20"
          borderless
          :rules="[
                    (v: string) => (v && v.length > 0) || $t('dappStaking.modals.descriptionRequired'),
                  ]"
        />
      </div>
      <div v-else>
        <q-scroll-area class="preview">
          <!-- eslint-disable vue/no-v-html -->
          <!-- data descriptionMarkdown is sanitized so no XSS can happen. -->
          <div class="markdown" v-html="data.descriptionMarkdown"></div>
        </q-scroll-area>
      </div>
    </div>
  </items-container>
</template>

<script lang="ts">
import { NewDappItem } from 'src/store/dapp-staking/state';
import { defineComponent, PropType, reactive, ref } from 'vue';
import DescriptionTab from './DescriptionTab.vue';
import ItemsContainer from './ItemsContainer.vue';

export default defineComponent({
  components: {
    DescriptionTab,
    ItemsContainer,
  },
  props: {
    dapp: {
      type: Object as PropType<NewDappItem>,
      required: true,
    },
  },
  setup(props) {
    const data = reactive<NewDappItem>(props.dapp);
    const isEditDescription = ref<boolean>(true);

    const setIsEdit = (isEdit: boolean): void => {
      isEditDescription.value = isEdit;
    };

    return {
      data,
      isEditDescription,
      setIsEdit,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/css/markdown.scss';

.wrapper--description {
  margin-top: 20px;
}

.preview {
  height: 416px;
}

.wrapper--tab {
  display: flex;
  justify-content: center;
}
</style>

<style lang="scss">
.wrapper--description {
  .q-field__control {
    background: none;
    box-shadow: none;
  }
  .q-textarea .q-field__native,
  .preview {
    padding: 16px;
  }
}
</style>
