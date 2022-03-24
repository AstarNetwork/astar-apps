<template>
  <div>
    <button
      type="button"
      :class="[
        'account-btn',
        'tw-inline-flex',
        'tw-items-center',
        'tw-px-4',
        'tw-py-1',
        'tw-border',
        'tw-border-transparent',
        'tw-text-sm',
        'tw-font-medium',
        'tw-rounded-full',
        'tw-shadow-sm',
        'tw-text-white',
        'tw-bg-gray-500',
        'hover:tw-bg-gray-500',
        'focus:tw-outline-none',
        'focus:tw-ring',
        'focus:tw-ring-gray-100',
        'dark-ring-dark-gray',
        'tw-mx-1',
      ]"
    >
      <icon-base
        class="tw-w-5 tw-h-5 tw-text-gray-500 tw--ml-1"
        stroke="currentColor"
        icon-name="wallet"
      >
        <icon-wallet />
      </icon-base>
      <img class="tw-mx-1" width="16" :src="iconWallet" />
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
import { SupportWallet, supportWalletObj } from 'src/config/wallets';
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
      return getShortenAddress(props.account);
    });

    const iconWallet = ref<string>('');

    const store = useStore();
    const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
    const isEthWallet = computed(() => store.getters['general/isEthWallet']);

    watchEffect(() => {
      const selAccount = getSelectedAccount(substrateAccounts.value);
      if (!props.account) {
        iconWallet.value = supportWalletObj[SupportWallet.PolkadotJs].img;
      } else if (isEthWallet.value) {
        iconWallet.value = supportWalletObj[SupportWallet.MetaMask].img;
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

<style scoped>
.account-btn {
  background: #2c3335;
}
.account-btn:hover {
  background: #3c4649;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
}
.m-account-btn {
  padding-left: 10px;
  width: 32px;
  height: 32px;
  background: #2c3335;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
}
.m-account-btn:hover {
  background: #3c4649;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.25);
}
</style>
