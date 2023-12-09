<template>
  <div>
    <div class="table--wrapper">
      <div class="chunk--row header--row">
        <div>{{ $t('stakingV3.index') }}</div>
        <div>{{ $t('stakingV3.unbondingAmount') }}</div>
        <div class="right">{{ $t('stakingV3.remainingEras') }}</div>
        <div v-if="width >= screenSize.sm" class="center">{{ $t('stakingV3.manage') }}</div>
      </div>
      <div v-for="(chunk, index) in chunks" :key="index" class="chunk--row">
        <div>{{ $t('stakingV3.chunk') }} {{ index + 1 }}</div>
        <div class="right"><token-balance-native :balance="chunk.amount.toString()" /></div>
        <div class="right">
          {{ getRemainingEras(chunk.remainingBlocks) }} / {{ chunk.remainingBlocks }}
        </div>
        <div class="buttons">
          <astar-button :disabled="!canWithdraw" :width="97" :height="28" @click="withdraw">{{
            $t('stakingV3.withdraw')
          }}</astar-button>
          <astar-button :disabled="!canRelock" :width="97" :height="28" @click="relock">{{
            $t('stakingV3.relock')
          }}</astar-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useDappStaking } from 'src/staking-v3/hooks';
import { defineComponent, computed } from 'vue';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import { useStore } from 'src/store';
import { useBreakpoints } from 'src/hooks';

export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  setup() {
    const store = useStore();
    const { ledger, constants, withdraw, relock } = useDappStaking();
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

    const canWithdraw = computed(() => chunks.value.some((chunk) => chunk.remainingBlocks === 0));

    const canRelock = computed(() => chunks.value.length > 0);

    const getRemainingEras = (remainingBlocks: number): number => {
      return constants.value ? Math.ceil(remainingBlocks / constants.value?.standardEraLength) : 0;
    };

    const { width, screenSize } = useBreakpoints();

    return {
      chunks,
      withdraw,
      relock,
      getRemainingEras,
      canWithdraw,
      canRelock,
      width,
      screenSize,
    };
  },
});
</script>

<style lang="scss" scoped>
// TODO refactor to separate file since the style is shared between MyDapps and Unbonding components.
@import 'src/css/quasar.variables.scss';

.table--wrapper {
  background-color: $gray-1;
  padding: 20px 12px;
  border-radius: 16px;
  @media (min-width: $sm) {
    padding: 40px 24px;
  }
}

.chunk--row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  border-bottom: solid 1px $gray-2;
  @media (min-width: $sm) {
    flex-wrap: nowrap;
  }
  div {
    flex-basis: 0;
    flex-grow: 1;
    padding: 16px;
  }
}

.header--row {
  background: rgba(0, 0, 0, 0.03);
  color: $gray-4;
  border: 0;
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
  width: 100%;
  @media (min-width: $sm) {
    width: auto;
  }
}

.body--dark {
  .table--wrapper {
    background-color: $navy-3;
  }
  .header--row {
    color: $gray-2;
    background: rgba(0, 0, 0, 0.15);
  }
  .chunk--row {
    border-color: lighten($navy-3, 10%);
  }
}
</style>
