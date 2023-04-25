<template>
  <div class="header">
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
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HeaderComp',
  props: {
    title: {
      type: String,
      default: '',
    },
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.header {
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  background: rgba(247, 247, 248, 0.8);
  mix-blend-mode: normal;
  backdrop-filter: blur(200px);
  height: 4rem;
  padding-left: 16px;
  padding-right: 16px;
  border-bottom: 1px solid transparent !important;
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
    background: #fff;
  }
}

.header-left {
  display: flex;
  height: 100%;
  align-items: center;
  font-weight: 590;
  font-size: 1.625rem;
  color: $navy-1;
  padding: 0rem;
}

.header-right {
  display: flex;
  height: 100%;
  align-items: center;
  padding: 0rem;
}

.body--dark {
  .header {
    background: rgba(8, 15, 46, 0.4);
    backdrop-filter: blur(200px);
    border-bottom: 1px solid !important;
    border-image: linear-gradient(
      90deg,
      #e6007a -4%,
      #e6007a -3.88%,
      #703ac2 17.01%,
      #0070eb 42.25%,
      #0297fb 73.9%,
      #0ae2ff 97.42%
    );
    border-image-slice: 1;
  }
  .header-left {
    color: $gray-1;
    @media (min-width: $lg) {
      padding: 0px;
    }
  }
}
</style>
