<template>
  <items-container :title="$t('dappStaking.modals.description')" class="component">
    <div class="wrapper--description">
      <div class="container-description">
        <description-tab :is-edit="isEditDescription" :set-is-edit="setIsEdit" />
        <div v-if="isEditDescription">
          <q-input
            v-model="data.description"
            style="width: 1000px"
            maxlength="5000"
            type="textarea"
            class="description"
            rows="20"
            :rules="[
                    (v: string) => (v && v.length > 0) || $t('dappStaking.modals.descriptionRequired'),
                  ]"
          />
        </div>
        <div v-else>
          <q-scroll-area class="tw-h-96">
            <!-- eslint-disable vue/no-v-html -->
            <!-- data descriptionMarkdown is sanitized so no XSS can happen. -->
            <div class="markdown" v-html="data.descriptionMarkdown"></div>
          </q-scroll-area>
        </div>
      </div>
    </div>
  </items-container>
</template>

<script lang="ts">
import { NewDappItem } from 'src/store/dapp-staking/state';
import { defineComponent, PropType, reactive, ref, watch } from 'vue';
import DescriptionTab from 'src/components/dapp-staking/register/DescriptionTab.vue';
import ItemsContainer from 'src/components/dapp-staking/register/ItemsContainer.vue';

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
</style>
