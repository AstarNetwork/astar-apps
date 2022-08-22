<template>
  <Transfer id="top-transfer" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMeta } from 'quasar';
import Transfer from 'src/components/assets/transfer/Transfer.vue';
import { scrollTo } from 'src/hooks/helper/common';

export default defineComponent({
  components: { Transfer },
  setup() {
    useMeta({ title: 'Transfer' });
  },
  mounted() {
    // Memo: scrollBehavior in createRouter is not working
    scrollTo('top-transfer');
  },
});
</script>
