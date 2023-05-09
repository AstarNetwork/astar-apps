<template>
  <div class="wrapper">
    <div class="wrapper--banners">
      <div
        v-for="(t, index) in items"
        :key="index"
        class="card"
        :style="`background-image: url('${t.background}'); background-size: cover; background-position: center;`"
        @click="goToLink(t.link)"
      >
        <div class="card--info">
          <div class="txt--title">
            {{ t.title }}
          </div>
          <div v-if="t.subtitle" class="txt--subtitle">{{ t.subtitle }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { truncate } from '@astar-network/astar-sdk-core';
import linksData from 'src/data/dynamic_links.json';
import { useI18n } from 'vue-i18n';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

interface Data {
  background: string;
  title: string;
  subtitle: string;
  link: string;
}

export default defineComponent({
  components: {},
  setup() {
    const { t } = useI18n();
    const banners = [
      require('/src/assets/img/banner/banner01.svg'),
      require('/src/assets/img/banner/banner02.svg'),
      require('/src/assets/img/banner/banner03.svg'),
    ];

    // The subsocial space where the news updates come from: https://polkaverse.com/10802
    const astarSpace = 10802;
    const item = ref<Data[]>([]);
    const { result, loading, error } = useQuery(gql`
      query PostsBySpaceId {
        posts(where: { space: { id_eq: "${astarSpace}" }, AND: { hidden_not_eq: true } }, orderBy: id_DESC, limit: 1) {
          background: image
          title
          link: slug
        }
      }
    `);

    let items = linksData.map((item, index) => ({
      background: banners[index],
      title: t(item.title),
      subtitle: t(item.subtitle),
      link: item.link,
    }));

    watch(
      [result, error],
      async () => {
        if (result.value) {
          item.value = result.value.posts.map((x: Data) => {
            return {
              background: `https://ipfs.subsocial.network/ipfs/${x.background}`,
              title: '', // x.title,
              subtitle: '',
              link: `https://astar.network/blog/${x.link}`,
            };
          });
          console.log('item.value[0]', item.value[0]);
          items.push(item.value[0]);
        }
      },
      { immediate: true }
    );

    const goToLink = (link: string): void => {
      window.open(link, '_blank');
    };

    return {
      truncate,
      items,
      goToLink,
    };
  },
});
</script>
<style lang="scss" scoped>
@import './styles/dynamic-links.scss';
</style>
