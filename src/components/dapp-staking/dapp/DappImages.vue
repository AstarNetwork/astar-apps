<template>
  <div v-if="images.length > 0" class="wrapper--dapp-images">
    <q-carousel v-model="slide" animated arrows navigation infinite class="box--carousel">
      <q-carousel-slide
        v-for="(image, index) in images"
        :key="index"
        class="dapp-image"
        :name="index"
        :img-src="image"
      />
    </q-carousel>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
export default defineComponent({
  props: {
    dapp: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const slide = ref<number>(0);
    const images = computed<string[]>(() => {
      if (props.dapp && props.dapp.dapp.imagesUrl.length > 0) {
        return props.dapp.dapp.imagesUrl;
      } else {
        return [];
      }
    });
    return { slide, images };
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/dapp-staking/dapp/styles/dapp-images.scss';
</style>
