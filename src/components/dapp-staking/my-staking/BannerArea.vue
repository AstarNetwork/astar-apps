<template>
  <div class="wrapper--cards">
    <developer-incentive />
    <algem />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import DeveloperIncentive from './components/banners/DeveloperIncentive.vue';
import Algem from './components/banners/Algem.vue';
export default defineComponent({
  components: { DeveloperIncentive, Algem },
  setup() {},
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--cards {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 48px;
  margin-bottom: 48px;

  @media (max-width: $sm) {
    display: block;
    width: 100%;
  }
  @media (min-width: $xxl) {
    gap: 24px;
  }
}
</style>
