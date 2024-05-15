<template>
  <div class="dapp-filter-container">
    <div
      v-for="(filter, index) in filters"
      :key="`filter-${index}`"
      :class="{ 'dapp-filter-selected': isComponentSelected(index) }"
      class="dapp-filter"
      @click="handleSelectComponent(index)"
    >
      {{ filter }}
    </div>
  </div>
</template>

<script lang="ts">
import { useSelectableComponent } from 'src/staking-v3/hooks';
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  setup() {
    const defaultFilterIndex = 0;
    const { t } = useI18n();
    const { isComponentSelected, handleSelectComponent } =
      useSelectableComponent(defaultFilterIndex);
    const filters = [
      t('stakingV3.voting.category'),
      t('stakingV3.voting.lastTVL'),
      t('stakingV3.voting.newbies'),
    ];

    return { filters, isComponentSelected, handleSelectComponent };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/staking-v3/components/styles/choose-dapps.scss';
</style>
