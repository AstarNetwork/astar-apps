<template>
  <div v-if="currentAccount">
    <!-- Fixme: scroll to top when the app was routed from other page -->
    <router-view id="assets-top" />
  </div>
  <div v-else />
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { meta } from 'src/config/metadata';
import { useAccount } from 'src/hooks';
import { defineComponent } from 'vue';

// <div v-else /> Memo: To avoid not rendering anything when users go to other pages
// Leaving comments on the `template` caused an unknown bug

export default defineComponent({
  setup() {
    useMeta({
      title: meta.title.assets.assets,
      meta: {
        description: {
          name: 'description',
          content: meta.description.assets,
        },
      },
    });
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
<style lang="scss" scoped>
#assets-top {
  @media (min-width: $lg) {
    margin-top: 50px;
  }
}
</style>
