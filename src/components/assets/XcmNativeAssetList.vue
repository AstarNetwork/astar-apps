<template>
  <div>
    <div class="container">
      <div class="row--menu">
        <div class="row">
          <span class="text--title">{{ $t('assets.xcmAssets') }}</span>
        </div>
        <asset-search-option
          :toggle-is-hide-small-balances="toggleIsHideSmallBalances"
          :is-hide-small-balances="isHideSmallBalances"
          :tokens="xcmAssets"
          :is-import-modal="false"
          :is-search="isSearch"
          :set-search="setSearch"
          :set-is-search="setIsSearch"
        />
      </div>

      <div v-for="t in filteredTokens" :key="t.id">
        <xcm-currency :token="t" />
      </div>
      <div v-if="search.length > 0 && filteredTokens.length === 0" class="box--no-result">
        <span class="text--xl">{{ $t('assets.noResults') }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import AssetSearchOption from 'src/components/assets/AssetSearchOption.vue';
import XcmCurrency from 'src/components/assets/XcmCurrency.vue';
import { Asset } from 'src/v2/models';
import { computed, defineComponent, PropType, ref } from 'vue';
export default defineComponent({
  components: {
    XcmCurrency,
    AssetSearchOption,
  },
  props: {
    xcmAssets: {
      type: Array as PropType<Asset[]>,
      required: true,
    },
  },
  setup(props) {
    const isSearch = ref<boolean>(false);
    const search = ref<string>('');
    const isHideSmallBalances = ref<boolean>(false);

    const filteredTokens = computed<Asset[]>(() => {
      if (!props.xcmAssets) return [];
      const tokens = isHideSmallBalances.value
        ? props.xcmAssets.filter((it) => Number(it.userBalance) > 0)
        : props.xcmAssets;

      if (!search.value) return tokens;

      const value = search.value.toLowerCase();
      const result = tokens
        .map((token: Asset) => {
          const isFoundToken =
            token.metadata.name.toLowerCase().includes(value) ||
            token.metadata.symbol.toLowerCase().includes(value);
          return isFoundToken ? token : undefined;
        })
        .filter((it) => it !== undefined) as Asset[];
      return result.length > 0 ? result : [];
    });

    const toggleIsHideSmallBalances = (): void => {
      isHideSmallBalances.value = !isHideSmallBalances.value;
    };

    const setIsSearch = (isTyping: boolean): void => {
      isSearch.value = isTyping;
    };

    const setSearch = (event: any): void => {
      search.value = event.target.value;
    };

    return {
      filteredTokens,
      search,
      isSearch,
      isHideSmallBalances,
      toggleIsHideSmallBalances,
      setIsSearch,
      setSearch,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
