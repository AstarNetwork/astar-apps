<template>
  <astar-simple-modal :show="show" :is-close-icon="true" title="Add Automation Fee">
    <div>
      <div class="mb-20">{{ $t('dappStaking.upfrontFee') }}</div>
      <div class="box container">
        <div>
          <span class="text--md">Fee</span>
        </div>
        <div class="mt-20">
          <span class="text--title">0.2 ASTAR</span>
        </div>
      </div>
      <div class="tw-text-center">
        <button class="btn btn--confirm mt-20" @click="confirm">
          {{ $t('confirm') }}
        </button>
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

.mb-20 {
  margin-bottom: 20px;
}
.mt-20 {
  margin-top: 20px;
}
</style>
