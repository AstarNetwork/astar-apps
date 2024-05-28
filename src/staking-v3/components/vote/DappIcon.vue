<template>
  <div class="icon">
    <img :src="iconUrl" :alt="altText" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    iconUrl: {
      type: String,
      required: true,
    },
    altText: {
      type: String,
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

.icon {
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1), 0px 0px 2px 0px rgba(0, 0, 0, 0.25) inset;
  background-color: $white;

  img {
    width: 24px;
    height: 24px;
  }
}
</style>
