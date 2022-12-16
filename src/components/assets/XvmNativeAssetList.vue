<template>
  <div>
    <div :class="isFeature && 'container-wrapper--feature'">
      <div :class="isFeature ? 'container-inner--feature' : 'container'">
        <div class="row--menu">
          <div class="row">
            <span class="text--title">{{ $t('assets.xvmAssets') }}</span>
          </div>
          <asset-search-option
            v-if="!isFeature"
            :toggle-is-hide-small-balances="toggleIsHideSmallBalances"
            :is-hide-small-balances="isHideSmallBalances"
            :is-import-modal="true"
            :is-search="isSearch"
            :set-search="setSearch"
            :set-is-search="setIsSearch"
          />
        </div>

        <div v-if="xvmAssets.length > 0">
          <div v-for="t in filteredTokens" :key="t.erc20Contract">
            <xvm-erc-20-currency :token="t" />
          </div>
        </div>
        <div v-else>
          <button class="button--import-token" @click="handleModalImportTokens({ isOpen: true })">
            <span class="icon--add"> + </span>
            <span class="text--option">{{ $t('assets.importErc20Tokens') }}</span>
          </button>
          <modal-import-xvm-tokens
            :is-modal-import-tokens="isModalImportTokens"
            :handle-modal-import-tokens="handleModalImportTokens"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue';
import XvmErc20Currency from 'src/components/assets/XvmErc20Currency.vue';
import AssetSearchOption from 'src/components/assets/AssetSearchOption.vue';
import { XvmAsset } from 'src/modules/token';
import ModalImportXvmTokens from 'src/components/assets/modals/ModalImportXvmTokens.vue';
export default defineComponent({
  components: {
    XvmErc20Currency,
    AssetSearchOption,
    ModalImportXvmTokens,
  },
  props: {
    xvmAssets: {
      type: Array as PropType<XvmAsset[]>,
      required: true,
    },
  },
  setup(props) {
    const isSearch = ref<boolean>(false);
    const search = ref<string>('');
    const isHideSmallBalances = ref<boolean>(false);
    const isModalImportTokens = ref<boolean>(false);

    const isFeature = computed<boolean>(() => props.xvmAssets.length === 0);

    const handleModalImportTokens = ({ isOpen }: { isOpen: boolean }) => {
      isModalImportTokens.value = isOpen;
    };

    const filteredTokens = computed<XvmAsset[] | null>(() => {
      if (!props.xvmAssets) return null;
      const tokens = isHideSmallBalances.value
        ? props.xvmAssets.filter((it) => Number(it.userBalance) > 0)
        : props.xvmAssets;

      if (!search.value) return tokens;

      const value = search.value.toLowerCase();
      const result = tokens
        .map((token: any) => {
          const isFoundToken =
            token.name.toLowerCase().includes(value) || token.symbol.toLowerCase().includes(value);
          return isFoundToken ? token : undefined;
        })
        .filter((it) => it !== undefined) as XvmAsset[];
      const res = result.length > 0 ? result : null;
      return res;
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
      isModalImportTokens,
      isFeature,
      toggleIsHideSmallBalances,
      setIsSearch,
      setSearch,
      handleModalImportTokens,
    };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
