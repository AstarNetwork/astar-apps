<template>
  <astar-simple-modal :show="show" :is-close-icon="false" title="Compound">
    <div class="box container">
      <div>
        <span class="text--md">Coumpound.</span>
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

  a {
    color: $astar-blue;
  }
}
</style>
