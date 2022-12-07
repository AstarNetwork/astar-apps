<template>
  <div>
    <div class="container">
      <div class="row--menu">
        <div class="row">
          <span class="text--title">{{ $t('assets.xcmAssets') }}</span>
        </div>

        <div class="row--search-option">
          <div :class="isSearch && 'search--active'">
            <div class="box--search">
              <table class="table--search">
                <tr class="tr--search">
                  <td>
                    <input
                      v-model="search"
                      type="text"
                      placeholder="Search"
                      class="input--search"
                      @focus="setIsSearch(true)"
                      @blur="setIsSearch(false)"
                    />
                  </td>
                  <td>
                    <div class="icon--search">
                      <astar-icon-search />
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </div>
          <asset-options
            :toggle-is-hide-small-balances="toggleIsHideSmallBalances"
            :is-hide-small-balances="isHideSmallBalances"
            :tokens="xcmAssets"
            :is-import-modal="false"
          />
        </div>
      </div>

      <div v-for="t in filteredTokens" :key="t.id">
        <XcmCurrency :token="t" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Asset } from 'src/v2/models';
import { defineComponent, PropType, ref, computed, watchEffect } from 'vue';
import XcmCurrency from 'src/components/assets/XcmCurrency.vue';
import AssetOptions from 'src/components/assets/AssetOptions.vue';
export default defineComponent({
  components: {
    XcmCurrency,
    AssetOptions,
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

    const filteredTokens = computed<Asset[] | null>(() => {
      if (!props.xcmAssets) return null;
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
      const res = result.length > 0 ? result : null;
      return res;
    });

    const toggleIsHideSmallBalances = (): void => {
      isHideSmallBalances.value = !isHideSmallBalances.value;
    };

    const setIsSearch = (isTyping: boolean): void => {
      isSearch.value = isTyping;
    };

    watchEffect(() => {
      console.log('filteredTokens', filteredTokens.value);
      console.log('isHideSmallBalances.value', isHideSmallBalances.value);
    });

    return {
      filteredTokens,
      search,
      isSearch,
      isHideSmallBalances,
      toggleIsHideSmallBalances,
      setIsSearch,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
