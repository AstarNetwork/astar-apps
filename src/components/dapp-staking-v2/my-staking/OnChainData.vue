<template>
  <div class="wrapper--onchain-data">
    <div class="row--title">
      <span class="text--title">{{ $t('dappStaking.onChainData') }}</span>
    </div>
    <div class="box--data">
      <div class="row--data-filter">
        <div class="dropbox--filter">
          <span class="text--name">{{ $t('dappStaking.stakingTvl') }}</span>
        </div>
        <div class="column--sort">
          <div>
            <span class="text--value">{{ $t('sortBy') }}</span>
          </div>
          <div class="dropbox--sort">
            <span class="text--value">{{ $t(sortBy) }}</span>
          </div>
        </div>
      </div>

      <div class="table--dapps">
        <div
          v-for="(dapp, index) in dataArray"
          :key="index"
          class="dapp"
          :class="getDappStyle(index)"
        >
          <div class="row--dapp">
            <div class="column--dapp-name">
              <img class="img--logo" :src="dapp.iconUrl" :alt="dapp.name" />
              <div>
                <span class="text--name"> {{ dapp.name }} </span>
              </div>
            </div>
            <div class="column--balance">
              <span class="text--value">
                <TokenBalance :balance="dapp.balance" :symbol="nativeTokenSymbol" :decimals="0" />
              </span>
            </div>
          </div>
          <div :class="getBorderStyle(index)" />
        </div>
        <div class="row--page">
          <button :disabled="page === 1" class="icon--arrow" @click="page--">
            <astar-icon-arrow-left />
          </button>
          <div>
            <span class="text--value"> {{ page }} / {{ pageTtl }} </span>
          </div>
          <button class="icon--arrow" :disabled="page === Number(pageTtl)" @click="page++">
            <astar-icon-arrow-right />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { useBreakpoints, useNetworkInfo } from 'src/hooks';
import { defineComponent, computed, watchEffect, ref } from 'vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { DappCombinedInfo } from 'src/v2/models';
import { useStore } from 'src/store';
import { paginate } from 'src/hooks/helper/common';

enum Filter {
  tvl = 'Staking TVL',
}
enum SortBy {
  alphabetical = 'alphabetical',
  amount = 'amount',
}

interface Data {
  iconUrl: string;
  name: string;
  balance: string;
}

const numItemsTablet = 8;
const numItemsMobile = 5;

export default defineComponent({
  components: {
    TokenBalance,
  },
  setup() {
    const { nativeTokenSymbol } = useNetworkInfo();
    const store = useStore();
    const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
    const { screenSize, width } = useBreakpoints();
    const numItems = computed<number>(() =>
      width.value > screenSize.md ? numItemsTablet : numItemsMobile
    );
    const page = ref<number>(1);
    const dataArray = ref<Data[]>([]);
    const filterData = ref<Filter>(Filter.tvl);
    const pageTtl = ref<number>(0);
    const sortBy = ref<SortBy>(SortBy.amount);

    const getDappStyle = (index: number): string => {
      if (screenSize.md > width.value) {
        return '';
      } else {
        if (index > numItemsTablet / 2 - 1) {
          return 'column--dapps-right';
        } else {
          return 'column--dapps-left';
        }
      }
    };

    const getBorderStyle = (index: number): string => {
      if (screenSize.md > width.value) {
        if (index === pageTtl.value - 1) {
          return '';
        } else {
          return 'divider';
        }
      } else {
        if (index === numItemsTablet - 1 || index === numItemsTablet / 2 - 1) {
          return '';
        } else {
          return 'divider';
        }
      }
    };

    const getBalance = (item: DappCombinedInfo): string => {
      try {
        if (filterData.value === Filter.tvl) {
          return item.stakerInfo.totalStakeFormatted ? item.stakerInfo.totalStakeFormatted : '0';
        }
        return '0';
      } catch (error) {
        return '0';
      }
    };

    const setDataArray = (): void => {
      if (!dapps.value) return;
      const data = dapps.value
        .map((it) => {
          if (it.dapp && it.stakerInfo) {
            const balance = getBalance(it);
            return {
              iconUrl: it.dapp.iconUrl,
              name: it.dapp.name,
              balance,
            };
          } else {
            return undefined;
          }
        })
        .filter((it) => it !== undefined) as Data[];

      if (sortBy.value === SortBy.alphabetical) {
        data.sort((a: Data, b: Data) => a.name.localeCompare(b.name));
      } else if (sortBy.value === SortBy.amount) {
        data.sort((a: Data, b: Data) => Number(b.balance) - Number(a.balance));
      }

      pageTtl.value = Number((data.length / numItems.value).toFixed(0));
      dataArray.value = paginate(data, numItems.value, page.value);
    };

    // Memo: avoid a blank table when the window size changes from 'sm' to 'lg'
    const handlePageUpdate = (): void => {
      if (dataArray.value.length === 0) return;
      if (page.value > pageTtl.value) {
        page.value = pageTtl.value;
      }
    };

    watchEffect(setDataArray);
    watchEffect(handlePageUpdate);

    return {
      nativeTokenSymbol,
      dataArray,
      page,
      pageTtl,
      getDappStyle,
      getBorderStyle,
      sortBy,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/components/dapp-staking-v2/my-staking/styles/on-chain-data.scss';
</style>
