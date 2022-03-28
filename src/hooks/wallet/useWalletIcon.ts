import { supportWalletObj, SupportWallet } from 'src/config/wallets';
import { useAccount } from 'src/hooks';
import { useStore } from 'src/store';
import { computed, ref, watchEffect } from 'vue';
import { getSelectedAccount } from '../helper/wallet';

export function useWalletIcon() {
  const iconWallet = ref<string>('');
  const { currentAccount } = useAccount();

  const store = useStore();
  const substrateAccounts = computed(() => store.getters['general/substrateAccounts']);
  const isEthWallet = computed(() => store.getters['general/isEthWallet']);

  watchEffect(() => {
    const account = getSelectedAccount(substrateAccounts.value);
    if (!currentAccount.value) {
      // Memo: placeholder
      iconWallet.value = supportWalletObj[SupportWallet.PolkadotJs].img;
    } else if (isEthWallet.value) {
      iconWallet.value = supportWalletObj[SupportWallet.MetaMask].img;
    } else if (account) {
      // @ts-ignore
      iconWallet.value = supportWalletObj[account.source].img;
    }
  });
  return {
    iconWallet,
  };
}
