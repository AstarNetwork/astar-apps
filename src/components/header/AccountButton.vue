<template>
  <div>
    <button
      type="button"
      class="btn--account"
      :class="width < screenSize.sm ? 'm-btn--account' : ''"
    >
      <icon-base class="iconbase" stroke="currentColor" icon-name="wallet">
        <icon-wallet />
      </icon-base>
      <img class="icon" width="16" :src="iconWallet" />
      <template v-if="width >= screenSize.sm">
        {{ shortenAddress }}
      </template>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs, computed, watchEffect, ref } from 'vue';
import { getShortenAddress } from 'src/hooks/helper/addressUtils';
import { useStore } from 'src/store';
import { useBreakpoints } from 'src/hooks';
import { supportEvmWalletObj, SupportWallet, supportWalletObj } from 'src/config/wallets';
import { getSelectedAccount } from 'src/hooks/helper/wallet';
import IconBase from 'components/icons/IconBase.vue';
import IconWallet from 'components/icons/IconWallet.vue';

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
    const shortenAddress = computed(() => {
      if (width.value > screenSize.md) {
        return getShortenAddress(props.account);
      } else {
        return getShortenAddress(props.account, 2);
      }
    });

    const iconWallet = ref<string>('');

    const store = useStore();
    const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
    const isEthWallet = computed(() => store.getters['general/isEthWallet']);

    watchEffect(() => {
      const selAccount = getSelectedAccount(substrateAccounts.value);
      if (isEthWallet.value) {
        iconWallet.value = supportEvmWalletObj[SupportWallet.MetaMask].img;
      } else if (selAccount) {
        // @ts-ignore
        iconWallet.value = supportWalletObj[selAccount.source].img;
      }
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
  background: $gray-5;
  padding: 8px 16px 8px 16px;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  margin-left: 16px;
  color: #fff;
}
.btn--account:hover {
  background: $gray-5-selected;
}

.iconbase {
  color: #e6e9ee;
  width: rem(20);
  height: rem(20);
  margin-left: -4px;
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
    background: $gray-6 !important;
    border: 1px solid $gray-5;
    color: white !important;
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
    border: 1px solid $gray-5;
  }
  .iconbase {
    color: $gray-4;
  }
}
</style>
