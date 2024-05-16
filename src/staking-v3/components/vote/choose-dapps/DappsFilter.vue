<template>
  <div class="dapp-filter-container">
    <div
      v-for="(filter, index) in filters"
      :key="`filter-${index}`"
      :class="{ 'dapp-filter-selected': isComponentSelected(index) }"
      class="dapp-filter"
      @click="handleFilterSelected(index)"
    >
      {{ filter }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useSelectableComponent } from 'src/staking-v3/hooks';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    onFilterChange: {
      type: Function as PropType<(index: number) => void>,
      required: true,
    },
  },
  setup(props) {
    const defaultFilterIndex = 0;
    const { t } = useI18n();
    const { isComponentSelected, handleSelectComponent } =
      useSelectableComponent(defaultFilterIndex);
    const filters = [
      t('stakingV3.voting.category'),
      t('stakingV3.voting.lastTVL'),
      t('stakingV3.voting.newbies'),
    ];

    const handleFilterSelected = (index: number): void => {
      handleSelectComponent(index);

      if (props.onFilterChange) {
        props.onFilterChange(index);
      }
    };

    return { filters, isComponentSelected, handleFilterSelected };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/staking-v3/components/vote/styles/choose-dapps.scss';
</style>
