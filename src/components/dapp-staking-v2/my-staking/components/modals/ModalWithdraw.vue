<template>
  <astar-default-modal :width="544" :height="381" :show="show" title="Withdraw" @close="close">
    <div class="text--guide">Your funds are available to withdraw.</div>
    <div class="box container">
      <div>
        <span class="text--title">Ready to withdraw</span>
      </div>
      <div class="text--amount">10,000 ASTR</div>
    </div>
    <astar-button :width="464" :height="52">Confirm</astar-button>
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
  margin-top: 32px;
  margin-bottom: 32px;
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
