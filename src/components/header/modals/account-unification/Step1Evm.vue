<template>
  <div class="tw-space-y-6">
    <div class="tw-font-bold tw-text-left">😎 I HAVE an Astar Native account</div>
    <div>
      <!-- TODO: please add a function to open a select wallet modal -->
      <astar-button class="btn">Select a wallet</astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  components: {},

  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
@use 'src/components/header/styles/modal-account-unification.scss';
</style>
