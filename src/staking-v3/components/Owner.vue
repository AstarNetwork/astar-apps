<template>
  <div class="wrapper--owner">
    <span>This is Owner page</span>
    <div v-if="dappAddress">
      <p>{{ dappAddress }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  components: {},
  // Todo: redirect to discover page if the connected account is not the owner
  setup() {
    const route = useRoute();
    const dappAddress = computed<string>(() => route.query.dapp as string);
    return { dappAddress };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/owner.scss';
</style>
