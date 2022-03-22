<template>
  <div>
    <div class="screen--lg">
      <span class="text--page-title">
        {{ $t('dashboard.dashboard') }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';

export default defineComponent({
  setup() {
    useMeta({ title: 'Dashboard' });
  },
});
</script>