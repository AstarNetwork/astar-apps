<template>
  <div class="wrapper">
    <swiper
      :slides-per-view="1.25"
      :slides-per-group="1"
      :space-between="24"
      :navigation="true"
      :parallax="true"
      :modules="modules"
      :breakpoints="{
        '768': {
          slidesPerView: 3.25,
          slidesPerGroup: 3,
        },
        '1280': {
          slidesPerView: 4.5,
          slidesPerGroup: 4,
        },
      }"
    >
      <swiper-slide v-for="(item, index) in dappPromotions" :key="index">
        <div class="card" @click="goToLink(item.link)">
          <img :src="item.img" class="card__img" />
          <div class="card__bottom">
            <div>
              <div class="text--accent">FEATURED</div>
              <div class="text--title">{{ item.name }}</div>
            </div>
            <div class="text--description">{{ item.description }}</div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watchEffect, computed } from 'vue';
import dappPromotions from 'src/data/dapp_promotions.json';
import { networkParam, Path } from 'src/router/routes';
import { useRouter } from 'vue-router';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

interface Data {
  name: string;
  description: string;
  img: string;
  link?: string;
  address?: string;
}

export default defineComponent({
  components: {
    Swiper,
    SwiperSlide,
  },
  setup() {
    const items = ref<Data[]>([]);
    const router = useRouter();

    const goToLink = (link: string) => {
      window.open(link, '_blank');
    };

    const goDappPageLink = (address: string | undefined): void => {
      const base = networkParam + Path.DappStaking + Path.Dapp;
      const url = `${base}?dapp=${address?.toLowerCase()}`;
      router.push(url);
    };

    // dummy data
    const newListing = [
      {
        address: '0x95f506e72777efcb3c54878bb4160b00cd11cd84',
        name: 'Lucky',
        description:
          'New listing1 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris rutrum.',
        img: '/images/dapp_promotions/new.webp',
      },
      {
        address: '0x95f506e72777efcb3c54878bb4160b00cd11cd84',
        name: 'Lucky',
        description:
          'New listing1 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris rutrum.',
        img: '/images/dapp_promotions/new.webp',
      },
    ];

    return {
      modules: [Navigation],
      dappPromotions,
      goToLink,
      goDappPageLink,
    };
  },
});
</script>
<style lang="scss" scoped>
// @import './styles/dynamic-ads-area.scss';
.swiper {
  overflow: visible;
}
.swiper-slide {
  border-radius: 6px;
  overflow: hidden;
  height: auto;
}
.card {
  background: rgba(255, 255, 255, 0.1);
  height: 100%;
  transition: all 0.2s ease;
  cursor: pointer;
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
}
.card__img {
  aspect-ratio: 16/9;
  object-fit: cover;
  width: 100%;
}
.card__bottom {
  padding: 16px 24px;
}
.text--accent {
  font-size: 12px;
  font-weight: 700;
  color: $astar-blue-dark;
}
.text--title {
  margin: 4px 0 16px 0;
}
.text--description {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: $gray-1;
}
</style>
