<template>
  <div v-if="images.length > 0" class="wrapper--dapp-images">
    <div class="container--dapp-images">
      <swiper
        class="swiper--dapp-images"
        :slides-per-view="1.25"
        :slides-per-group="1"
        :space-between="8"
        :navigation="true"
        :modules="modules"
        :breakpoints="{
          '768': {
            slidesPerView: 1.5,
            slidesPerGroup: 1,
          },
          '1280': {
            slidesPerView: 2.25,
            slidesPerGroup: 2,
          },
          '1440': {
            slidesPerView: 2.5,
            slidesPerGroup: 2,
          },
        }"
      >
        <swiper-slide v-for="(image, index) in images" :key="index">
          <img :src="image" :alt="`Image ${index}`" @click="handleOpenPicture(index)" />
        </swiper-slide>
      </swiper>
    </div>

    <!-- Memo: fullscreen image preview -->
    <q-carousel
      v-if="isFullScreen"
      v-model="slide"
      v-model:fullscreen="isFullScreen"
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
        <q-carousel-control position="top-right" :offset="[18, 18]">
          <q-btn
            push
            round
            dense
            color="white"
            text-color="primary"
            :icon="isFullScreen ? 'fullscreen_exit' : 'fullscreen'"
            @click="isFullScreen = false"
          />
        </q-carousel-control>
      </template>
    </q-carousel>
  </div>
</template>
<script lang="ts">
import { CombinedDappInfo } from 'src/staking-v3/logic';
import { computed, defineComponent, ref, watchEffect, onUnmounted, PropType } from 'vue';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

export default defineComponent({
  components: {
    Swiper,
    SwiperSlide,
  },
  props: {
    dapp: {
      type: Object as PropType<CombinedDappInfo>,
      required: true,
    },
  },
  setup(props) {
    const slide = ref<number>(0);
    const isFullScreen = ref<boolean>(false);

    const images = computed<string[]>(() => {
      try {
        if (props.dapp.extended !== undefined && props.dapp.extended.imagesUrl.length > 0) {
          return props.dapp.extended.imagesUrl;
        }

        return [];
      } catch (error) {
        return [];
      }
    });

    const handleOpenPicture = (index: number): void => {
      isFullScreen.value = true;
      slide.value = index;
    };

    const handleKeyUp = ({ keyCode }: { keyCode: number }): void => {
      const escKey = 27;
      const leftKey = 37;
      const rightKey = 39;
      if (keyCode === escKey) {
        isFullScreen.value = false;
      } else if (keyCode === rightKey && slide.value !== images.value.length - 1) {
        slide.value = slide.value + 1;
      } else if (keyCode === leftKey && slide.value !== 0) {
        slide.value = slide.value - 1;
      }
      return;
    };

    const handleImageFullScreen = (): void => {
      if (isFullScreen.value) {
        document.addEventListener('keyup', handleKeyUp);
      }
    };

    watchEffect(handleImageFullScreen);
    onUnmounted(() => {
      document.removeEventListener('keyup', handleKeyUp);
    });

    return {
      modules: [Navigation],
      slide,
      images,
      isFullScreen,
      handleOpenPicture,
    };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/dapp-images.scss';
</style>

<style lang="scss">
.swiper--dapp-images {
  > .swiper-button-prev,
  > .swiper-button-next {
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
  > .swiper-button-prev {
    padding-right: 2px;
  }
  > .swiper-button-next {
    padding-left: 2px;
  }
  > .swiper-button-disabled {
    display: none;
  }
}
</style>
