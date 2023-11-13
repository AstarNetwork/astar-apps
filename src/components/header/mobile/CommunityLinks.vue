<template>
  <div class="wrapper--community">
    <div class="text--title">Astar Network is owned by the community</div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { useBreakpoints } from 'src/hooks';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {},
  setup() {
    const { width, screenSize } = useBreakpoints();
    const { t } = useI18n();
    const icon_img = {
      home: require('/src/assets/img/icon_home.svg'),
      astar2: require('/src/assets/img/icon_astar2.svg'),
      tech_stack: require('/src/assets/img/icon_tech_stack.svg'),
      docs: require('/src/assets/img/icon_docs.svg'),
      forum: require('/src/assets/img/icon_forum.svg'),
      startale: require('/src/assets/img/icon_startale.svg'),
    };

    const items = [
      {
        title: 'Home',
        img: icon_img.home,
        link: 'https://astar.network/',
      },
      {
        title: 'Astar 2.0',
        img: icon_img.astar2,
        link: 'https://astar.network/astar2',
      },
      {
        title: 'Tech Stack',
        img: icon_img.tech_stack,
        link: 'https://astar.network/developers/techstack',
      },
      {
        title: 'Astar Docs',
        img: icon_img.docs,
        link: 'https://docs.astar.network/',
      },
      {
        title: 'Forum',
        img: icon_img.forum,
        link: 'https://forum.astar.network/',
      },
      {
        title: 'Startale',
        img: icon_img.startale,
        link: 'https://startale.org/',
      },
    ];

    return { items, width, screenSize };
  },
});
</script>
<style lang="scss" scoped>
.wrapper--community {
  background-color: $navy-1;
  color: white;
  text-align: center;
  padding: 0 16px;
}
.text--title {
  font-weight: 900;
  color: white;
  font-size: 24px;
  margin-bottom: 24px;
}
</style>
