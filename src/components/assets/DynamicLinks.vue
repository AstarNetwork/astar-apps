<template>
  <div class="wrapper">
    <div class="wrapper-item wrapper--banners">
      <div v-for="(t, index) in items" :key="index" class="card" @click="goToLink(t.link)">
        <div class="wrapper--img">
          <q-img :src="t.background" class="img--dapp" fit="contain" no-spinner />
        </div>
        <div class="card-info">
          <div class="txt--title">
            {{ t.title }}
          </div>
          <div class="txt--subtitle">{{ t.subtitle }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, watchEffect, computed } from 'vue';
import { truncate } from '@astar-network/astar-sdk-core';
import linksData from 'src/data/dynamic_links.json';

export default defineComponent({
  components: {},
  setup() {
    const items = linksData;

    const goToLink = (link: string) => {
      window.open(link, '_blank');
    };

    console.log(items);

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
  