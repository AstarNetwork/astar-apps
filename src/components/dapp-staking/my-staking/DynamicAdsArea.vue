<template>
  <div class="wrapper--ads-area">
    <swiper
      class="swiper--ads-area"
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
      <swiper-slide v-for="(item, index) in items" :key="index">
        <div
          class="card--swiper"
          @click="item.link !== undefined ? goToLink(item.link) : goDappPageLink(item.address)"
        >
          <img :src="item.img" class="card__img" />
          <div class="card__bottom">
            <div>
              <div
                class="text--accent"
                :class="item.link !== undefined ? 'featured' : 'new-listing'"
              >
                {{ item.link !== undefined ? 'FEATURED' : 'NEW LISTING' }}
              </div>
              <div class="text--name">{{ item.name }}</div>
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

    const goToLink = (link: string): void => {
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
          'New listing2 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris rutrum.',
        img: '/images/dapp_promotions/new.webp',
      },
    ];

    const maxLength = Math.max(newListing.length, dappPromotions.length);
    for (let i = 0; i < maxLength; i++) {
      if (i < newListing.length) {
        items.value.push(newListing[i]);
      }
      if (i < dappPromotions.length) {
        items.value.push(dappPromotions[i]);
      }
    }

    return {
      modules: [Navigation],
      items,
      goToLink,
      goDappPageLink,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/ads-area.scss';
</style>

<style lang="scss">
.swiper--ads-area {
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
  }
  .swiper-button-next {
    padding-left: 2px;
  }
  .swiper-button-disabled {
    display: none;
  }
}
</style>
