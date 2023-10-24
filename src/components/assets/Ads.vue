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
  </div>
</template>
<script lang="ts">
import { Url } from 'url';
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  components: {},
  setup() {
    const { t } = useI18n();
    const bg_img = {
      zkevm: require('/src/assets/img/zkevm_text_bg.webp'),
    };
    return { bg_img };
  },
});
</script>
<style lang="scss" scoped>
.wrapper--ads {
}
.astar-zkevm {
  display: flex;
  flex-direction: column;
  justify-content: end;
  font-size: 30px;
  font-weight: 800;
  height: 284px;
  padding: 24px;
  border-radius: 30px;
  line-height: 1.3;
  color: white;
  background: linear-gradient(180deg, #703ac2 26.04%, #226dff 100%);
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  span {
    display: block;
    width: 180px;
  }
  &:hover {
    opacity: 0.8;
  }
}
</style>
