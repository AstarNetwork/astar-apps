<template>
  <div class="wrapper--blog-posts">
    <div class="container--blog-posts">
      <div
        v-for="(t, index) in items"
        :key="index"
        class="card--blog-post"
        @click="goToLink(t.link)"
      >
        <img :src="t.img" :alt="t.title" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

interface Data {
  img: string;
  title: string;
  link: string;
}

export default defineComponent({
  components: {},
  setup() {
    // The subsocial space where the news updates come from: https://polkaverse.com/10802
    const astarSpace = 10802;
    const items = ref<Data[]>([]);
    const { result, error } = useQuery(gql`
      query PostsBySpaceId {
        posts(where: { space: { id_eq: "${astarSpace}" }, AND: { hidden_not_eq: true } }, orderBy: id_DESC, limit: 5) {
          img: image
          title
          link: slug
        }
      }
    `);

    watch(
      [result, error],
      async () => {
        if (result.value) {
          items.value = result.value.posts.map((x: Data) => {
            return {
              img: `https://ipfs.subsocial.network/ipfs/${x.img}`,
              title: x.title,
              link: `https://astar.network/blog/${x.link}`,
            };
          });
        }
      },
      { immediate: true }
    );

    const goToLink = (link: string): void => {
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
.wrapper--blog-posts {
  padding: 16px;
  overflow-x: auto;
  .container--blog-posts {
    display: flex;
    gap: 8px;
    width: 1532px;
  }
  .card--blog-post {
    width: 300px;
    border-radius: 16px;
    overflow: hidden;
    img {
      aspect-ratio: 16/9;
      object-fit: cover;
      width: 100%;
    }
  }
}
</style>
