<template>
  <div v-if="isLedger && hasLockedTokens" class="wrapper--migration-support">
    <div class="wrapper--migration-support__inter">
      <div class="row--header">
        {{ $t('stakingV3.migrationSupport.actionRequired') }}
      </div>
      <div class="row--body">
        <div class="text">
          {{ $t('stakingV3.migrationSupport.yourTokensAreLocked') }}
          (<a :href="docsUrl.faqLedger" target="_blank"> {{ $t('stakingV3.moreInfo') }}</a
          >)
        </div>
        <div class="row--locked-tokens">
          <div>{{ $t('stakingV3.lockedAmount') }}</div>
          <token-balance-native :balance="availableToUnlock.toString()" />
          <div class="column--migrate">
            <button type="button" class="button--migrate" @click="unlock(availableToUnlock)">
              {{ $t('stakingV3.unlock') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useLedger } from 'src/hooks';
import { useDappStaking } from 'src/staking-v3/hooks';
import TokenBalanceNative from 'src/components/common/TokenBalanceNative.vue';
import { docsUrl } from 'src/links';

export default defineComponent({
  components: {
    TokenBalanceNative,
  },
  setup() {
    const { isLedger } = useLedger();
    const { ledger, totalStake, unlock } = useDappStaking();
    const hasLockedTokens = computed<Boolean>(
      () => (ledger.value?.locked ?? BigInt(0)) > BigInt(0)
    );
    const availableToUnlock = computed<bigint>(
      () => (ledger.value?.locked ?? BigInt(0)) - totalStake.value
    );

    return { isLedger, hasLockedTokens, availableToUnlock, docsUrl, unlock };
  },
});
</script>

<style lang="scss" scoped>
.wrapper--migration-support {
  border-radius: 16px;
  background: linear-gradient(270deg, rgba(#fc008f, 41%), #e6007a 100%);
  padding: 1px;
  overflow: hidden;
  margin-bottom: 24px;
}

.wrapper--migration-support__inter {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
}

.row--header {
  background: linear-gradient(270deg, rgba(#fc008f, 41%) 26.04%, #e6007a 100%);
  padding: 16px;
  color: white;
  font-weight: 700;
}

.row--body {
  gap: 24px;
  padding: 24px 16px;
  background: linear-gradient(270deg, rgba(255, 148, 205, 0.1) 26.04%, rgba(230, 0, 122, 0.1) 100%);
  display: flex;
  flex-direction: column;
  align-self: stretch;
}

.text {
  color: $navy-4;
}

.row--locked-tokens {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: $navy-1;
  font-weight: 600;
  @media (min-width: $md) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
}

.column--migrate {
  align-self: center;
  margin-top: 12px;
  @media (min-width: $md) {
    margin-top: 0;
  }
}

.button--migrate {
  width: 240px;
  padding: 8px;
  border-radius: 9999px;
  background: linear-gradient(270deg, rgba(#fc008f, 41%) 26.04%, #e6007a 100%);
  font-weight: 700;
  color: white;
  transition: all 0.2s ease;
  &:hover {
    filter: brightness(1.2);
  }
}

.body--dark {
  .wrapper--migration-support__inter {
    background-color: $navy-1;
  }
  .text {
    color: $gray-2;
  }
  .row--locked-tokens {
    color: $gray-1;
  }
}
</style>
