<template>
  <div class="wrapper--dapp-images">
    <div class="row--images">
      <button class="button-arrow" @click="scrollLeft">
        <astar-icon-arrow-left class="button-arrow" :size="arrowSize" />
      </button>
      <div class="main-scroll-div">
        <div class="cover">
          <div class="scroll-images">
            <div v-for="(image, index) in images" :key="index" class="child">
              <img :src="image" alt="index" class="child-img" @click="handleOpenPicture(index)" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <button class="button-arrow" @click="scrollRight">
          <astar-icon-arrow-right :size="arrowSize" />
        </button>
      </div>
    </div>

    <!-- Memo: fullscreen image preview -->
    <div>
      <q-carousel
        v-if="fullscreen"
        v-model="slide"
        v-model:fullscreen="fullscreen"
        swipeable
        animated
        arrows
        infinite
      >
        <q-carousel-slide
          v-for="(image, index) in images"
          :key="index"
          :name="index"
          :img-src="image"
        />

        <template #control>
          <q-carousel-control position="bottom-right" :offset="[18, 18]">
            <q-btn
              push
              round
              dense
              color="white"
              text-color="primary"
              :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
              @click="fullscreen = false"
            />
          </q-carousel-control>
        </template>
      </q-carousel>
    </div>
  </div>
</template>
<script lang="ts">
import { useBreakpoints } from 'src/hooks';
import { computed, defineComponent, ref } from 'vue';
export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { width, screenSize } = useBreakpoints();
    const slide = ref<number>(0);
    const images = computed<string[]>(() => {
      if (props.dapp && props.dapp.dapp.imagesUrl.length > 0) {
        return props.dapp.dapp.imagesUrl;
      } else {
        return [];
      }
    });

    const scrollLeft = (): void => {
      const isSm = width.value > screenSize.sm;
      const move = isSm ? -350 : -250;
      const left = document.querySelector('.scroll-images');
      left && left.scrollBy(move, 0);
    };

    const scrollRight = (): void => {
      const isSm = width.value > screenSize.sm;
      const move = isSm ? 350 : 250;
      const right = document.querySelector('.scroll-images');
      right && right.scrollBy(move, 0);
    };

    const arrowSize = computed<number>(() => (width.value > screenSize.sm ? 40 : 30));
    const fullscreen = ref<boolean>(false);

    const handleOpenPicture = (index: number) => {
      fullscreen.value = true;
      slide.value = index;
    };

    return { slide, images, scrollLeft, scrollRight, arrowSize, fullscreen, handleOpenPicture };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/dapp-images.scss';
</style>
