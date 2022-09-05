<template>
  <div class="wrapper--dashboard">
    <dashboard />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import Dashboard from 'src/components/dashboard/Dashboard.vue';

export default defineComponent({
  components: {
    Dashboard,
  },
  setup() {
    useMeta({ title: 'Dashboard' });
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.wrapper--dashboard {
  @media (min-width: $lg) {
    margin-top: 20px;
  }
}
</style>
