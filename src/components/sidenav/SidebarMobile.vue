<template>
  <!-- TODO: need to hide after moving to another screen -->
  <div class="sidebar-mobile">
    <div
      class="astar-stars"
      :style="`background-image: url('${bg_img.astar_stars}'); background-size: contain;`"
    />
    <nav class="nav">
      <router-link :to="RoutePath.Assets" :class="['link', path === 'assets' && 'active-link']">
        <div class="column--item">
          <span class="text--link">
            {{ $t('sidenavi.myAssets') }}
          </span>
        </div>
      </router-link>

      <router-link
        v-if="network.isStoreEnabled"
        :to="RoutePath.DappStaking"
        :class="['link', path === 'dapp-staking' && 'active-link']"
      >
        <div class="column--item">
          <span class="text--link">
            {{ $t('sidenavi.dappsStaking') }}
          </span>
        </div>
      </router-link>

      <router-link
        :to="RoutePath.Dashboard"
        :class="['link', path === 'dashboard' && 'active-link']"
      >
        <div class="column--item column--item--dashboard">
          <span class="text--link">
            {{ $t('sidenavi.data') }}
          </span>
        </div>
      </router-link>

      <div class="link" :class="showSettings ? 'tw-underline' : ''" @click="handleSettingsDrawer()">
        {{ $t('sidenavi.settings') }}
      </div>

      <div
        class="link"
        :class="showCommunity ? 'tw-underline' : ''"
        @click="handleCommunityDrawer()"
      >
        {{ $t('sidenavi.community') }}
      </div>
    </nav>

    <!-- External links -->
    <div class="external-links">
      <a v-for="(link, index) in externalLinks" :key="link.title" :href="link.href" target="_blank">
        <span class="icon">
          <component :is="link.icon" v-if="index === 0" :class="index === 0 ? 'tw-text-lg' : ''" />
          <astar-icon-base v-else :class="index !== 0 ? 'tw-mt-2 tw-ml-2' : ''">
            <component :is="link.icon" />
          </astar-icon-base>
        </span>
        <span class="title">Astar<br />{{ link.title }}</span>
      </a>
    </div>

    <!-- Dynamic links -->
    <div class="dynamic-links">
      <div
        v-for="(t, index) in items"
        :key="index"
        class="card"
        :style="`background-image: url('${t.background}'); background-size: cover; background-position: center;`"
        @click="goToLink(t.link)"
      >
        <div class="card--info">
          <div class="txt--title" :class="index === 0 ? 'tw-italic' : ''">
            {{ t.title }}
          </div>
        </div>
      </div>
    </div>

    <!-- Sub navigation -->
    <div class="drawer-menu" :class="showSettings ? 'show' : 'hide'">
      <sidebar-settings />
    </div>

    <div class="drawer-menu" :class="showCommunity ? 'show' : 'hide'">
      <sidebar-community />
    </div>
  </div>
</template>

<script lang="ts">
import { providerEndpoints } from 'src/config/chainEndpoints';
import { useStore } from 'src/store';
import { computed, defineComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import SidebarSettings from './SidebarSettings.vue';
import SidebarCommunity from './SidebarCommunity.vue';
import { Path as RoutePath } from 'src/router/routes';
import { IconHome, IconDocs, IconForum, IconEcosystem } from '@astar-network/astar-ui';

import linksData from 'src/data/dynamic_links.json';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { useI18n } from 'vue-i18n';

interface Data {
  background: string;
  title: string;
  subtitle: string;
  link: string;
}

export default defineComponent({
  components: {
    SidebarSettings,
    SidebarCommunity,
  },
  setup() {
    const store = useStore();
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const network = ref(providerEndpoints[currentNetworkIdx.value]);
    const showCommunity = ref(false);
    const showSettings = ref(false);
    const router = useRouter();
    const path = computed(() => router.currentRoute.value.path.split('/')[2]);

    // const getIndicatorClass = (path: string): string => {
    //   switch (path) {
    //     case 'dashboard':
    //       return 'tabs__dashboard';
    //     case 'assets':
    //       return 'tabs__assets';
    //     case 'dapp-staking':
    //       return 'tabs__staking';
    //     default:
    //       return 'tabs__staking';
    //   }
    // };

    const { t } = useI18n();
    const externalLinks = [
      {
        title: t('common.home'),
        href: 'https://astar.network/',
        icon: IconHome,
      },
      {
        title: t('sidenavi.docs'),
        href: 'https://docs.astar.network/',
        icon: IconDocs,
      },
      {
        title: t('sidenavi.forum'),
        href: 'https://forum.astar.network/',
        icon: IconForum,
      },
      {
        title: t('common.ecosystem'),
        href: 'https://astar.network/community/ecosystem/',
        icon: IconEcosystem,
      },
    ];

    const banners = [
      require('/src/assets/img/banner/banner01.svg'),
      require('/src/assets/img/banner/banner02.svg'),
      require('/src/assets/img/banner/banner03.svg'),
    ];

    // The subsocial space where the news updates come from: https://polkaverse.com/10802
    const astarSpace = 10802;
    const items = ref<Data[]>([]);
    const { result, error } = useQuery(gql`
      query PostsBySpaceId {
        posts(where: { space: { id_eq: "${astarSpace}" }, AND: { hidden_not_eq: true } }, orderBy: id_DESC, limit: 1) {
          background: image
          title
          link: slug
        }
      }
    `);

    items.value = linksData.map((item, index) => ({
      background: banners[index],
      title: t(item.title),
      subtitle: t(item.subtitle),
      link: item.link,
    }));

    watch(
      [result, error],
      async () => {
        if (result.value) {
          const item = result.value.posts.map((x: Data) => {
            return {
              background: `https://ipfs.subsocial.network/ipfs/${x.background}`,
              title: '', // x.title,
              link: `https://astar.network/blog/${x.link}`,
            };
          });

          item?.length > 0 && items.value.push(item[0]);
        }
      },
      { immediate: true }
    );

    const goToLink = (link: string): void => {
      window.open(link, '_blank');
    };

    const handleSettingsDrawer = () => {
      showSettings.value = !showSettings.value;
      showCommunity.value = false;
    };

    const handleCommunityDrawer = () => {
      showCommunity.value = !showCommunity.value;
      showSettings.value = false;
    };

    const bg_img = {
      astar_stars: require('/src/assets/img/assets-page-bg-stars.webp'),
    };

    return {
      showCommunity,
      showSettings,
      network,
      // getIndicatorClass,
      path,
      RoutePath,
      externalLinks,
      items,
      bg_img,
      goToLink,
      handleSettingsDrawer,
      handleCommunityDrawer,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './styles/sidebar-mobile.scss';
</style>
