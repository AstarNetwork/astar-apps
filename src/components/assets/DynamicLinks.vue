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
import { defineComponent, ref, watchEffect, computed } from 'vue';
import { truncate } from '@astar-network/astar-sdk-core';
import linksData from 'src/data/dynamic_links.json';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {},
  setup() {
    const { t } = useI18n();
    const banners = [
      require('/src/assets/img/banner/banner01.svg'),
      require('/src/assets/img/banner/banner02.svg'),
      require('/src/assets/img/banner/banner03.svg'),
      require('/src/assets/img/banner/banner04.svg'),
    ];
    const items = linksData.map((item, index) => ({
      background: banners[index],
      title: t(item.title),
      subtitle: t(item.subtitle),
      link: item.link,
    }));

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
