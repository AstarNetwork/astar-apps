<template>
  <astar-default-modal :width="544" :height="402" :show="show" title="Re-bond" @close="close">
    <div class="text--guide">
      {{ $t('myDapps.rebondGuide') }}
    </div>
    <div class="box--container">
      <div>
        <span class="text--title">{{ $t('myDapps.rebondTitle') }}</span>
      </div>
      <div class="text--amount"><format-balance :balance="rebondAmount" /></div>
    </div>
    <astar-button :width="464" :height="52" @click="confirm">{{ $t('confirm') }}</astar-button>
  </astar-default-modal>
</template>

<script>
import { defineComponent } from 'vue';
import FormatBalance from 'components/common/FormatBalance.vue';

export default defineComponent({
  components: { FormatBalance },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    rebondAmount: {
      type: String,
      default: null,
    },
  },
  emits: ['update:is-open', 'confirm'],
  setup(props, { emit }) {
    const close = () => {
      emit('update:is-open', false);
    };

    const confirm = () => {
      emit('confirm');
    };

    return {
      close,
      confirm,
    };
  },
});
</script>

<style lang="scss" scoped>
.text--guide {
  font-weight: 500;
  font-size: 14px;
}
.box--container {
  font-family: 'Inter';
  margin-top: 20px;
  margin-bottom: 16px;
  color: $gray-1;
  text-align: center;
  padding: 16px;
  background: $gray-1;
  border-radius: 6px;

  .text--title {
    font-weight: 600;
    font-size: 14px;
  }
  .text--amount {
    font-weight: 600;
    font-size: 22px;
    margin-top: 16px;
    color: $gray-5-selected;
  }
}

.body--dark {
  .box--container {
    background: $gray-7;
    .text--amount {
      color: $gray-1;
    }
  }
}
</style>
