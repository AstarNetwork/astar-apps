<template>
  <div>
    <span>hello</span>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    // handleSelectGas: {
    //   type: Function,
    //   required: true,
    // },
    // gasPrice: {
    //   type: Object,
    //   required: true,
    // },
  },
  setup(props) {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/common/styles/speed-meter.scss';
</style>
