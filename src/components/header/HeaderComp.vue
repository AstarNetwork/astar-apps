<template>
  <div
    class="header"
    :class="`${isDecentralized && 'margin--decentralized'} header__border-${network}`"
  >
    <div class="header-left">
      <div v-if="title">{{ title }}</div>
      <div v-else>
        <slot name="left"></slot>
      </div>
    </div>
    <div class="header-right">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { decentralizedOrigin } from 'src/links';

export default defineComponent({
  name: 'HeaderComp',
  props: {
    title: {
      type: String,
      default: '',
    },
    network: {
      type: Number,
      default: 0,
    },
  },
  setup() {
    const isDecentralized = computed<boolean>(() => {
      return window.location.origin === decentralizedOrigin;
    });

    return { isDecentralized };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.margin--decentralized {
  @media (min-width: $lg) {
    margin-top: 40px;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  background: $navy-1;
  mix-blend-mode: normal;
  backdrop-filter: blur(200px);
  height: 4rem;
  padding-left: 16px;
  padding-right: 16px;
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(
    121.48deg,
    #e6007a -5.77%,
    #703ac2 13.57%,
    #0070eb 34.18%,
    #0297fb 58.08%,
    #0ae2ff 74.93%
  );
  border-image-slice: 1;
  @media (min-width: $lg) {
    padding: 40px 40px 25px 40px;
    height: 6rem;
  }

  // astar native
  &.header__border-0 {
    border-image: linear-gradient(270deg, #e6007a 25%, #ff9dd1 100%);
    border-image-slice: 1;
  }

  // shiden
  &.header__border-1 {
    border-image: linear-gradient(270deg, #5928b1 25%, #b092ea 100%);
    border-image-slice: 1;
  }

  // shibuya
  &.header__border-2 {
    border-image: linear-gradient(270deg, #6c6c6c 25%, #b7b7b7 100%);
    border-image-slice: 1;
  }

  // zKatana
  &.header__border-4 {
    border-image: linear-gradient(270deg, #703ac2 25%, #226dff 100%);
    border-image-slice: 1;
  }
}

.header-left {
  display: flex;
  height: 100%;
  align-items: center;
  font-weight: 590;
  font-size: 1.625rem;
  color: white;
  padding: 0rem;
}

.header-right {
  display: flex;
  height: 100%;
  align-items: center;
  padding: 0rem;
  gap: 8px;
}
</style>
