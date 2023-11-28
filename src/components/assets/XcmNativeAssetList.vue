<template>
  <div>
    <div class="row--header">
      <div class="row--header__left">
        <div class="column--token-name">
          <img
            class="token-logo"
            :src="isDarkTheme ? icon_img.dark : icon_img.light"
            :alt="$t('assets.assets')"
          />
          <span class="text--title">{{ $t('assets.assets') }}</span>
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

    <div class="separator" />

    <div v-for="t in filteredTokens" :key="t.id" class="rows">
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
import { useStore } from 'src/store';

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

    const store = useStore();
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');
    const icon_img = {
      light: require('/src/assets/img/assets_icon_light.svg'),
      dark: require('/src/assets/img/assets_icon_dark.svg'),
    };

    return {
      filteredTokens,
      search,
      isSearch,
      isHideSmallBalances,
      width,
      screenSize,
      isDarkTheme,
      icon_img,
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
