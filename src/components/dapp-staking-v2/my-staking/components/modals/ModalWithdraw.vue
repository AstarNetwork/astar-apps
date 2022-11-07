<template>
  <astar-default-modal :width="544" :height="381" :show="show" title="Withdraw" @close="close">
    <div class="wrapper">
      <div class="text--guide">{{ $t('myDapps.withdrawGuide') }}</div>
      <div class="box--container">
        <div>
          <span class="text--title">{{ $t('myDapps.withdrawTitle') }}</span>
        </div>
        <div class="text--amount"><format-balance :balance="withdrawAmount" /></div>
      </div>
      <astar-button :width="464" :height="52" @click="confirm">{{ $t('confirm') }}</astar-button>
    </div>
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
    withdrawAmount: {
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
      close();
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
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.text--guide {
  font-weight: 500;
  font-size: 14px;
}
.box--container {
  font-family: 'Inter';
  margin-top: 32px;
  margin-bottom: 32px;
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
