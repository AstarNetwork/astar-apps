<template>
  <div>
    <a
      v-if="network !== endpointKey.SHIBUYA"
      href="https://docs.astar.network/docs/learn/dapp-staking/dapp-staking-faq/#q-i-am-a-leger-astar-native-app-user-what-do-i-need-to-do"
      target="_blank"
      rel="noopener noreferrer"
      class="banner"
      :class="`banner--${network}`"
    >
      <span>
        <span class="text--ledger-users">{{ $t('warning.ledgerUsers') }}</span>
        {{ $t('warning.ledgerUsersImportantInformation') }}
      </span>
      <astar-icon-arrow-right />
    </a>
    <div v-else class="banner" :class="`banner--${network}`">
      {{ $t('warning.underDevelopmentShibuyaWarning') }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { endpointKey } from 'src/config/chainEndpoints';

export default defineComponent({
  props: {
    network: {
      type: Number,
      default: 0,
    },
  },
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

  // shibuya, zkyoto, local
  background: linear-gradient(90deg, #6c6c6c 25%, #b7b7b7 100%);

  // astar native
  &.banner--0 {
    background: linear-gradient(90deg, #e6007a 25%, #ff9dd1 100%);
  }

  // shiden
  &.banner--1 {
    background: linear-gradient(90deg, #5928b1 25%, #b092ea 100%);
  }

  // zkEVM
  &.banner--3 {
    background: linear-gradient(90deg, #703ac2 25%, #226dff 100%);
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
