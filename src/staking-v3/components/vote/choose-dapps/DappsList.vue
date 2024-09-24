<template>
  <div>
    <swiper
      class="swiper--voting-dapps"
      :slides-per-view="2"
      :slides-per-group="2"
      :space-between="8"
      :navigation="true"
      :grid="{
        rows: 2,
      }"
      :breakpoints="{
        '768': {
          slidesPerView: 3,
          slidesPerGroup: 3,
          grid: {
            rows: 3,
          },
        },
      }"
      :modules="modules"
    >
      <swiper-slide v-for="(dapp, index) in filteredDapps" :key="index">
        <div
          :class="`container--item ${isItemSelected(index) ? 'is-selected' : ''}`"
          @click="handleItemSelected(index)"
        >
          <div class="dapp-name-icon">
            <dapp-icon :icon-url="dapp.logoUrl" :alt-text="dapp.name" />
            <div class="dapp-name">{{ dapp.name }}</div>
          </div>
          <div><format-balance :balance="dapp.stakeAmount?.toString() ?? '0'" /></div>
          <div v-if="isItemSelected(index)" class="item--selected">
            {{ getSelectionOrder(index) }}
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, computed } from 'vue';
import { useDappStaking } from 'src/staking-v3/hooks';
import DappIcon from '../DappIcon.vue';
import type { DappVote } from '../../../logic';
import FormatBalance from 'src/components/common/FormatBalance.vue';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/navigation';
import { Grid, Navigation } from 'swiper/modules';

export default defineComponent({
  components: {
    Swiper,
    SwiperSlide,
    DappIcon,
    FormatBalance,
  },
  props: {
    dapps: {
      type: Array as PropType<DappVote[]>,
      required: true,
    },
    category: {
      type: String,
      required: false,
      default: undefined,
    },
    filter: {
      type: String,
      required: false,
      default: '',
    },
    onDappsSelected: {
      type: Function as PropType<(dapps: DappVote[]) => void>,
      required: true,
    },
  },
  setup(props) {
    const { constants } = useDappStaking();

    const categoryFilter = (dapp: DappVote, category?: string): boolean =>
      dapp.mainCategory?.toLowerCase() === category?.toLowerCase() ||
      (dapp.mainCategory === undefined && category?.toLowerCase() === 'others');

    const filteredDapps = computed<DappVote[]>(() => {
      if (props.category && props.filter) {
        return props.dapps.filter(
          (dapp) =>
            categoryFilter(dapp, props.category) &&
            dapp.name.toLowerCase().includes(props.filter.toLowerCase())
        );
      }
      if (props.category) {
        return props.dapps.filter((dapp) => categoryFilter(dapp, props.category));
      }

      if (props.filter) {
        return props.dapps.filter((dapp) =>
          dapp.name.toLowerCase().includes(props.filter.toLowerCase())
        );
      }

      return props.dapps;

    });

    const selectedIndexes = ref<number[]>([]);

    const maxDappsToSelect = computed<number>(
      () => constants.value?.maxNumberOfStakedContracts ?? 0
    );

    const globalDappIndex = (filteredIndex: number): number =>
      props.dapps.findIndex((dapp) => dapp === filteredDapps.value[filteredIndex]);

    const handleItemSelected = (index: number): void => {
      const dappIndex = globalDappIndex(index);
      const indexToRemove = selectedIndexes.value.indexOf(dappIndex);
      if (indexToRemove >= 0) {
        selectedIndexes.value.splice(indexToRemove, 1);
      } else {
        if (selectedIndexes.value.length <= maxDappsToSelect.value) {
          selectedIndexes.value.push(dappIndex);
        }
      }

      if (props.onDappsSelected) {
        props.onDappsSelected(
          selectedIndexes.value.map((selectedIndex) => props.dapps[selectedIndex])
        );
      }
    };

    const getSelectionOrder = (index: number): number | undefined => {
      const number = selectedIndexes.value.indexOf(globalDappIndex(index)) + 1;
      return number === 0 ? undefined : number;
    };

    const isItemSelected = (index: number): boolean => selectedIndexes.value.includes(globalDappIndex(index));

    return {
      modules: [Grid, Navigation],
      filteredDapps,
      handleItemSelected,
      isItemSelected,
      getSelectionOrder,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/staking-v3/components/vote/styles/choose-dapps.scss';
</style>

<style lang="scss">
.swiper--voting-dapps {
  height: 342px;
  overflow: visible;
  margin-bottom: 88px;

  @media (min-width: $lg) {
    height: 232px;
    margin-bottom: 0;
  }

  .swiper-button-prev,
  .swiper-button-next {
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: $navy-1;
    &::after {
      font-size: 12px;
      font-weight: 600;
    }
  }
  .swiper-button-prev {
    padding-right: 2px;
    left: calc(50% - 48px);
    top: auto;
    bottom: -64px;

    @media (min-width: $lg) {
      top: -34px;
      right: 372px;
      bottom: auto;
      left: auto;
    }
  }
  .swiper-button-next {
    padding-left: 2px;
    right: calc(50% - 48px);
    top: auto;
    bottom: -64px;

    @media (min-width: $lg) {
      top: -34px;
      right: 316px;
      bottom: auto;
    }
  }
}
</style>
