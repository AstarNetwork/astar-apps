<template>
  <div>
    <div class="row--header">
      <div class="row__left">
        <div v-if="nativeTokenSymbol">
          <img width="32" :src="nativeTokenImg" :alt="nativeTokenSymbol" />
          <span>{{ $t('assets.assets') }}</span>
        </div>
        <div v-else>
          <q-skeleton animation="fade" class="skeleton--md" />
        </div>
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
    <div class="gradient-divider" />

    <div v-for="t in filteredTokens" :key="t.id">
      <xcm-currency :token="t" />
    </div>
    <div v-if="search.length > 0 && filteredTokens.length === 0" class="box--no-result">
      <span class="text--xl">{{ $t('assets.noResults') }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import AssetSearchOption from 'src/components/assets/AssetSearchOption.vue';
import XcmCurrency from 'src/components/assets/XcmCurrency.vue';
import { useBreakpoints } from 'src/hooks';
import { Asset } from 'src/v2/models';
import { computed, defineComponent, PropType, ref } from 'vue';
import { useNetworkInfo } from 'src/hooks';
import { getTokenImage } from 'src/modules/token';

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
    const { width, screenSize } = useBreakpoints();

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

    const { nativeTokenSymbol } = useNetworkInfo();

    const nativeTokenImg = computed(() =>
      getTokenImage({ isNativeToken: true, symbol: nativeTokenSymbol.value })
    );

    return {
      filteredTokens,
      search,
      isSearch,
      isHideSmallBalances,
      width,
      screenSize,
      toggleIsHideSmallBalances,
      setIsSearch,
      setSearch,
      nativeTokenSymbol,
      nativeTokenImg,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
