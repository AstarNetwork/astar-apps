<template>
  <div>
    <div class="size-lg">
      <span class="title">
        {{ $t('assets.assets') }}
      </span>
    </div>
    <Assets />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import Assets from 'src/components/assets/Assets.vue';

export default defineComponent({
  components: { Assets },
  setup() {
    useMeta({ title: 'Assets' });
  },
});
</script>

<style lang="scss" scoped>
@import 'src/components/assets/styles/assets.scss';

.dark\:tw-bg-blue-500 {
  background-color: rgba(27, 109, 193, 0.1) !important;
}
.checked\:tw-border-blue-500:checked {
  border-color: rgba(27, 109, 193, 1) !important;
}
</style>
