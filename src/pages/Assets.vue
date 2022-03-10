<template>
  <div>
    <div>
      <span class="title">
        {{ $t('assets.assets') }}
      </span>
    </div>
    <!-- <router-view /> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';

export default defineComponent({
  components: {},
  setup() {
    useMeta({ title: 'Assets' });
  },
});
</script>
<style>
.dark\:tw-bg-blue-500 {
  background-color: rgba(27, 109, 193, 0.1) !important;
}
.checked\:tw-border-blue-500:checked {
  border-color: rgba(27, 109, 193, 1) !important;
}

.title {
  font-family: 'SF Pro';
  font-weight: 600;
  font-size: 26px;
}
</style>
