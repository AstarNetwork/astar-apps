<template>
  <div class="table--wrapper">
    <div class="row--header">
      <div class="column column--index">{{ $t('stakingV3.index') }}</div>
      <div class="column column--amount">{{ $t('stakingV3.unbondingAmount') }}</div>
      <div class="column column--remaining-days">{{ $t('stakingV3.remainingEras') }}</div>
    </div>
    <div v-for="(chunk, index) in chunks" :key="index" class="row">
      <div class="column column--index">{{ $t('stakingV3.chunk') }} {{ index + 1 }}</div>
      <div class="column column--amount">
        <token-balance-native :balance="chunk.amount.toString()" />
      </div>
      <div class="column column--remaining-days">
        <span v-if="chunk.remainingBlocks > 0" class="text--remaining-days">
          {{ getRemainingEras(chunk.remainingBlocks) }} / {{ chunk.remainingBlocks }}
        </span>
        <span v-else class="icon--check">
          <!-- TODO: move to AstarUI -->
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.54988 15.5154L18.1884 6.87692C18.3371 6.72821 18.5137 6.65224 18.7182 6.64902C18.9226 6.64582 19.1024 6.72179 19.2576 6.87692C19.4127 7.03204 19.4903 7.21024 19.4903 7.41152C19.4903 7.61279 19.4127 7.79099 19.2576 7.94612L10.1826 17.0211C10.0018 17.2019 9.7909 17.2922 9.54988 17.2922C9.30887 17.2922 9.09798 17.2019 8.91721 17.0211L4.74221 12.8461C4.59349 12.6974 4.52009 12.5208 4.52201 12.3163C4.52394 12.1118 4.60247 11.932 4.75758 11.7769C4.91272 11.6218 5.09092 11.5442 5.29218 11.5442C5.49347 11.5442 5.67167 11.6218 5.82678 11.7769L9.54988 15.5154Z"
              fill="currentColor"
            />
          </svg>
        </span>
      </div>
    </div>

    <div class="row--actions">
      <div class="row">
        <div class="column">{{ $t('stakingV3.availableToWithdraw') }}</div>
        <!-- TODO: dynamic data -->
        <div class="column column--amount">-- {{ nativeTokenSymbol }}</div>
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
        <!-- TODO: dynamic data -->
        <div class="column column--amount">-- ASTR</div>
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

export default defineComponent({
  components: {
    TokenBalanceNative,
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

    const getRemainingEras = (remainingBlocks: number): number => {
      return eraLengths.value
        ? Math.ceil(remainingBlocks / eraLengths.value?.standardEraLength)
        : 0;
    };

    const { width, screenSize } = useBreakpoints();

    const { nativeTokenSymbol } = useNetworkInfo();

    return {
      chunks,
      withdraw,
      relock,
      getRemainingEras,
      canWithdraw,
      canRelock,
      width,
      screenSize,
      nativeTokenSymbol,
    };
  },
});
</script>

<style lang="scss" scoped>
@use './styles/staking-table.scss';

.row--action {
  background-color: white;
}
</style>
