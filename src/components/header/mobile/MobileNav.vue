<template>
  <div>
    <button
      type="button"
      class="button--mobile-nav"
      :class="showNav && 'active'"
      @click="showNav = !showNav"
    >
      <astar-icon-base class="icon--dot" stroke="currentColor" icon-name="option">
        <astar-icon-3dots />
      </astar-icon-base>
    </button>

    <q-slide-transition :duration="150">
      <div v-show="showNav" class="wrapper--mobile-nav">
        <nav class="links">
          <router-link
            :to="RoutePath.Assets"
            :class="['link', path === 'assets' && 'active-link']"
            @click="showNav = !showNav"
          >
            <div class="column--item">
              <span>{{ $t('sidenavi.myAssets') }}</span>
            </div>
          </router-link>

          <router-link
            v-if="network.isStoreEnabled"
            :to="RoutePath.DappStaking"
            :class="['link', path === 'dapp-staking' && 'active-link']"
            @click="showNav = !showNav"
          >
            <div class="column--item">
              <span class="text--link">
                {{ $t('common.staking') }}
              </span>
            </div>
          </router-link>

          <button
            v-if="isZkatana"
            :disabled="true"
            :class="['link', path === 'dashboard' && 'active-link']"
          >
            <div class="column--item column--item--dashboard">
              <span class="text--link">Data</span>
            </div>
          </button>

          <router-link
            v-else
            :to="RoutePath.Dashboard"
            :class="['link', path === 'dashboard' && 'active-link']"
            @click="showNav = !showNav"
          >
            <div class="column--item column--item--dashboard">
              <span class="text--link">{{ $t('sidenavi.data') }}</span>
            </div>
          </router-link>
        </nav>

        <div class="gradient-bg">
          <astar-domains />
          <blog-posts />
        </div>

        <div class="gradient-bg">
          <community-links />
          <div class="text--settings">{{ $t('sidenavi.settings') }}</div>
          <div class="container--settings">
            <locale-changer />
            <light-dark-mode />
          </div>
        </div>

        <div class="footer--mobile-nav">
          <div>Astar Network © 2023 Built by Astar Foundation</div>
          <div class="footer--mobile-nav__links">
            <a href="https://astar.network/term-of-use" target="_blank" rel="noopener noreferrer">
              {{ $t('disclaimer.terms') }}
            </a>
            <a
              href="https://astar.network/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ $t('disclaimer.privacy') }}
            </a>
          </div>
        </div>
      </div>
    </q-slide-transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useBreakpoints } from 'src/hooks';
import { Path as RoutePath } from 'src/router/routes';
import { useRouter } from 'vue-router';
import { useNetworkInfo } from 'src/hooks';
import { useStore } from 'src/store';
import { providerEndpoints } from 'src/config/chainEndpoints';
import AstarDomains from './AstarDomains.vue';
import CommunityLinks from './CommunityLinks.vue';
import BlogPosts from './BlogPosts.vue';
import LocaleChanger from './LocaleChanger.vue';
import LightDarkMode from './LightDarkMode.vue';

export default defineComponent({
  components: { AstarDomains, CommunityLinks, BlogPosts, LocaleChanger, LightDarkMode },
  setup() {
    const { width, screenSize } = useBreakpoints();
    const showNav = ref<boolean>(false);
    const router = useRouter();
    const path = computed(() => router.currentRoute.value.path.split('/')[2]);
    const { isZkatana } = useNetworkInfo();

    const store = useStore();
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const network = ref(providerEndpoints[currentNetworkIdx.value]);

    return {
      width,
      screenSize,
      showNav,
      path,
      RoutePath,
      network,
      isZkatana,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.button--mobile-nav {
  width: 32px;
  height: 32px;
  color: white;
  border: solid 1px white;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
  overflow-y: auto;
  &.active {
    background-color: $astar-blue;
    border-color: $astar-blue;
  }
}
.icon--dot {
  width: 20px;
  height: 20px;
  stroke: transparent;
}
.wrapper--mobile-nav {
  width: 100vw;
  background-color: $navy-1;
  position: absolute;
  left: 0;
  top: 64px;
  z-index: 1;
  color: $gray-1;
  display: flex;
  flex-direction: column;
  padding-top: 40px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}
.links {
  padding: 0 16px;
  a {
    font-size: 24px;
    font-weight: 800;
    line-height: 64px;
  }
}

.gradient-bg {
  padding: 40px 0;
  background: linear-gradient(176deg, #081029 50%, #1f2f5f 96.8%);
}

.footer--mobile-nav {
  padding: 40px 16px 80px 16px;
  text-align: center;
  font-size: 12px;
  color: $gray-3;
  .footer--mobile-nav__links {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 8px;
    a {
      color: $astar-blue;
    }
  }
}

.text--settings {
  color: $gray-1;
  text-align: center;
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 24px;
}
.container--settings {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 0 16px;
}
</style>
