<template>
  <div>
    <div class="header">
      <div class="tabs">
        <router-link
          to="/dashboard"
          :class="['link', $route.path.split('/')[1] === 'dashboard' ? 'activeLink' : '']"
        >
          <div class="indicator" />
          <div class="col--item">
            {{ $t('dashboard.dashboard') }}
          </div>
        </router-link>

        <router-link
          to="/assets"
          :class="['link', $route.path.split('/')[1] === 'assets' ? 'activeLink' : '']"
        >
          <div class="indicator" />
          <div class="col--item">
            {{ $t('assets.assets') }}
          </div>
        </router-link>

        <router-link
          v-if="network.isStoreEnabled"
          to="/dapp-staking"
          :class="['link', $route.path.split('/')[1] === 'dapp-staking' ? 'activeLink' : '']"
        >
          <div class="indicator" />
          <div class="col--item">
            {{ $t('common.staking') }}
          </div>
        </router-link>
      </div>

      <button type="button" class="button--option" @click="showOption = !showOption">
        <icon-base class="tw-w-5 tw-h-5" stroke="currentColor" icon-name="option">
          <icon-3dots />
        </icon-base>
      </button>
    </div>

    <div v-if="showOption" class="wrapper--bottom">
      <SocialMediaLinks />
      <div class="wrapper--option">
        <LightDarkMode />
        <LocaleChanger />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useStore } from 'src/store';
import { providerEndpoints } from 'src/config/chainEndpoints';
import Icon3dots from 'components/icons/Icon3dots.vue';
import LocaleChanger from '../common/LocaleChanger.vue';
import SocialMediaLinks from '../common/SocialMediaLinks.vue';
import LightDarkMode from '../common/LightDarkMode.vue';
export default defineComponent({
  components: {
    Icon3dots,
    LocaleChanger,
    SocialMediaLinks,
    LightDarkMode,
  },
  setup() {
    const store = useStore();
    const currentNetworkIdx = computed(() => store.getters['general/networkIdx']);
    const network = ref(providerEndpoints[currentNetworkIdx.value]);
    const showOption = ref(false);

    return {
      showOption,
      network,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.header {
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  height: 40px;
  background: $gray-1;
  opacity: 0.8;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.1);
  border-top: 1px solid #e6e9ee;
  border-bottom: 1px solid #e6e9ee;
}

.tabs {
  display: flex;
  padding-left: 3px;
}

.link {
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  text-align: center;
  color: $gray-3;
  padding: 12px;
}

.activeLink {
  font-weight: 700;
  color: $gray-5;

  .indicator {
    position: absolute;
    // top: 0px;
    margin-bottom: 35px;
    margin-left: 4px;
    background: $astar-blue;
    border-radius: 0px 0px 8px 8px;
    width: 36px;
    height: 4px;
  }
}

.button--option {
  width: 32px;
  height: 32px;
  color: $gray-3;
  border-radius: 16px;
  margin-top: 4px;
  margin-right: rem(16);
  padding-left: 4px;
}

.wrapper--bottom {
  flex-shrink: 0;
  padding: rem(16);
  background: $gray-1;
  color: $gray-4;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(50px);
  border-top: 1px solid $gray-4;

  .wrapper--option {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding-left: rem(28.8);
    padding-right: rem(28.8);
    padding-top: rem(4.8);
  }
}

.body--dark {
  .header {
    background: $gray-5 !important;
    border-top: none;
    border-bottom: 1px solid $gray-4;
  }

  .activeLink {
    color: $gray-1;
  }

  .button--option {
    color: #fff;
    background: $gray-5;
  }

  .wrapper--bottom {
    background: rgba(44, 51, 53, 0.8);
  }
}
</style>
