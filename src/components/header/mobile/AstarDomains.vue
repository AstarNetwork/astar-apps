<template>
  <div class="wrapper--domains">
    <a
      v-for="(t, index) in items"
      :key="index"
      class="link"
      :href="t.link"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img :src="t.img" :alt="t.title" />
      <span>{{ t.title }}</span>
    </a>
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
.wrapper--domains {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 40px 12px;
  padding: 0 16px;
  margin-bottom: 40px;
  @media (min-width: $sm) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
  @media (min-width: $lg) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    padding: 0;
  }
}
.link {
  font-weight: 500;
  font-size: 14px;
  display: block;
  transition: all 0.2s ease;
  img {
    width: 64px;
    height: 64px;
    margin: auto;
  }
  span {
    display: block;
    text-align: center;
    margin-top: 12px;
  }
  &:hover {
    color: $astar-blue;
    img {
      opacity: 80%;
    }
  }
}
.body--dark {
  .link {
    &:hover {
      color: $astar-blue-dark;
    }
  }
}
</style>
