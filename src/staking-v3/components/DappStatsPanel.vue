<template>
  <div class="panel-wrapper">
    <div class="panel-title">{{ title }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export type PanelData = {
  name: string;
  iconUrl: string;
  amount: bigint;
};

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true,
    },
    data: {
      type: Array as PropType<PanelData[]>,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>

<style scoped lang="scss">
@import 'src/css/quasar.variables.scss';

.panel-wrapper {
  border-radius: 16px;
  background: rgba(8, 16, 41, 0.3);
  padding: 16px;
}

.panel-title {
  color: $white;
  font-size: 24px;
  font-weight: 700;
  line-height: normal;
}
</style>
