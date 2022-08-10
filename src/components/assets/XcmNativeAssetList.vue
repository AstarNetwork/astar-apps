<template>
  <div>
    <div class="container">
      <div class="row">
        <span class="text--title">{{ $t('assets.xcmAssets') }}</span>
      </div>

      <div v-for="t in xcmAssets" :key="t.id">
        <XcmCurrency :token="t" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Asset } from 'src/v2/models';
import { defineComponent, PropType } from 'vue';
import XcmCurrency from './XcmCurrency.vue';
export default defineComponent({
  components: {
    XcmCurrency,
  },
  props: {
    xcmAssets: {
      type: Array as PropType<Asset[]>,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/assets/styles/asset-list.scss';
</style>
