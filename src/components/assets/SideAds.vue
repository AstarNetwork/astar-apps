<template>
  <div class="wrapper--ads-area">
    <swiper class="swiper--ads-area" :slides-per-view="1" :modules="modules" :autoplay="true">
      <swiper-slide v-for="(item, index) in combinedCampaigns" :key="index">
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
            <div class="text--description">{{ item.shortDescription }}</div>
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
import { Autoplay } from 'swiper/modules';

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
      modules: [Autoplay],
      combinedCampaigns,
      goToLink,
      goDappPageLink,
    };
  },
});
</script>
<style lang="scss" scoped>
@import '../dapp-staking/my-staking/styles/ads-area.scss';

.wrapper--ads-area {
  margin: 0;
  padding: 0;
  mask-image: none;
}
.swiper {
  overflow: hidden;
}

.card--swiper {
  border: solid 1px $gray-2;
  border-radius: 16px;
  box-shadow: none;
  background-color: white;
}

.body--dark {
  .card--swiper {
    border-color: $navy-3;
    background-color: $navy-1;
  }
}
</style>
