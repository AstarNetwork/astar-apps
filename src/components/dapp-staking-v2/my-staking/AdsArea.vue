<template>
  <div class="wrapper--cards">
    <div v-for="(t, index) in items" :key="index" class="card" @click="goToLink(t.link)">
      <div class="wrapper--img"></div>
      <div class="txt--subtitle">{{ t.subtitle }}</div>
      <div class="txt--title">{{ t.title }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  setup() {
    const items = [
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        title: 'What is dApp Staking',
        subtitle: 'Learn our unique solution',
        link: 'https://docs.astar.network/docs/dapp-staking/',
      },
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        title: 'How to Stake?',
        subtitle: 'Step-by-step video tutorial',
        link: 'https://www.youtube.com/watch?v=8KrUhu2rweA',
      },
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        title: 'How to set up Polkadot Native Wallet',
        subtitle: 'Step-by-step video tutorial',
        link: 'https://www.youtube.com/watch?v=9jkM_uYrqUw',
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

.wrapper--cards {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 48px;
  margin-bottom: 48px;

  @media (max-width: $lg) {
    // display: block;
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    justify-content: left;
    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.card {
  flex-basis: 30%;
  min-width: 300px;
  cursor: pointer;
  .wrapper--img {
    background: rgb(110, 110, 110);
    height: 200px;
    border-radius: 6px;
  }
  .txt--subtitle {
    font-weight: 600;
    font-size: 14px;
    line-height: 17px;
    color: #b1b7c1;
    margin-top: 16px;
  }
  .txt--title {
    font-weight: 600;
    font-size: 20px;
    line-height: 18px;
    color: $gray-5-selected;
    margin-top: 10px;
  }

  @media (max-width: $sm) {
    margin-bottom: 40px;
  }
}

.body--dark {
  .card {
    .txt--title {
      color: $gray-1;
    }
  }
}
</style>