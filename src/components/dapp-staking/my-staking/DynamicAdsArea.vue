<template>
  <div class="wrapper">
    <swiper
      id="dynamic-ads-area"
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
      <swiper-slide v-for="(item, index) in combinedCampaigns" :key="index">
        <div
          class="card"
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
import { defineComponent } from 'vue';
import { networkParam, Path } from 'src/router/routes';
import { useRouter } from 'vue-router';
import { useCampaign } from 'src/hooks';

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
  setup() {
    const router = useRouter();
    const { combinedCampaigns } = useCampaign();

    const goToLink = (link: string): void => {
      window.open(link, '_blank');
    };

    const goDappPageLink = (address: string | undefined): void => {
      const base = networkParam + Path.DappStaking + Path.Dapp;
      const url = `${base}?dapp=${address?.toLowerCase()}`;
      router.push(url);
    };

    return {
      modules: [Navigation],
      combinedCampaigns,
      goToLink,
      goDappPageLink,
    };
  },
});
</script>
<style lang="scss">
@import './styles/dynamic-ads-area.scss';
</style>
