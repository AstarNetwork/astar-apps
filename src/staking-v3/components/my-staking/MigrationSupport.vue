<template>
  <div class="wrapper--migration-support">
    <div class="wrapper--migration-support__inter">
      <div class="row--header">
        {{ $t('dappStaking.migrationSupport.actionRequired') }}
      </div>
      <div class="row--body">
        <div class="text">
          {{ $t('dappStaking.migrationSupport.yourTokensAreLocked') }}
        </div>
        <div class="row--locked-tokens">
          <div>{{ $t('dappStaking.migrationSupport.balanceFromV2') }}</div>
          <div>-- ASTR</div>
          <div class="column--migrate">
            <button type="button" class="button--migrate">
              {{ $t('dappStaking.migrationSupport.migrateNow') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {},
  setup() {
    return {};
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
