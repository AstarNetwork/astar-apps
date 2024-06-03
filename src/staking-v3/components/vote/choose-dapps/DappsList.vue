<template>
  <div>
    <swiper class="swiper--dapps" :navigation="true" :modules="modules">
      <swiper-slide v-for="(page, pageIndex) in pagedItems" :key="`page-${pageIndex}`">
        <div class="container--dapps">
          <div
            v-for="(dapp, index) in page"
            :key="`page-${index}`"
            class="container--item"
            @click="handleItemSelected(itemIndex(pageIndex, index))"
          >
            <dapp-icon :icon-url="dapp.logoUrl" :alt-text="dapp.name" />
            <div>{{ dapp.name }}</div>
            <div v-if="isItemSelected(itemIndex(pageIndex, index))" class="item--selected">
              {{ getSelectionOrder(itemIndex(pageIndex, index)) }}
            </div>
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

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { DappVote } from '../../../logic';

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
    const itemsPerPage = 12;
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

    const { pagedItems } = usePaging(filteredDapps, itemsPerPage);
    const selectedIndexes = ref<number[]>([]);

    const maxDappsToSelect = computed<number>(
      () => constants.value?.maxNumberOfStakedContracts ?? 0
    );

    const itemIndex = (pageIndex: number, index: number): number =>
      pageIndex * itemsPerPage + index;

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
      modules: [Navigation],
      pagedItems,
      itemsPerPage,
      filteredDapps,
      itemIndex,
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
