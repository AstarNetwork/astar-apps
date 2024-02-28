<template>
  <div class="dapp">
    <div>{{ index + length }}</div>
    <div class="dapp--button">
      <div class="dapp--image">
        <img :src="require('../../assets/burn.png')" :alt="$t('stakingV3.burn')" />
      </div>
      <div>{{ $t('stakingV3.noEntry') }}</div>
    </div>
    <div class="amount">{{ $t('stakingV3.burn') }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  props: {
    index: {
      type: Number,
      required: true,
    },
    length: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@import './styles/tier.scss';
</style>
