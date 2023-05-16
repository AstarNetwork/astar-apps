<template>
  <div>
    <button type="button" class="btn--account" :class="screenSize.sm > width && 'm-btn--account'">
      <astar-icon-base class="iconbase" stroke="currentColor" icon-name="wallet">
        <astar-icon-wallet />
      </astar-icon-base>
      <img class="icon" width="16" :src="iconWallet" />
      <template v-if="width >= screenSize.sm">
        <span class="text--address">
          {{ getShortenAddress(account, 4) }}
        </span>
      </template>
    </button>
  </div>
</template>

<script lang="ts">
import { useBreakpoints, useWalletIcon } from 'src/hooks';
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

    return {
      width,
      screenSize,
      iconWallet,
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
  height: 32px;
  flex-direction: row;
  align-items: center;
  padding: 8px 16px 8px 12px;
  border-radius: 16px;
  transition: all 0.3s ease 0s;
  background: transparent;
  color: #fff;
  border: 1px solid $gray-4;

  @media (min-width: $lg) {
    border: 1px solid $navy-3;
  }

  &:hover {
    background: $astar-blue !important;
    border: 1px solid transparent;
    .iconbase {
      color: $gray-1;
    }
    @media (min-width: $lg) {
      background: transparent !important;
      border: 1px solid $gray-4;
      .iconbase {
        color: $gray-5;
      }
    }
  }
}

.iconbase {
  color: $gray-3;
  width: rem(22);
  height: rem(22);
  transition: all 0.3s ease 0s;
  @media (min-width: $lg) {
    color: $navy-3;
  }
}

.m-btn--account {
  background: transparent;
  box-shadow: none;
  padding: 8px;
  transition: all 0.3s ease 0s;
  color: $gray-3;
  border: 1px solid $gray-4;
  @media (min-width: $lg) {
    border: 1px solid $navy-3;
  }
}

.icon {
  margin: 0 6px;
}

.text--address {
  font-weight: 400;
  font-size: 14px;
  color: $gray-1;
  @media (min-width: $lg) {
    color: $navy-1;
  }
}

.body--dark {
  .btn--account {
    border: 1px solid $gray-4;
    &:hover {
      background: $astar-blue !important;
      border: 1px solid transparent;
      .iconbase {
        color: $gray-1;
      }
    }
  }

  .iconbase {
    color: $gray-3;
  }

  .m-btn--account {
    border: 1px solid $gray-4;
  }

  .text--address {
    color: $gray-1;
  }
}
</style>
