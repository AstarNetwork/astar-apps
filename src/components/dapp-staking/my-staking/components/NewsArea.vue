<template>
  <div
    class="wrapper--news"
    :style="`background-image: url('${isDarkTheme ? bg_img.bg_news_dark : bg_img.bg_news_light}')`"
  >
    <div class="title--news">News</div>
    <div class="list--news">
      <div class="animate__animated" :class="isDisplay ? inAnimation : outAnimation">
        <div v-for="(t, index) in dataArray" :key="index" class="row--news">
          <div v-if="t.tag === 'Notice'" class="box--notice">{{ t.tag }}</div>
          <div v-else class="box--tag">
            <div class="txt--tag">{{ t.tag }}</div>
          </div>
          <div class="txt--title" :class="t.link ? 'txt--underline' : ''" @click="goToLink(t.link)">
            {{ t.title }}
          </div>
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
    const isDarkTheme = computed(() => store.getters['general/theme'] === 'DARK');

    const page = ref<number>(1);
    const pageTtl = ref<number>(0);
    const dataArray = ref<Data[]>([]);
    const isDisplay = ref<boolean>(true);
    const goToNext = ref<boolean>(true);
    const NUM_ITEMS = 3;

    const inAnimation = computed<string>(() =>
      goToNext.value ? 'animate__fadeInRight' : 'animate__fadeInLeft'
    );
    const outAnimation = computed<string>(() =>
      goToNext.value ? 'animate__fadeOutLeft' : 'animate__fadeOutRight'
    );

    const bg_img = {
      bg_news_light: require('src/assets/img/bg_dapp_news_light.jpg'),
      bg_news_dark: require('/src/assets/img/bg_dapp_news_dark.jpg'),
    };

    const items = [
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        tag: 'Notice',
        title: 'NFT drop from astar.network',
        link: '',
      },
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        tag: 'Campaign',
        title: 'NFT drop from astar.network',
        link: 'https://www.youtube.com/watch?v=8KrUhu2rweA',
      },
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        tag: 'Application',
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
        tag: 'Application',
        title: 'NFT drop from astar.network 2',
        link: 'https://www.youtube.com/watch?v=8KrUhu2rweA',
      },
      {
        img: 'https://firebasestorage.googleapis.com/v0/b/astarnetwork-a4924.appspot.com/o/astar-dapps%2F0x1de7c3A07918fb4BE9159703e73D6e0b0736CaBC_rIb1fUz3_400x400%20(1).jpeg?alt=media&token=3832d94b-81bd-4e12-9d8b-96d83896ed3a',
        tag: 'Campaign',
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
      isDarkTheme,
      bg_img,
      inAnimation,
      outAnimation,
      goToLink,
      isDisplay,
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
  background-repeat: no-repeat;
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
    align-items: center;
    font-weight: 600;
    gap: 10px;
    font-size: 14px;
    margin-top: 15px;
    margin-bottom: 15px;
    .box--tag {
      position: relative;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 1px;
      width: 84px;
      height: 26px;
      border-radius: 6px;
      background-image: linear-gradient(#d9d9d9, #d9d9d9),
        linear-gradient(
          100.62deg,
          #e6007a -13.87%,
          #703ac2 10.44%,
          #0070eb 47.07%,
          #0297fb 89.31%,
          #0ae2ff 151.16%
        );
      background-origin: border-box;
      background-clip: content-box, border-box;
    }
    .txt--tag {
      width: 100%;
      white-space: nowrap;
      text-align: center;
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
    .box--notice {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 4px 8px;
      width: 84px;
      height: 26px;
      border-radius: 6px;
      background: $border-yellow;
      color: #fff;
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
  bottom: 40px;
  float: right;
  color: $gray-5-selected;
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
  color: $gray-5-selected;
  &:hover {
    transition: all 0.2s ease-in;
    background: rgba(255, 255, 255, 0.2);
  }
}

.icon--expand {
  margin-top: 6px;
}

.body--dark {
  .list--news {
    .row--news {
      .box--tag {
        background-image: linear-gradient($gray-6, $gray-6),
          linear-gradient(
            100.62deg,
            #e6007a -13.87%,
            #703ac2 10.44%,
            #0070eb 47.07%,
            #0297fb 89.31%,
            #0ae2ff 151.16%
          );
      }
    }
  }
  .row--page {
    color: #fff;
  }
  .icon--arrow {
    color: #fff;
  }
}
</style>
