<template>
  <astar-default-modal
    :width="544"
    :height="393"
    :show="show"
    title="Stake on Astar Degens"
    @close="close"
  >
    <div class="box container">Add</div>
    <astar-button width="464" height="37">Stake</astar-button>
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
  setup(props, { emit }) {
    const close = () => {
      emit('update:is-open', false);
    };

    return {
      close,
    };
  },
});
</script>

<style lang="scss" scoped>
.text--guide {
  font-weight: 500;
  font-size: 14px;
}
.container {
  font-family: 'Inter';
  margin-top: 20px;
  margin-bottom: 16px;
  color: $gray-1;
  text-align: center;
  padding: 16px;

  .text--title {
    font-weight: 600;
    font-size: 14px;
  }
  .text--amount {
    font-weight: 600;
    font-size: 22px;
    margin-top: 16px;
  }
}
</style>
