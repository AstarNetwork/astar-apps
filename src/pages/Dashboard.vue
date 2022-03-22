<template>
  <div>
    <div class="screen--lg">
      <span class="text--page-title">
        {{ $t('dashboard.dashboard') }}
      </span>
    </div>
    <chart-panel title="Total Value Locked" default-value="$672.88milion" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import ChartPanel from 'src/components/dashboard/ChartPanel.vue';

export default defineComponent({
  components: {
    ChartPanel,
  },
  setup() {
    useMeta({ title: 'Dashboard' });
  },
});
</script>