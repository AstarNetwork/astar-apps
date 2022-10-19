<template>
  <astar-default-modal :width="544" :height="402" :show="show" title="Re-bond" @close="close">
    <div class="text--guide">
      Once re-bond your funds goes back to staking. You will need 10era to unstake again.
    </div>
    <div class="box container">
      <div>
        <span class="text--title">The amount you wish to rebond</span>
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
