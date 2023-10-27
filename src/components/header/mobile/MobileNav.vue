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
        <astar-domains />
        <community-links />
      </div>
    </q-slide-transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useBreakpoints } from 'src/hooks';
import AstarDomains from 'src/components/header/mobile/AstarDomains.vue';
import CommunityLinks from 'src/components/header/mobile/CommunityLinks.vue';

export default defineComponent({
  components: { AstarDomains, CommunityLinks },
  setup() {
    const { width, screenSize } = useBreakpoints();
    const showNav = ref<boolean>(false);
    return {
      width,
      screenSize,
      showNav,
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
  height: calc(100vh - 64px);
  background-color: white;
  position: absolute;
  left: 0;
  top: 64px;
  z-index: 1;
}
</style>
