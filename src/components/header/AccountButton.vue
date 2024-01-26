<template>
  <div>
    <button type="button" class="btn--account" data-testid="btn-account">
      <img
        v-if="width >= screenSize.sm"
        class="icon"
        width="24"
        :src="iconWallet"
        :class="multisig && 'img--polkasafe'"
      />
      <span>
        {{ getShortenAddress(account, 4) }}
      </span>
    </button>
  </div>
</template>

<script lang="ts">
import { useBreakpoints, useWalletIcon, useAccount } from 'src/hooks';
import { getShortenAddress } from '@astar-network/astar-sdk-core';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    account: {
      type: String,
      required: true,
    },
  },
  setup() {
    const { width, screenSize } = useBreakpoints();
    const { iconWallet } = useWalletIcon();
    const { multisig } = useAccount();

    return {
      width,
      screenSize,
      iconWallet,
      multisig,
      getShortenAddress,
    };
  },
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';
@import 'src/css/utils.scss';

.btn--account {
  display: flex;
  align-items: center;
  height: 32px;
  color: white;
  gap: 8px;
  font-weight: 600;
  font-size: 12px;
  border-radius: 20px;
  transition: all 0.2s ease;
  border: solid 1px transparent;
  &:hover {
    border-color: $astar-blue;
    background-color: $astar-blue;
  }
  @media (min-width: $sm) {
    height: 40px;
    padding: 0 16px 0 12px;
  }
}
</style>
