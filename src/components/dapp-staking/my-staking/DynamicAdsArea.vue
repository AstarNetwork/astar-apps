<template>
  <div class="wrapper">
    <div class="wrapper-item news-area">
      <news-area />
    </div>
    <div class="wrapper-item wrapper--banners">
      <div v-for="(t, index) in items" :key="index" class="card" @click="goToLink(t.link)">
        <div class="wrapper--img">
          <q-img :src="t.img" class="img--dapp" fit="contain" no-spinner />
        </div>
        <div class="card-info">
          <div class="txt--category">{{ t.category }}</div>
          <div class="txt--title">{{ t.title }}</div>
          <div class="txt--subtitle">{{ t.subtitle }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import NewsArea from './components/NewsArea.vue';
import featuredData from 'src/data/featured_dapp.json';

export default defineComponent({
  components: {
    NewsArea,
  },
  setup() {
    const items = featuredData;

    const goToLink = (link: string) => {
      window.open(link, '_blank');
    };

    return {
      items,
      goToLink,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper {
  display: block;
  margin-top: 48px;
  margin-bottom: 48px;
  @media (min-width: $xl) {
    display: flex;
    gap: 16px;
  }
}
.wrapper-item {
  flex: 1 1 0px;
  height: 211px;
}

.wrapper--banners {
  display: flex;
  gap: 16px;
  margin-top: 20px;
  @media (max-width: $md) {
    display: flex;
    width: 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    justify-content: left;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  @media (min-width: $xl) {
    margin-top: 0px;
  }
  .card {
    flex-basis: 33%;
    height: 100%;
    cursor: pointer;
    background: rgba(196, 196, 196, 0.1);
    backdrop-filter: blur(50px);
    border-radius: 6px;
    @media (max-width: $md) {
      min-width: 191px;
    }
    .wrapper--img {
      display: flex;
      justify-content: flex-end;
      border-radius: 999px;
      width: 72px;
      height: 72px;
      margin-top: 16px;
      margin-right: 16px;
      margin-left: auto;
      .img--dapp {
        max-width: 72px;
        max-height: 72px;
        border-radius: 999px;
      }
    }
    .card-info {
      padding-left: 16px;
      padding-right: 16px;
      padding-bottom: 16px;
      margin-top: 6px;
    }
    .txt--category {
      font-weight: 600;
      font-size: 14px;
      line-height: 18px;
      color: $astar-blue;
    }
    .txt--title {
      font-weight: 600;
      font-size: 20px;
      line-height: 24px;
      color: #fff;
      margin-top: 4px;
      margin-bottom: 4px;
    }
    .txt--subtitle {
      font-weight: 500;
      font-size: 14px;
      line-height: 18px;
      color: $gray-2;
    }
  }

  @media (min-width: $xxl) {
    gap: 24px;
  }
}
</style>