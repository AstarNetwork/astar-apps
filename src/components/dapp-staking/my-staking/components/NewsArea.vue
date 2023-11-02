<template>
  <div
    class="wrapper--news"
    :class="isShiden && 'wrapper--shiden'"
    :style="`background-image: url('${isDarkTheme ? bg_img.bg_news_dark : bg_img.bg_news_light}')`"
  >
    <div class="title--news">News</div>
    <div class="list--news">
      <div class="animate__animated" :class="isDisplay ? inAnimation : outAnimation">
        <div v-for="(t, index) in dataArray" :key="index" class="row--news">
          <div v-if="t.tag === 'Notice'" class="box--notice">{{ t.tag }}</div>
          <div v-else class="box--tag">
            {{ t.tag }}
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
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { defineComponent, computed, ref, watchEffect, watch } from 'vue';
import { useStore } from 'src/store';
import { paginate } from '@astar-network/astar-sdk-core';
import { endpointKey } from 'src/config/chainEndpoints';
import { useNetworkInfo } from 'src/hooks';
import { DappCombinedInfo } from 'src/v2/models';

interface Data {
  img: string;
  tag: string;
  title: string;
  link: string;
}

export default defineComponent({
  setup() {
    const store = useStore();
    const dapps = computed<DappCombinedInfo[]>(() => store.getters['dapps/getAllDapps']);
    const isDarkTheme = computed<boolean>(() => store.getters['general/theme'] === 'DARK');
    const { currentNetworkIdx } = useNetworkInfo();
    const isShiden = computed(() => currentNetworkIdx.value === endpointKey.SHIDEN);

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

    // The subsocial space where the dApp staking news updates come from: https://polkaverse.com/11132
    const AstarNetworkdAppStakingUpdateSpace = 11132;
    const items = ref<Data[]>([]);
    const { result, loading, error } = useQuery(gql`
      query PostsBySpaceId {
        posts(where: { space: { id_eq: "${AstarNetworkdAppStakingUpdateSpace}" }, AND: { hidden_not_eq: true } }, orderBy: id_DESC) {
          img: image
          tag: tagsOriginal
          title
          link: canonical
        }
      }
    `);

    const setDataArray = (): void => {
      if (!dataArray.value) return;

      pageTtl.value = Number((items.value.length / NUM_ITEMS).toFixed(0));
      dataArray.value = paginate(items.value, NUM_ITEMS, page.value);
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
        handlePageUpdate();
        setDataArray();
      }, 700);
    };

    watch(
      [result, error],
      async () => {
        if (result.value) {
          // Currently only one tag can be displayed on UI, so let's pick the first one
          // link property is missing from SubSocial data.
          items.value = result.value.posts
            .map((x: Data) => {
              return {
                tag: x.tag && x.tag.includes(',') ? x.tag.split(',')[0] : x.tag,
                title: x.title,
                link: x.link,
                img: 'https://ipfs.subsocial.network/ipfs/' + x.img,
              };
            })
            .filter((x: Data) => x.tag !== null);
          setDataArray();
          handlePageUpdate();
        }

        // TODO handle error
      },
      { immediate: true }
    );

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
      isShiden,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--news {
  width: 100%;
  background: #d9d9d9 no-repeat center;
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 6px;
  padding: 24px 16px;

  @media (min-width: $md) {
    padding: 24px 32px;
    height: 100%;
  }
}
.title--news {
  font-weight: 700;
  font-size: 26px;
  line-height: 31px;
  background: linear-gradient(
    122deg,
    #e6007a -1%,
    #703ac2 5%,
    #0070eb 10%,
    #0297fb 15%,
    #0ae2ff 40%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.list--news {
  height: 100%;
  padding-top: 4px;
  .row--news {
    display: flex;
    align-items: center;
    font-weight: 500;
    gap: 10px;
    font-size: 14px;
    margin-top: 15px;
    margin-bottom: 15px;
    max-width: 560px;
    .box--tag {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1px;
      width: 104px;
      min-width: 84px;
      height: 26px;
      color: #fff;
      font-weight: 600;
      font-size: 12px;
      line-height: 18px;
      white-space: nowrap;
      border-radius: 6px;
      background: linear-gradient(
        122deg,
        #e6007a -10%,
        #703ac2 20%,
        #0070eb 50%,
        #0297fb 70%,
        #0ae2ff 95%
      );
    }
    .box--notice {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      padding: 4px 8px;
      width: 84px;
      min-width: 84px;
      height: 26px;
      border-radius: 6px;
      background: $border-yellow;
      color: #fff;
    }
    .txt--title {
      margin-left: 5px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
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
  color: $navy-1;

  @media (min-width: $md) {
    bottom: 48px;
  }
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
  color: $navy-1;
  &:hover {
    transition: all 0.2s ease-in;
    background: rgba(255, 255, 255, 0.2);
  }
}

.icon--expand {
  margin-top: 6px;
}

.body--dark {
  .row--page {
    color: #fff;
  }
  .icon--arrow {
    color: #fff;
  }
}

.wrapper--shiden {
  .title--news {
    background: linear-gradient(129.32deg, #170d29 -4.43%, #481e94 5%, #6d2cae 80%, #0a010d 10%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
  .box--tag {
    background: linear-gradient(
      129.32deg,
      #170d29 -4.43%,
      #481e94 31.93%,
      #6d2cae 74.44%,
      #0a010d 133.31%
    ) !important;
  }
}
</style>
