<template>
  <div class="categories-container">
    <div
      v-for="(category, index) in possibleCategories"
      :key="category.value"
      class="category-container"
      :class="{ selected: isComponentSelected(index) }"
      @click="handleCategorySelected(index)"
    >
      <div class="text">
        <div
          class="category-name"
          :class="{ 'category-name-gradient': !isComponentSelected(index) }"
        >
          {{ category.label }}
        </div>
        <div class="category-description">
          {{ $t(`stakingV3["${category.value}Description"]`) }}
        </div>
      </div>
      <div class="icon"><astar-icon-arrow-right /></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { possibleCategories } from 'src/components/dapp-staking/register/components/MainCategory.vue';
import { useSelectableComponent } from 'src/staking-v3/hooks';

export default defineComponent({
  props: {
    onCategorySelected: {
      type: Function as PropType<(category: string) => void>,
      required: true,
    },
  },
  setup(props) {
    const { isComponentSelected, handleSelectComponent } = useSelectableComponent();

    const handleCategorySelected = (index: number): void => {
      handleSelectComponent(index);

      if (props.onCategorySelected) {
        props.onCategorySelected(possibleCategories[index].value);
      }
    };

    return { possibleCategories, isComponentSelected, handleCategorySelected };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/staking-v3/components/vote/styles/choose-category.scss';
</style>
