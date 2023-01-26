<template>
  <div class="wrapper">
    <div class="news-area">
      <news-area />
    </div>
    <div class="wrapper--banners">
      <div v-for="(t, index) in items" :key="index" class="card" @click="goToLink(t.link)">
        <div class="img--dapp" :style="`background-image: url('')`"></div>
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

export default defineComponent({
  components: {
    NewsArea,
  },
  setup() {
    const items = [
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        category: 'Featured dApp',
        title: 'Astar Farm',
        subtitle: 'The multi-cahin lending platform',
        link: 'https://docs.astar.network/docs/dapp-staking/',
      },
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        category: 'EVM Staking',
        title: 'Algem',
        subtitle: 'dApp Staking is available on EVM',
        link: 'https://www.youtube.com/watch?v=8KrUhu2rweA',
      },
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        category: 'Featured dApp',
        title: 'Astar Farm',
        subtitle: 'The multi-cahin lending platform',
        link: 'https://docs.astar.network/docs/dapp-staking/',
      },
    ];

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
  @media (min-width: $sm) {
    display: flex;
    gap: 16px;
  }
}

.wrapper--banners {
  display: flex;
  gap: 16px;

  .card {
    width: 191px;
    height: 210px;
    .img--dapp {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
      margin-right: 16px;
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
      color: $astar-blue;
    }
    .txt--title {
      font-weight: 600;
      font-size: 20px;
      color: #fff;
      margin-top: 4px;
      margin-bottom: 4px;
    }
    .txt--subtitle {
      font-weight: 500;
      font-size: 14px;
      color: $gray-2;
    }
  }

  @media (min-width: $xxl) {
    gap: 24px;
  }
}
</style>