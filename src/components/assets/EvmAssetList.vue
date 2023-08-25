<template>
  <div v-if="isListReady" class="container--assets">
    <div class="container">
      <div class="row">
        <div>
          <span class="text--title">{{ $t('assets.assets') }}</span>
        </div>

        <asset-search-option
          :toggle-is-hide-small-balances="toggleIsHideSmallBalances"
          :is-hide-small-balances="isHideSmallBalances"
          :tokens="tokens"
          :is-import-modal="true"
          :is-search="isSearch"
          :set-search="setSearch"
          :set-is-search="setIsSearch"
        />
      </div>

      <div v-for="t in filteredTokens" :key="t.symbol">
        <div v-if="checkIsCbridgeToken(t)">
          <evm-cbridge-token :token="t" :data-testid="t.symbol" />
        </div>
        <div v-else>
          <erc-20-currency :token="t" :data-testid="t.symbol" />
        </div>
      </div>
      <div v-if="search.length > 0 && filteredTokens.length === 0" class="box--no-result">
        <span class="text--xl">{{ $t('assets.noResults') }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { cbridgeAppLink, checkIsCbridgeToken } from 'src/c-bridge';
import AssetSearchOption from 'src/components/assets/AssetSearchOption.vue';
import Erc20Currency from 'src/components/assets/Erc20Currency.vue';
import EvmCbridgeToken from 'src/components/assets/EvmCbridgeToken.vue';
import { useNetworkInfo } from 'src/hooks';
import { Erc20Token } from 'src/modules/token';
import { PropType, computed, defineComponent, ref } from 'vue';

export default defineComponent({
  components: {
    EvmCbridgeToken,
    Erc20Currency,
    AssetSearchOption,
  },
  props: {
    tokens: {
      type: Object as PropType<Erc20Token[]>,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const isHideSmallBalances = ref<boolean>(false);
    const token = ref<Erc20Token | string | null>(null);
    const symbol = ref<string>('');
    const isSearch = ref<boolean>(false);
    const search = ref<string>('');
    const { isMainnet } = useNetworkInfo();
    const isListReady = computed<boolean>(() => !!(!isMainnet.value || props.tokens.length > 0));

    const filteredTokens = computed<Erc20Token[] | []>(() => {
      if (!props.tokens) return [];
      const tokens = isHideSmallBalances.value
        ? props.tokens.filter((it) => Number(it.userBalance) > 0)
        : props.tokens;

      const value = search.value.toLowerCase();
      const result = tokens
        .map((token: Erc20Token) => {
          const isFoundToken =
            value === token.address.toLowerCase() ||
            token.symbol.toLowerCase().includes(value) ||
            token.name.toLowerCase().includes(value);
          return isFoundToken ? token : undefined;
        })
        .filter((it) => it !== undefined)
        .sort((a, b) => Number(b?.userBalanceUsd) - Number(a?.userBalanceUsd)) as Erc20Token[];
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
      symbol,
      token,
      isListReady,
      isSearch,
      search,
      filteredTokens,
      cbridgeAppLink,
      isHideSmallBalances,
      setIsSearch,
      checkIsCbridgeToken,
      toggleIsHideSmallBalances,
      setSearch,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
