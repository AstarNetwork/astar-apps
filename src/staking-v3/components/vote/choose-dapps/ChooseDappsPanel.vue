<template>
  <div>
    <dapps-filter />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import DappsFilter from './DappsFilter.vue';

export default defineComponent({
  components: { DappsFilter },
  setup() {
    return {};
  },
});
</script>
