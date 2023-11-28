<template>
  <div class="row--search-option">
    <div class="box--search">
      <input
        type="text"
        placeholder="Search"
        class="input--search"
        @input="setSearch"
        @focus="setIsSearch(true)"
        @blur="setIsSearch(false)"
      />
    </div>
    <asset-options
      :is-import-modal="isImportModal"
      :toggle-is-hide-small-balances="toggleIsHideSmallBalances"
      :is-hide-small-balances="isHideSmallBalances"
      :tokens="tokens"
      :is-only-import-tokens="false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import AssetOptions from 'src/components/assets/AssetOptions.vue';
export default defineComponent({
  components: {
    AssetOptions,
  },
  props: {
    isImportModal: {
      type: Boolean,
      required: true,
    },
    isHideSmallBalances: {
      type: Boolean,
      required: true,
    },
    isSearch: {
      type: Boolean,
      required: true,
    },
    setSearch: {
      type: Function as PropType<(payload: Event) => void>,
      required: true,
    },
    setIsSearch: {
      type: Function,
      required: true,
    },
    toggleIsHideSmallBalances: {
      type: Function,
      required: true,
    },
    tokens: {
      type: Array as PropType<any[]>,
      required: false,
      default: null,
    },
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-search-option.scss';
</style>
