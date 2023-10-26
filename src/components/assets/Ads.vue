<template>
  <div class="wrapper--ads">
    <a
      class="astar-zkevm"
      href="https://astar.network/blog/astar-zkevm-testnet-is-now-live-39560"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span
        :style="{
          background: `url(${bg_img.zkevm})`,
          backgroundSize: 'cover',
          webkitBackgroundClip: 'text',
          webkitTextFillColor: 'transparent',
        }"
        >Astar zkEVM is Coming</span
      >
    </a>
    <a class="new-partner" href="#" target="_blank" rel="noopener noreferrer">
      <span class="new-partner__top">New Partner</span>
      <span>
        <span class="new-partner__title">Gridlock</span>
        <span class="new-partner__subtitle">The innovative wallet</span>
      </span>
    </a>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  setup() {
    const bg_img = {
      zkevm: require('/src/assets/img/zkevm_text_bg.webp'),
    };
    return { bg_img };
  },
});
</script>
<style lang="scss" scoped>
.wrapper--ads {
  display: flex;
  flex-direction: column;
  gap: 40px;
  a {
    box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
    &:hover {
      opacity: 0.8;
    }
  }
}
.astar-zkevm {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  font-size: 30px;
  font-weight: 800;
  height: 284px;
  padding: 24px;
  border-radius: 16px;
  line-height: 1.3;
  color: white;
  background: linear-gradient(180deg, #703ac2 26.04%, #226dff 100%);
  span {
    display: block;
    width: 180px;
  }
}
.new-partner {
  height: 175px;
  padding: 24px;
  border-radius: 16px;
  line-height: 1.3;
  color: white;
  background: linear-gradient(180deg, #3e1978 26.04%, #083fa8 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  span {
    display: block;
  }
  .new-partner__top {
    font-size: 16px;
    font-weight: 700;
  }
  .new-partner__title {
    font-size: 32px;
    font-weight: 700;
  }
  .new-partner__subtitle {
    font-size: 14px;
    font-weight: 700;
  }
}
</style>
