<template>
  <items-container
    :title="$t('dappStaking.modals.tagsTitle', { category: categoryName })"
    class="component"
  >
    <items-toggle
      :available-items="getTags(category)"
      :selected-items="data.tags"
      :item-toggled="handleItemToggled"
      class="container--toggle"
    />
  </items-container>
</template>

<script lang="ts">
import { Category, NewDappItem } from 'src/store/dapp-staking/state';
import { defineComponent, PropType, reactive, watch } from 'vue';
import ItemsContainer from 'src/components/dapp-staking/register/ItemsContainer.vue';
import ItemsToggle, { LabelValuePair } from 'src/components/dapp-staking/register/ItemsToggle.vue';

export default defineComponent({
  components: {
    ItemsContainer,
    ItemsToggle,
  },
  props: {
    dapp: {
      type: Object as PropType<NewDappItem>,
      required: true,
    },
    category: {
      type: String as PropType<Category>,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const data = reactive<NewDappItem>(props.dapp);
    const possibleTags = {
      defi: [
        { label: 'Stable', value: 'stable' },
        { label: 'DEX', value: 'dex' },
        { label: 'LaunchPad', value: 'launchpad' },
      ],
      gamefi: [
        { label: 'Tag1', value: 'tag1' },
        { label: 'Tag2', value: 'tag2' },
      ],
      infra: [],
      nft: [],
      others: [],
    };

    const getTags = (category: Category): LabelValuePair[] => {
      const tags = possibleTags[category];

      return tags ? tags : [];
    };

    const handleItemToggled = (selectedItems: string[]): void => {
      data.tags = selectedItems;
    };

    return {
      data,
      possibleTags,
      handleItemToggled,
      getTags,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/styles/register.scss';
</style>
