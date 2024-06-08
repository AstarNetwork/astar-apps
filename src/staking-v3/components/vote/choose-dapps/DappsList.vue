<template>
  <div>
    <swiper
      class="swiper--voting-dapps"
      :slides-per-view="1"
      :slides-per-group="3"
      :space-between="8"
      :navigation="true"
      :grid="{
        rows: 3,
      }"
      :breakpoints="{
        '768': {
          slidesPerView: 3,
          slidesPerGroup: 32,
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
          <dapp-icon :icon-url="dapp.logoUrl" :alt-text="dapp.name" />
          <div>{{ dapp.name }}</div>
          <div v-if="isItemSelected(index)" class="item--selected">
            {{ getSelectionOrder(index) }}
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue';
import { useDappStaking, usePaging } from 'src/staking-v3/hooks';
import DappIcon from '../DappIcon.vue';
import { DappVote } from '../../../logic';

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

    const filteredDapps = computed<DappVote[]>(() => {
      if (props.category && props.filter) {
        return props.dapps.filter(
          (dapp) =>
            dapp.mainCategory?.toLowerCase() === props.category?.toLowerCase() &&
            dapp.name.toLowerCase().includes(props.filter.toLowerCase())
        );
      }
      if (props.category) {
        return props.dapps.filter(
          (dapp) => dapp.mainCategory?.toLowerCase() === props.category?.toLowerCase()
        );
      } else if (props.filter) {
        return props.dapps.filter((dapp) =>
          dapp.name.toLowerCase().includes(props.filter.toLowerCase())
        );
      } else {
        return props.dapps;
      }
    });

    const selectedIndexes = ref<number[]>([]);

    const maxDappsToSelect = computed<number>(
      () => constants.value?.maxNumberOfStakedContracts ?? 0
    );

    const handleItemSelected = (index: number): void => {
      const indexToRemove = selectedIndexes.value.indexOf(index);
      if (indexToRemove >= 0) {
        selectedIndexes.value.splice(indexToRemove, 1);
      } else {
        if (selectedIndexes.value.length < maxDappsToSelect.value) {
          selectedIndexes.value.push(index);
        }
      }
      if (props.onDappsSelected) {
        props.onDappsSelected(
          selectedIndexes.value.map((selectedIndex) => filteredDapps.value[selectedIndex])
        );
      }
    };

    const getSelectionOrder = (index: number): number | undefined => {
      const number = selectedIndexes.value.indexOf(index) + 1;

      return number === 0 ? undefined : number;
    };

    const isItemSelected = (index: number): boolean => selectedIndexes.value.includes(index);

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
    left: auto;
    @media (min-width: $lg) {
      top: -34px;
      right: 372px;
    }
  }
  .swiper-button-next {
    padding-left: 2px;
    right: 0;
    @media (min-width: $lg) {
      top: -34px;
      right: 316px;
    }
  }
}
</style>
