<template>
  <div class="tw-space-y-8">
    <div class="completed">
      <p class="emoji">🍾</p>
      <p>
        Congrats!!<br />
        Your account is unified!
      </p>
      <p>No need EVM deposit anymore!</p>
    </div>

    <!-- Action -->
    <div>
      <!-- TODO: please add a function to close modal -->
      <astar-button class="btn close">Close</astar-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

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
