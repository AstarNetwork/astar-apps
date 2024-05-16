<template>
  <div class="categories-container">
    <div
      v-for="(category, index) in possibleCategories"
      :key="category.value"
      class="category-container"
      :class="{ selected: isComponentSelected(index) }"
      @click="handleSelectComponent(index)"
    >
      <div class="text">
        <div
          class="category-name"
          :class="{ 'category-name-gradient': !isComponentSelected(index) }"
        >
          {{ category.label }}
        </div>
        <div class="category-description">Some text ...</div>
      </div>
      <div class="icon"><icon-arrow-right /></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { possibleCategories } from 'src/components/dapp-staking/register/components/MainCategory.vue';
import { IconArrowRight } from '@astar-network/astar-ui';
import { useSelectableComponent } from 'src/staking-v3/hooks';

export default defineComponent({
  components: { IconArrowRight },
  setup() {
    const { isComponentSelected, handleSelectComponent } = useSelectableComponent();
    return { possibleCategories, isComponentSelected, handleSelectComponent };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/staking-v3/components/vote/styles/choose-category.scss';
</style>
