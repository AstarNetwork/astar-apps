<template>
  <div class="wrapper--cards">
    <div v-for="(t, index) in items" :key="index" class="card">
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
    //test items
    const items = [
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        title: 'What is dApps Staking?',
        subtitle: 'Learn our unique solution',
      },
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        title: 'What is dApps Staking?',
        subtitle: 'Learn our unique solution',
      },
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        title: 'What is dApps Staking?',
        subtitle: 'Learn our unique solution',
      },
    ];

    return {
      items,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--cards {
  display: flex;
  gap: 16px;
  flex-direction: column;
  align-items: center;
  margin-top: 48px;
  margin-bottom: 48px;
  width: 100%;
  @media (min-width: $sm) {
    flex-direction: row;
    justify-content: space-evenly !important;
  }
  @media (min-width: $md) {
    width: 100vw;
  }
  @media (min-width: $lg) {
    width: 100%;
  }

  @media (max-width: $lg) {
    overflow-x: auto;
    overflow-y: hidden;
    justify-content: left;
    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.card {
  cursor: pointer;
  width: 344px;
  @media (min-width: 500px) {
    width: 380px;
  }
  @media (min-width: $md) {
    width: 200px;
    margin-left: -28px;
  }
  @media (min-width: 850px) {
    width: 220px;
  }
  @media (min-width: $lg) {
    margin-left: 0px;
  }
  @media (min-width: $xl) {
    width: 234px;
  }
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
