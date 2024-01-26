<template>
  <div class="table--wrapper">
    <div class="row--header">
      <div class="column column--index">{{ $t('stakingV3.index') }}</div>
      <div class="column column--amount">{{ $t('stakingV3.unlockingAmount') }}</div>
      <div class="column column--remaining-days">{{ $t('stakingV3.remainingDays') }}</div>
    </div>
    <div v-for="(chunk, index) in chunks" :key="index" class="row">
      <div class="column column--index">{{ $t('stakingV3.chunk') }} {{ index + 1 }}</div>
      <div class="column column--amount">
        <token-balance-native :balance="chunk.amount.toString()" />
      </div>
      <div class="column column--remaining-days">
        <remaining-days
          v-if="chunk.remainingBlocks > 0"
          :remaining-blocks="chunk.remainingBlocks"
          :remaining-eras="getRemainingEras(chunk.remainingBlocks)"
        />
        <span v-else class="icon--check">
          <astar-icon-check />
        </span>
      </div>
    </div>

    <div class="row--actions">
      <div class="row">
        <div class="column">{{ $t('stakingV3.availableToWithdraw') }}</div>
        <div class="column column--amount">
          <token-balance-native :balance="totalToWithdraw.toString()" />
        </div>
        <div class="column column--actions">
          <div>
            <button type="button" class="btn btn--icon" :disabled="!canWithdraw" @click="withdraw">
              <astar-icon-arrow-right />
            </button>
            <q-tooltip>
              <span class="text--tooltip">
                {{ $t('stakingV3.withdraw') }}
              </span>
            </q-tooltip>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="column">{{ $t('stakingV3.relock') }}</div>
        <div class="column column--amount">
          <token-balance-native :balance="totalToRelock.toString()" />
        </div>
        <div class="column column--actions">
          <div>
            <button type="button" class="btn btn--icon" :disabled="!canRelock" @click="relock">
              <astar-icon-arrow-right />
            </button>
            <q-tooltip>
              <span class="text--tooltip">
                {{ $t('stakingV3.relock') }}
              </span>
            </q-tooltip>
          </div>
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
import { useBreakpoints, useNetworkInfo } from 'src/hooks';
import RemainingDays from 'src/staking-v3/components/my-staking/RemainingDays.vue';

export default defineComponent({
  components: {
    TokenBalanceNative,
    RemainingDays,
  },
  setup() {
    const store = useStore();
    const { ledger, eraLengths, withdraw, relock } = useDappStaking();
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

    const totalToWithdraw = computed<bigint>(() =>
      chunks.value
        .filter((x) => x.remainingBlocks === 0)
        .reduce((acc, chunk) => acc + chunk.amount, BigInt(0))
    );

    const totalToRelock = computed<bigint>(() =>
      chunks.value.reduce((acc, chunk) => acc + chunk.amount, BigInt(0))
    );

    const getRemainingEras = (remainingBlocks: number): number => {
      return eraLengths.value
        ? Math.ceil(remainingBlocks / eraLengths.value?.standardEraLength)
        : 0;
    };

    return {
      chunks,
      withdraw,
      relock,
      getRemainingEras,
      canWithdraw,
      canRelock,
      totalToWithdraw,
      totalToRelock,
    };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/staking-table.scss';

.row--action {
  background-color: white;
}

.column--remaining-days {
  display: flex;
  align-items: center;
}
</style>
