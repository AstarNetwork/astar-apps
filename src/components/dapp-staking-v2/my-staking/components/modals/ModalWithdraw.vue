<template>
  <astar-default-modal :width="544" :height="381" :show="show" title="Withdraw">
    <div>Your funds are available to withdraw.</div>
    <div class="box container">
      <div>
        <span class="text--md">Ready to withdraw</span>
      </div>
      <div class="text--md">10,000 ASTR</div>
    </div>
    <astar-button width="320" height="42">Confirm</astar-button>
  </astar-default-modal>
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

  div {
    margin: 10px 0px;
  }

  a {
    color: $astar-blue;
  }
}
</style>
