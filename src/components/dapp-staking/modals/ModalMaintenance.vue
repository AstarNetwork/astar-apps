<template>
  <astar-simple-modal :show="show" title="Maintenance Mode">
    <div class="box container">
      <div>
        <span class="text--md">Dapps Staking Page Is Currently Under Maintenance.</span>
      </div>
      <div>
        <span class="text--md">We expect to be back soon!</span>
      </div>
      <div class="text--md">
        While you are waiting you can check your <a href="#/assets/">assets</a>.
      </div>
    </div>
  </astar-simple-modal>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  setup() {},
});
</script>

<style lang="scss" scoped>
.container {
  margin-top: 20px;
  padding: 30px;

  div {
    margin: 10px 0px;
  }
}
</style>