<template>
  <div class="kpi-wrapper">
    <div class="kpi-title">{{ title }}</div>
    <div class="value-unit">
      <div class="value">{{ value }}</div>
      <div class="unit">{{ unit }}</div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      required: false,
      default: '',
    },
    value: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: false,
      default: '',
    },
  },
});
</script>

<style lang="scss" scoped>
.kpi-wrapper {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;

  @media (min-width: $lg) {
    flex-direction: column;
  }
}

.kpi-title {
  font-weight: 700;
}

.value-unit {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 8px;

  background: var(--Linear, linear-gradient(90deg, #0047ff 0%, #00d4ff 97.65%));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.value {
  font-size: 40px;
  font-weight: 800;
  line-height: 40px;
  line-break: anywhere;
}

.unit {
  font-size: 24px;
  font-weight: 500;
  line-height: normal;
}
</style>
