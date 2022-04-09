<template>
  <div>
    <button type="button" class="btn--account" :class="screenSize.sm > width && 'm-btn--account'">
      <icon-base class="iconbase" stroke="currentColor" icon-name="wallet">
        <icon-wallet />
      </icon-base>
      <img class="icon" width="16" :src="iconWallet" />
      <template v-if="width >= screenSize.sm">
        <span class="text--md">
          {{ shortenAddress }}
        </span>
      </template>
    </button>
  </div>
</template>

<script lang="ts">
import IconBase from 'components/icons/IconBase.vue';
import IconWallet from 'components/icons/IconWallet.vue';
import { useBreakpoints, useWalletIcon } from 'src/hooks';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { computed, defineComponent, toRefs } from 'vue';

export default defineComponent({
  components: {
    IconBase,
    IconWallet,
  },
  props: {
    account: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { width, screenSize } = useBreakpoints();
    const { iconWallet } = useWalletIcon();
    const shortenAddress = computed(() => {
      return getShortenAddress(props.account);
    });

    return {
      width,
      screenSize,
      shortenAddress,
      iconWallet,
      ...toRefs(props),
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
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  margin-left: 16px;
  color: #fff;
}

.btn--account:hover {
  background: $gray-5-selected;
}

.iconbase {
  color: $gray-3 !important;
  width: rem(22);
  height: rem(22);
  @media (min-width: $sm) {
    color: #e6e9ee !important;
  }
}

.m-btn--account {
  border: 1px solid $object-light;
  box-shadow: none;
  padding: 8px;

  .iconbase {
    color: $object-light;
  }
}

.icon {
  margin: 0 6px;
}

.body--dark {
  .btn--account {
    background: $gray-5 !important;
    color: #fff;
    border: 1px solid $gray-6 !important;
    @media (min-width: $md) {
      background: $gray-5 !important;
    }
  }
  .btn--account:hover {
    background: $gray-5-selected !important;
  }

  .m-btn--account {
    background: $gray-6 !important;
    color: $gray-3;
    border: 1px solid $gray-5 !important;
  }
  .iconbase {
    color: $astar-blue-dark !important;
    @media (min-width: $md) {
      color: $gray-4 !important;
    }
  }
}
</style>
