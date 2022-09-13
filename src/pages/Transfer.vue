<template>
  <Transfer />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import Transfer from 'src/components/assets/transfer/Transfer.vue';

export default defineComponent({
  components: { Transfer },
  setup() {
    useMeta({ title: 'Transfer' });
  },
});
</script>
