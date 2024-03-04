<template>
  <div>
    <!-- Memo: add this line later -->
    <!-- <a href="https://yoki.astar.network/" target="_blank" rel="noopener noreferrer" class="banner"> -->
    <div class="banner">
      <span>
        <span class="text--ledger-users">{{ $t('warning.yoki') }}</span>
        <span>
          {{ $t('warning.yokiSignUp') }}
        </span>
      </span>
      <astar-icon-arrow-right />
      <!-- </a> -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { endpointKey } from 'src/config/chainEndpoints';

export default defineComponent({
  setup() {
    return { endpointKey };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.banner {
  color: $gray-2;
  font-weight: 600;
  padding: 4px 8px 8px 8px;
  font-size: 12px;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  @media (min-width: $sm) {
    font-size: 14px;
    padding: 4px 16px 8px 16px;
  }

  &.banner {
    background: linear-gradient(90deg, #0047ff 0%, #00d4ff 98%);
  }
}

a.banner {
  transition: all 0.2s ease;
  &:hover {
    filter: brightness(1.1);
  }
}

.text--ledger-users {
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 4px;
  border: 1px solid $gray-2;
  margin-right: 4px;
  @media (min-width: $sm) {
    margin-right: 8px;
  }
}
</style>
