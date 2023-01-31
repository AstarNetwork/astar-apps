<template>
  <div class="wrapper--news">
    <div class="title--news">News</div>
    <div class="list--news">
      <div v-for="(t, index) in dataArray" :key="index" class="row--news">
        <div class="txt--tag">●{{ t.tag }}●</div>
        <div class="txt--title" :class="t.link ? 'txt--underline' : ''" @click="goToLink(t.link)">
          {{ t.title }}
        </div>
      </div>
    </div>
    <div class="row--page">
      <button v-show="page > 1" class="icon--arrow" @click="changePage(false)">
        <astar-icon-arrow-left />
      </button>
      <div class="colum--current-page">
        <span class="text--value"> {{ page }}/{{ pageTtl }} </span>
      </div>
      <button class="icon--arrow" :disabled="page === Number(pageTtl)" @click="changePage(true)">
        <astar-icon-arrow-right />
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, ref, watchEffect } from 'vue';
import { useBreakpoints } from 'src/hooks';
import { useStore } from 'src/store';
import { paginate } from 'src/hooks/helper/common';

interface Data {
  img: string;
  tag: string;
  title: string;
  link: string;
}

export default defineComponent({
  setup() {
    const store = useStore();
    const dapps = computed(() => store.getters['dapps/getAllDapps']);
    const { screenSize, width } = useBreakpoints();
    const page = ref<number>(1);
    const pageTtl = ref<number>(0);
    const dataArray = ref<Data[]>([]);
    const isDisplay = ref<boolean>(true);
    const goToNext = ref<boolean>(true);
    const NUM_ITEMS = 3;

    const bg_img = {
      astar_hero: require('/src/assets/img/banner/banner-02-astar.png'),
      shiden_hero: require('/src/assets/img/banner/banner-02-shiden.png'),
    };

    const items = [
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        tag: 'Campaign',
        title: 'NFT drop from astar.network',
        link: '',
      },
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        tag: 'New release',
        title: 'NFT drop from astar.network',
        link: 'https://www.youtube.com/watch?v=8KrUhu2rweA',
      },
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        tag: 'Latest News',
        title: 'NFT drop from astar.network',
        link: 'https://www.youtube.com/watch?v=9jkM_uYrqUw',
      },
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        tag: 'Campaign',
        title: 'NFT drop from astar.network 2',
        link: '',
      },
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        tag: 'New release',
        title: 'NFT drop from astar.network 2',
        link: 'https://www.youtube.com/watch?v=8KrUhu2rweA',
      },
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        tag: 'Latest News',
        title: 'NFT drop from astar.network 2',
        link: 'https://www.youtube.com/watch?v=9jkM_uYrqUw',
      },
    ];

    const setDataArray = (): void => {
      if (!dataArray.value) return;

      pageTtl.value = Number((items.length / NUM_ITEMS).toFixed(0));
      dataArray.value = paginate(items, NUM_ITEMS, page.value);
    };

    const goToLink = (link: string) => {
      if (link) {
        window.open(link, '_blank');
      }
    };

    const handlePageUpdate = (): void => {
      if (dapps.value.length === 0) return;
      if (page.value > pageTtl.value) {
        page.value = pageTtl.value;
      }
    };

    const changePage = (isNext: boolean) => {
      isDisplay.value = false;
      goToNext.value = isNext;
      setTimeout(() => {
        if (isNext) {
          page.value < pageTtl.value ? page.value++ : pageTtl.value;
        } else {
          page.value > 1 ? page.value-- : 1;
        }
        isDisplay.value = true;
      }, 700);
    };

    watchEffect(setDataArray);
    watchEffect(handlePageUpdate);

    return {
      dataArray,
      bg_img,
      goToLink,
      page,
      pageTtl,
      changePage,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--news {
  width: 100%;
  height: 100%;
  background: #d9d9d9;
  border-radius: 6px;
  padding: 24px 32px;
}
.title--news {
  font-weight: 700;
  font-size: 26px;
  line-height: 31px;
  background: linear-gradient(
    100.62deg,
    #e6007a -13.87%,
    #703ac2 10.44%,
    #0070eb 47.07%,
    #0297fb 89.31%,
    #0ae2ff 151.16%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.list--news {
  padding-top: 12px;
  .row--news {
    display: flex;
    font-weight: 600;
    font-size: 14px;
    margin-top: 12px;
    margin-top: 12px;
    .txt--tag {
      background: linear-gradient(
        100.62deg,
        #e6007a -13.87%,
        #703ac2 10.44%,
        #0070eb 47.07%,
        #0297fb 89.31%,
        #0ae2ff 151.16%
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-fill-color: transparent;
    }
    .txt--title {
      margin-left: 5px;
    }
    .txt--underline {
      text-decoration: underline;
      cursor: pointer;
    }
  }
}

.row--page {
  display: flex;
  position: relative;
  bottom: 10px;
  float: right;
  color: #fff;
}
.colum--current-page {
  width: 34px;
  display: flex;
  justify-content: center;
}

.icon--arrow {
  margin-top: -1px;
  height: 24px;
  width: 24px;
  display: flex;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in;
  border-radius: 50%;
  color: #fff;
  &:hover {
    transition: all 0.2s ease-in;
    background: rgba(255, 255, 255, 0.2);
  }
}

.icon--expand {
  margin-top: 6px;
}
</style>
