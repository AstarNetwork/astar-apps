<template>
  <div class="dapp-search-container">
    <div class="title">{{ title }}</div>
    <input class="search" :placeholder="$t('stakingV3.search')" @input="handleSearch" />
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    searchTerm: {
      type: String,
      required: false,
      default: '',
    },
    onSearch: {
      type: Function as PropType<(search: string) => void>,
      required: true,
    },
  },
  setup(props) {
    const handleSearch = (event: Event): void => {
      const target = event.target as HTMLInputElement;
      if (props.onSearch) {
        props.onSearch(target.value);
      }
    };

    return { handleSearch };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.dapp-search-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 0;
  gap: 16px;

  @media (min-width: $lg) {
    flex-direction: row;
  }
}

.title {
  font-size: 16px;
  font-weight: 700;
  text-align: left;
}

.search {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  padding: 0px 16px;
  align-items: center;
  border-radius: 16px;
  border: 1px solid $navy-1;
  height: 40px;
  outline: none;
  width: 100%;

  @media (min-width: $lg) {
    width: 300px;
  }
}
</style>
