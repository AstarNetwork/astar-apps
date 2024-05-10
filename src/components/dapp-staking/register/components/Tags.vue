<template>
  <items-container :title="$t('dappStaking.modals.tagsTitle')" class="component">
    <items-toggle
      :available-items="possibleTags"
      :selected-items="data.tags"
      :item-toggled="handleItemToggled"
      class="container--toggle"
    />
  </items-container>
</template>

<script lang="ts">
import { NewDappItem } from 'src/staking-v3';
import { defineComponent, PropType, reactive } from 'vue';
import ItemsContainer from './ItemsContainer.vue';
import ItemsToggle from './ItemsToggle.vue';

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
  },
  setup(props) {
    const data = reactive<NewDappItem>(props.dapp);
    const possibleTags = [
      { label: 'AMM', value: 'amm' },
      { label: 'dApp', value: 'dapp' },
      { label: 'DeFi', value: 'defi' },
      { label: 'Lending', value: 'lending' },
      { label: 'Multi-chain', value: 'multi-chain' },
      { label: 'Stablecoin', value: 'stablecoin' },
      { label: 'Utility', value: 'utility' },
      { label: 'Yield Farming', value: 'yield-farming' },
      { label: 'Play-to-Earn', value: 'play-to-earn' },
      { label: 'Art', value: 'art' },
    ];

    const handleItemToggled = (selectedItems: string[]): void => {
      data.tags = selectedItems;
    };

    return {
      data,
      possibleTags,
      handleItemToggled,
    };
  },
});
</script>

<style lang="scss" scoped>
@use '../styles/register.scss';
</style>
