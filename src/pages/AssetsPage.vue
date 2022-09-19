<template>
  <div v-if="currentAccount">
    <!-- Fixme: scroll to top when the app was routed from other page -->
    <router-view id="assets-top" />
  </div>
  <div v-else />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { useAccount } from 'src/hooks';
import { defineComponent } from 'vue';

// <div v-else /> Memo: To avoid not rendering anything when users go to other pages
// Leaving comments on the `template` caused an unknown bug

export default defineComponent({
  setup() {
    useMeta({ title: 'Assets' });
    const { currentAccount } = useAccount();
    return { currentAccount };
  },
  // mounted() {
  // Memo: scrollBehavior in createRouter is not working
  // Memo: scrollTo doesn't work with fixed header
  // scrollTo('assets-top');
  // },
});
</script>
