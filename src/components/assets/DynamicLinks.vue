<template>
  <div class="wrapper">
    <div class="wrapper--banners">
      <div
        v-for="(t, index) in items"
        :key="index"
        class="card"
        :style="`background-image: url('${t.background}');`"
        @click="goToLink(t.link)"
      >
        <div class="card-info">
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
import { defineComponent, ref, watchEffect, computed } from 'vue';
import { truncate } from '@astar-network/astar-sdk-core';
import linksData from 'src/data/dynamic_links.json';

export default defineComponent({
  components: {},
  setup() {
    const banners = [
      require('/src/assets/img/banner/banner01.svg'),
      require('/src/assets/img/banner/banner02.svg'),
      require('/src/assets/img/banner/banner03.svg'),
      require('/src/assets/img/banner/banner04.svg'),
    ];
    const items = linksData.map((item) => ({
      background: banners[item.background],
      title: item.title,
      subtitle: item.subtitle,
      link: item.link,
    }));

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
  