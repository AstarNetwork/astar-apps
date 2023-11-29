<template>
  <img src="~assets/img/astar_logo_v2.svg" class="icon--logo" />
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return {};
  },
});
</script>

<style lang="scss">
@import 'src/css/quasar.variables.scss';

.icon--logo {
  width: 142px;
  height: 40px;
  margin-left: 12px;
  @media (min-width: $lg) {
    margin-top: 12px;
  }
}
</style>
