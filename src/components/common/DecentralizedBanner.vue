<template>
  <div v-if="isDecentralized" class="wrapper--decentralized-banner highest-z-index">
    <span class="text--banner">
      {{ $t('common.decentralizedBanner.bannerText') }}
      <a
        href="https://portal.astar.network"
        class="text-highlight"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ $t('common.decentralizedBanner.goToClassicPortal') }}
      </a>
    </span>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import { decentralizedOrigin } from 'src/links';

export default defineComponent({
  setup() {
    const isDecentralized = computed<boolean>(() => {
      return window.location.origin === decentralizedOrigin;
    });

    return {
      isDecentralized,
    };
  },
});
</script>
<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
.wrapper--decentralized-banner {
  background: linear-gradient(
    90.03deg,
    #e6007a 1.48%,
    #703ac2 23.96%,
    #0070eb 49.49%,
    #0297fb 79.1%,
    #0ae2ff 99.98%
  );
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  text-align: center;
  @media (min-width: $md) {
    height: 40px;
  }
}

.text--banner {
  color: $gray-1;
  font-weight: 600;
  font-size: 12px;
  @media (min-width: $sm) {
    font-size: 14px;
  }
}

.text-highlight {
  color: $gray-1;
  font-weight: 600;
  border-bottom: 1px solid $gray-1;
  cursor: pointer;
}
</style>
