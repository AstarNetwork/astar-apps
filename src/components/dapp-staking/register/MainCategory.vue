<template>
  <items-container :title="$t('dappStaking.modals.categoryTitle')" class="component">
    <q-radio
      v-for="(category, index) in possibleCategories"
      :key="index"
      v-model="data.mainCategory"
      :val="category.value"
      :label="category.label"
      class="radio"
    />
  </items-container>
</template>

<script lang="ts">
import { Category, NewDappItem } from 'src/store/dapp-staking/state';
import { defineComponent, PropType, reactive } from 'vue';
import ItemsContainer from 'src/components/dapp-staking/register/ItemsContainer.vue';

export const possibleCategories = [
  { label: 'DeFi', value: 'defi' },
  { label: 'GameFi', value: 'gamefi' },
  { label: 'Infra', value: 'infra' },
  { label: 'NFT', value: 'nft' },
  { label: 'Others', value: 'others' },
];

export default defineComponent({
  components: {
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

    const handleItemToggled = (selectedItems: string[]): void => {
      data.mainCategory = selectedItems[0] as Category;
    };

    return {
      data,
      possibleCategories,
      handleItemToggled,
    };
  },
});
</script>

<style lang="scss" scoped>
.radio {
  margin-right: 20px;
  margin-top: 6px;
}
</style>
