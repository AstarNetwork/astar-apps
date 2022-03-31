import { supportEvmWalletObj, SupportWallet, supportWalletObj } from 'src/config/wallets';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { getSelectedAccount } from '../helper/wallet';

export function useWalletIcon() {
  const iconWallet = ref<string>('');
  const store = useStore();
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const isEthWallet = computed(() => store.getters['general/isEthWallet']);

  watchEffect(() => {
    const account = getSelectedAccount(substrateAccounts.value);
    if (isEthWallet.value) {
      iconWallet.value = supportEvmWalletObj[SupportWallet.MetaMask].img;
    } else if (account) {
      // @ts-ignore
      iconWallet.value = supportWalletObj[account.source].img;
    }
  });
  return {
    iconWallet,
  };
}
