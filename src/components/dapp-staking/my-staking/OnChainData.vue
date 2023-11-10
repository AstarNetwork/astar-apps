<template>
  <div class="wrapper--onchain-data">
    <div class="row--title">
      <span class="text--title">{{ $t('dappStaking.onChainData') }}</span>
    </div>
    <div class="box--data" :class="isShiden && 'box--data-shiden'">
      <div class="row--data-filter">
        <div class="column--sort">
          <q-btn-dropdown no-caps class="dropbox--filter" :label="$t(filterBy)" unelevated>
            <q-list>
              <q-item
                v-for="(item, index) in filters"
                :key="index"
                v-close-popup
                clickable
                @click="changeFilter(item)"
              >
                <q-item-section>
                  <q-item-label>{{ $t(item) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <div v-if="filterBy !== Filter.tvl" class="text--value">
            {{ $t('dappStaking.last30days') }}
          </div>
        </div>
        <div class="column--sort">
          <div>
            <span class="text--value">{{ $t('sort.sortBy') }}</span>
          </div>
          <q-btn-dropdown no-caps class="dropbox--sort" :label="$t(sortBy)" unelevated>
            <q-list>
              <q-item
                v-for="(item, index) in sorts"
                :key="index"
                v-close-popup
                clickable
                @click="sortBy = item"
              >
                <q-item-section>
                  <q-item-label>{{ $t(item) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>

      <div class="table--dapps">
        <div
          v-for="(dapp, index) in dataArray"
          :key="index"
          class="dapp"
          :class="getDappStyle(index)"
        >
          <div class="animate__animated" :class="isDisplay ? inAnimation : outAnimation">
            <div class="row--dapp">
              <div class="column--dapp-name" @click="goDappPageLink(dapp.address)">
                <img class="img--logo" :src="dapp.iconUrl" :alt="dapp.name" />
                <div class="column--name">
                  <span class="text--name"> {{ dapp.name }} </span>
                </div>
              </div>
              <div class="column--balance">
                <span class="text--value">
                  <token-balance
                    v-if="filterBy === Filter.tvl"
                    :balance="dapp.balance"
                    :symbol="nativeTokenSymbol"
                    :decimals="0"
                  />
                  <span v-else> {{ dapp.balance }} </span>
                </span>
              </div>
            </div>
            <div :class="getBorderStyle(index)" />
          </div>
          <div class="row--page">
            <button :disabled="page === 1" class="icon--arrow" @click="changePage(false)">
              <astar-icon-arrow-left />
            </button>
            <div class="colum--current-page">
              <span class="text--value"> {{ page }} / {{ pageTtl }} </span>
            </div>
            <button
              class="icon--arrow"
              :disabled="page === Number(pageTtl)"
              @click="changePage(true)"
            >
              <astar-icon-arrow-right />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { useBreakpoints, useNetworkInfo } from 'src/hooks';
import { defineComponent, computed, watchEffect, ref, watch } from 'vue';
import TokenBalance from 'src/components/common/TokenBalance.vue';
import { DappCombinedInfo, SmartContractState } from 'src/v2/models';
import { useStore } from 'src/store';
import { paginate } from '@astar-network/astar-sdk-core';
import { container } from 'src/v2/common';
import { IDappStakingRepository, DappAggregatedMetrics } from 'src/v2/repositories';
import { Symbols } from 'src/v2/symbols';
import { networkParam, Path } from 'src/router/routes';
import { useRouter } from 'vue-router';

enum Filter {
  tvl = 'dappStaking.stakingTvl',
  transactions = 'dappStaking.transactions',
  uaw = 'dappStaking.uaw',
}
enum SortBy {
  alphabeticalAtoZ = 'sort.alphabeticalAtoZ',
  alphabeticalZtoA = 'sort.alphabeticalZtoA',
  amountHighToLow = 'sort.amountHightToLow',
  amountLowToHigh = 'sort.amountLowToHigh',
}

interface Data {
  iconUrl: string;
  name: string;
  balance: string;
  address: string;
}

const numItemsTablet = 8;
const numItemsMobile = 5;

const sorts = [
  SortBy.alphabeticalAtoZ,
  SortBy.alphabeticalZtoA,
  SortBy.amountHighToLow,
  SortBy.amountLowToHigh,
];

const filters = [Filter.tvl, Filter.transactions, Filter.uaw];

export default defineComponent({
  components: {
    TokenBalance,
  },
  setup() {
    const { nativeTokenSymbol, currentNetworkName, networkNameSubstrate } = useNetworkInfo();
    const store = useStore();
    const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
    const { screenSize, width } = useBreakpoints();
    const page = ref<number>(1);
    const dataArray = ref<Data[]>([]);
    const filterBy = ref<Filter>(Filter.tvl);
    const pageTtl = ref<number>(0);
    const isDisplay = ref<boolean>(true);
    const goToNext = ref<boolean>(true);
    const sortBy = ref<SortBy>(SortBy.amountHighToLow);
    const aggregatedData = ref<DappAggregatedMetrics[]>([]);
    const router = useRouter();

    const numItems = computed<number>(() =>
      width.value > screenSize.md ? numItemsTablet : numItemsMobile
    );
    const inAnimation = computed<string>(() =>
      goToNext.value ? 'animate__fadeInRight' : 'animate__fadeInLeft'
    );
    const outAnimation = computed<string>(() =>
      goToNext.value ? 'animate__fadeOutLeft' : 'animate__fadeOutRight'
    );
    const isShiden = computed<boolean>(() => currentNetworkName.value === 'Shiden');

    const fetchAggregatedData = async () => {
      if (aggregatedData.value.length === 0) {
        const repo = container.get<IDappStakingRepository>(Symbols.DappStakingRepository);
        aggregatedData.value = await repo.getAggregatedMetrics(
          networkNameSubstrate.value.toLowerCase()
        );
      }
    };

    const goDappPageLink = (address: string | undefined): void => {
      const base = networkParam + Path.DappStaking + Path.Dapp;
      const url = `${base}?dapp=${address?.toLowerCase()}`;
      router.push(url);
    };

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

    const getBalance = (item: DappCombinedInfo, filter: Filter): string => {
      try {
        if (filter === Filter.tvl) {
          return item.stakerInfo.totalStakeFormatted ? item.stakerInfo.totalStakeFormatted : '0';
        } else {
          const data = aggregatedData.value.find(
            (x) =>
              x.name.toLowerCase() === item?.dapp?.name?.toLowerCase() ||
              getDomain(x.url.toLowerCase()) === getDomain(item?.dapp?.url?.toLowerCase())
          );

          if (data) {
            return filter === Filter.transactions
              ? data.metrics.transactions.toString()
              : data.metrics.uaw.toString();
          }

          return '';
        }
      } catch (error) {
        return '0';
      }
    };

    const getDomain = (url: string | undefined): string | undefined => {
      if (!url) {
        return undefined;
      }

      const prefix = /^https?:\/\//i;
      const domain = /^[^\/:]+/;
      // Remove any prefix
      url = url.replace(prefix, '');
      // Extract just the domain
      const match = url.match(domain);
      if (match) {
        return match[0];
      }

      return undefined;
    };

    const setDataArray = (): void => {
      if (!dapps.value) return;
      const data = dapps.value
        .map((it) => {
          if (it.contract.state === SmartContractState.Unregistered) {
            return undefined;
          }

          if (it.dapp && it.stakerInfo) {
            const balance = getBalance(it, filterBy.value);
            if (!balance) {
              return undefined;
            }

            return {
              iconUrl: it.dapp.iconUrl,
              name: it.dapp.name,
              address: it.dapp.address,
              balance,
            };
          } else {
            return undefined;
          }
        })
        .filter((it) => it !== undefined) as Data[];

      if (sortBy.value === SortBy.alphabeticalAtoZ) {
        data.sort((a: Data, b: Data) => a.name.localeCompare(b.name));
      } else if (sortBy.value === SortBy.alphabeticalZtoA) {
        data.sort((a: Data, b: Data) => b.name.localeCompare(a.name));
      } else if (sortBy.value === SortBy.amountHighToLow) {
        data.sort((a: Data, b: Data) => Number(b.balance) - Number(a.balance));
      } else if (sortBy.value === SortBy.amountLowToHigh) {
        data.sort((a: Data, b: Data) => Number(a.balance) - Number(b.balance));
      }

      pageTtl.value = Math.ceil(data.length / numItems.value);
      dataArray.value = paginate(data, numItems.value, page.value);
    };

    // Memo: avoid a blank table when the window size changes from 'sm' to 'lg'
    const handlePageUpdate = (): void => {
      if (dapps.value.length === 0) return;
      if (page.value > pageTtl.value) {
        page.value = pageTtl.value;
      }
    };

    const changePage = (isNext: boolean) => {
      isDisplay.value = false;
      goToNext.value = isNext;
      setTimeout(() => {
        if (isNext) {
          page.value < pageTtl.value ? page.value++ : pageTtl.value;
        } else {
          page.value > 1 ? page.value-- : 1;
        }
        isDisplay.value = true;
      }, 700);
    };

    const changeFilter = (filter: Filter): void => {
      filterBy.value = filter;
      page.value = 1;
      changePage(false);
    };

    watchEffect(setDataArray);

    // The below cause problem with not showing the data (after uplift to a new Quasar version) when accessing the page directly
    // watchEffect(handlePageUpdate);

    watch(
      [currentNetworkName],
      async () => {
        if (!currentNetworkName.value) return;
        await fetchAggregatedData();
      },
      { immediate: true }
    );

    return {
      nativeTokenSymbol,
      dataArray,
      page,
      pageTtl,
      sortBy,
      isDisplay,
      inAnimation,
      outAnimation,
      sorts,
      filters,
      filterBy,
      currentNetworkName,
      isShiden,
      changePage,
      getDappStyle,
      getBorderStyle,
      Filter,
      goDappPageLink,
      changeFilter,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/on-chain-data.scss';
</style>

<style lang="scss">
.body--dark .column--sort .q-icon {
  color: $gray-1;
}
</style>
