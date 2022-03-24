<template>
  <div>
    <div class="screen--lg">
      <span class="text--page-title">
        {{ $t('assets.assets') }}
      </span>
    </div>
    <Assets />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import { useStore } from 'src/store';
import Assets from 'src/components/assets/Assets.vue';

export default defineComponent({
  components: { Assets },
  setup() {
    useMeta({ title: 'Assets' });

    const store = useStore();
    store.commit('general/setHeaderName', 'Assets');
  },
});
</script>
