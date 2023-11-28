<template>
  <div>
    <div class="chunk--row">
      <div>{{ $t('stakingV3.index') }}</div>
      <div>{{ $t('stakingV3.unbondingAmount') }}</div>
      <div>Remaining blocks</div>
      <div class="center">{{ $t('stakingV3.withdraw') }}</div>
    </div>
    <div v-for="(chunk, index) in chunks" :key="index" class="chunk--row">
      <div>{{ $t('stakingV3.chunk') }} {{ index + 1 }}</div>
      <div class="right"><token-balance-native :balance="chunk.amount.toString()" /></div>
      <div class="right">{{ chunk.remainingBlocks }}</div>
      <div class="buttons">
        <astar-button
          :disabled="chunk.remainingBlocks > 0"
          :width="97"
          :height="24"
          @click="withdraw"
          >{{ $t('stakingV3.withdraw') }}</astar-button
        >
        <astar-button
          :disabled="chunk.remainingBlocks <= 0"
          :width="97"
          :height="24"
          @click="relock"
          >{{ $t('stakingV3.relock') }}</astar-button
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useDappStaking } from 'src/staking-v3/hooks';
import { defineComponent, computed } from 'vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import { useStore } from 'src/store';

export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  setup() {
    const store = useStore();
    const { ledger, withdraw, relock } = useDappStaking();
    const chunks = computed(
      () =>
        ledger.value?.unlocking.map((chunk) => {
          return {
            amount: chunk.amount,
            unlockBlock: chunk.unlockBlock,
            remainingBlocks: Math.max(Number(chunk.unlockBlock) - currentBlock.value, 0),
          };
        }) ?? []
    );
    const currentBlock = computed<number>(() => store.getters['general/getCurrentBlock']);

    return { chunks, withdraw, relock };
  },
});
</script>

<style lang="scss" scoped>
// TODO refactor to separate file since the style is shared between MyDapps and Unbonding components.
@import 'src/css/quasar.variables.scss';
.header--row {
  display: flex;
  justify-content: space-between;
}

.chunk--row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 700;
  line-height: normal;

  div {
    flex-basis: 0;
    flex-grow: 1;
    padding: 16px;
  }
}

.center {
  text-align: center;
}

.right {
  text-align: right;
}

.buttons {
  display: flex;
  justify-content: center;
  column-gap: 16px;
}
</style>
